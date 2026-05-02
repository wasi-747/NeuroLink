from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize the Groq client
try:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    client = None

class ReportRequest(BaseModel):
    user_stats: Dict[str, Any]

SYSTEM_PROMPT = """You are a compassionate mental wellness coach for university students. Your name is Aria.
You write warm, encouraging, and professional weekly wellness summaries.
Your tone should be supportive and insightful, but never clinical or diagnostic.
You are writing a private report for the user to read.

Rules you MUST follow:
- NEVER diagnose any mental health condition.
- Frame everything in a positive and forward-looking way.
- Always start with a warm greeting.
- Structure the report into three sections: "What Went Well", "Areas to Focus On", and "Actionable Suggestions for Next Week".
- Use markdown for formatting (e.g., bolding for headers).
- Keep the entire report under 250 words.
- The suggestions should be practical and related to the app's features if possible (e.g., "try a breathing exercise," "write in your gratitude journal").
- Write in the second person ("You...").
"""

@router.post("/analyze/weekly-report")
async def generate_weekly_report(request: ReportRequest):
    if not client:
        raise HTTPException(status_code=503, detail="AI report generation service is not available.")

    stats = request.user_stats
    
    # Construct the user message for the prompt
    user_message = f"""Generate a weekly wellness report for a student with these stats:
- Average mood score: {stats.get('avgMood', 'N/A')} (out of 5)
- Mood trend: {stats.get('moodTrend', 'N/A')}
- Habits completion: {stats.get('habitCompletion', 'N/A')}%
- Journal entries this week: {stats.get('journalCount', 'N/A')}
- Average journal sentiment: {stats.get('avgSentiment', 'N/A')}
- Stress quiz score: {stats.get('stressScore', 'Not taken')} (out of 40)
- Gratitude streak: {stats.get('gratitudeStreak', 'N/A')} days

Please write the report based on these stats, following all the rules in the system prompt.
"""

    try:
        message = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            max_tokens=400,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ]
        )
        
        report_text = message.choices[0].message.content
        
        return {"report": report_text}

    except Exception as e:
        print(f"Error calling Groq API for weekly report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate the wellness report.")
