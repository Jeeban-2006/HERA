from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from uuid import UUID
from datetime import datetime

class LifestyleData(BaseModel):
    sleep: float
    stress: int
    exercise: int
    water: int

class LabValues(BaseModel):
    insulin: Optional[float] = None
    testosterone: Optional[float] = None
    lh_fsh_ratio: Optional[float] = None
    amh: Optional[float] = None
    glucose: Optional[float] = None

class AnalyzeRequest(BaseModel):
    symptoms: List[str]
    lifestyle: LifestyleData
    lab_values: Optional[LabValues] = None

class DriverBreakdown(BaseModel):
    label: str
    value: float
    color: str

class Recommendation(BaseModel):
    category: str
    title: str
    desc: str
    priority: Literal["high", "medium", "low"]
    icon_name: str

class LabFlag(BaseModel):
    marker: str
    value: str
    status: Literal["normal", "borderline", "high", "low"]
    range: str

class AnalyzeResponse(BaseModel):
    id: UUID
    subtype: str
    subtype_label: str
    risk_score: float
    confidence: float
    drivers: List[DriverBreakdown]
    recommendations: List[Recommendation]
    lab_flags: List[LabFlag]
    created_at: datetime
    model_used: str
