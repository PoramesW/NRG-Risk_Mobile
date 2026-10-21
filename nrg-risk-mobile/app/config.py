from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./nrg_risk.db"
    secret_key: str  # ไม่มีค่าเริ่มต้น: ต้องตั้งใน .env ไม่งั้นเซิร์ฟเวอร์ไม่ยอมเริ่ม
    access_token_expire_minutes: int = 60 * 24  # โทเค็นอายุ 24 ชั่วโมง

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()