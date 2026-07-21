"""Mood tracking router endpoints."""

from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.schemas.mood import MoodLogRequest, MoodLogResponse, MoodLogsListResponse, CorrelationResponse
from app.dependencies import get_db, get_current_user
from app.models import User
from app.services.mood_service import create_mood_log, get_mood_logs, get_mood_correlation
from app.services.audit import write_audit_log
from app.middleware.rate_limit import limiter
from app.monitoring import mood_logs_total

router = APIRouter()


@router.post("/log", response_model=MoodLogResponse, status_code=201)
@limiter.limit("20/minute")
async def log_mood(
    request: Request,
    body: MoodLogRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Log today's mood entry."""
    try:
        result = await create_mood_log(db, user.id, body)
        mood_logs_total.inc()
        await write_audit_log(
            db,
            accessor_user_id=str(user.id),
            target_user_id=str(user.id),
            resource_type="mood_log",
            action="write",
            resource_id=str(result.id),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        return result
    except Exception as e:
        if "duplicate" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Already logged mood for this date"
            )
        raise


@router.get("/logs", response_model=MoodLogsListResponse)
@limiter.limit("60/minute")
async def get_logs(
    request: Request,
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get mood logs for date range."""
    return await get_mood_logs(db, user.id, start_date, end_date, page, limit)


@router.get("/correlation")
async def get_correlation(
    days: int = Query(30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get mood-hormone correlation analysis."""
    return await get_mood_correlation(db, user.id, days)

