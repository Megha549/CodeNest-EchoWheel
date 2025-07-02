// Basic voice command setup using Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = false;

const commands = {
  "go to dashboard": "dashboard.html",
  "go to patient info": "patient.html",
  "go to medication": "medication.html",
  "go to emergency logs": "emergency.html",
  "go to qr": "qr.html",
  "go to settings": "settings.html",
  "send emergency alert": "emergency", // can trigger function
};

function handleVoiceCommand(command) {
  const normalized = command.toLowerCase().trim();

  if (commands[normalized]) {
    if (commands[normalized] === "emergency") {
      // Trigger emergency alert function here
      alert("🚨 Emergency Alert Triggered!");
      // document.getElementById("emergencyBtn").click(); (if you have a button)
    } else {
      window.location.href = commands[normalized];
    }
  } else {
    speak("Sorry, I didn't understand.");
  }
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

document.getElementById("voiceBtn")?.addEventListener("click", () => {
  recognition.start();
  speak("Listening...");
});

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  handleVoiceCommand(transcript);
};

recognition.onerror = (event) => {
  speak("There was an error with voice input.");
};
