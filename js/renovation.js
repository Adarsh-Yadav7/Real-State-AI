// Fetch Input Data from the form
function getInputData() {
    return {
        "Property Size (sqft)": document.getElementById("propertySize").value,
        "City": document.getElementById("city").value,
        "Renovation Type": document.getElementById("renovationType").value,
        "Material Type": document.getElementById("materialType").value,
        "Labor Cost (₹/sqft)": document.getElementById("laborCost").value,
        "Material Cost (₹/sqft)": document.getElementById("materialCost").value
    };
}

// Predict Renovation Cost from the backend
async function predictCost() {
    const inputData = getInputData();

    try {
        const response = await fetch("http://127.0.0.1:5003/predict-cost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputData)
        });

        const data = await response.json();
        console.log("Cost Prediction API Response:", data);

        if (data.predicted_renovation_cost !== undefined) {
            document.getElementById("costResult").textContent = data.predicted_renovation_cost + " ₹";
        } else {
            document.getElementById("costResult").textContent = "Error: No Cost Prediction";
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("costResult").textContent = "API Request Failed";
    }
}

// Predict Resale Value from the backend
async function predictResale() {
    const inputData = getInputData();

    try {
        const response = await fetch("http://127.0.0.1:5003/predict-resale", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputData)
        });

        const data = await response.json();
        console.log("Resale Prediction API Response:", data);

        if (data.predicted_resale_value !== undefined) {
            document.getElementById("resaleResult").textContent = data.predicted_resale_value + " %";
        } else {
            document.getElementById("resaleResult").textContent = "Error: No Resale Prediction";
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resaleResult").textContent = "API Request Failed";
    }
}
