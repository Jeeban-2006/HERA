"""Pydantic schemas for user endpoints."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from uuid import UUID


class UserProfileUpdate(BaseModel):
    """User profile update schema."""
    name: Optional[str] = None
    dob: Optional[date] = None
    cycle_length: Optional[int] = None
    last_period_date: Optional[date] = None
    health_goals: Optional[List[str]] = None


class UserHealthProfileResponse(BaseModel):
    """User health profile response schema."""
    model_config = {"from_attributes": True}
    
    id: UUID
    user_id: UUID
    cycle_length: int
    last_period_date: Optional[date]
    health_goals: dict
    onboarding_complete: bool
