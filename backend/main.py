from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "home"

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    email_text = data.get("email_text", "")
    email_id = data.get("email_id", "")

    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    # Dummy summary for testing (replace this with your LLM-generated summary)
    summary = email_text[:100] + "..."  # Simulate a summary

    return jsonify({"summary": summary, "email_id": email_id})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)

