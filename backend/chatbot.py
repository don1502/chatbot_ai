import os
import json
from typing import List, Dict, Optional

from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import uvicorn

# Load environment variables
load_dotenv()

# Configuration (overridable via .env)
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    "You are a helpful, friendly and concise AI assistant. "
    "Answer clearly and use Markdown formatting when it helps readability.",
)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
).split(",")

app = FastAPI(title="AI Chatbot API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., min_length=1)


class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Gemini helpers
# ---------------------------------------------------------------------------
def _get_model() -> genai.GenerativeModel:
    """Configure and return a Gemini model with the system prompt applied."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "API key for Google is missing. Please set GOOGLE_API_KEY in the .env file."
        )

    genai.configure(api_key=api_key)
    # Passing the system prompt as a system_instruction is the correct way to
    # steer Gemini — it does not support a "system" role inside chat history.
    return genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_PROMPT)


def _split_history(messages: List[Dict]) -> (List[Dict], str):
    """Convert incoming messages into Gemini chat history + the latest prompt.

    Any client-supplied "system" messages are ignored here because the system
    prompt is applied via system_instruction on the model.
    """
    conversation = [m for m in messages if m["role"] in ("user", "assistant")]
    if not conversation:
        raise ValueError("No user message was provided.")

    if conversation[-1]["role"] != "user":
        raise ValueError("The last message must come from the user.")

    user_message = conversation[-1]["content"]

    history = []
    for msg in conversation[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    return history, user_message


def query_gemini_api(messages: List[Dict]) -> str:
    """Return a full (non-streamed) completion from Gemini."""
    try:
        model = _get_model()
        history, user_message = _split_history(messages)
        chat = model.start_chat(history=history)
        response = chat.send_message(user_message)
        return response.text
    except ValueError:
        raise
    except Exception as e:
        print(f"Error with Gemini API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error with Gemini API: {str(e)}")


def stream_gemini_api(messages: List[Dict]):
    """Yield Server-Sent Events with incremental Gemini output."""
    try:
        model = _get_model()
        history, user_message = _split_history(messages)
        chat = model.start_chat(history=history)
        stream = chat.send_message(user_message, stream=True)

        for chunk in stream:
            text = getattr(chunk, "text", None)
            if text:
                yield f"data: {json.dumps({'content': text})}\n\n"

        yield f"data: {json.dumps({'done': True})}\n\n"
    except Exception as e:
        print(f"Error with Gemini streaming API: {str(e)}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "AI Chatbot API is running!"}


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        response = query_gemini_api(messages)
        return ChatResponse(response=response, success=True)
    except HTTPException as e:
        return ChatResponse(response="", success=False, error=e.detail)
    except Exception as e:
        return ChatResponse(response="", success=False, error=str(e))


@app.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    return StreamingResponse(
        stream_gemini_api(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Chatbot API",
        "model": MODEL_NAME,
        "api_key_configured": bool(os.getenv("GOOGLE_API_KEY")),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
