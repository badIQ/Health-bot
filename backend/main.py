import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.agents import get_bot_reply

# -------------------------
# Create FastAPI app
# -------------------------
app = FastAPI(title="Health Chatbot API", version="1.0")

# Mount static folder (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Health check (for Render uptime monitoring)
@app.get("/api/status")
async def status():
    return {"status": "running", "message": "✅ Health Bot REST API is live!"}

# ✅ Request body model
class ChatRequest(BaseModel):
    message: str
    user_id: int = 1

# ✅ Chat endpoint
@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        reply = get_bot_reply(req.message, req.user_id)
        return {
            "user_id": req.user_id,
            "user_message": req.message,
            "bot_reply": reply,
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"⚠️ Server error: {str(e)}"})

# ✅ Serve frontend (index.html)
@app.get("/", response_class=HTMLResponse)
async def home():
    return FileResponse(os.path.join("templates", "index.html"))

# ✅ Optional second page (chat.html)
@app.get("/chatpage", response_class=HTMLResponse)
async def chatpage():
    return FileResponse(os.path.join("templates", "chat.html"))
