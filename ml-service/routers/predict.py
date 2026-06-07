from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import numpy as np
import pandas as pd
from ml_models import (mood_model, mood_scaler,
    sentiment_model, vectorizer, label_encoder,
    sleep_rules, faq_kb, clean_text)

router = APIRouter()

class MoodPredictRequest(BaseModel):
    gender: str
    age: int
    year_of_study: int
    cgpa: float
    marital_status: str
    has_depression: bool
    has_anxiety: bool
    has_panic: bool

@router.post("/predict-mood")
def predict_mood(req: MoodPredictRequest):
    gender_enc = 1 if req.gender.lower() == 'male' else 0
    year_enc = req.year_of_study
    
    if req.cgpa >= 3.50: cgpa_enc = 4
    elif req.cgpa >= 3.00: cgpa_enc = 3
    elif req.cgpa >= 2.50: cgpa_enc = 2
    elif req.cgpa >= 2.00: cgpa_enc = 1
    else: cgpa_enc = 0
        
    marital_enc = 1 if req.marital_status.lower() == 'yes' else 0
    dep_enc = 1 if req.has_depression else 0
    anx_enc = 1 if req.has_anxiety else 0
    pan_enc = 1 if req.has_panic else 0
    
    feature_names = ['gender', 'age', 'year_of_study', 'cgpa', 'marital_status', 'has_depression', 'has_anxiety', 'has_panic']
    features = pd.DataFrame([[gender_enc, req.age, year_enc, cgpa_enc, marital_enc, dep_enc, anx_enc, pan_enc]], columns=feature_names)
    features_scaled = mood_scaler.transform(features)
    
    score = mood_model.predict(features_scaled)[0]
    score = max(1.0, min(5.0, score))
    
    if score >= 4.5: label = "Excellent"
    elif score >= 3.5: label = "Good"
    elif score >= 2.5: label = "Neutral"
    elif score >= 1.5: label = "Low"
    else: label = "Very Low"
        
    return {
        "mood_score": float(score),
        "mood_label": label,
        "confidence": "high"
    }

class SentimentRequest(BaseModel):
    text: str

@router.post("/analyze-sentiment")
def analyze_sentiment(req: SentimentRequest):
    cleaned = clean_text(req.text)
    vec = vectorizer.transform([cleaned])
    
    pred_encoded = sentiment_model.predict(vec)[0]
    sentiment = label_encoder.inverse_transform([pred_encoded])[0]
    
    try:
        proba = sentiment_model.predict_proba(vec)
        confidence = float(np.max(proba))
    except AttributeError:
        confidence = 0.85
        
    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "requires_crisis_support": True if sentiment == "CRISIS" else False
    }

class SleepRequest(BaseModel):
    sleep_hours: float
    stress_level: int
    sleep_quality: int

@router.post("/sleep-insights")
def sleep_insights(req: SleepRequest):
    recs = {"articles": [], "courses": [], "tools": [], "habits": []}
    issues = []
    
    if req.sleep_hours < sleep_rules["low_sleep"]["threshold"]:
        issues.append("low_sleep")
        for k, v in sleep_rules["low_sleep"]["recommendations"].items():
            recs[k].extend(v)
            
    if req.stress_level > sleep_rules["high_stress"]["threshold"]:
        issues.append("high_stress")
        for k, v in sleep_rules["high_stress"]["recommendations"].items():
            recs[k].extend(v)
            
    if req.sleep_quality < sleep_rules["poor_sleep_quality"]["threshold"]:
        issues.append("poor_sleep_quality")
        for k, v in sleep_rules["poor_sleep_quality"]["recommendations"].items():
            recs[k].extend(v)
            
    # Deduplicate
    for k in recs:
        recs[k] = list(set(recs[k]))
        
    score = (req.sleep_hours / 8.0 * 50) + (req.sleep_quality / 10.0 * 50)
    score = max(0.0, min(100.0, score))
    
    return {
        "sleep_score": float(score),
        "issues_detected": issues,
        "recommendations": recs
    }

@router.get("/faq-search")
def faq_search(q: str):
    cleaned_q = clean_text(q).split()
    query_words = [w for w in cleaned_q if len(w) > 3]
    
    results = []
    for entry in faq_kb:
        score = sum(1 for w in query_words if w in entry["keywords"])
        results.append({
            "id": entry["id"],
            "question": entry["question"],
            "answer": entry["answer"],
            "relevance_score": score
        })
        
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    filtered_results = [r for r in results if r["relevance_score"] > 0][:3]
    if not filtered_results:
        filtered_results = results[:3]
        
    return {
        "query": q,
        "results": filtered_results
    }
