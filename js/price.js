const API_URL = "http://127.0.0.1:5002";  // Flask API URL

// Function to update slider values dynamically
document.addEventListener("DOMContentLoaded", function() {
    let crimeRate = document.getElementById("crime_rate");
    let crimeVal = document.getElementById("crime_val");

    let marketDemand = document.getElementById("market_demand");
    let demandVal = document.getElementById("demand_val");

    let pricePerSqft = document.getElementById("price_per_sqft");
    let priceVal = document.getElementById("price_val");

    // Update displayed value when slider moves
    crimeRate.addEventListener("input", function() {
        crimeVal.textContent = crimeRate.value;
    });

    marketDemand.addEventListener("input", function() {
        demandVal.textContent = marketDemand.value;
    });

    pricePerSqft.addEventListener("input", function() {
        priceVal.textContent = pricePerSqft.value;
    });
});

// Predict House Price
async function predictPrice() {
    let data = {
        Location: document.getElementById("location").value,
        Area_sqft: parseFloat(document.getElementById("area").value),
        Bedrooms: parseInt(document.getElementById("bedrooms").value),
        Bathrooms: parseInt(document.getElementById("bathrooms").value),
        Amenities_Score: parseFloat(document.getElementById("amenities_score").value),
        Crime_Rate: parseFloat(document.getElementById("crime_rate").value),
        Market_Demand: parseFloat(document.getElementById("market_demand").value),
        Price_per_sqft: parseFloat(document.getElementById("price_per_sqft").value)
    };

    try {
        let response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        let result = await response.json();
        if (response.ok) {
            document.getElementById("predicted_price").innerText = `₹ ${result.predicted_price}`;
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Prediction Error:", error);
    }
}

// Analyze Future Trends
async function analyzeTrend() {
    try {
        let response = await fetch(`${API_URL}/trend_analysis`);
        let result = await response.json();
        if (response.ok) {
            document.getElementById("trend_price").innerText = `₹ ${result.future_price_trend}`;
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Trend Analysis Error:", error);
    }
}
