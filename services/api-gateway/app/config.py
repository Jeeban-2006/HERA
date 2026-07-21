"""Configuration module for HERA API Gateway."""

from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict, field_validator
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file."""
    
    model_config = ConfigDict(env_file=".env", case_sensitive=True)
    
    # Server
    ENVIRONMENT: str = Field(default="development")
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    
    # Database
    DATABASE_URL: str = Field(default="postgresql+asyncpg://hera_user:dev_password@localhost:5432/hera_dev")
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # JWT
    JWT_SECRET: str = Field(default="change-me-in-production-min-32-chars-!!!")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30)
    
    # ML Service URLs
    PCOD_SERVICE_URL: str = Field(default="http://localhost:8001")
    MOOD_SERVICE_URL: str = Field(default="http://localhost:8002")
    SAFETY_SERVICE_URL: str = Field(default="http://localhost:8003")

    # External APIs
    ANTHROPIC_API_KEY: str = Field(default="")
    AWS_BUCKET_NAME: str = Field(default="")
    MAPBOX_TOKEN: str = Field(default="")
    TWILIO_ACCOUNT_SID: str = Field(default="")
    TWILIO_AUTH_TOKEN: str = Field(default="")
    TWILIO_PHONE: str = Field(default="")

    # CORS — stored as comma-separated string; parsed into list by cors_origins_list property
    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:19000")

    # ── Layer 7: Security ─────────────────────────────────────────────────────
    # Fernet key for field-level encryption of health data at rest.
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    # In production: store in AWS Secrets Manager and inject as env var.
    FERNET_SECRET_KEY: str = Field(default="")
    # Previous key (used for decryption during 90-day rotation window)
    FERNET_SECRET_KEY_OLD: str = Field(default="")

    # Sentry DSN for error tracking (leave blank to disable)
    SENTRY_DSN: str = Field(default="")

    # Comma-separated list of allowed host headers (prevents host header injection)
    ALLOWED_HOSTS: str = Field(default="localhost,127.0.0.1")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list) -> str:
        """Accept both a comma-separated string and a JSON list — normalise to str for storage."""
        if isinstance(v, list):
            return ",".join(v)
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        """Return CORS_ORIGINS as a Python list for use in FastAPI middleware."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Create global settings instance
settings = get_settings()


