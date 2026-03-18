import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ══════════════════════════════════════════════════════════════════════════════
//  FIREBASE INIT
// ══════════════════════════════════════════════════════════════════════════════
const app = initializeApp({
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1",
});

const auth      = getAuth(app);
const functions = getFunctions(app, "us-central1");
const markSponsorWinner = httpsCallable(functions, "markSponsorWinner");

// ══════════════════════════════════════════════════════════════════════════════
//  DOM
// ══════════════════════════════════════════════════════════════════════════════
const installBtn = document.getElementById("installBtn");
const skipBtn    = document.getElementById("skipBtn");

// ══════════════════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════════════════
let currentUser    = null;
let installHandled = false;
let deferredPrompt = null;

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════════════
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// ══════════════════════════════════════════════════════════════════════════════
//  BEFOREINSTALLPROMPT
//  The button starts disabled in HTML. Only enable it once the browser signals
//  the PWA is installable — avoids a broken "Install" button on unsupported
//  browsers or when the app is already installed.
// ══════════════════════════════════════════════════════════════════════════════
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  installBtn.disabled    = false;
  installBtn.innerText   = "Install Now 🚀";
});

// ══════════════════════════════════════════════════════════════════════════════
//  APP ALREADY INSTALLED
//  If the app is launched from the home screen, skip the install page entirely.
// ══════════════════════════════════════════════════════════════════════════════
window.addEventListener("appinstalled", () => {
  // User installed via browser UI or prompt accepted — go home
  deferredPrompt = null;
  window.location.href = "/";
});

// ══════════════════════════════════════════════════════════════════════════════
//  FIX: if already running as standalone PWA, redirect immediately —
//       no point showing the install screen if the app is already installed.
// ══════════════════════════════════════════════════════════════════════════════
if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
  window.location.href = "/";
}

// ══════════════════════════════════════════════════════════════════════════════
//  INSTALL BUTTON
// ══════════════════════════════════════════════════════════════════════════════
installBtn.addEventListener("click", async () => {

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!currentUser) {
    installBtn.innerText = "Login Required 😕";
    setTimeout(() => { installBtn.innerText = "Install Now 🚀"; }, 1500);
    return;
  }

  // ── Prompt guard ─────────────────────────────────────────────────────────
  // FIX: deferredPrompt becomes null after the first .prompt() call.
  // Guard against a second click re-running the flow with a stale prompt.
  if (!deferredPrompt) {
    installBtn.innerText = "Already Installing...";
    return;
  }

  installBtn.disabled  = true;
  installBtn.innerText = "Installing... ⏳";

  // Capture and immediately clear the prompt so it can't be reused
  const prompt = deferredPrompt;
  deferredPrompt = null;

  try {
    prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice.outcome === "accepted") {

      // FIX: installHandled guard is correct — keep it. Prevents double-calling
      // markSponsorWinner if appinstalled event and this branch both fire.
      if (!installHandled) {
        installHandled = true;

        const sponsorId = localStorage.getItem("pendingSponsorId");

        if (sponsorId) {
          try {
            await markSponsorWinner({ sponsorId: String(sponsorId) });
            localStorage.removeItem("pendingSponsorId");
            installBtn.innerText = "Installed 🎉";
          } catch (err) {
            console.error("markSponsorWinner failed:", err);
            installBtn.innerText = "Reward Failed 😕";
            // Don't block the user — still go home after a moment
          }
        } else {
          // No sponsor flow — just show success
          installBtn.innerText = "Installed 🎉";
        }

        // Redirect home after install regardless of sponsor result
        setTimeout(() => { window.location.href = "/"; }, 1500);
      }

    } else {
      // User dismissed the prompt
      deferredPrompt       = null; // already null, but be explicit
      installBtn.disabled  = false;
      installBtn.innerText = "Install Now 🚀";
    }

  } catch (err) {
    // prompt() can throw if called at the wrong time
    console.error("Install prompt error:", err);
    installBtn.disabled  = false;
    installBtn.innerText = "Try Again";
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SKIP BUTTON
// ══════════════════════════════════════════════════════════════════════════════
skipBtn.addEventListener("click", () => {
  window.location.href = "/";
});