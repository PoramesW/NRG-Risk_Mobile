import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import models  # noqa: F401  (ให้ SQLAlchemy รู้จักตารางก่อนสร้าง)
from app.database import Base, SessionLocal, engine
from app.routers import auth, energy
from app.seed import seed_if_empty

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # สร้างตารางที่ยังไม่มี (ช่วงพัฒนาเท่านั้น ภายหลังจะเปลี่ยนเป็นเครื่องมือ migration)
    Base.metadata.create_all(bind=engine)

    # นำเข้าข้อมูลเริ่มต้นเฉพาะตารางที่ยังว่าง ถ้าพังให้เซิร์ฟเวอร์ยังทำงานต่อได้
    try:
        with SessionLocal() as db:
            seed_if_empty(db)
    except Exception:
        logger.exception("นำเข้าข้อมูลเริ่มต้นไม่สำเร็จ (เซิร์ฟเวอร์ยังทำงานต่อ)")

    yield


app = FastAPI(title="NRG Risk API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(energy.router)


@app.get("/health")
def health():
    """ใช้เช็กว่าเซิร์ฟเวอร์ทำงานอยู่"""
    return {"status": "ok"}