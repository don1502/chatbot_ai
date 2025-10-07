#!/usr/bin/env python3
"""
Simple script to start the FastAPI server
"""

import uvicorn
from chatbot import app

if __name__ == "__main__":
    print("Starting AI Chatbot API server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    
    uvicorn.run(
        "chatbot:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
