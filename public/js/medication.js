// js/medication.js
import { auth, db } from './firebase.js';
import {
  collection, addDoc, query, where, getDocs, onSnapshot,
  orderBy, updateDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("medicationForm");
const medList = document.getElementById("medList");
const usernameSpan = document.getElementById("username");

// Show username
usernameSpan.textContent = localStorage.getItem("username") || "User";

// Format 24h to AM/PM
function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  return `${formattedHour}:${minute} ${ampm}`;
}

// Request Notification permission
if (Notification && Notification.permission !== "granted") {
  Notification.requestPermission();
}

let currentUserUID = null;

// Auth check and init
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid;
    loadReminders();
    watchForTimeMatch();
  } else {
    window.location.href = "login.html";
  }
});

// Add new reminder
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const medName = document.getElementById("medName").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  await addDoc(collection(db, "medications"), {
    uid: currentUserUID,
    medName,
    dose,
    time,
    taken: false,
    timestamp: serverTimestamp()
  });

  form.reset();
});

// Load and listen to reminders
function loadReminders() {
  const q = query(
    collection(db, "medications"),
    where("uid", "==", currentUserUID),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    medList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" ${data.taken ? "checked disabled" : ""} data-id="${docSnap.id}" />
        💊 ${formatTime(data.time)} – ${data.medName} (${data.dose})
      `;
      if (data.taken) li.style.opacity = "0.5";
      medList.appendChild(li);
    });

    medList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        const docId = checkbox.dataset.id;
        await updateDoc(doc(db, "medications", docId), { taken: true });
      });
    });
  });
}

// Check time every 30s and notify
function watchForTimeMatch() {
  setInterval(async () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    const q = query(
      collection(db, "medications"),
      where("uid", "==", currentUserUID),
      where("time", "==", currentTime),
      where("taken", "==", false)
    );

    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (Notification.permission === "granted") {
        new Notification("💊 Medication Reminder", {
          body: `${data.medName} (${data.dose}) – Time to take it!`,
          icon: "wheelchair.png"
        });
      }
    });
  }, 30000); // every 30s
}
