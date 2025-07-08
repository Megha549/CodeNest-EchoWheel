import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const reminderContainer = document.getElementById("reminderContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const q = query(
      collection(db, "medications"),
      where("uid", "==", user.uid),
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
});

function formatTime(timeString) {
  const [hour, minute] = timeString.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
