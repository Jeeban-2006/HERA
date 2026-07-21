import json
import anthropic
from typing import List, Dict
from loguru import logger

from app.config import settings

def generate_static_insights(phase_averages: List[dict], correlation_score: float, pms_detected: bool, peak_window: dict, trend_data: List[dict]) -> List[dict]:
    
    # Get last 7 mood scores for sparkline
    last_7_moods = [p["mood_score"] for p in trend_data[-7:]]
    # Pad to 7 if less
    if len(last_7_moods) < 7 and len(last_7_moods) > 0:
        avg = sum(last_7_moods) / len(last_7_moods)
        last_7_moods = ([avg] * (7 - len(last_7_moods))) + last_7_moods
    elif len(last_7_moods) == 0:
        last_7_moods = [5] * 7
        
    insights = []
    
    # Insight 1: Peak
    insights.append({
        "type": "peak",
        "title": "Peak Energy Window",
        "message": f"Your energy tends to peak during your {peak_window['phase']} phase (days {peak_window['start_day']}-{peak_window['end_day']}).",
        "confidence": 0.8,
        "sparkline": last_7_moods
    })
    
    # Insight 2: PMS or Pattern
    if pms_detected:
        insights.append({
            "type": "pms_risk",
            "title": "PMS Risk Ahead",
            "message": "Your mood tends to dip in the days before your period. Planning lighter days during this window may help.",
            "confidence": correlation_score if correlation_score > 0 else 0.6,
            "sparkline": [pa["avg_mood"] for pa in phase_averages] if phase_averages else last_7_moods
        })
    else:
        pattern_str = "a clear hormonal pattern" if correlation_score >= 0.3 else "no strong pattern yet, keep logging"
        insights.append({
            "type": "pattern",
            "title": "Pattern Status",
            "message": f"Correlation score is {correlation_score} — {pattern_str}.",
            "confidence": correlation_score if correlation_score > 0 else 0.6,
            "sparkline": [pa["avg_mood"] for pa in phase_averages] if phase_averages else last_7_moods
        })
        
    # Insight 3: Stress
    luteal_avg = next((p['avg_mood'] for p in phase_averages if p['phase'] == 'luteal'), None)
    if luteal_avg and luteal_avg < 5:
        msg = "Lower mood scores cluster in your luteal phase — consider stress-reduction practices during this time."
    else:
        msg = "No strong stress clustering detected across your cycle."
        
    insights.append({
        "type": "stress",
        "title": "Stress Pattern",
        "message": msg,
        "confidence": 0.7,
        "sparkline": last_7_moods
    })
    
    return insights

async def generate_llm_insights(phase_averages: List[dict], correlation_score: float, pms_detected: bool, peak_window: dict) -> List[dict] | None:
    if not settings.ANTHROPIC_API_KEY:
        return None
        
    try:
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        summary = json.dumps({
            "phase_averages": phase_averages,
            "correlation_score": correlation_score,
            "pms_detected": pms_detected,
            "peak_window": peak_window
        })
        
        response = await client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=400,
            system="You are HERA, a compassionate women's health AI. Given mood pattern statistics, generate exactly 3 insights as a JSON array of objects with keys: type, title, message, confidence (0-1). type must be one of: peak, pms_risk, pattern, stress. message max 2 sentences, warm and actionable. Respond with ONLY the JSON array, no markdown.",
            messages=[{"role": "user", "content": summary}]
        )
        
        text = response.content[0].text
        # Clean json
        text = text.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        
        parsed = json.loads(text.strip())
        return parsed
    except Exception as e:
        logger.warning(f"LLM insight generation failed: {e}")
        return None

async def get_insights(phase_averages: List[dict], correlation_score: float, pms_detected: bool, peak_window: dict, trend_data: List[dict]) -> List[dict]:
    # Try LLM first
    llm_result = await generate_llm_insights(phase_averages, correlation_score, pms_detected, peak_window)
    
    if llm_result:
        # Attach sparklines to LLM insights (LLM doesn't generate them)
        last_7_moods = [p["mood_score"] for p in trend_data[-7:]]
        if len(last_7_moods) < 7 and len(last_7_moods) > 0:
            avg = sum(last_7_moods) / len(last_7_moods)
            last_7_moods = ([avg] * (7 - len(last_7_moods))) + last_7_moods
        elif len(last_7_moods) == 0:
            last_7_moods = [5] * 7
            
        for insight in llm_result:
            insight["sparkline"] = last_7_moods
        return llm_result
        
    # Fallback to static
    return generate_static_insights(phase_averages, correlation_score, pms_detected, peak_window, trend_data)
