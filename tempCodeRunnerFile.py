from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.saving import register_keras_serializable

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Register custom function for MSE issue
@register_keras_serializable()
def mse(y_true, y_pred):
    return np.mean(np.square(y_true - y_pred))

# Load Models and Scalers
try:
    rf_model = joblib.load("random_forest_model.pkl")
    xgb_model = joblib.load("xgb_model.pkl")
    scaler = joblib.load("scaler.pkl")
    encoder = joblib.load("encoder.pkl")
    lstm_model = load_model("lstm_model.h5", custom_objects={"mse": mse})
    scaler_lstm = joblib.load("scaler_lstm.pkl")
except Exception as e:
    print(f"🔥 Error loading models: {e}")

# Route: Predict House Price
@app.route('/predict', methods=['POST'])
def predict_price():
    try:
        data = request.json
        if 'Location' not in data or 'features' not in data:
            return jsonify({"error": "Missing 'Location' or 'features'"}), 400

        location = data['Location']
        features = np.array(data['features']).reshape(1, -1)

        # Encode categorical location
        location_encoded = encoder.transform([[location]]).toarray()

        # Combine with numerical features
        full_features = np.hstack((features, location_encoded))

        # Scale input data
        full_features_scaled = scaler.transform(full_features)

        # Predictions
        rf_price = float(rf_model.predict(full_features_scaled)[0])
        xgb_price = float(xgb_model.predict(full_features_scaled)[0])

        return jsonify({
            "Random Forest Price": rf_price,
            "XGBoost Price": xgb_price
        })

    except Exception as e:
        print(f"🔥 API Error: {e}")
        return jsonify({"error": str(e)}), 500

# Route: Future Trend Analysis using LSTM
@app.route('/trend_analysis', methods=['GET'])
def trend_analysis():
    try:
        # Simulated last 10 price points
        last_10_prices = np.array([[1000000], [1050000], [1100000], [1150000], [1200000], 
                                   [1250000], [1300000], [1350000], [1400000], [1450000]])
        
        last_10_scaled = scaler_lstm.transform(last_10_prices)
        last_10_scaled = last_10_scaled.reshape(1, 10, 1)

        # Predict future price using LSTM
        future_price = lstm_model.predict(last_10_scaled)
        future_price = scaler_lstm.inverse_transform(future_price)[0][0]

        # Recommendation Logic
        last_actual_price = last_10_prices[-1][0]
        recommendation = "📈 Buy Now" if future_price > last_actual_price else "📉 Sell Now"

        return jsonify({
            "Future Price Estimate": future_price,
            "Recommendation": recommendation
        })

    except Exception as e:
        print(f"🔥 Trend Analysis Error: {e}")
        return jsonify({"error": str(e)}), 500

# Run Flask App
if __name__ == '__main__':
    app.run(debug=True, port=5002)
