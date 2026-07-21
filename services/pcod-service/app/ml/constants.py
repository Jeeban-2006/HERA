"""Shared constants for ML feature alignment to prevent drift."""

SYMPTOM_ORDER = [
    "irregular_periods", 
    "weight_gain", 
    "acne", 
    "hair_thinning",
    "excess_facial_hair", 
    "fatigue", 
    "mood_swings", 
    "bloating",
    "pelvic_pain", 
    "heavy_periods", 
    "absent_periods", 
    "cravings",
    "brain_fog", 
    "sleep_issues", 
    "low_libido", 
    "skin_darkening"
]

SYMPTOM_LABEL_MAP = {
    "Irregular periods": "irregular_periods",
    "Weight gain": "weight_gain",
    "Acne": "acne",
    "Hair thinning": "hair_thinning",
    "Excess facial hair": "excess_facial_hair",
    "Fatigue": "fatigue",
    "Mood swings": "mood_swings",
    "Bloating": "bloating",
    "Pelvic pain": "pelvic_pain",
    "Heavy periods": "heavy_periods",
    "Absent periods": "absent_periods",
    "Cravings": "cravings",
    "Brain fog": "brain_fog",
    "Sleep issues": "sleep_issues",
    "Low libido": "low_libido",
    "Skin darkening": "skin_darkening"
}

SUBTYPES = ["insulin_resistant", "inflammatory", "adrenal", "post_pill"]
