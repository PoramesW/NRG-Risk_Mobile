from datetime import datetime, timezone

from sqlalchemy import DateTime, String
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