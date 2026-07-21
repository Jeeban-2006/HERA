from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8003
    DEBUG: bool = True
    API_GATEWAY_URL: str = "http://localhost:8000"
    SAFETY_MODEL_PATH: str = "models/safety_model.joblib"
    GOOGLE_MAPS_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
