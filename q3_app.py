
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load trained model
MODEL_PATH = "building_quality_model.h5"  # Update with your model file
if os.path.exists(MODEL_PATH):
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully!")
else:
    print("❌ Model file not found!")
    exit(1)  # Stop execution if model is missing

# Function to preprocess the image
def preprocess_image(image):
    try:
        image = image.convert("RGB")  # Ensure it's in RGB mode
        image = image.resize((128, 128))  # Resize to model's input size
        image = np.array(image) / 255.0  # Normalize pixel values
        image = np.expand_dims(image, axis=0)  # Add batch dimension
        return image
    except Exception as e:
        print(f"❌ Error in preprocessing: {e}")
        return None

# API route for prediction
@app.route("/predict", methods=["POST"])
def predict():
    print("🚀 Received request to /predict")

    # Check if a file is uploaded
    if "file" not in request.files:
        print("❌ No file uploaded.")
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    
    # Read and process the image
    try:
        image = Image.open(io.BytesIO(file.read()))  # Read the image file
        processed_image = preprocess_image(image)  # Preprocess
        if processed_image is None:
            return jsonify({"error": "Image preprocessing failed"}), 500
    except Exception as e:
        print(f"❌ Error loading image: {e}")
        return jsonify({"error": "Invalid image file"}), 400

    # Make prediction
    try:
        prediction = model.predict(processed_image)[0][0]  # Get prediction
        confidence = float(prediction)

        # Set threshold for damage classification
        threshold = 0.5  # Adjust if necessary
        result = "Damage Detected ✅" if confidence < threshold else "No Damage ❌"


        response_data = {
            "prediction": result,
            "confidence": confidence
        }
        print(f"✅ Prediction: {response_data}")
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        return jsonify({"error": "Prediction failed"}), 500

# Run Flask app
if __name__ == "__main__":
    app.run(debug=True,port=5000)
