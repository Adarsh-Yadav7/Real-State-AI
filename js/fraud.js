document.getElementById("predictFraudBtn").addEventListener("click", async function () {
    const description = document.getElementById("description").value;

    if (!description) {
        alert("Please enter a description!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5001/predict_fraud", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ description: description }),
        });

        const data = await response.json();
        if (data.fraud_prediction === 1) {
            document.getElementById("result").innerText = "🚨 Fraud Detected!";
        } else {
            document.getElementById("result").innerText = "✅ Not Fraudulent!";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error connecting to API");
    }
});

document.getElementById("predictOwnershipBtn").addEventListener("click", async function () {
    const price = document.getElementById("price").value;
    const duplicateListing = document.getElementById("duplicateListing").checked ? 1 : 0;
    const imageManipulated = document.getElementById("imageManipulated").checked ? 1 : 0;

    try {
        const response = await fetch("http://127.0.0.1:5001/predict_ownership", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                price: parseFloat(price),
                duplicate_listing: duplicateListing,
                image_manipulated: imageManipulated,
            }),
        });

        const data = await response.json();
        if (data.ownership_verification === 1) {
            document.getElementById("ownershipResult").innerText = "✅ Ownership Verified!";
        } else {
            document.getElementById("ownershipResult").innerText = "⚠️ Ownership NOT Verified!";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error connecting to API");
    }
});
