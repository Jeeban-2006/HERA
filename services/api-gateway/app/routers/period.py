"""Period tracker router endpoints."""

from datetime import date
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.period import (
    StartPeriodRequest, EndPeriodRequest, LogSymptomsRequest,
    PeriodLogResponse, PeriodSymptomResponse, PeriodHistoryResponse,
    CurrentCycleStatus,
)
from app.services.period_service import (
    start_period, end_period, log_symptoms,
    get_period_history, get_current_status, get_symptoms_for_date,
)
from app.services.audit import write_audit_log

router = APIRouter()


@router.post("/start", response_model=PeriodLogResponse, status_code=201)
async def start_period_route(
    request: Request,
    body: StartPeriodRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Log the start of a new menstrual period."""
    result = await start_period(db, user.id, body)
    await write_audit_log(
        db,
        accessor_user_id=str(user.id),
        target_user_id=str(user.id),
        resource_type="period_log",
        action="write",
        resource_id=str(result.id),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return result


@router.post("/end", response_model=PeriodLogResponse)
async def end_period_route(
    request: Request,
    body: EndPeriodRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark the current active period as ended."""
    result = await end_period(db, user.id, body)
    await write_audit_log(
        db,
        accessor_user_id=str(user.id),
        target_user_id=str(user.id),
        resource_type="period_log",
        action="update",
        resource_id=str(result.id),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return result


@router.post("/symptoms", response_model=PeriodSymptomResponse, status_code=201)
async def log_symptoms_route(
    body: LogSymptomsRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Log or update symptoms for a specific day within a period."""
    return await log_symptoms(db, user.id, body)


@router.get("/history", response_model=PeriodHistoryResponse)
async def get_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get full period history with predictions and health score."""
    return await get_period_history(db, user.id)


@router.get("/current", response_model=CurrentCycleStatus)
async def get_current(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current cycle day, phase, and prediction. Polled hourly by dashboard."""
    return await get_current_status(db, user.id)


@router.get("/symptoms/{log_date}")
async def get_symptoms_date(
    log_date: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get symptom log for a specific date."""
    return await get_symptoms_for_date(db, user.id, log_date)
