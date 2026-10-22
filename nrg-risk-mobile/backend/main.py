from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import models  # noqa: F401  (ให้ SQLAlchemy รู้จักตารางก่อนสร้าง)
from app.database import Base, engine
from app.routers import auth


@asynccontextmanager
async def lifespan(_: FastAPI):
    # สร้างตารางที่ยังไม่มี (ช่วงพัฒนาเท่านั้น ภายหลังจะเปลี่ยนเป็นเครื่องมือ migration)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="NRG Risk API", lifespan=lifespan)
app.include_router(auth.router)


@app.get("/health")
def health():
    """ใช้เช็กว่าเซิร์ฟเวอร์ทำงานอยู่"""
    return {"status": "ok"}