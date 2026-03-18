import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 Firebase config
const app = initializeApp({
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1",
});

const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");
const markSponsorWinner = httpsCallable(functions, "markSponsorWinner");

const installBtn = document.getElementById("installBtn");

let currentUser = null;
let installHandled = false;
let deferredPrompt = null;

// 🔒 INITIAL BUTTON STATE (FAST UX)
installBtn.disabled = true;
installBtn.innerText = "Preparing...";

// ───── AUTH STATE ─────
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// ───── INSTALL PROMPT READY ─────
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // ⚡ INSTANT ENABLE
  installBtn.disabled = false;
  installBtn.innerText = "Install Now 🚀";
});

// ───── INSTALL BUTTON ─────
installBtn.addEventListener("click", async () => {

  if (!currentUser) {
    installBtn.innerText = "Login Required 😕";
    setTimeout(() => {
      installBtn.innerText = "Install Now 🚀";
    }, 1500);
    return;
  }

  if (!deferredPrompt) {
    installBtn.innerText = "Not Supported ❌";
    return;
  }

  // ⚡ LOADING STATE
  installBtn.disabled = true;
  installBtn.innerText = "Installing... ⏳";

  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {

    if (!installHandled) {
      installHandled = true;

      const sponsorId = localStorage.getItem("pendingSponsorId");

      if (!sponsorId) {
        console.warn("❌ No sponsorId");
        return;
      }

      try {
        await markSponsorWinner({
          sponsorId: String(sponsorId)
        });

        installBtn.innerText = "Success 🎉";
        localStorage.removeItem("pendingSponsorId");

      } catch (err) {
        console.error(err);
        installBtn.innerText = "Failed 😕";
      }
    }

  } else {
    // user cancelled
    installBtn.disabled = false;
    installBtn.innerText = "Install Now 🚀";
  }

  deferredPrompt = null;
});

// ───── SKIP BUTTON ─────
document.getElementById("skipBtn").onclick = () => {
  window.location.href = "/";
};