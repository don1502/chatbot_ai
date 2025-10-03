import os
from dotenv import load_dotenv
import google.generativeai as gemini

def query_gemini_api(messages) -> str:
    load_dotenv()
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise ValueError("API key for Google is missing. Please set the GOOGLE_API_KEY in the .env file.")
    try:
        gemini.configure(api_key=GOOGLE_API_KEY)
        model = gemini.GenerativeModel('gemini-2.5-pro')
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
        return "[Error: Could not get response from Gemini API.]"

def main():
    print("Welcome to the Chatbot! Type 'exit' to quit.")
    messages = [{"role": "system", "content": "You are a useful AI assistant."}]
    while True:
        user_input = input("You: ")
        if user_input.strip().lower() == "exit":
            print("Goodbye!")
            break
        messages.append({"role": "user", "content": user_input})
        response = query_gemini_api(messages)
        print(f"Gemini: {response}")
        messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    main()