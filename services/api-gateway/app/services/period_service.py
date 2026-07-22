"""Period tracker service — business logic for all period endpoints."""

from __future__ import annotations

import statistics
import uuid
from datetime import date, datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.period import PeriodLog, PeriodSymptom
from app.models.user import UserHealthProfile
from app.schemas.period import (
    StartPeriodRequest,
    EndPeriodRequest,
    LogSymptomsRequest,
    PeriodLogResponse,
    PeriodSymptomResponse,
    PeriodHistoryResponse,
    CurrentCycleStatus,
    CyclePrediction,
    CycleHealthScore,
)

import logging
logger = logging.getLogger(__name__)


# ── Phase helpers ────────────────────────────────────────────────────────────

def _get_phase(cycle_day: int) -> tuple[str, str]:
    """Return (phase_id, phase_label) for a given cycle day."""
    if cycle_day <= 5:
        return "menstrual", "Menstrual"
    elif cycle_day <= 14:
        return "follicular", "Follicular"
    elif cycle_day <= 16:
        return "ovulation", "Ovulation"
    else:
        return "luteal", "Luteal"


def _days_in_phase(cycle_day: int) -> int:
    """Days elapsed within the current phase."""
    if cycle_day <= 5:
        return cycle_day
    elif cycle_day <= 14:
        return cycle_day - 5
    elif cycle_day <= 16:
        return cycle_day - 14
    else:
        return cycle_day - 16


# ── Prediction engine ────────────────────────────────────────────────────────

def predict_next_period(
    period_logs: list[dict], profile_cycle_length: int = 28
) -> Optional[dict]:
    """
    Deterministic predictor using the last 3 completed cycles only.
    Same input -> same output. Clinically: more recent cycles > older cycles.
    """
    if not period_logs:
        return None

    completed = [p for p in period_logs if p.get("cycle_length") is not None]
    recent = completed[:3]  # logs are sorted DESC by start_date

    if not recent:
        # First period ever logged — no completed cycle yet
        predicted_length = profile_cycle_length
        confidence = 0.40
        is_irregular = False
        std_dev = 0.0
    else:
        lengths = [p["cycle_length"] for p in recent]
        predicted_length = round(sum(lengths) / len(lengths))
        std_dev = statistics.stdev(lengths) if len(lengths) > 1 else 0.0
        # CRITICAL: 7-day std_dev threshold is clinically accepted — do not change
        is_irregular = std_dev > 7.0

        base_confidence = {1: 0.55, 2: 0.70, 3: 0.82}.get(len(recent), 0.55)
        confidence = base_confidence * (0.75 if is_irregular else 1.0)

    latest_start: date = period_logs[0]["start_date"]
    next_start = latest_start + timedelta(days=predicted_length)
    ovulation = next_start - timedelta(days=14)

    return {
        "next_period_date": next_start,
        "next_period_date_range": {
            "earliest": next_start - timedelta(days=3),
            "latest":   next_start + timedelta(days=3),
        },
        "ovulation_date": ovulation,
        "fertile_window_start": ovulation - timedelta(days=2),
        "fertile_window_end":   ovulation + timedelta(days=2),
        "next_pms_window_start": next_start - timedelta(days=7),
        "predicted_cycle_length": predicted_length,
        "confidence": round(confidence, 2),
        "is_irregular": is_irregular,
        "irregularity_reason": (
            f"Your last {len(recent)} cycles varied by {round(std_dev, 1)} days"
            if is_irregular else None
        ),
    }


