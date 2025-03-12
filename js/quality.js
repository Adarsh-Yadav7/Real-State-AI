const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("captureButton");
const imageUpload = document.getElementById("imageUpload");
const predictButton = document.getElementById("predictButton");
const imagePreview = document.getElementById("imagePreview");

let selectedFile = null; // Stores the last selected image (either uploaded or captured)
let cameraStream = null; // Stores the camera stream

// ✅ Open Camera When Clicking "Capture Image"
captureButton.addEventListener("click", function (event) {
    event.preventDefault();

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
            video.style.display = "block"; // Show live camera feed
        })
        .catch(error => {
            console.error("❌ Camera access denied:", error);
        });
});

// ✅ Capture Image When Clicking "Predict" (Ensures Image is Taken)
predictButton.addEventListener("click", function (event) {
    event.preventDefault();

    if (video.style.display === "block") {
        // ✅ Capture image from video
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // ✅ Convert captured image to Data URL
        const imageDataURL = canvas.toDataURL("image/png");

        // ✅ Display Image Preview
        imagePreview.innerHTML = `<img src="${imageDataURL}" alt="Captured Image">`;

        // ✅ Convert Data URL to Blob and Save it as `selectedFile`
        canvas.toBlob(blob => {
            selectedFile = new File([blob], "captured_image.png", { type: "image/png" });

            // ✅ Stop camera stream after capturing
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                video.style.display = "none";
            }

            // Now process the image after capturing
            processPrediction();
        }, "image/png");
    } else {
        // ✅ If no image is captured, check if an uploaded file is present
        if (!selectedFile) {
            document.getElementById("result").innerHTML = "<p style='color: red;'>⚠️ Please upload or capture an image first!</p>";
            return;
        }
        // ✅ If an image is already selected (from upload), process prediction
        processPrediction();
    }
});

// ✅ Function to Send Image for Prediction
function processPrediction() {
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Show Processing Message
    document.getElementById("result").innerHTML = "<p style='color: blue;'>⏳ Processing image... Please wait.</p>";

    // Send Image to Flask API
    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        let confidenceLevel;
        if (data.confidence > 0.85) {
            confidenceLevel = "I am very sure! ✅";
        } else if (data.confidence > 0.65) {
            confidenceLevel = "I am fairly sure. 👍";
        } else if (data.confidence > 0.45) {
            confidenceLevel = "I am not fully confident. 🤔";
        } else {
            confidenceLevel = "I am unsure about this. ❌";
        }

        document.getElementById("result").innerHTML = `
            <h3>Prediction Result:</h3>
            <p style="font-size: 18px; font-weight: bold; color: blue;">${data.prediction}</p>
            <p>${confidenceLevel}</p>
        `;
    })
    .catch(error => {
        console.error("❌ Error:", error);
        document.getElementById("result").innerHTML = "<p style='color: red;'>❌ Failed to connect to the server.</p>";
    });
}

// ✅ Handle File Upload (When User Selects from File)
imageUpload.addEventListener("change", function () {
    if (this.files.length > 0) {
        selectedFile = this.files[0];

        // ✅ Display Image Preview
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
        };
        reader.readAsDataURL(selectedFile);
    }
});
