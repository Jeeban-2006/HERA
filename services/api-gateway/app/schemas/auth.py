"""Pydantic schemas for authentication endpoints."""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class RegisterRequest(BaseModel):
    """Registration request schema."""
    email: EmailStr
    password: str
    name: str
    dob: Optional[date] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password has uppercase, lowercase, and digit."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain digit")
        return v


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response schema."""
    model_config = {"from_attributes": True}
    
    id: UUID
    email: str
    name: str
    dob: Optional[date] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str
