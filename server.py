import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5173", "http://localhost:5173"])  # allow local static server

RESEND_API = "https://api.resend.com/emails"

@app.post("/api/contact")
def contact():
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        message = (data.get("message") or "").strip()
        if not name or not email or not message:
            return jsonify({"error": "Invalid input"}), 400

        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            return jsonify({"error": "Missing RESEND_API_KEY"}), 500

        # Destination: allow override for local testing (e.g., apoorva.krisna@gmail.com)
        to_addr = os.getenv("RESEND_TO", "apoorvakrisna@gmail.com")

        payload = {
            "from": "Apoorva Portfolio <onboarding@resend.dev>",
            "to": [to_addr],
            "subject": f"Portfolio Contact — {name}",
            "text": f"From: {name} <{email}>\n\n{message}",
        }

        resp = requests.post(
            RESEND_API,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            data=json.dumps(payload),
            timeout=20,
        )
        if resp.status_code >= 400:
            # bubble up helpful detail when possible
            detail = None
            try:
                detail = resp.json()
            except Exception:
                detail = resp.text
            return jsonify({"error": "Email send failed", "detail": detail}), 502

        return jsonify({"ok": True}), 200
    except Exception:
        return jsonify({"error": "Server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="127.0.0.1", port=port)
