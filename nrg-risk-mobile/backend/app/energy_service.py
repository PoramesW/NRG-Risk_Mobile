from collections import defaultdict
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import EnergyGeneration, GasImportShare


class PeriodError(ValueError):
    """รูปแบบช่วงเวลาไม่ถูกต้อง"""


def month_key(value: date) -> str:
    return f"{value.year:04d}-{value.month:02d}"


def next_month(value: date) -> date:
    if value.month == 12:
        return date(value.year + 1, 1, 1)
    return date(value.year, value.month + 1, 1)


def shift_year(value: date, years: int) -> date:
    return date(value.year + years, value.month, 1)


def parse_month(text: str) -> date:
    """รับ 'YYYY-MM' คืนวันที่ 1 ของเดือนนั้น"""
    try:
        year_text, month_text = text.strip().split("-")
        return date(int(year_text), int(month_text), 1)
    except (ValueError, TypeError):
        raise PeriodError(f"รูปแบบเดือนต้องเป็น YYYY-MM (ได้รับ '{text}')") from None


def parse_period(text: str) -> tuple[date, date, str]:
    """รับ 'YYYY' หรือ 'YYYY-MM' คืน (วันเริ่ม, วันสิ้นสุดแบบไม่รวม, ป้ายชื่อ)"""
    text = text.strip()
    try:
        if len(text) == 4 and text.isdigit():
            year = int(text)
            return date(year, 1, 1), date(year + 1, 1, 1), text
        start = parse_month(text)
        return start, next_month(start), month_key(start)
    except (ValueError, PeriodError):
        raise PeriodError(f"ช่วงเวลาต้องเป็น YYYY หรือ YYYY-MM (ได้รับ '{text}')") from None


def _fuel_totals(db: Session, start: date, end: date) -> tuple[dict[str, float], set[date]]:
    rows = db.scalars(
        select(EnergyGeneration).where(
            EnergyGeneration.period >= start, EnergyGeneration.period < end
        )
    ).all()
    totals: dict[str, float] = defaultdict(float)
    months: set[date] = set()
    for row in rows:
        totals[row.fuel_type] += row.quantity_gwh
        months.add(row.period)
    return dict(totals), months


def dataset_meta(db: Session) -> dict:
    gen_first, gen_last, gen_rows = db.execute(
        select(
            func.min(EnergyGeneration.period),
            func.max(EnergyGeneration.period),
            func.count(),
        )
    ).one()
    fuels = list(
        db.scalars(select(EnergyGeneration.fuel_type).distinct().order_by(EnergyGeneration.fuel_type))
    )
    gas_first, gas_last, gas_rows = db.execute(
        select(
            func.min(GasImportShare.period),
            func.max(GasImportShare.period),
            func.count(),
        )
    ).one()
    sources = list(
        db.scalars(select(GasImportShare.source).distinct().order_by(GasImportShare.source))
    )
    return {
        "energy_generation": {
            "unit": "GWh",
            "rows": gen_rows,
            "first_period": month_key(gen_first) if gen_first else None,
            "last_period": month_key(gen_last) if gen_last else None,
            "fuel_types": fuels,
        },
        "gas_import_share": {
            "unit": "%",
            "rows": gas_rows,
            "first_period": month_key(gas_first) if gas_first else None,
            "last_period": month_key(gas_last) if gas_last else None,
            "sources": sources,
        },
    }


def generation_series(
    db: Session,
    start: date | None = None,
    end: date | None = None,
    fuel_type: str | None = None,
    granularity: str = "month",
) -> list[dict]:
    query = select(EnergyGeneration)
    if start:
        query = query.where(EnergyGeneration.period >= start)
    if end:
        query = query.where(EnergyGeneration.period < next_month(end))
    if fuel_type:
        query = query.where(EnergyGeneration.fuel_type == fuel_type.strip().upper())
    rows = db.scalars(query.order_by(EnergyGeneration.period, EnergyGeneration.fuel_type)).all()

    if granularity == "year":
        sums: dict[tuple[int, str], float] = defaultdict(float)
        months: dict[tuple[int, str], set[int]] = defaultdict(set)
        for row in rows:
            key = (row.period.year, row.fuel_type)
            sums[key] += row.quantity_gwh
            months[key].add(row.period.month)
        return [
            {
                "period": str(year),
                "fuel_type": fuel,
                "quantity_gwh": round(total, 2),
                "months": len(months[(year, fuel)]),
            }
            for (year, fuel), total in sorted(sums.items())
        ]

    return [
        {
            "period": month_key(row.period),
            "fuel_type": row.fuel_type,
            "quantity_gwh": round(row.quantity_gwh, 2),
        }
        for row in rows
    ]


