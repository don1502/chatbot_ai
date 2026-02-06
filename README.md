# AI Chatbot

A modern React frontend connected to a FastAPI backend with Google Gemini AI integration.

## Features

- AI-powered chat using Google Gemini API
- Real-time chat interface with message history
- Modern, responsive design
- Auto-scrolling chat messages
- Mobile-friendly interface
- FastAPI backend with automatic API documentation

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory and add your Google API key:
   ```
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   ```

4. Start the backend server:
   ```bash
   python start_server.py
   ```


### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```