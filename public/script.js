document.addEventListener("DOMContentLoaded", function () {
  // Load sidebar HTML
  fetch('sidebar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('sidebar-container').innerHTML = data;

      // Sidebar toggle handler
      document.body.addEventListener("click", function (e) {
        if (e.target && e.target.matches(".toggle-btn")) {
          const sidebar = document.getElementById('sidebar');
          if (sidebar) sidebar.classList.toggle("closed");

          const main = document.querySelector("main");
          if (main) main.classList.toggle("collapsed");
        }
      });

      // Voice emergency alert inside sidebar load
      const emergencyBtn = document.getElementById("emergencyBtn");
      const voiceBtn = document.getElementById("voiceBtn");

      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      voiceBtn?.addEventListener("click", () => {
        recognition.start();
        const utter = new SpeechSynthesisUtterance("Listening for emergency command");
        window.speechSynthesis.speak(utter);
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        if (transcript.includes("emergency")) {
          emergencyBtn?.click();
          const utter = new SpeechSynthesisUtterance("Emergency alert has been sent.");
          window.speechSynthesis.speak(utter);
        } else {
          const utter = new SpeechSynthesisUtterance("Command not recognized. Try again.");
          window.speechSynthesis.speak(utter);
        }
      };

      // Sidebar buttons like logout and dark mode
      document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("loggedIn");
        window.location.href = "index.html";
      });

      const darkModeToggle = document.getElementById("darkModeToggle");
      if (localStorage.getItem("dark") === "true") document.body.classList.add("dark");
      darkModeToggle?.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("dark", document.body.classList.contains("dark"));
      });
    });

  // Dashboard Logic
  if (window.location.pathname.includes("dashboard.html")) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!localStorage.getItem("loggedIn")) {
      window.location.href = "index.html";
    }

    function startLocationTracking() {
      const locationP = document.getElementById("location");
      const latitudeP = document.getElementById("latitude");
      const longitudeP = document.getElementById("longitude");

      if (!navigator.geolocation) {
        locationP.innerText = "Geolocation is not supported by your browser.";
        return;
      }

      locationP.innerText = "Fetching location...";

      navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lon = pos.coords.longitude.toFixed(5);

          locationP.innerText = "Location updated successfully!";
          latitudeP.innerText = `Latitude: ${lat}`;
          longitudeP.innerText = `Longitude: ${lon}`;
          window.currentLat = lat;
          window.currentLon = lon;
        },
        (err) => {
          locationP.innerText = "Error fetching location.";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              locationP.innerText = "Permission denied for location access.";
              break;
            case err.POSITION_UNAVAILABLE:
              locationP.innerText = "Location unavailable.";
              break;
            case err.TIMEOUT:
              locationP.innerText = "The request to get location timed out.";
              break;
            default:
              locationP.innerText = "Unknown error occurred.";
          }
          latitudeP.innerText = "Latitude: Fetching...";
          longitudeP.innerText = "Longitude: Fetching...";
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );
    }

    document.getElementById("refresh-btn")?.addEventListener("click", startLocationTracking);

    document.getElementById("navigate-btn")?.addEventListener("click", () => {
      const dest = document.getElementById("destination").value;
      if (!dest) {
        alert("Please enter a destination!");
        return;
      }
      const lat = window.currentLat;
      const lon = window.currentLon;
      if (!lat || !lon) {
        alert("Current location not available yet!");
        return;
      }
      const mapsURL = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
      window.open(mapsURL, "_blank");
    });

    window.addEventListener("load", startLocationTracking);

    // Reminders
    const reminderForm = document.getElementById("reminderForm");
    const reminderList = document.getElementById("reminderList");
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    const speak = (msg) => {
      const utterance = new SpeechSynthesisUtterance(msg);
      speechSynthesis.speak(utterance);
    };

    const requestNotificationPermission = () => {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    };

    const showNotification = (text) => {
      new Notification("Medication Reminder", {
        body: text,
        icon: "img/moon-icon.png",
      });
    };

    const showReminders = () => {
      requestNotificationPermission();
      reminderList.innerHTML = "";
      reminders.forEach((r) => {
        const li = document.createElement("li");
        li.innerText = `${r.text} at ${r.time}`;
        reminderList.appendChild(li);
      });
    };

    setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      reminders.forEach((r) => {
        if (r.time === currentTime) {
          speak(`Time for ${r.text}`);
          showNotification(`Time for ${r.text}`);
        }
      });
    }, 60000);

    reminderForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("reminderText").value;
      const hour = document.getElementById("reminderHour").value;
      const minute = document.getElementById("reminderMinute").value;
      const ampm = document.getElementById("reminderAMPM").value;

      let hours24 = hour;
      if (ampm === "PM" && hour < 12) {
        hours24 = parseInt(hour) + 12;
      } else if (ampm === "AM" && hour == 12) {
        hours24 = "00";
      }

      const time = `${hours24.toString().padStart(2, '0')}:${minute}`;
      reminders.push({ text, time });
      localStorage.setItem("reminders", JSON.stringify(reminders));
      showReminders();
    });

    showReminders();

    document.getElementById("emergencyBtn")?.addEventListener("click", () => {
      const message = encodeURIComponent("🚨 I need immediate help! Please check on me.");
      const emergencyNumber = user?.emergency;
      if (emergencyNumber) {
        const whatsappURL = `https://wa.me/91${emergencyNumber}?text=${message}`;
        window.open(whatsappURL, "_blank");
      } else {
        alert("Emergency contact not available");
      }
    });
  }
});
