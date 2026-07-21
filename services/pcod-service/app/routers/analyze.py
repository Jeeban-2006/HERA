from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from typing import Dict
import uuid
from datetime import datetime

from app.schemas import AnalyzeRequest, AnalyzeResponse, Recommendation
from app.ml.feature_engineering import get_lab_flags
from app.parsers.lab_report_parser import parse_lab_report

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(body: AnalyzeRequest, request: Request):
    predictor = request.app.state.predictor
    
    if predictor is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not trained — run ml_training/train_model.py"
        )
        
    recs_config = request.app.state.recommendations
    
    # 1. Predict
    lifestyle_dict = body.lifestyle.model_dump()
    lab_dict = body.lab_values.model_dump() if body.lab_values else None
    
    result = predictor.predict(body.symptoms, lifestyle_dict, lab_dict)
    
    # 2. Get lab flags
    lab_flags = get_lab_flags(lab_dict)
    
    # 3. Get recommendations
    raw_recs = recs_config.get(result["subtype"], [])
    recommendations = [Recommendation(**r) for r in raw_recs]
    
    # 4. Construct response
    return AnalyzeResponse(
        id=uuid.uuid4(),
        subtype=result["subtype"],
        subtype_label=result["subtype_label"],
        risk_score=result["risk_score"],
        confidence=result["confidence"],
        drivers=result["driver_breakdown"],
        recommendations=recommendations,
        lab_flags=lab_flags,
        model_used="xgboost",
        created_at=datetime.utcnow()
    )

@router.post("/parse-lab-report")
async def parse_lab_report_endpoint(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    contents = await file.read()
    extracted = parse_lab_report(contents)
    
    return {"extracted_values": extracted}
