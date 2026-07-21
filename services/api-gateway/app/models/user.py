"""SQLAlchemy ORM models for HERA platform."""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Date, Float, Integer, Text, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    """User account model."""
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    health_profile: Mapped[Optional["UserHealthProfile"]] = relationship("UserHealthProfile", back_populates="user", cascade="all, delete-orphan", uselist=False)
    pcod_analyses: Mapped[List["PCODAnalysis"]] = relationship("PCODAnalysis", back_populates="user", cascade="all, delete-orphan")
    mood_logs: Mapped[List["MoodLog"]] = relationship("MoodLog", back_populates="user", cascade="all, delete-orphan")
    emergency_contacts: Mapped[List["EmergencyContact"]] = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    sos_events: Mapped[List["SOSEvent"]] = relationship("SOSEvent", back_populates="user", cascade="all, delete-orphan")


class UserHealthProfile(Base):
    """Health profile for users (cycle tracking, goals, etc)."""
    __tablename__ = "user_health_profile"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    cycle_length: Mapped[int] = mapped_column(Integer, default=28, nullable=False)
    last_period_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    health_goals: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="health_profile")


class PCODAnalysis(Base):
    """PCOD analysis results."""
    __tablename__ = "pcod_analyses"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symptoms: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    lifestyle_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    lab_values: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    subtype: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recommendations: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    driver_breakdown: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="pcod_analyses")


class MoodLog(Base):
    """Daily mood tracking entries."""
    __tablename__ = "mood_logs"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    mood_score: Mapped[int] = mapped_column(Integer, nullable=False)
    mood_state: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    energy_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cycle_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mood_logs")
    
    # Constraints
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_mood_date"),)


class EmergencyContact(Base):
    """Emergency contact information for SOS."""
    __tablename__ = "emergency_contacts"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notify_sms: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="emergency_contacts")


class SOSEvent(Base):
    """Emergency SOS event logging."""
    __tablename__ = "sos_events"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    location_lat: Mapped[float] = mapped_column(Float, nullable=False)
    location_lng: Mapped[float] = mapped_column(Float, nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    contacts_notified: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sos_events")