def energy_mix(db: Session, period: str) -> dict | None:
    start, end, label = parse_period(period)
    totals, months = _fuel_totals(db, start, end)
    if not totals:
        return None
    grand = sum(totals.values())
    items = [
        {
            "fuel_type": fuel,
            "quantity_gwh": round(quantity, 2),
            "share_pct": round(quantity / grand * 100, 2) if grand else 0.0,
        }
        for fuel, quantity in sorted(totals.items(), key=lambda pair: -pair[1])
    ]
    return {
        "period": label,
        "months_covered": len(months),
        "unit": "GWh",
        "total_gwh": round(grand, 2),
        "items": items,
    }


def gas_source_series(
    db: Session,
    start: date | None = None,
    end: date | None = None,
    granularity: str = "month",
) -> list[dict]:
    query = select(GasImportShare)
    if start:
        query = query.where(GasImportShare.period >= start)
    if end:
        query = query.where(GasImportShare.period < next_month(end))
    rows = db.scalars(query.order_by(GasImportShare.period, GasImportShare.source)).all()

    if granularity == "year":
        sums: dict[tuple[int, str], float] = defaultdict(float)
        counts: dict[tuple[int, str], int] = defaultdict(int)
        for row in rows:
            key = (row.period.year, row.source)
            sums[key] += row.share_pct
            counts[key] += 1
        return [
            {
                "period": str(year),
                "source": source,
                "share_pct": round(total / counts[(year, source)], 2),
                "months": counts[(year, source)],
            }
            for (year, source), total in sorted(sums.items())
        ]

    return [
        {
            "period": month_key(row.period),
            "source": row.source,
            "share_pct": round(row.share_pct, 2),
        }
        for row in rows
    ]


def risk_indicators(db: Session, period: str) -> dict | None:
    """ตัวชี้วัดดิบจากปริมาณพลังงานในช่วงเวลาที่ระบุ (ยังไม่ใช่คะแนนรวม)"""
    start, end, label = parse_period(period)
    totals, months = _fuel_totals(db, start, end)
    if not totals:
        return None
    grand = sum(totals.values())
    if grand <= 0:
        return None

    def share(fuel: str) -> float:
        return round(totals.get(fuel, 0.0) / grand * 100, 2)

    top_fuel, top_quantity = max(totals.items(), key=lambda pair: pair[1])
    hhi = sum((quantity / grand) ** 2 for quantity in totals.values())

    # เทียบกับช่วงเดียวกันของปีก่อน เฉพาะเมื่อจำนวนเดือนเท่ากัน
    prev_totals, prev_months = _fuel_totals(db, shift_year(start, -1), shift_year(end, -1))
    prev_grand = sum(prev_totals.values())
    yoy = None
    if prev_grand > 0 and len(prev_months) == len(months):
        yoy = round((grand - prev_grand) / prev_grand * 100, 2)

    gas_rows = db.scalars(
        select(GasImportShare).where(
            GasImportShare.period >= start, GasImportShare.period < end
        )
    ).all()
    gas_sources = None
    if gas_rows:
        sums: dict[str, float] = defaultdict(float)
        counts: dict[str, int] = defaultdict(int)
        gas_months: set[date] = set()
        for row in gas_rows:
            sums[row.source] += row.share_pct
            counts[row.source] += 1
            gas_months.add(row.period)
        averages = {source: sums[source] / counts[source] for source in sums}
        gas_sources = {
            "months_covered": len(gas_months),
            "average_share_pct": {source: round(value, 2) for source, value in averages.items()},
            "concentration_hhi": round(sum((value / 100) ** 2 for value in averages.values()), 4),
        }

    return {
        "period": label,
        "months_covered": len(months),
        "total_gwh": round(grand, 2),
        "import_share_pct": share("IMPORTED"),
        "renewable_share_pct": share("RENEWABLE ENERGY"),
        "natural_gas_share_pct": share("NATURAL GAS"),
        "top_fuel": {"fuel_type": top_fuel, "share_pct": round(top_quantity / grand * 100, 2)},
        "fuel_concentration_hhi": round(hhi, 4),
        "yoy_total_change_pct": yoy,
        "gas_import_sources": gas_sources,
    }