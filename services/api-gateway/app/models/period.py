"""Period tracking ORM models."""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Boolean, Date, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PeriodLog(Base):
    """Period log — tracks each menstrual cycle start and end."""
    __tablename__ = "period_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    cycle_length: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    period_length: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    symptoms: Mapped[List["PeriodSymptom"]] = relationship(
        "PeriodSymptom", back_populates="period_log", cascade="all, delete-orphan"
    )


class PeriodSymptom(Base):
    """Symptoms logged per day within a period."""
    __tablename__ = "period_symptoms"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    period_log_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("period_logs.id", ondelete="CASCADE"), nullable=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    flow_intensity: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    symptoms: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    pain_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    period_log: Mapped[Optional["PeriodLog"]] = relationship(
        "PeriodLog", back_populates="symptoms"
    )
