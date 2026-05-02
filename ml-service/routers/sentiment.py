from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import re
from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# --- Model Initialization ---
# Hugging Face (Disabled to prevent startup hang from downloading model)
classifier = None
# try:
#     classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)
# except Exception as e:
#     print(f"Warning: Hugging Face model failed to load: {e}")
#     classifier = None

# Groq
try:
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception as e:
    print(f"Warning: Groq client failed to initialize: {e}")
    groq_client = None

class SentimentRequest(BaseModel):
    text: str
    source: str # "journal" | "forum"

# --- Crisis Keyword Detection ---
CRISIS_KEYWORDS = [
    "end my life", "kill myself", "don't want to live",
    "can't go on", "no reason to live", "suicide", "self harm",
    "hurt myself", "worthless", "hopeless", "disappear forever"
]
crisis_pattern = re.compile(r'\b(' + '|'.join(CRISIS_KEYWORDS) + r')\b', re.IGNORECASE)

def analyze_with_groq_fallback(text: str):
    """Uses Groq as a fallback for sentiment analysis."""
    if not groq_client:
        raise HTTPException(status_code=503, detail="All sentiment analysis services are unavailable.")

    prompt = f"""Analyze the sentiment of this text and return ONLY a valid JSON object with the specified keys:
{{
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE|CRISIS",
  "confidence": 0.0-1.0,
  "crisis_detected": true|false
}}

Text: "{text}"

Return ONLY the JSON object, no additional text."""
    try:
        response = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=100
        )
        
        # Extract and parse the JSON response
        json_text = response.choices[0].message.content.strip()
        result = json.loads(json_text)
        # Add empty emotions dict to maintain consistent response structure
        result["emotions"] = {}
        return result
    except Exception as e:
        print(f"Error calling Groq fallback API: {e}")
        raise HTTPException(status_code=500, detail="Groq fallback sentiment analysis failed.")


@router.post("/analyze/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    text_to_analyze = request.text
    
    # 1. Always check for crisis keywords first for immediate response
    if crisis_pattern.search(text_to_analyze):
        return {
            "sentiment": "CRISIS",
            "emotions": {},
            "confidence": 1.0,
            "crisis_detected": True
        }

    # 2. Try Hugging Face model if available
    if classifier:
        try:
            results = classifier(text_to_analyze)
            emotions = {item['label']: item['score'] for item in results[0]}
            
            dominant_emotion = max(emotions, key=emotions.get)
            confidence = emotions[dominant_emotion]

            sentiment = "NEUTRAL"
            if dominant_emotion == 'joy':
                sentiment = 'POSITIVE'
            elif dominant_emotion in ['sadness', 'disgust', 'anger', 'fear']:
                sentiment = 'NEGATIVE'

            is_crisis = (emotions.get('fear', 0) + emotions.get('sadness', 0)) > 1.5 and confidence > 0.75
            if is_crisis:
                sentiment = 'CRISIS'
            
            return {
                "sentiment": sentiment,
                "emotions": emotions,
                "confidence": confidence,
                "crisis_detected": is_crisis
            }
        except Exception as e:
            print(f"Hugging Face model analysis failed: {e}. Falling back to Groq.")
            # Fall through to Groq fallback
    
    # 3. If Hugging Face fails or is unavailable, use Groq
    return analyze_with_groq_fallback(text_to_analyze)
