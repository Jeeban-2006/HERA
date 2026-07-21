"""Pydantic schemas for PCOD analysis endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Literal
from uuid import UUID
from datetime import datetime


class LifestyleData(BaseModel):
    """Lifestyle data for PCOD analysis."""
    sleep: float = Field(ge=0, le=24, description="Hours of sleep")
    stress: int = Field(ge=1, le=10, description="Stress level 1-10")
    exercise: int = Field(ge=0, le=7, description="Days of exercise per week")
    water: int = Field(ge=0, le=20, description="Glasses of water per day")


class LabValues(BaseModel):
    """Lab values for PCOD analysis."""
    insulin: Optional[float] = None
    testosterone: Optional[float] = None
    lh_fsh_ratio: Optional[float] = None
    amh: Optional[float] = None
    glucose: Optional[float] = None


class PCODAnalyzeRequest(BaseModel):
    """PCOD analysis request schema."""
    symptoms: List[str] = Field(min_length=2, description="At least 2 symptoms")
    lifestyle: LifestyleData
    lab_values: Optional[LabValues] = None


class DriverBreakdown(BaseModel):
    """Driver breakdown in analysis result."""
    label: str
    value: float
    color: str


class Recommendation(BaseModel):
    """Recommendation in analysis result."""
    category: str
    title: str
    desc: str
    priority: Literal["high", "medium", "low"]
    icon_name: str


class LabFlag(BaseModel):
    """Lab flag in analysis result."""
    marker: str
    value: str
    status: Literal["normal", "borderline", "high", "low"]
    range: str


class PCODAnalyzeResponse(BaseModel):
    """PCOD analysis response schema."""
    model_config = {"from_attributes": True}
    
    id: UUID
    subtype: str
    subtype_label: str
    risk_score: float
    confidence: float
    drivers: List[DriverBreakdown]
    recommendations: List[Recommendation]
    lab_flags: List[LabFlag]
    created_at: datetime


class PCODHistoryResponse(BaseModel):
    """PCOD history response schema."""
    analyses: List[PCODAnalyzeResponse]
    total: int
    page: int
