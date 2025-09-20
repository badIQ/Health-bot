from flask import Flask, request, jsonify, render_template
from agents import get_bot_reply

# -------------------------
# Create Flask app
# -------------------------
app = Flask(
    _name_,
    template_folder="../templates",   # looks in /templates
    static_folder="../static"         # looks in /static
)

# ✅ Health check (for Render uptime monitoring)
@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({
        "status": "running",
        "message": "✅ Health Bot REST API is live!"
    }), 200

# ✅ Chat endpoint (called from JS fetch in script.js)
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Message field is required"}), 400

        user_id = data.get("user_id", 1)
        message = data["message"]

        # Call your bot logic
        reply = get_bot_reply(message, user_id)

        return jsonify({
            "user_id": user_id,
            "user_message": message,
            "bot_reply": reply
        }), 200

    except Exception as e:
        return jsonify({"error": f"⚠ Server error: {str(e)}"}), 500

# ✅ Serve frontend (index.html in /templates)
@app.route("/")
def home():
    return render_template("index.html")

# ✅ Optional second page for full chat UI
@app.route("/chatpage")
def chatpage():
    return render_template("chat.html")

# -------------------------
# Start the server (local only)
# -------------------------
if _name_ == "_main_":
    print("🚀 Health Bot running at http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)