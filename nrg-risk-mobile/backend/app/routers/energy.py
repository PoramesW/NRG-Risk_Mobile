from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import energy_service
from app.database import get_db
from app.energy_service import PeriodError
from app.routers.auth import get_current_user

# ทุกเส้นทางในไฟล์นี้ต้องล็อกอินก่อน
router = APIRouter(
    prefix="/energy",
    tags=["energy"],
    dependencies=[Depends(get_current_user)],
)

NO_DATA = "ไม่มีข้อมูลในช่วงเวลานี้"


def _month_or_none(text: str | None):
    if text is None:
        return None
    try:
        return energy_service.parse_month(text)
    except PeriodError as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(error)) from None


@router.get("/meta")
def meta(db: Session = Depends(get_db)):
    return energy_service.dataset_meta(db)


@router.get("/generation")
def generation(
    start: str | None = Query(None, description="เดือนเริ่ม YYYY-MM"),
    end: str | None = Query(None, description="เดือนสิ้นสุด YYYY-MM (รวมเดือนนี้)"),
    fuel_type: str | None = Query(None, description="เช่น NATURAL GAS"),
    granularity: Literal["month", "year"] = "month",
    db: Session = Depends(get_db),
):
    points = energy_service.generation_series(
        db,
        start=_month_or_none(start),
        end=_month_or_none(end),
        fuel_type=fuel_type,
        granularity=granularity,
    )
    return {"unit": "GWh", "granularity": granularity, "points": points}


@router.get("/mix")
def mix(
    period: str = Query(..., description="YYYY หรือ YYYY-MM"),
    db: Session = Depends(get_db),
):
    try:
        result = energy_service.energy_mix(db, period)
    except PeriodError as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(error)) from None
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_DATA)
    return result


@router.get("/gas-sources")
def gas_sources(
    start: str | None = Query(None, description="เดือนเริ่ม YYYY-MM"),
    end: str | None = Query(None, description="เดือนสิ้นสุด YYYY-MM (รวมเดือนนี้)"),
    granularity: Literal["month", "year"] = "month",
    db: Session = Depends(get_db),
):
    points = energy_service.gas_source_series(
        db,
        start=_month_or_none(start),
        end=_month_or_none(end),
        granularity=granularity,
    )
    return {"unit": "%", "granularity": granularity, "points": points}


@router.get("/indicators")
def indicators(
    period: str = Query(..., description="YYYY หรือ YYYY-MM"),
    db: Session = Depends(get_db),
):
    try:
        result = energy_service.risk_indicators(db, period)
    except PeriodError as error:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(error)) from None
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_DATA)
    return result