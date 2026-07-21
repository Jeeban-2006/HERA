"""Pydantic schemas for mood tracking endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import date, datetime
from uuid import UUID


class MoodLogRequest(BaseModel):
    """Mood log request schema."""
    date: date
    mood_score: int = Field(ge=1, le=10)
    mood_state: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = Field(None, max_length=500)


class MoodLogResponse(BaseModel):
    """Mood log response schema."""
    model_config = {"from_attributes": True}
    
    id: UUID
    date: date
    mood_score: int
    mood_state: Optional[str]
    cycle_day: Optional[int]
    created_at: datetime


class MoodLogsListResponse(BaseModel):
    """Mood logs list response schema."""
    logs: List[MoodLogResponse]
    total: int
    page: int


class PhaseAverage(BaseModel):
    """Phase average in correlation data."""
    phase: str
    avg_mood: float
    avg_energy: float
    days_logged: int


class MoodInsight(BaseModel):
    """Mood insight in correlation data."""
    type: Literal["peak", "pms_risk", "pattern", "stress"]
    title: str
    message: str
    confidence: float
    sparkline: List[float]


class CorrelationResponse(BaseModel):
    """Correlation response schema."""
    correlation_score: float
    pattern_detected: bool
    phase_averages: List[PhaseAverage]
    pms_days: List[str]
    peak_energy_window: dict
    insights: List[MoodInsight]
    trend_data: List[dict]
