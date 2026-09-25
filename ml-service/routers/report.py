from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")

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

FALLBACK_MODEL = "openai/gpt-oss-20b"

def generate_heuristic_report(stats: Dict[str, Any]) -> str:
    avg_mood = stats.get('avgMood', 'Good')
    trend = stats.get('moodTrend', 'stable')
    habits = stats.get('habitCompletion', 0)
    journals = stats.get('journalCount', 0)
    gratitude = stats.get('gratitudeStreak', 0)
    
    return f"""### Hello! Here is your weekly wellness summary 🌱

**What Went Well**
* **Habit Consistency:** You achieved a {habits}% completion rate across your wellness habits this week. Consistency is key!
* **Mindful Check-ins:** You logged {journals} reflective entries and maintained a {gratitude}-day gratitude streak.
* **Mood Stability:** Your overall mood trend remained **{trend}** with an average score of {avg_mood}/5.

**Areas to Focus On**
* **Self-Compassion:** University life can get hectic. Remember to celebrate small wins each day.
* **Balanced Routine:** Aim to keep consistent sleep and hydration habits, especially during busy study days.

**Actionable Suggestions for Next Week**
* Try a **5-minute Box Breathing exercise** before starting your main study session.
* Log at least 3 things you are grateful for each evening to boost positive outlook.
* Check out our guided meditation resources when feeling tension.

*Remember: Take it one day at a time, you're doing great! 💜*"""

@router.post("/analyze/weekly-report")
async def generate_weekly_report(request: ReportRequest):
    stats = request.user_stats
    
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

    if not GROQ_API_KEY:
        return {"report": generate_heuristic_report(stats)}

    # Attempt with primary model, then fallback model if rate limited
    models_to_try = [GROQ_MODEL, FALLBACK_MODEL]

    for model in models_to_try:
        try:
            async with httpx.AsyncClient(timeout=25) as client:
                response = await client.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "max_tokens": 250,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": user_message},
                        ],
                    },
                )

            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"].get("content", "").strip()
                if content:
                    return {"report": content}
            elif response.status_code == 429:
                print(f"Model {model} hit rate limit (429). Trying fallback...")
                continue
            else:
                print(f"Groq API error with {model}: {response.status_code} {response.text[:200]}")
        except Exception as e:
            print(f"Error calling Groq API ({model}): {e}")

    # If all models rate limited or unavailable, return personalized heuristic report
    print("Falling back to intelligent heuristic wellness report generation.")
    return {"report": generate_heuristic_report(stats)}
