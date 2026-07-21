"""PCOD analyzer router endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.pcod import PCODAnalyzeRequest, PCODAnalyzeResponse, PCODHistoryResponse
from app.dependencies import get_db, get_current_user
from app.models import User
from app.services.pcod_service import run_pcod_analysis, get_pcod_history, get_pcod_analysis
from app.services.audit import write_audit_log
from app.middleware.rate_limit import limiter
from app.monitoring import pcod_analyses_total

router = APIRouter()


@router.post("/analyze", response_model=PCODAnalyzeResponse, status_code=201)
@limiter.limit("5/minute")
async def analyze_pcod(
    request: Request,
    body: PCODAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Run PCOD analysis with ML model or fallback."""
    result = await run_pcod_analysis(db, user.id, body)
    pcod_analyses_total.labels(subtype=result.subtype or "unknown").inc()
    await write_audit_log(
        db,
        accessor_user_id=str(user.id),
        target_user_id=str(user.id),
        resource_type="pcod_analysis",
        action="write",
        resource_id=str(result.id),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        extra={"subtype": result.subtype, "risk_score": result.risk_score},
    )
    return result


@router.get("/history", response_model=PCODHistoryResponse)
@limiter.limit("60/minute")
async def get_analysis_history(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get user's PCOD analysis history."""
    return await get_pcod_history(db, user.id, page, limit)


@router.get("/history/{analysis_id}", response_model=PCODAnalyzeResponse)
async def get_single_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a specific PCOD analysis."""
    try:
        from uuid import UUID
        analysis_uuid = UUID(analysis_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format"
        )
    
    analysis = await get_pcod_analysis(db, user.id, analysis_uuid)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    return PCODAnalyzeResponse.model_validate(analysis)

