from typing import List, Dict
import numpy as np

from app.analysis.cycle_utils import get_cycle_phase, get_phase_label

def build_trend_data(logs: List[dict], phase_averages: List[dict], cycle_length: int = 28) -> List[dict]:
    # Sort logs by date
    sorted_logs = sorted(logs, key=lambda x: x.get("date", ""))
    
    trend_data = []
    
    # Precompute phase map for easy lookup
    phase_avg_map = {pa["phase"]: pa["avg_mood"] for pa in phase_averages}
    
    # Process historical trend data
    for idx, log in enumerate(sorted_logs):
        cd = log.get("cycle_day")
        phase = get_cycle_phase(cd, cycle_length) if cd is not None else None
        
        date_val = log.get("date")
        if hasattr(date_val, "isoformat"):
            date_val = date_val.isoformat()
            
        point = {
            "date": date_val,
            "mood_score": log.get("mood_score"),
            "phase": phase,
            "phase_label": get_phase_label(phase) if phase else None
        }
        trend_data.append(point)
        
    # If we have >= 14 logs, generate forecast overlay
    if len(sorted_logs) >= 14:
        moods = [p["mood_score"] for p in trend_data]
        days = list(range(len(trend_data)))
        
        # Calculate linear trend
        try:
            slope, intercept = np.polyfit(days, moods, 1)
            
            # Add predicted score to each historical point
            for i, point in enumerate(trend_data):
                phase = point["phase"]
                phase_avg = phase_avg_map.get(phase, np.mean(moods))
                
                trend_val = intercept + slope * i
                
                # Blend phase typical value with overall trend
                predicted = (phase_avg * 0.6) + (trend_val * 0.4)
                # Clip between 1 and 10
                predicted = max(1.0, min(10.0, predicted))
                
                point["predicted_score"] = round(float(predicted), 1)
        except np.linalg.LinAlgError:
            # Polyfit failed, skip prediction
            pass
            
    return trend_data
