import { db } from "./firebase.js";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

const activityList = document.getElementById("recent-activity-list");

const q = query(
  collection(db, "activities"),
  orderBy("timestamp", "desc"),
  limit(5)
);

onSnapshot(q, (snapshot) => {
  activityList.innerHTML = ""; // Clear old list
  snapshot.forEach((doc) => {
    const data = doc.data();
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