def calculate_health_score(
    period_logs: list[dict], symptom_logs: list[dict]
) -> dict:
    """4-factor cycle health score: regularity, duration, symptoms, completeness."""
    breakdown: dict[str, int] = {}

    # Regularity (40 points)
    completed = [p for p in period_logs if p.get("cycle_length")][:6]
    if len(completed) >= 2:
        std_dev = statistics.stdev([p["cycle_length"] for p in completed])
        regularity = max(0, 40 - int(std_dev * 3))
    else:
        regularity = 25  # Neutral — not enough data
    breakdown["regularity"] = regularity

    # Period duration (25 points)
    durations = [p["period_length"] for p in period_logs if p.get("period_length")][:3]
    if durations:
        avg_duration = sum(durations) / len(durations)
        if 3 <= avg_duration <= 7:
            duration_score = 25
        elif 2 <= avg_duration <= 8:
            duration_score = 15
        else:
            duration_score = 5
    else:
        duration_score = 15
    breakdown["duration"] = duration_score

    # Symptom severity (20 points)
    if symptom_logs:
        avg_pain = sum(s.get("pain_level") or 0 for s in symptom_logs) / len(symptom_logs)
        symptom_score = max(0, 20 - int(avg_pain * 2))
    else:
        symptom_score = 15
    breakdown["symptoms"] = symptom_score

    # Data completeness bonus (15 points)
    completeness = min(15, len(period_logs) * 3)
    breakdown["data_completeness"] = completeness

    total = sum(breakdown.values())

    if total >= 80:
        label, color = "Excellent", "#00FFD1"
    elif total >= 60:
        label, color = "Good", "#FFD166"
    elif total >= 40:
        label, color = "Fair", "#FF9F1C"
    else:
        label, color = "Needs Attention", "#FF5F7E"

    recs = {
        "Excellent": "Your cycle health looks great — keep up your current lifestyle!",
        "Good": "Your cycle is fairly regular. Track a few more cycles to improve accuracy.",
        "Fair": "Some irregularity detected. Consider logging symptoms daily for better insights.",
        "Needs Attention": "Your cycle shows significant variation. Consider speaking with a healthcare provider.",
    }

    return {
        "score": total,
        "label": label,
        "color": color,
        "breakdown": breakdown,
        "recommendation": recs[label],
    }


# ── Service functions ────────────────────────────────────────────────────────

