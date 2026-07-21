from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True
    API_GATEWAY_URL: str = "http://localhost:8000"
    PCOD_MODEL_PATH: str = "models/pcod_model.joblib"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
