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
GROQ_MODEL = "llama3-8b-8192"

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

@router.post("/chat")
async def handle_chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="AI chat service is not available. GROQ_API_KEY not set.")

    try:
        messages_with_system = [{"role": "system", "content": SYSTEM_PROMPT}] + request.messages

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "max_tokens": 250,
                    "messages": messages_with_system,
                },
            )

        if response.status_code != 200:
            print(f"Groq API error: {response.status_code} {response.text[:300]}")
            raise HTTPException(status_code=500, detail="Failed to get a response from the AI assistant.")

        data = response.json()
        reply = data["choices"][0]["message"]["content"]

        return {"reply": reply}

    except httpx.HTTPError as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a response from the AI assistant.")
