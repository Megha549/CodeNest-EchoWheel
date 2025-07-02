
  import { auth, db } from './js/firebase.js';
  import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  let currentUser = null;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      console.log("🔐 User logged in:", user.email);
    } else {
      alert("Please login first.");
      window.location.href = "login.html";
    }
  });

window.generateQR = async function () {
  if (!currentUser) {
    alert("User not logged in.");
    return;
  }

  const docRef = doc(db, "patient_info", currentUser.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("❌ Patient info not found. Please fill the form first.");
    return;
  }

  const data = docSnap.data();

  // ✅ Keep only critical info
  const qrData = {
    name: data.name || "",
    age: data.age || "",
    bloodGroup: data.bloodGroup || "",
    diseases: data.diseases || "",
    allergies: data.allergies || "",
    emergency: {
      name: data.emergencyContactName || "",
      phone: data.emergencyContactNumber || "",
    }
  };

  const qrText = JSON.stringify(qrData);

  // Clear old QR
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: qrText,
    width: 200,
    height: 200,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });
};
document.getElementById("downloadQRBtn").style.display = "inline-block";
document.getElementById("downloadQRBtn").addEventListener("click", () => {
    const canvas = document.querySelector("#qrcode canvas");
    if (!canvas) {
      alert("QR not generated yet!");
      return;
    }

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "HealthQR.png";
    a.click();
  });