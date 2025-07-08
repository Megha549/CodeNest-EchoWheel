import { auth, db } from './js/firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const reminderContainer = document.getElementById("reminderContainer");
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    fetchLatestReminder(user.uid);
  } else {
    reminderContainer.innerHTML = "⚠️ Please login first.";
  }
});

async function fetchLatestReminder(uid) {
  try {
    const reminderRef = collection(db, "medications");
    const q = query(
      reminderRef,
      where("uid", "==", uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      const formattedTime = formatTime(data.time || "00:00");
      reminderContainer.innerHTML = `⏰ ${formattedTime} – ${data.medName || "No name"}`;
    } else {
      reminderContainer.innerHTML = "No reminders found.";
    }
  } catch (error) {
    console.error("❌ Error fetching reminder:", error);
    reminderContainer.innerHTML = "⚠️ Failed to load reminder.";
  }
}

function formatTime(timeString) {
  const [hour, minute] = timeString.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