async def start_period(
    db: AsyncSession, user_id: UUID, body: StartPeriodRequest
) -> PeriodLogResponse:
    """Log the start of a new period. Auto-ends any currently active period."""

    # 1. Auto-end any active period
    active_result = await db.execute(
        select(PeriodLog).where(
            and_(PeriodLog.user_id == user_id, PeriodLog.is_active == True)  # noqa: E712
        )
    )
    active = active_result.scalar_one_or_none()
    if active:
        auto_end = body.start_date - timedelta(days=1)
        if auto_end >= active.start_date:
            active.end_date = auto_end
            active.period_length = (auto_end - active.start_date).days + 1
        active.is_active = False

    # 2. Calculate cycle_length from previous period
    prev_result = await db.execute(
        select(PeriodLog)
        .where(
            and_(
                PeriodLog.user_id == user_id,
                PeriodLog.start_date < body.start_date,
            )
        )
        .order_by(PeriodLog.start_date.desc())
        .limit(1)
    )
    prev = prev_result.scalar_one_or_none()
    cycle_length = (body.start_date - prev.start_date).days if prev else None

    # 3. Create new period log
    new_log = PeriodLog(
        id=uuid.uuid4(),
        user_id=user_id,
        start_date=body.start_date,
        is_active=True,
        cycle_length=cycle_length,
        notes=body.notes,
    )
    db.add(new_log)
    await db.flush()  # get ID before creating symptom FK

    # 4. Auto-update user health profile (period tracker is source of truth)
    profile_result = await db.execute(
        select(UserHealthProfile).where(UserHealthProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile:
        profile.last_period_date = body.start_date
        if cycle_length and 21 <= cycle_length <= 35:
            profile.cycle_length = cycle_length

    # 5. Create opening symptom entry for start date
    if body.flow_intensity:
        symptom = PeriodSymptom(
            id=uuid.uuid4(),
            user_id=user_id,
            period_log_id=new_log.id,
            date=body.start_date,
            flow_intensity=body.flow_intensity,
            symptoms=[],
        )
        db.add(symptom)

    await db.commit()
    await db.refresh(new_log)
    return PeriodLogResponse.model_validate(new_log)


async def end_period(
    db: AsyncSession, user_id: UUID, body: EndPeriodRequest
) -> PeriodLogResponse:
    """Mark the currently active period as ended."""
    result = await db.execute(
        select(PeriodLog).where(
            and_(PeriodLog.user_id == user_id, PeriodLog.is_active == True)  # noqa: E712
        )
    )
    active = result.scalar_one_or_none()

    if not active:
        raise HTTPException(status_code=404, detail="No active period found. Start a period first.")

    if body.end_date < active.start_date:
        raise HTTPException(
            status_code=400,
            detail=f"End date ({body.end_date}) cannot be before start date ({active.start_date})"
        )

    active.end_date = body.end_date
    active.period_length = (body.end_date - active.start_date).days + 1
    active.is_active = False

    await db.commit()
    await db.refresh(active)
    return PeriodLogResponse.model_validate(active)


async def log_symptoms(
    db: AsyncSession, user_id: UUID, body: LogSymptomsRequest
) -> PeriodSymptomResponse:
    """Log or update symptoms for a specific day within a period."""

    # Find a period log covering this date
    result = await db.execute(
        select(PeriodLog).where(
            and_(
                PeriodLog.user_id == user_id,
                PeriodLog.start_date <= body.date,
                or_(
                    PeriodLog.end_date >= body.date,
                    PeriodLog.is_active == True,  # noqa: E712
                ),
            )
        ).order_by(PeriodLog.start_date.desc()).limit(1)
    )
    period = result.scalar_one_or_none()

    if not period:
        raise HTTPException(
            status_code=400,
            detail="No period logged for this date. Start a period first."
        )

    # Upsert symptom entry (unique on user_id + date)
    existing_result = await db.execute(
        select(PeriodSymptom).where(
            and_(
                PeriodSymptom.user_id == user_id,
                PeriodSymptom.date == body.date
            )
        )
    )
    symptom = existing_result.scalar_one_or_none()

    if symptom:
        # Update only fields that are provided
        if body.flow_intensity is not None:
            symptom.flow_intensity = body.flow_intensity
        if body.symptoms:
            symptom.symptoms = body.symptoms
        if body.pain_level is not None:
            symptom.pain_level = body.pain_level
        if body.notes is not None:
            symptom.notes = body.notes
    else:
        symptom = PeriodSymptom(
            id=uuid.uuid4(),
            user_id=user_id,
            period_log_id=period.id,
            date=body.date,
            flow_intensity=body.flow_intensity,
            symptoms=body.symptoms,
            pain_level=body.pain_level,
            notes=body.notes,
        )
        db.add(symptom)

    await db.commit()
    await db.refresh(symptom)
    return PeriodSymptomResponse.model_validate(symptom)


async def get_period_history(db: AsyncSession, user_id: UUID) -> PeriodHistoryResponse:
    """Get full period history with averages, prediction, and health score."""

    logs_result = await db.execute(
        select(PeriodLog)
        .where(PeriodLog.user_id == user_id)
        .order_by(PeriodLog.start_date.desc())
    )
    logs = logs_result.scalars().all()

    symptoms_result = await db.execute(
        select(PeriodSymptom).where(PeriodSymptom.user_id == user_id)
    )
    symptoms = symptoms_result.scalars().all()

    # Calculate averages
    cycle_lengths = [log.cycle_length for log in logs if log.cycle_length is not None]
    period_lengths = [log.period_length for log in logs if log.period_length is not None]
    avg_cycle = round(sum(cycle_lengths) / len(cycle_lengths), 1) if cycle_lengths else None
    avg_period = round(sum(period_lengths) / len(period_lengths), 1) if period_lengths else None

    # Serialize for prediction engine
    log_dicts = [
        {"start_date": log.start_date, "cycle_length": log.cycle_length,
         "period_length": log.period_length}
        for log in logs
    ]
    symptom_dicts = [
        {"pain_level": s.pain_level, "symptoms": s.symptoms}
        for s in symptoms
    ]

    # Get profile cycle length for prediction fallback
    profile_result = await db.execute(
        select(UserHealthProfile).where(UserHealthProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()
    profile_cycle = profile.cycle_length if profile else 28

    prediction_dict = predict_next_period(log_dicts, profile_cycle)
    health_dict = calculate_health_score(log_dicts, symptom_dicts) if logs else None

    prediction = CyclePrediction(**prediction_dict) if prediction_dict else None
    health_score = CycleHealthScore(**health_dict) if health_dict else None

    return PeriodHistoryResponse(
        logs=[PeriodLogResponse.model_validate(log) for log in logs],
        total_cycles=len(logs),
        average_cycle_length=avg_cycle,
        average_period_length=avg_period,
        prediction=prediction,
        health_score=health_score,
    )


async def get_current_cycle_day(db: AsyncSession, user_id: UUID) -> Optional[int]:
    """
    Get the current cycle day from the most recent period log.
    Returns None if no period logged or if data is stale (>35 days).
    Used by mood module for auto cycle_day calculation.
    """
    result = await db.execute(
        select(PeriodLog)
        .where(PeriodLog.user_id == user_id)
        .order_by(PeriodLog.start_date.desc())
        .limit(1)
    )
    latest = result.scalar_one_or_none()

    if not latest:
        return None

    cycle_day = (date.today() - latest.start_date).days + 1
    if cycle_day > 35:
        return None  # Data stale — don't use it
    return cycle_day


async def get_current_status(db: AsyncSession, user_id: UUID) -> CurrentCycleStatus:
    """Get current cycle status for the dashboard CycleRing widget."""

    cycle_day = await get_current_cycle_day(db, user_id)

    # Check for active period
    active_result = await db.execute(
        select(PeriodLog).where(
            and_(PeriodLog.user_id == user_id, PeriodLog.is_active == True)  # noqa: E712
        )
    )
    active = active_result.scalar_one_or_none()

    phase, phase_label, days_in_ph = None, None, None
    if cycle_day:
        phase, phase_label = _get_phase(cycle_day)
        days_in_ph = _days_in_phase(cycle_day)

    # Build prediction
    logs_result = await db.execute(
        select(PeriodLog)
        .where(PeriodLog.user_id == user_id)
        .order_by(PeriodLog.start_date.desc())
    )
    logs = logs_result.scalars().all()
    log_dicts = [
        {"start_date": lg.start_date, "cycle_length": lg.cycle_length}
        for lg in logs
    ]

    profile_result = await db.execute(
        select(UserHealthProfile).where(UserHealthProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()
    profile_cycle = profile.cycle_length if profile else 28

    prediction_dict = predict_next_period(log_dicts, profile_cycle)
    prediction = CyclePrediction(**prediction_dict) if prediction_dict else None

    return CurrentCycleStatus(
        cycle_day=cycle_day,
        phase=phase,
        phase_label=phase_label,
        days_in_phase=days_in_ph,
        is_menstruating=active is not None,
        active_period_start=active.start_date if active else None,
        prediction=prediction,
    )


async def get_symptoms_for_date(
    db: AsyncSession, user_id: UUID, log_date: date
) -> Optional[PeriodSymptomResponse]:
    """Get symptom log for a specific date, or None if not found."""
    result = await db.execute(
        select(PeriodSymptom).where(
            and_(
                PeriodSymptom.user_id == user_id,
                PeriodSymptom.date == log_date
            )
        )
    )
    symptom = result.scalar_one_or_none()
    if not symptom:
        return None
    return PeriodSymptomResponse.model_validate(symptom)
