from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

from resume_parser import extract_text
from resume_analyzer import analyze_resume

app = Flask(__name__)
CORS(app)

@app.route("/analyze-resume", methods=["POST"])
def analyze():
    data = request.json
    resume_url = data.get("resumeURL")

    if not resume_url:
        return jsonify({"error": "No resume URL provided"}), 400

    ext = resume_url.split(".")[-1].lower()
    file_path = f"temp_resume.{ext}"

    try:
        response = requests.get(resume_url)
        with open(file_path, "wb") as f:
            f.write(response.content)

        text = extract_text(file_path)
        analysis = analyze_resume(text)

        return jsonify(analysis)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
