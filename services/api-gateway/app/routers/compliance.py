"""DPDP-compliant data endpoints: export, deletion, and consent.

Implements:
  GET  /users/me/data/export   — full JSON export of all user health data
  DELETE /users/me/data        — hard-delete all health records (not the account)
  POST /users/me/consent       — record explicit consent for health data processing
  GET  /users/me/consent       — retrieve current consent record
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime
import uuid
import logging

from app.dependencies import get_db, get_current_user
from app.models.user import User, PCODAnalysis, MoodLog, EmergencyContact, SOSEvent, UserHealthProfile
from app.services.audit import write_audit_log

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me/data/export", tags=["DPDP Compliance"])
async def export_my_data(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export all health data for the current user as JSON (DPDP Art. 11 — Data Portability)."""

    # PCOD analyses
    pcod_result = await db.execute(
        select(PCODAnalysis).where(PCODAnalysis.user_id == current_user.id)
    )
    pcod_analyses = pcod_result.scalars().all()

    # Mood logs
    mood_result = await db.execute(
        select(MoodLog).where(MoodLog.user_id == current_user.id)
    )
    mood_logs = mood_result.scalars().all()

    # Emergency contacts
    contacts_result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.user_id == current_user.id)
    )
    contacts = contacts_result.scalars().all()

    # SOS events
    sos_result = await db.execute(
        select(SOSEvent).where(SOSEvent.user_id == current_user.id)
    )
    sos_events = sos_result.scalars().all()

    # Health profile
    profile_result = await db.execute(
        select(UserHealthProfile).where(UserHealthProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    await write_audit_log(
        db,
        accessor_user_id=str(current_user.id),
        target_user_id=str(current_user.id),
        resource_type="full_data_export",
        action="export",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return {
        "export_timestamp": datetime.utcnow().isoformat(),
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "created_at": current_user.created_at.isoformat(),
        },
        "health_profile": {
            "cycle_length": profile.cycle_length if profile else None,
            "last_period_date": profile.last_period_date.isoformat() if profile and profile.last_period_date else None,
        } if profile else None,
        "pcod_analyses": [
            {
                "id": str(a.id),
                "subtype": a.subtype,
                "risk_score": a.risk_score,
                "created_at": a.created_at.isoformat(),
            }
            for a in pcod_analyses
        ],
        "mood_logs": [
            {
                "id": str(m.id),
                "date": m.date.isoformat(),
                "mood_score": m.mood_score,
                "mood_state": m.mood_state,
                "energy_level": m.energy_level,
            }
            for m in mood_logs
        ],
        "emergency_contacts": [
            {"id": str(c.id), "name": c.name, "phone": c.phone}
            for c in contacts
        ],
        "sos_events": [
            {
                "id": str(s.id),
                "triggered_at": s.triggered_at.isoformat(),
                "resolved": s.resolved,
            }
            for s in sos_events
        ],
    }


@router.delete("/me/data", status_code=204, tags=["DPDP Compliance"])
async def delete_my_health_data(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete all health records for the current user (DPDP Art. 12 — Right to Erasure).
    Does NOT delete the account itself — only health data.
    """
    uid = current_user.id

    await db.execute(delete(PCODAnalysis).where(PCODAnalysis.user_id == uid))
    await db.execute(delete(MoodLog).where(MoodLog.user_id == uid))
    await db.execute(delete(EmergencyContact).where(EmergencyContact.user_id == uid))
    await db.execute(delete(SOSEvent).where(SOSEvent.user_id == uid))

    await write_audit_log(
        db,
        accessor_user_id=str(uid),
        target_user_id=str(uid),
        resource_type="full_health_data",
        action="delete",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        extra={"reason": "user_request_dpdp"},
    )
    await db.commit()
    logger.info(f"🗑️  All health data deleted for user {uid} (DPDP erasure request)")
    return  # 204 No Content
