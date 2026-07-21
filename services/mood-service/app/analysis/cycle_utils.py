from datetime import date

def get_cycle_phase(cycle_day: int, cycle_length: int = 28) -> str:
    """Get the cycle phase based on the current day and total cycle length.
    Mirrors frontend apps/web/src/lib/utils/cycle.ts
    """
    ovulation_day = cycle_length - 14
    if cycle_day <= 5:
        return "menstrual"
    elif cycle_day <= ovulation_day:
        return "follicular"
    elif cycle_day <= ovulation_day + 2:
        return "ovulation"
    else:
        return "luteal"

def get_phase_label(phase: str) -> str:
    labels = {
        "menstrual": "Menstrual",
        "follicular": "Follicular",
        "ovulation": "Ovulation",
        "luteal": "Luteal"
    }
    return labels.get(phase, "Unknown")

def get_phase_color(phase: str) -> str:
    colors = {
        "menstrual": "#FF5F7E",
        "follicular": "#00FFD1",
        "ovulation": "#FFD166",
        "luteal": "#9B5DE5"
    }
    return colors.get(phase, "#000000")

def get_cycle_day(log_date: date, last_period_date: date | None, cycle_length: int = 28) -> int | None:
    if last_period_date is None:
        return None
    days_since = (log_date - last_period_date).days
    if days_since < 0:
        return None
    return (days_since % cycle_length) + 1
