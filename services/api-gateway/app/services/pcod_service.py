"""PCOD analysis service for database operations and ML integration."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
import httpx
import logging

from app.models import PCODAnalysis
from app.schemas.pcod import PCODAnalyzeRequest, PCODAnalyzeResponse, DriverBreakdown, Recommendation, LabFlag
from app.config import settings
from app.services.encryption import encrypt_dict

logger = logging.getLogger(__name__)


async def run_pcod_analysis(
    db: AsyncSession,
    user_id: UUID,
    body: PCODAnalyzeRequest
) -> PCODAnalyzeResponse:
    """Run PCOD analysis by calling ML service or using fallback logic."""
    
    # Try to call PCOD ML service
    ml_result = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.PCOD_SERVICE_URL}/analyze",
                json=body.model_dump()
            )
            if response.status_code == 200:
                ml_result = response.json()
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.warning(f"PCOD ML service unavailable: {e}, using fallback")
    
    # Use rule-based fallback if ML service unavailable
    if not ml_result:
        # Simple rule-based scoring for MVP
        score = len(body.symptoms) * 4.5
        if body.lifestyle.stress > 7:
            score += 10
        if body.lifestyle.exercise < 2:
            score += 8
        if body.lifestyle.sleep < 6:
            score += 7
        
        score = min(100, score)
        
        ml_result = {
            "subtype": "insulin_resistant",
            "subtype_label": "Insulin-Resistant PCOD",
            "risk_score": score,
            "confidence": 65.0,
            "drivers": [
                {"label": "Insulin Resistance", "value": 78, "color": "#FF5F7E"},
                {"label": "Inflammation", "value": 45, "color": "#FFD166"},
                {"label": "Adrenal Activity", "value": 32, "color": "#9B5DE5"},
                {"label": "Lifestyle Impact", "value": 61, "color": "#00FFD1"},
            ],
            "recommendations": [
                {
                    "category": "Diet",
                    "title": "Low-GI Nutrition Plan",
                    "desc": "Reduce refined carbs and sugar.",
                    "priority": "high",
                    "icon_name": "Salad"
                },
            ],
            "lab_flags": []
        }
    
    # Encrypt sensitive lab values before DB storage (HERA Layer 7 — data at rest)
    raw_lab_values = body.lab_values.model_dump() if body.lab_values else {}
    encrypted_lab_values = encrypt_dict(
        raw_lab_values,
        fields=["insulin", "testosterone", "lh_fsh", "amh", "glucose",
                "lhFsh", "lh-fsh"]  # cover all possible key names
    )

    # Save to database
    analysis = PCODAnalysis(
        id=uuid4(),
        user_id=user_id,
        symptoms={"items": body.symptoms},
        lifestyle_data=body.lifestyle.model_dump(),
        lab_values=encrypted_lab_values,
        subtype=ml_result.get("subtype"),
        risk_score=ml_result.get("risk_score"),
        confidence=ml_result.get("confidence"),
        recommendations=ml_result.get("recommendations", []),
        driver_breakdown={"drivers": ml_result.get("drivers", [])},
    )
    
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    # Format response
    return PCODAnalyzeResponse(
        id=analysis.id,
        subtype=ml_result.get("subtype"),
        subtype_label=ml_result.get("subtype_label", ""),
        risk_score=ml_result.get("risk_score", 0.0),
        confidence=ml_result.get("confidence", 0.0),
        drivers=[
            DriverBreakdown(**d) for d in ml_result.get("drivers", [])
        ],
        recommendations=[
            Recommendation(**r) for r in ml_result.get("recommendations", [])
        ],
        lab_flags=[
            LabFlag(**f) for f in ml_result.get("lab_flags", [])
        ],
        created_at=analysis.created_at,
    )


async def get_pcod_history(
    db: AsyncSession,
    user_id: UUID,
    page: int = 1,
    limit: int = 10
):
    """Get user's PCOD analysis history."""
    offset = (page - 1) * limit
    
    result = await db.execute(
        select(PCODAnalysis)
        .where(PCODAnalysis.user_id == user_id)
        .order_by(PCODAnalysis.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    analyses = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(
        select(PCODAnalysis).where(PCODAnalysis.user_id == user_id)
    )
    total = len(count_result.scalars().all())
    
    return {
        "analyses": [
            PCODAnalyzeResponse.model_validate(a) for a in analyses
        ],
        "total": total,
        "page": page
    }


async def get_pcod_analysis(db: AsyncSession, user_id: UUID, analysis_id: UUID):
    """Get a specific PCOD analysis."""
    result = await db.execute(
        select(PCODAnalysis).where(
            (PCODAnalysis.id == analysis_id) & 
            (PCODAnalysis.user_id == user_id)
        )
    )
    analysis = result.scalar_one_or_none()
    return analysis

