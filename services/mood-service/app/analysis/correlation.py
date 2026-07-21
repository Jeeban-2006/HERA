from datetime import date, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict
import numpy as np
from scipy.stats import pearsonr

from app.analysis.cycle_utils import get_cycle_phase, get_phase_label

def compute_phase_averages(logs: List[dict], cycle_length: int = 28) -> List[dict]:
    phase_data = defaultdict(list)
    for log in logs:
        cycle_day = log.get("cycle_day")
        if cycle_day is None:
            continue
            
        phase = get_cycle_phase(cycle_day, cycle_length)
        mood = log.get("mood_score", 0)
        energy = log.get("energy_level") if log.get("energy_level") is not None else mood
        
        phase_data[phase].append((mood, energy))
        
    averages = []
    for phase, data in phase_data.items():
        if len(data) > 0:
            avg_mood = sum(item[0] for item in data) / len(data)
            avg_energy = sum(item[1] for item in data) / len(data)
            averages.append({
                "phase": phase,
                "phase_label": get_phase_label(phase),
                "avg_mood": round(avg_mood, 1),
                "avg_energy": round(avg_energy, 1),
                "days_logged": len(data)
            })
            
    # Sort phases in cycle order
    order = {"menstrual": 1, "follicular": 2, "ovulation": 3, "luteal": 4}
    averages.sort(key=lambda x: order.get(x["phase"], 5))
    return averages

def compute_correlation_score(logs: List[dict]) -> float:
    cycle_days = []
    mood_scores = []
    
    for log in logs:
        cd = log.get("cycle_day")
        ms = log.get("mood_score")
        if cd is not None and ms is not None:
            cycle_days.append(cd)
            mood_scores.append(ms)
            
    if len(cycle_days) < 3:
        return 0.0
        
    try:
        # Calculate Pearson correlation coefficient
        # Note: cycle day isn't perfectly linear with mood, but it's a proxy 
        # for identifying strong fluctuations across the cycle.
        corr, _ = pearsonr(cycle_days, mood_scores)
        if np.isnan(corr):
            return 0.0
        return round(abs(corr), 2)
    except Exception:
        return 0.0

def detect_pattern(correlation_score: float) -> bool:
    return correlation_score >= 0.3

def detect_pms(phase_averages: List[dict], last_period_date: date | None, cycle_length: int = 28) -> Tuple[bool, List[str]]:
    luteal_avg = None
    follicular_avg = None
    
    for pa in phase_averages:
        if pa["phase"] == "luteal":
            luteal_avg = pa["avg_mood"]
        elif pa["phase"] == "follicular":
            follicular_avg = pa["avg_mood"]
            
    pms_detected = False
    pms_days = []
    
    if luteal_avg is not None and follicular_avg is not None:
        if (follicular_avg - luteal_avg) >= 1.5:
            pms_detected = True
            
    if pms_detected and last_period_date is not None:
        # Calculate next cycle's luteal phase dates
        next_period_start = last_period_date + timedelta(days=cycle_length)
        # Luteal starts after ovulation + 2
        ovulation_day = cycle_length - 14
        luteal_start_day = ovulation_day + 3 
        
        # We find the dates corresponding to luteal_start_day up to cycle_length
        # e.g. for 28 day cycle, luteal is day 17 to 28.
        # This means days from next_period_start - 12 to next_period_start - 1
        days_in_luteal = cycle_length - luteal_start_day + 1
        
        for d in range(luteal_start_day, cycle_length + 1):
            day_date = last_period_date + timedelta(days=d - 1)
            # If the calculated date is in the past, calculate for the next cycle
            if day_date < date.today():
                day_date = day_date + timedelta(days=cycle_length)
            pms_days.append(day_date.isoformat())
            
        pms_days.sort()
            
    return pms_detected, pms_days

def find_peak_energy_window(phase_averages: List[dict], cycle_length: int = 28) -> dict:
    if not phase_averages:
        return {"start_day": 6, "end_day": 14, "phase": "Follicular"}
        
    highest_phase = max(phase_averages, key=lambda x: x["avg_energy"])
    
    # Check if peak is clear
    lowest_phase = min(phase_averages, key=lambda x: x["avg_energy"])
    if highest_phase["avg_energy"] - lowest_phase["avg_energy"] < 0.5:
        # Default to follicular if no clear peak
        return {"start_day": 6, "end_day": cycle_length - 14, "phase": "Follicular"}
        
    phase = highest_phase["phase"]
    ovulation_day = cycle_length - 14
    
    if phase == "menstrual":
        return {"start_day": 1, "end_day": 5, "phase": "Menstrual"}
    elif phase == "follicular":
        return {"start_day": 6, "end_day": ovulation_day, "phase": "Follicular"}
    elif phase == "ovulation":
        return {"start_day": ovulation_day + 1, "end_day": ovulation_day + 2, "phase": "Ovulation"}
    elif phase == "luteal":
        return {"start_day": ovulation_day + 3, "end_day": cycle_length, "phase": "Luteal"}
        
    return {"start_day": 6, "end_day": 14, "phase": "Follicular"}
