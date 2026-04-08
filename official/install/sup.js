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
//  TOAST SYSTEM
//  Creates a self-removing toast at the bottom of the screen.
//  type: "success" | "error" | "info"
// ══════════════════════════════════════════════════════════════════════════════
(function injectToastStyles() {
  if (document.getElementById("__install-toast-style")) return;
  const style = document.createElement("style");
  style.id = "__install-toast-style";
  style.textContent = `
    #__toast-container {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }
    .install-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 22px;
      border-radius: 14px;
      font-family: system-ui, sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      box-shadow: 0 8px 32px rgba(0,0,0,0.28);
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: auto;
      max-width: 340px;
      text-align: center;
      backdrop-filter: blur(8px);
    }
    .install-toast.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .install-toast.success { background: linear-gradient(135deg, #1db954, #17963f); }
    .install-toast.error   { background: linear-gradient(135deg, #e53935, #b71c1c); }
    .install-toast.info    { background: linear-gradient(135deg, #1976d2, #0d47a1); }
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "__toast-container";
  document.body.appendChild(container);
})();

function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("__toast-container");
  const toast = document.createElement("div");
  toast.className = `install-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, duration);
}

// ══════════════════════════════════════════════════════════════════════════════
//  ADS — ADSTERRA
//  Replace the data-* values with your own Adsterra zone IDs.
//  This injects all major Adsterra formats:
//    • Popunder  (loads once, no visible element needed)
//    • Social Bar (sticky floating bar)
//    • Native Banner (inline — needs a container div in your HTML)
//    • Display Banner 300×250 (needs a container div in your HTML)
// ══════════════════════════════════════════════════════════════════════════════
function loadAdsterra() {

  // ── 1. Popunder ────────────────────────────────────────────────────────────
  // Replace ADSTERRA_POPUNDER_KEY with your key from Adsterra dashboard
  const popunderKey = "ADSTERRA_POPUNDER_KEY"; // ← your key here
  (function(d, s, id) {
    const js = d.createElement(s);
    js.id = id;
    js.src = `//www.profitabledisplaynetwork.com/${popunderKey}/invoke.js`;
    js.setAttribute("data-cfasync", "false");
    js.async = true;
    d.body.appendChild(js);
  })(document, "script", "adsterra-popunder");

  // ── 2. Social Bar ──────────────────────────────────────────────────────────
  // Replace ADSTERRA_SOCIAL_BAR_KEY with your Social Bar zone key
  const socialBarKey = "ADSTERRA_SOCIAL_BAR_KEY"; // ← your key here
  const sbScript = document.createElement("script");
  sbScript.setAttribute("data-cfasync", "false");
  sbScript.async = true;
  sbScript.src = `//www.topcreativeformat.com/${socialBarKey}/invoke.js`;
  document.body.appendChild(sbScript);

  // ── 3. Native Banner ───────────────────────────────────────────────────────
  // Add  <div id="ad-adsterra-native"></div>  wherever you want it in your HTML
  const nativeContainer = document.getElementById("ad-adsterra-native");
  if (nativeContainer) {
    const nativeKey = "ADSTERRA_NATIVE_KEY"; // ← your key here
    const ns = document.createElement("script");
    ns.setAttribute("data-cfasync", "false");
    ns.async = true;
    ns.src = `//www.topcreativeformat.com/${nativeKey}/invoke.js`;
    nativeContainer.appendChild(ns);
  }

  // ── 4. Display Banner 300×250 ──────────────────────────────────────────────
  // Add  <div id="ad-adsterra-banner"></div>  wherever you want it in your HTML
  const bannerContainer = document.getElementById("ad-adsterra-banner");
  if (bannerContainer) {
    const bannerKey = "ADSTERRA_BANNER_KEY"; // ← your key here
    const bs = document.createElement("script");
    bs.setAttribute("data-cfasync", "false");
    bs.async = true;
    bs.src = `//www.topcreativeformat.com/${bannerKey}/invoke.js`;
    bannerContainer.appendChild(bs);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  ADS — MONETAG
//  Replace the placeholder IDs with your own Monetag zone/publisher IDs.
//  This injects all major Monetag formats:
//    • Push Notifications (SW-based, requires service worker already registered)
//    • Popunder / OnClick
//    • In-Page Push (sticky banner)
//    • Interstitial / Vignette
// ══════════════════════════════════════════════════════════════════════════════
function loadMonetag() {

  // ── 1. Push Notifications ──────────────────────────────────────────────────
  // Your Monetag publisher ID (numeric)
  const monetagPublisherId = "MONETAG_PUBLISHER_ID"; // ← your ID here

  // Monetag push requires this snippet + a service worker.
  // Add monetag-sw.js to your root: https://monetag.com/resources/sw.js
  (function(d, z, s) {
    s = d.createElement("script");
    s.src = "//revenueadnetwork.com/pwpp/" + z;
    s.async = true;
    s.defer = true;
    d.head.appendChild(s);
  })(document, monetagPublisherId);

  // ── 2. Popunder / OnClick ─────────────────────────────────────────────────
  // Replace MONETAG_POPUNDER_ID with your zone ID
  const monetagPopunderId = "MONETAG_POPUNDER_ID"; // ← your zone ID here
  (function(d, z, s) {
    s = d.createElement("script");
    s.src = "//revenueadnetwork.com/401/" + z;
    s.async = true;
    s.defer = true;
    d.body.appendChild(s);
  })(document, monetagPopunderId);

  // ── 3. In-Page Push ───────────────────────────────────────────────────────
  // Replace MONETAG_INPAGE_ID with your In-Page Push zone ID
  const monetagInPageId = "MONETAG_INPAGE_ID"; // ← your zone ID here
  (function(d, z, s) {
    s = d.createElement("script");
    s.src = "//revenueadnetwork.com/inpage/" + z;
    s.async = true;
    s.defer = true;
    d.body.appendChild(s);
  })(document, monetagInPageId);

  // ── 4. Vignette / Interstitial ────────────────────────────────────────────
  // Replace MONETAG_VIGNETTE_ID with your Vignette zone ID
  const monetagVignetteId = "MONETAG_VIGNETTE_ID"; // ← your zone ID here
  (function(d, z, s) {
    s = d.createElement("script");
    s.src = "//revenueadnetwork.com/vignette/" + z;
    s.async = true;
    s.defer = true;
    d.body.appendChild(s);
  })(document, monetagVignetteId);
}

// ── Boot ads when DOM is ready ──────────────────────────────────────────────
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadAdsterra();
    loadMonetag();
  });
} else {
  loadAdsterra();
  loadMonetag();
}

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
// ══════════════════════════════════════════════════════════════════════════════
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  installBtn.disabled  = false;
  installBtn.innerText = "Install Now 🚀";
});

