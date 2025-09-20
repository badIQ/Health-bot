import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env (for local dev)
load_dotenv()

# -------------------------
# API Config
# -------------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Default model (you can change if needed)
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")

# -------------------------
# Bot Reply Function
# -------------------------
def get_bot_reply(message: str, user_id: int = 1) -> str:
    """Send user message to OpenRouter API and return bot reply."""
    if not OPENROUTER_API_KEY:
        return "⚠ No OpenRouter API key found. Please set OPENROUTER_API_KEY in .env or Render Environment Variables."

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You are a friendly and knowledgeable health assistant. Always provide safe, factual, and helpful advice."},
                {"role": "user", "content": message}
            ],
            "max_tokens": 200,
        }

        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=20)
        response.raise_for_status()  # raise error if request failed
        data = response.json()

        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"].strip()
        else:
            return f"⚠ API Error: {data}"

    except requests.exceptions.Timeout:
        return "⚠ API request timed out. Please try again."
    except requests.exceptions.RequestException as e:
        return f"⚠ API request failed: {str(e)}"
    except Exception as e:
        return f"⚠ Error while fetching reply: {str(e)}"