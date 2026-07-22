"""Period prediction engine for the Mood Service.

Mirrors the prediction logic in services/api-gateway/app/services/period_service.py.
Same algorithm — used here for mood correlation enhancement.
"""

from __future__ import annotations
import statistics
from datetime import date, timedelta
from typing import Optional

# CRITICAL CONSTANTS — do not change without clinical review
_IRREGULARITY_STD_DEV_THRESHOLD = 7.0  # days — clinically accepted threshold
_CONFIDENCE_BY_SAMPLES = {1: 0.55, 2: 0.70, 3: 0.82}
_IRREGULARITY_CONFIDENCE_PENALTY = 0.75


def predict_next_period(
    period_logs: list[dict],
    profile_cycle_length: int = 28,
) -> Optional[dict]:
    """
    Deterministic period predictor using last 3 completed cycles only.
    More recent cycles are more predictive than older ones.

    Args:
        period_logs: List of dicts with keys: start_date (date), cycle_length (int|None).
                     MUST be sorted DESC by start_date.
        profile_cycle_length: Fallback cycle length from user health profile.

    Returns:
        Prediction dict or None if no logs provided.
    """
    if not period_logs:
        return None

    completed = [p for p in period_logs if p.get("cycle_length") is not None]
    recent = completed[:3]  # use last 3 completed cycles only

    if not recent:
        # First period — no completed cycle data yet
        predicted_length = profile_cycle_length
        confidence = 0.40
        is_irregular = False
        std_dev = 0.0
    else:
        lengths = [p["cycle_length"] for p in recent]
        predicted_length = round(sum(lengths) / len(lengths))
        std_dev = statistics.stdev(lengths) if len(lengths) > 1 else 0.0
        is_irregular = std_dev > _IRREGULARITY_STD_DEV_THRESHOLD

        base_confidence = _CONFIDENCE_BY_SAMPLES.get(len(recent), 0.55)
        confidence = base_confidence * (
            _IRREGULARITY_CONFIDENCE_PENALTY if is_irregular else 1.0
        )

    latest_start: date = period_logs[0]["start_date"]
    next_start = latest_start + timedelta(days=predicted_length)
    ovulation = next_start - timedelta(days=14)

    return {
        "next_period_date": next_start.isoformat(),
        "next_period_date_range": {
            "earliest": (next_start - timedelta(days=3)).isoformat(),
            "latest":   (next_start + timedelta(days=3)).isoformat(),
        },
        "ovulation_date": ovulation.isoformat(),
        "fertile_window_start": (ovulation - timedelta(days=2)).isoformat(),
        "fertile_window_end":   (ovulation + timedelta(days=2)).isoformat(),
        "next_pms_window_start": (next_start - timedelta(days=7)).isoformat(),
        "predicted_cycle_length": predicted_length,
        "confidence": round(confidence, 2),
        "is_irregular": is_irregular,
        "irregularity_reason": (
            f"Your last {len(recent)} cycles varied by {round(std_dev, 1)} days"
            if is_irregular else None
        ),
    }


def calculate_health_score(
    period_logs: list[dict],
    symptom_logs: list[dict],
) -> dict:
    """4-factor cycle health score used by mood correlation engine."""
    breakdown: dict[str, int] = {}

    # Regularity (40 points)
    completed = [p for p in period_logs if p.get("cycle_length")][:6]
    if len(completed) >= 2:
        std_dev = statistics.stdev([p["cycle_length"] for p in completed])
        regularity = max(0, 40 - int(std_dev * 3))
    else:
        regularity = 25
    breakdown["regularity"] = regularity

    # Duration (25 points)
    durations = [p["period_length"] for p in period_logs if p.get("period_length")][:3]
    if durations:
        avg_d = sum(durations) / len(durations)
        duration_score = 25 if 3 <= avg_d <= 7 else (15 if 2 <= avg_d <= 8 else 5)
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

    # Completeness bonus (15 points)
    breakdown["data_completeness"] = min(15, len(period_logs) * 3)

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
        "Good": "Track a few more cycles to improve prediction accuracy.",
        "Fair": "Some irregularity detected. Daily symptom logging improves insights.",
        "Needs Attention": "Significant cycle variation. Consider speaking with a healthcare provider.",
    }

    return {
        "score": total,
        "label": label,
        "color": color,
        "breakdown": breakdown,
        "recommendation": recs[label],
    }
