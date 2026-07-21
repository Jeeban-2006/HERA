import joblib
from pathlib import Path
from typing import Dict, List, Optional
from app.ml.feature_engineering import build_feature_vector

SUBTYPE_LABELS = {
    "insulin_resistant": "Insulin-Resistant PCOD",
    "inflammatory": "Inflammatory PCOD",
    "adrenal": "Adrenal PCOD",
    "post_pill": "Post-Pill PCOD"
}

class PCODPredictor:
    def __init__(self, model_dir: Path):
        self.model = joblib.load(model_dir / "model.joblib")
        self.scaler = joblib.load(model_dir / "scaler.joblib")
        self.label_encoder = joblib.load(model_dir / "label_encoder.joblib")
        self._loaded = True

    def predict(self, symptoms: List[str], lifestyle: Dict, lab_values: Optional[Dict]) -> Dict:
        # 1. Build features
        features = build_feature_vector(symptoms, lifestyle, lab_values)
        
        # 2. Scale last 9 columns
        continuous_features = features[:, 16:]
        scaled_continuous = self.scaler.transform(continuous_features)
        
        # Recombine
        features[:, 16:] = scaled_continuous
        
        # 3. Predict probabilities
        probs = self.model.predict_proba(features)[0]
        
        # 4. Get index of max prob
        predicted_idx = probs.argmax()
        
        # 5. Decode subtype
        subtype = self.label_encoder.inverse_transform([predicted_idx])[0]
        
        # 6. Confidence
        confidence = round(float(probs[predicted_idx]) * 100, 1)
        
        # 7. Risk score
        risk = len(symptoms) * 4
        if lifestyle.get("stress", 0) > 7:
            risk += 10
        if lifestyle.get("exercise", 0) < 2:
            risk += 10
        if lifestyle.get("sleep", 0) < 6:
            risk += 8
            
        risk += float(probs[predicted_idx] * 20)
        risk_score = min(100.0, round(risk))
        
        # 8. Driver breakdown
        drivers = [
            {
                "label": "Insulin Resistance", 
                "value": min(100, (lab_values.get("insulin", 0) if lab_values else 0) * 2 + (100 - lifestyle.get("exercise", 0)*10)),
                "color": "#FF5F7E"
            },
            {
                "label": "Inflammation",
                "value": min(100, (10 - lifestyle.get("sleep", 0)) * 10),
                "color": "#FFD166"
            },
            {
                "label": "Adrenal Activity",
                "value": min(100, lifestyle.get("stress", 0) * 10),
                "color": "#9B5DE5"
            },
            {
                "label": "Lifestyle Impact",
                "value": min(100, (10 - lifestyle.get("exercise", 0))*5 + lifestyle.get("stress", 0)*5 + (12 - lifestyle.get("sleep", 0))*3),
                "color": "#00FFD1"
            }
        ]
        
        # Normalize drivers dynamically just in case
        for d in drivers:
            if d["value"] < 0: d["value"] = 10
            elif d["value"] > 100: d["value"] = 90
            
        return {
            "subtype": subtype,
            "subtype_label": SUBTYPE_LABELS.get(subtype, "Unknown"),
            "risk_score": risk_score,
            "confidence": confidence,
            "driver_breakdown": drivers
        }
