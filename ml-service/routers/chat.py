from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
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
    if not client:
        raise HTTPException(status_code=503, detail="AI chat service is not available.")

    # Convert messages from {"role": "user/assistant", "content": "..."} to {"role": "user/assistant", "content": "..."}
    # Groq uses the same format as OpenAI
    messages = request.messages

    try:
        # Prepend system prompt to messages
        messages_with_system = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
        
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            max_tokens=250,
            messages=messages_with_system
        )
        
        reply = response.choices[0].message.content
        
        return {"reply": reply}

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a response from the AI assistant.")
