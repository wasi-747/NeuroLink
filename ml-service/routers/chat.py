from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    user_context: Dict[str, Any]

SYSTEM_PROMPT = """You are NeuroLink's AI wellness companion for university students.
Your name is Aria. You are warm, empathetic, and non-judgmental.

Rules you MUST follow:
- Never diagnose any mental health condition.
- Never prescribe medication or specific treatments.
- If a user expresses suicidal ideation or self-harm (e.g., mentions of "kill myself", "end my life", "self harm"), you MUST immediately respond with crisis resources and encourage professional help. Your response should be gentle but direct, like: "It sounds like you are going through immense pain right now. Please know that help is available. You can connect with people who can support you by calling or texting 988 in the US and Canada, or calling 111 in the UK. Please reach out to them."
- Always remind users you are an AI, not a therapist, especially in your first message.
- Keep responses concise (under 150 words unless explaining something).
- Suggest the app's own features when relevant (e.g., 'You might find the breathing exercises helpful right now').
- Be conversational, use the student's first name if known.
- End each response with a gentle follow-up question.
"""

FALLBACK_MODEL = "openai/gpt-oss-20b"

@router.post("/chat")
async def handle_chat(request: ChatRequest):
    messages_with_system = [{"role": "system", "content": SYSTEM_PROMPT}] + request.messages

    if not GROQ_API_KEY:
        return {"reply": "Hi there! I'm Aria, your wellness companion. I'm currently in lightweight offline mode, but remember I'm always cheering for you! How are you feeling right now?"}

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
                        "max_tokens": 200,
                        "messages": messages_with_system,
                    },
                )

            if response.status_code == 200:
                data = response.json()
                reply = data["choices"][0]["message"].get("content", "").strip()
                if reply:
                    return {"reply": reply}
            elif response.status_code == 429:
                print(f"Chat model {model} rate limited (429). Trying fallback...")
                continue
            else:
                print(f"Groq API error with {model}: {response.status_code} {response.text[:200]}")
        except Exception as e:
            print(f"Error calling Groq API ({model}): {e}")

    # Friendly fallback message if all rate limited
    return {
        "reply": "I'm right here with you! Take a deep, gentle breath and let yourself unwind for a moment. What's the main thing on your mind right now?"
    }
