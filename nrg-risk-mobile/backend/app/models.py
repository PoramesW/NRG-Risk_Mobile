from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50))  # ชื่อบัญชีตามที่ผู้ใช้พิมพ์
    username_lower: Mapped[str] = mapped_column(String(50), unique=True, index=True)  # ไว้เช็กซ้ำแบบไม่แยกตัวพิมพ์
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")  # เตรียมไว้สำหรับสิทธิ์ Admin
    is_active: Mapped[bool] = mapped_column(default=True)  # เตรียมไว้สำหรับระงับบัญชี
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class EnergyGeneration(Base):
    """ปริมาณรายเดือนแยกตามเชื้อเพลิง หน่วย GWh (จากไฟล์ dataset_11_27)"""

    __tablename__ = "energy_generation"
    __table_args__ = (
        UniqueConstraint("period", "fuel_type", name="uq_energy_generation_period_fuel"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[date] = mapped_column(Date, index=True)  # วันที่ 1 ของเดือน (ค.ศ.)
    fuel_type: Mapped[str] = mapped_column(String(50))
    quantity_gwh: Mapped[float] = mapped_column(Float)


class GasImportShare(Base):
    """สัดส่วน (%) ของแต่ละแหล่งรายเดือน (จากไฟล์ dataset_11_82)"""

    __tablename__ = "gas_import_share"
    __table_args__ = (
        UniqueConstraint("period", "source", name="uq_gas_import_share_period_source"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[date] = mapped_column(Date, index=True)  # วันที่ 1 ของเดือน (ค.ศ.)
    source: Mapped[str] = mapped_column(String(30))
    share_pct: Mapped[float] = mapped_column(Float)