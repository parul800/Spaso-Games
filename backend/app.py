from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# YOUR GEMINI API KEY
genai.configure(api_key="AIzaSyApUU8yw8R52NucRd_jNZGhgd9Hmh2TxYk")

model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/ask-eva", methods=["POST"])
def ask_eva():
    data = request.json
    prompt = data.get("prompt", "")

    response = model.generate_content(prompt)

    return jsonify({
        "reply": response.text
    })

if __name__ == "__main__":
    app.run(debug=True)