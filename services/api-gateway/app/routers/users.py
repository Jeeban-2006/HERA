"""Users router for profile management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models import User, UserHealthProfile
from app.schemas.auth import UserResponse
from app.schemas.user import UserProfileUpdate, UserHealthProfileResponse, UserActivityResponse

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


@router.get("/me/activity", response_model=list[UserActivityResponse])
async def get_recent_activity(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's recent activity from audit logs."""
    from app.services.audit import AuditLog
    
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.target_user_id == str(user.id))
        .where(AuditLog.action.in_(["write", "update", "sos_triggered"]))
        .order_by(AuditLog.timestamp.desc())
        .limit(10)
    )
    logs = result.scalars().all()
    
    activity_list = []
    for log in logs:
        # Map resource_type to module and details
        module = "System"
        title = "Activity Logged"
        description = "System recorded an activity."
        icon_name = "Activity"
        
        if log.resource_type == "period_log":
            module = "Period Tracker"
            title = "Period Data Logged" if log.action == "write" else "Period Data Updated"
            description = "You updated your menstrual cycle data."
            icon_name = "Droplet"
        elif log.resource_type == "mood_log":
            module = "Mood Tracker"
            title = "Mood Entry Logged"
            description = "You logged your daily mood and symptoms."
            icon_name = "Moon"
        elif log.resource_type == "pcod_analysis":
            module = "PCOD Analyzer"
            title = "PCOD Assessment"
            description = "You ran a root-cause analysis for PCOD."
            icon_name = "Activity"
        elif log.resource_type == "sos_event":
            module = "Safety Routes"
            title = "SOS Triggered"
            description = "You triggered an emergency SOS."
            icon_name = "ShieldAlert"
            
        activity_list.append(
            UserActivityResponse(
                id=str(log.id),
                module=module,
                title=title,
                description=description,
                timestamp=log.timestamp.isoformat() + "Z",
                icon_name=icon_name,
            )
        )
        
    return activity_list
