import joblib
import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATA_DIR   = os.path.join(BASE_DIR, 'data')

# Load all models
mood_model       = joblib.load(os.path.join(MODELS_DIR, 'mood_predictor.pkl'))
mood_scaler      = joblib.load(os.path.join(MODELS_DIR, 'mood_scaler.pkl'))
sentiment_model  = joblib.load(os.path.join(MODELS_DIR, 'sentiment_classifier.pkl'))
vectorizer       = joblib.load(os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl'))
label_encoder    = joblib.load(os.path.join(MODELS_DIR, 'sentiment_label_encoder.pkl'))

# Load JSON data
with open(os.path.join(DATA_DIR, 'sleep_insights.json'))     as f: sleep_rules = json.load(f)
with open(os.path.join(DATA_DIR, 'sleep_correlations.json')) as f: sleep_corr  = json.load(f)
with open(os.path.join(DATA_DIR, 'faq_knowledge_base.json')) as f: faq_kb      = json.load(f)

# Text cleaning (same as training)
def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text