// ══════════════════════════════════════════════════════════════════════════════
//  APP ALREADY INSTALLED (browser fires this after prompt accepted)
//  FIX: Do NOT redirect here — just clear the prompt and show a toast.
// ══════════════════════════════════════════════════════════════════════════════
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  // Toast already shown from the install button handler — no need to repeat.
  // Do NOT redirect.
});

// ══════════════════════════════════════════════════════════════════════════════
//  Already running as standalone PWA — redirect home (already installed)
// ══════════════════════════════════════════════════════════════════════════════
if (
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true
) {
  window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
}

// ══════════════════════════════════════════════════════════════════════════════
//  INSTALL BUTTON
// ══════════════════════════════════════════════════════════════════════════════
installBtn.addEventListener("click", async () => {

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!currentUser) {
    showToast("Please login first to install the app 😕", "error");
    installBtn.innerText = "Login Required 😕";
    setTimeout(() => { installBtn.innerText = "Install Now 🚀"; }, 2000);
    return;
  }

  // ── Prompt guard ─────────────────────────────────────────────────────────
  if (!deferredPrompt) {
    showToast("App is already being installed or is already installed ✅", "info");
    installBtn.innerText = "Already Installing...";
    return;
  }

  installBtn.disabled  = true;
  installBtn.innerText = "Installing... ⏳";

  // Capture and clear the prompt so it can't be reused
  const prompt = deferredPrompt;
  deferredPrompt = null;

  try {
    prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice.outcome === "accepted") {

      if (!installHandled) {
        installHandled = true;

        const sponsorId = localStorage.getItem("pendingSponsorId");

        if (sponsorId) {
          try {
            await markSponsorWinner({ sponsorId: String(sponsorId) });
            localStorage.removeItem("pendingSponsorId");

            // ✅ FIX: Show toast — do NOT redirect
            showToast("🎉 Installed! Your reward has been credited!", "success", 5000);
            installBtn.innerText = "Installed 🎉";

          } catch (err) {
            console.error("markSponsorWinner failed:", err);

            // Still show install success, but flag reward failure
            showToast("App installed! But reward sync failed. Contact support 😕", "error", 5000);
            installBtn.innerText = "Reward Failed 😕";
          }
        } else {
          // No sponsor — just celebrate the install
          showToast("🎉 App installed successfully! Enjoy!", "success", 4000);
          installBtn.innerText = "Installed 🎉";
        }

        // ✅ FIX: NO redirect — user stays on the page
      }

    } else {
      // User dismissed the prompt
      installBtn.disabled  = false;
      installBtn.innerText = "Install Now 🚀";
      showToast("Installation cancelled. You can install anytime! 👍", "info");
    }

  } catch (err) {
    console.error("Install prompt error:", err);
    installBtn.disabled  = false;
    installBtn.innerText = "Try Again";
    showToast("Something went wrong. Please try again.", "error");
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SKIP BUTTON
// ══════════════════════════════════════════════════════════════════════════════
skipBtn.addEventListener("click", () => {
  window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
});