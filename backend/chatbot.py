import os
from dotenv import load_dotenv
import google.generativeai as gemini
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Chatbot API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: str = None

def query_gemini_api(messages: List[Dict]) -> str:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise ValueError("API key for Google is missing. Please set the GOOGLE_API_KEY in the .env file.")
    
    try:
        gemini.configure(api_key=GOOGLE_API_KEY)
        model = gemini.GenerativeModel('gemini-2.0-flash-exp')
        
        # Convert messages to Gemini format
        chat_history = []
        for msg in messages:
            if msg["role"] == "user":
                chat_history.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                chat_history.append({"role": "model", "parts": [msg["content"]]})
        
        chat = model.start_chat(history=chat_history)
        user_message = messages[-1]["content"]
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        print(f"Error with Gemini API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error with Gemini API: {str(e)}")

@app.get("/")
async def root():
    return {"message": "AI Chatbot API is running!"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert Pydantic models to dictionaries
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Add system message if not present
        if not messages or messages[0]["role"] != "system":
            messages.insert(0, {"role": "system", "content": "You are a helpful AI assistant."})
        
        response = query_gemini_api(messages)
        
        return ChatResponse(
            response=response,
            success=True
        )
    except Exception as e:
        return ChatResponse(
            response="",
            success=False,
            error=str(e)
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Chatbot API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)