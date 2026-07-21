from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import date

class MoodLogEntry(BaseModel):
    date: date
    mood_score: int
    mood_state: Optional[str] = None
    energy_level: Optional[int] = None
    cycle_day: Optional[int] = None

class CorrelationRequest(BaseModel):
    logs: list[MoodLogEntry]
    cycle_length: int = 28
    last_period_date: Optional[date] = None

class PhaseAverage(BaseModel):
    phase: str
    phase_label: str
    avg_mood: float
    avg_energy: float
    days_logged: int

class TrendPoint(BaseModel):
    date: str
    mood_score: int
    phase: Optional[str] = None
    phase_label: Optional[str] = None
    predicted_score: Optional[float] = None

class Insight(BaseModel):
    type: str
    title: str
    message: str
    confidence: float
    sparkline: list[float]

class PeakEnergyWindow(BaseModel):
    start_day: int
    end_day: int
    phase: str

class CorrelationResponse(BaseModel):
    correlation_score: float
    pattern_detected: bool
    phase_averages: list[PhaseAverage]
    pms_days: list[str]
    peak_energy_window: PeakEnergyWindow
    insights: list[Insight]
    trend_data: list[TrendPoint]
