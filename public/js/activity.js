import { db } from "./firebase.js";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

const activityList = document.getElementById("recent-activity-list");

const q = query(
  collection(db, "activities"),
  orderBy("timestamp", "desc"),
  limit(5)
);

onSnapshot(q, (snapshot) => {
  console.log("Fetched snapshot size:", snapshot.size);
  activityList.innerHTML = ""; // Clear old list

  if (snapshot.empty) {
    activityList.innerHTML = "<li>No recent activities</li>";
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (!data.timestamp) return; // skip if missing
    const time = formatTime(data.timestamp.toDate());

    const li = document.createElement("li");
    li.innerHTML = `[${time}] ${data.message}`;
    activityList.appendChild(li);
  });
});

function formatTime(date) {
  const hrs = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${hrs}:${mins}`;
}
