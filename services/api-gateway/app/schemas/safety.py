"""Pydantic schemas for safety endpoints."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class Coordinates(BaseModel):
    """Coordinates for location."""
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class RouteRequest(BaseModel):
    """Route request schema."""
    origin: Coordinates
    destination: Coordinates
    origin_name: Optional[str] = None
    destination_name: Optional[str] = None


class SafetySignal(BaseModel):
    """Safety signal in route response."""
    type: str
    description: str
    icon_name: str
    positive: bool


class RouteOption(BaseModel):
    """Route option in response."""
    type: str  # 'safest' or 'fastest'
    distance: str
    duration: str
    safety_score: float
    coordinates: List[tuple]
    signals: List[SafetySignal]


class RouteResponse(BaseModel):
    """Route response schema."""
    safest_route: RouteOption
    fastest_route: RouteOption
    safety_signals: List[SafetySignal]


class SOSRequest(BaseModel):
    """SOS request schema."""
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    accuracy: Optional[float] = None


class SOSResponse(BaseModel):
    """SOS response schema."""
    event_id: UUID
    contacts_notified: int
    timestamp: datetime
    message: str


class ContactRequest(BaseModel):
    """Emergency contact request schema."""
    name: str = Field(min_length=2, max_length=255)
    phone: str
    email: Optional[EmailStr] = None
    notify_sms: bool = True


class UpdateContactRequest(BaseModel):
    """Update emergency contact request schema."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    notify_sms: Optional[bool] = None


class ContactResponse(BaseModel):
    """Emergency contact response schema."""
    model_config = {"from_attributes": True}
    
    id: UUID
    user_id: UUID
    name: str
    phone: str
    email: Optional[str]
    notify_sms: bool
