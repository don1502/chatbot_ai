# AI Chatbot

A modern React frontend connected to a FastAPI backend with Google Gemini AI integration.

## Features

- 🤖 AI-powered chat using Google Gemini API
- 💬 Real-time chat interface with message history
- 🎨 Modern, responsive design
- 🔄 Auto-scrolling chat messages
- 📱 Mobile-friendly interface
- ⚡ FastAPI backend with automatic API documentation

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

   The API will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

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

   The frontend will be available at `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Start chatting with the AI assistant!

## API Endpoints

- `GET /` - Welcome message
- `POST /chat` - Send chat messages
- `GET /health` - Health check

## Project Structure

```
chatbot_AI/
├── backend/
│   ├── chatbot.py          # FastAPI server with Gemini integration
│   ├── start_server.py     # Server startup script
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (create this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Node.js dependencies
│   └── index.html         # HTML template
└── README.md              # This file
```

## Getting a Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## Troubleshooting

- Make sure both servers are running on their respective ports
- Check that your Google API key is correctly set in the `.env` file
- Ensure CORS is properly configured (should work out of the box)
- Check browser console for any JavaScript errors
- Check backend logs for any API errors

## Development

- Backend uses FastAPI with automatic reloading
- Frontend uses Vite with hot module replacement
- Both support development mode with live updates
