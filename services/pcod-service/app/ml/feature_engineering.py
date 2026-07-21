import numpy as np
from typing import List, Dict, Optional
from app.ml.constants import SYMPTOM_ORDER, SYMPTOM_LABEL_MAP

LAB_CLINICAL_RANGES = {
    "insulin":      {"low": 2,  "normal_max": 20,  "high": 40, "unit": "μIU/mL"},
    "testosterone": {"low": 15, "normal_max": 70,  "high": 100,"unit": "ng/dL"},
    "lh_fsh_ratio": {"low": 0.5,"normal_max": 2.0, "high": 4,  "unit": ""},
    "amh":          {"low": 1.0,"normal_max": 3.5, "high": 12, "unit": "ng/mL"},
    "glucose":      {"low": 60, "normal_max": 100, "high": 180,"unit": "mg/dL"},
}

def build_feature_vector(symptoms: List[str], lifestyle: Dict, lab_values: Optional[Dict]) -> np.ndarray:
    """Converts API request to 25-feature numpy array."""
    
    # 1. Initialize 16 symptom features to 0
    features = {s: 0 for s in SYMPTOM_ORDER}
    
    # 2. Map symptoms
    for s in symptoms:
        mapped = SYMPTOM_LABEL_MAP.get(s)
        if mapped in features:
            features[mapped] = 1
            
    # 3. Lifestyle
    feature_list = [features[s] for s in SYMPTOM_ORDER]
    feature_list.append(lifestyle.get("sleep", 0))
    feature_list.append(lifestyle.get("stress", 0))
    feature_list.append(lifestyle.get("exercise", 0))
    feature_list.append(lifestyle.get("water", 0))
    
    # 4. Labs
    lab_keys = ["insulin", "testosterone", "lh_fsh_ratio", "amh", "glucose"]
    for k in lab_keys:
        if not lab_values or k not in lab_values or lab_values[k] is None:
            feature_list.append(-1)
        else:
            feature_list.append(lab_values[k])
            
    # 5. Return 2D array
    return np.array(feature_list).reshape(1, 25)

def get_lab_flags(lab_values: Optional[Dict]) -> List[Dict]:
    """Generates clinical flags for lab values."""
    if not lab_values:
        return []
        
    flags = []
    # Map frontend display names
    marker_names = {
        "insulin": "Fasting Insulin",
        "testosterone": "Testosterone (Free)",
        "lh_fsh_ratio": "LH/FSH Ratio",
        "amh": "AMH",
        "glucose": "Fasting Glucose"
    }
    
    for key, val in lab_values.items():
        if val is None or key not in LAB_CLINICAL_RANGES:
            continue
            
        ranges = LAB_CLINICAL_RANGES[key]
        
        status = "normal"
        if val < ranges["low"]:
            status = "low"
        elif val > ranges["normal_max"] * 1.15:
            status = "high"
        elif val > ranges["normal_max"]:
            status = "borderline"
            
        unit = ranges["unit"]
        unit_str = f" {unit}" if unit else ""
        
        flags.append({
            "marker": marker_names.get(key, key.title()),
            "value": f"{val}{unit_str}",
            "status": status,
            "range": f"{ranges['low']}–{ranges['normal_max']}{unit_str}"
        })
        
    return flags

def has_lab_data(lab_values: Optional[Dict]) -> bool:
    """Checks if sufficient lab data is present."""
    if not lab_values:
        return False
    count = sum(1 for v in lab_values.values() if v is not None)
    return count >= 2
