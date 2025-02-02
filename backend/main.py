from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route("/")
def home():
    return "home"

@app.route("/summarize", methods=["OPTIONS"])
def preflight():
    response = jsonify({"status": "ok"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    email_text = data.get("email_text", "")
    email_id = data.get("email_id", "")

    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    summary = email_text  # Simulated summary

    response = jsonify({"summary": summary, "email_id": email_id})
    response.headers["Access-Control-Allow-Origin"] = "*"  # Allow all origins
    return response

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
