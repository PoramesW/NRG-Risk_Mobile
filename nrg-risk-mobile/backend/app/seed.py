import csv
import logging
from datetime import date
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import EnergyGeneration, GasImportShare

logger = logging.getLogger("uvicorn.error")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
GENERATION_FILE = DATA_DIR / "energy_generation.csv"
GAS_SHARE_FILE = DATA_DIR / "gas_import_share.csv"

MONTH_NUMBERS = {
    name: number
    for number, name in enumerate(
        [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ],
        start=1,
    )
}


def _read_csv(path: Path):
    # utf-8-sig เพื่อตัด BOM ที่อยู่หน้าไฟล์ออก
    with path.open(encoding="utf-8-sig", newline="") as file:
        yield from csv.DictReader(file)


def _period(row: dict) -> date:
    month_name = row["Month"].strip().title()
    if month_name not in MONTH_NUMBERS:
        raise ValueError(f"ชื่อเดือนไม่ถูกต้อง: {row['Month']!r}")
    return date(int(row["Year"]), MONTH_NUMBERS[month_name], 1)


def _check_unit(row: dict, expected: str) -> None:
    unit = row["UNIT"].strip()
    if unit != expected:
        raise ValueError(f"หน่วยไม่ตรงที่คาดไว้ ({expected}): {unit!r}")


def _is_empty(db: Session, model) -> bool:
    return db.scalar(select(func.count()).select_from(model)) == 0


def seed_if_empty(db: Session) -> None:
    """นำเข้าข้อมูลเริ่มต้นเฉพาะตารางที่ยังว่าง (ไม่ซ้ำและไม่ทับข้อมูลเดิม)"""
    if _is_empty(db, EnergyGeneration):
        if GENERATION_FILE.exists():
            items = []
            for row in _read_csv(GENERATION_FILE):
                _check_unit(row, "GWh")
                items.append(
                    EnergyGeneration(
                        period=_period(row),
                        fuel_type=row["Fuel Type"].strip().upper(),
                        quantity_gwh=float(row["Quantity"]),
                    )
                )
            db.add_all(items)
            db.commit()
            logger.info("นำเข้า energy_generation แล้ว %d แถว", len(items))
        else:
            logger.warning("ไม่พบไฟล์ข้อมูล %s", GENERATION_FILE)

    if _is_empty(db, GasImportShare):
        if GAS_SHARE_FILE.exists():
            items = []
            for row in _read_csv(GAS_SHARE_FILE):
                _check_unit(row, "%")
                items.append(
                    GasImportShare(
                        period=_period(row),
                        source=row["Source"].strip().upper(),
                        share_pct=float(row["Share"]),
                    )
                )
            db.add_all(items)
            db.commit()
            logger.info("นำเข้า gas_import_share แล้ว %d แถว", len(items))
        else:
            logger.warning("ไม่พบไฟล์ข้อมูล %s", GAS_SHARE_FILE)