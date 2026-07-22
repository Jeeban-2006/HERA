"""Period tracker Pydantic v2 schemas."""

from __future__ import annotations
from datetime import date, datetime
from typing import Optional, List, Literal, Dict
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


FlowIntensity = Literal["none", "spotting", "light", "medium", "heavy"]

VALID_SYMPTOMS = [
    "cramps", "bloating", "headache", "fatigue",
    "mood_swings", "back_pain", "nausea",
    "breast_tenderness", "cravings", "acne",
]


class StartPeriodRequest(BaseModel):
    start_date: date
    flow_intensity: Optional[FlowIntensity] = "medium"
    notes: Optional[str] = None

    @field_validator("start_date")
    @classmethod
    def not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Period start date cannot be in the future")
        return v


class EndPeriodRequest(BaseModel):
    end_date: date

    @field_validator("end_date")
    @classmethod
    def not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("End date cannot be in the future")
        return v


class LogSymptomsRequest(BaseModel):
    date: date
    flow_intensity: Optional[FlowIntensity] = None
    symptoms: List[str] = []
    pain_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None

    @field_validator("symptoms")
    @classmethod
    def valid_symptoms(cls, v: List[str]) -> List[str]:
        invalid = [s for s in v if s not in VALID_SYMPTOMS]
        if invalid:
            raise ValueError(f"Invalid symptoms: {invalid}. Valid: {VALID_SYMPTOMS}")
        return v


class PeriodLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    start_date: date
    end_date: Optional[date]
    cycle_length: Optional[int]
    period_length: Optional[int]
    is_active: bool
    notes: Optional[str]
    created_at: datetime


class PeriodSymptomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    date: date
    flow_intensity: Optional[str]
    symptoms: List[str]
    pain_level: Optional[int]


class CyclePrediction(BaseModel):
    next_period_date: date
    next_period_date_range: Dict[str, date]
    ovulation_date: date
    fertile_window_start: date
    fertile_window_end: date
    next_pms_window_start: date
    predicted_cycle_length: int
    confidence: float
    is_irregular: bool
    irregularity_reason: Optional[str]


class CycleHealthScore(BaseModel):
    score: int
    label: str
    color: str
    breakdown: Dict[str, int]
    recommendation: str


class PeriodHistoryResponse(BaseModel):
    logs: List[PeriodLogResponse]
    total_cycles: int
    average_cycle_length: Optional[float]
    average_period_length: Optional[float]
    prediction: Optional[CyclePrediction]
    health_score: Optional[CycleHealthScore]


class CurrentCycleStatus(BaseModel):
    cycle_day: Optional[int]
    phase: Optional[str]
    phase_label: Optional[str]
    days_in_phase: Optional[int]
    is_menstruating: bool
    active_period_start: Optional[date]
    prediction: Optional[CyclePrediction]
