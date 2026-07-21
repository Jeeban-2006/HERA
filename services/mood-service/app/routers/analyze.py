from fastapi import APIRouter
from app.schemas import CorrelationRequest, CorrelationResponse
from app.analysis.cycle_utils import get_cycle_day
from app.analysis.correlation import (
    compute_phase_averages,
    compute_correlation_score,
    detect_pattern,
    detect_pms,
    find_peak_energy_window
)
from app.analysis.forecasting import build_trend_data
from app.analysis.insights import get_insights

router = APIRouter()

@router.post("/analyze/correlation", response_model=CorrelationResponse)
async def analyze_correlation(body: CorrelationRequest):
    logs = [log.model_dump() for log in body.logs]
    
    # Auto-fill cycle_day if missing and last_period_date provided
    for log in logs:
        if log["cycle_day"] is None and body.last_period_date:
            log["cycle_day"] = get_cycle_day(log["date"], body.last_period_date, body.cycle_length)
            
    # Too few logs to do anything meaningful
    if len(logs) < 3:
        return CorrelationResponse(
            correlation_score=0.0,
            pattern_detected=False,
            phase_averages=[],
            pms_days=[],
            peak_energy_window={"start_day": 6, "end_day": 14, "phase": "Follicular"},
            insights=[],
            trend_data=[]
        )
        
    phase_averages = compute_phase_averages(logs, body.cycle_length)
    correlation_score = compute_correlation_score(logs)
    pattern_detected = detect_pattern(correlation_score)
    pms_detected, pms_days = detect_pms(phase_averages, body.last_period_date, body.cycle_length)
    peak_window = find_peak_energy_window(phase_averages, body.cycle_length)
    trend_data = build_trend_data(logs, phase_averages, body.cycle_length)
    insights = await get_insights(phase_averages, correlation_score, pms_detected, peak_window, trend_data)
    
    return CorrelationResponse(
        correlation_score=correlation_score,
        pattern_detected=pattern_detected,
        phase_averages=phase_averages,
        pms_days=pms_days,
        peak_energy_window=peak_window,
        insights=insights,
        trend_data=trend_data
    )
