const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US";

function startListening() {
    recognition.start();
}

recognition.onresult = function (event) {
    let transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    sendMessage();
};

recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
};

async function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    let chatBox = document.getElementById("chat-box");

    let userMessage = `<div class="user-message">${userInput}</div>`;
    chatBox.innerHTML += userMessage;
    document.getElementById("user-input").value = "";

    try {
        let response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput }),
        });

        let data = await response.json();
        let botMessage = `<div class="bot-message">${data.response}</div>`;
        chatBox.innerHTML += botMessage;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error("Error:", error);
    }
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("active");
}
