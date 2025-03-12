from flask import Flask, request, jsonify
import joblib
import re
import string
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from flask_cors import CORS

# ✅ Download stopwords
nltk.download('stopwords')

# ✅ Load models
fraud_model = joblib.load("fraud_detector.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")
onr_model = joblib.load("ownership_verification.pkl")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# ✅ Text Preprocessing Function
def preprocess_text(text):
    text = text.lower()  
    text = re.sub(r'\d+', '', text)  
    text = text.translate(str.maketrans('', '', string.punctuation))  
    words = text.split()
    words = [word for word in words if word not in stopwords.words('english')]  
    return " ".join(words)

# 🚀 **1. Predict Fraud**
@app.route("/predict_fraud", methods=["POST"])
def predict_fraud():
    try:
        data = request.json
        description = data.get("description", "")
        
        if not description:
            return jsonify({"error": "No description provided"}), 400

        processed_text = preprocess_text(description)
        text_vectorized = vectorizer.transform([processed_text])
        prediction = fraud_model.predict(text_vectorized)[0]
        
        return jsonify({"fraud_prediction": int(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🚀 **2. Predict Ownership Verification**
@app.route("/predict_ownership", methods=["POST"])
def predict_ownership():
    try:
        data = request.json
        price = float(data.get("price", 0))
        duplicate_listing = int(data.get("duplicate_listing", 0))
        image_manipulated = int(data.get("image_manipulated", 0))
        
        features = np.array([[price, duplicate_listing, image_manipulated]])
        prediction = onr_model.predict(features)[0]
        
        return jsonify({"ownership_verification": int(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Change port to 5001
