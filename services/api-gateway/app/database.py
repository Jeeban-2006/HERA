"""Database connection and session factory for async SQLAlchemy."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connection before using
    echo=settings.ENVIRONMENT == "development",
)

# Session factory for async sessions
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# Base class for all ORM models
class Base(DeclarativeBase):
    """Base class for SQLAlchemy ORM models."""
    pass
