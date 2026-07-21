"""Users router for profile management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models import User, UserHealthProfile
from app.schemas.auth import UserResponse
from app.schemas.user import UserProfileUpdate, UserHealthProfileResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    body: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile."""
    
    # Update User fields
    if body.name is not None:
        user.name = body.name
    if body.dob is not None:
        user.dob = body.dob
    
    # Update health profile if provided
    if body.cycle_length is not None or body.last_period_date is not None:
        # Fetch or create health profile
        result = await db.execute(
            select(UserHealthProfile).where(UserHealthProfile.user_id == user.id)
        )
        profile = result.scalar_one_or_none()
        
        if not profile:
            profile = UserHealthProfile(
                user_id=user.id,
                cycle_length=body.cycle_length or 28
            )
            db.add(profile)
        
        if body.cycle_length is not None:
            profile.cycle_length = body.cycle_length
        if body.last_period_date is not None:
            profile.last_period_date = body.last_period_date
    
    # Update health goals if provided
    if body.health_goals is not None:
        result = await db.execute(
            select(UserHealthProfile).where(UserHealthProfile.user_id == user.id)
        )
        profile = result.scalar_one_or_none()
        
        if profile:
            profile.health_goals = {"goals": body.health_goals}
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.get("/me/health-profile", response_model=UserHealthProfileResponse)
async def get_health_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's health profile."""
    result = await db.execute(
        select(UserHealthProfile).where(UserHealthProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found"
        )
    
    return UserHealthProfileResponse.model_validate(profile)

