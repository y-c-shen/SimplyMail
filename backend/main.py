from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "home"

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    email_text = data.get("email_text", "")
    
    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    # return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
