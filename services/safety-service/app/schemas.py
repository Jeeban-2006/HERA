"""Pydantic schemas for the safety routing service.

Field names use camelCase to match apps/web/src/types/safety.types.ts exactly,
so the API Gateway can pass responses through to the frontend with minimal transformation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class Coordinates(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class RouteRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    origin_name: Optional[str] = None
    destination_name: Optional[str] = None


class SafetySignal(BaseModel):
    """Matches SafetySignal in safety.types.ts — camelCase field names."""
    type: str
    description: str
    iconName: str       # camelCase — matches TS interface
    positive: bool


class RouteOption(BaseModel):
    """Matches RouteOption in safety.types.ts — camelCase field names."""
    type: str           # "safest" | "fastest"
    distance: str
    duration: str
    safetyScore: float  # camelCase — matches TS interface
    coordinates: list[list[float]]  # [[lng, lat], ...]
    signals: list[SafetySignal]


class RouteResponse(BaseModel):
    """Matches RouteResult in safety.types.ts — camelCase field names."""
    safestRoute: RouteOption   # camelCase — matches TS interface
    fastestRoute: RouteOption  # camelCase — matches TS interface
