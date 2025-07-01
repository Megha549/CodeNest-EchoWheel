// /js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPp8Prk6x29L5tXp7nK9OUq1PE5dhIpyM",
  authDomain: "echowheel-9c8ca.firebaseapp.com",
  projectId: "echowheel-9c8ca",
  storageBucket: "echowheel-9c8ca.firebasestorage.app",
  messagingSenderId: "355780499878",
  appId: "1:355780499878:web:6aefb57dc860875e1fd767",
  measurementId: "G-6QPZZF2E3X"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
