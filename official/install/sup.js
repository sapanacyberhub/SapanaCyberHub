import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";


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
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);
let deferredPrompt = null;

const installScreen = document.getElementById("installScreen");
const installBtn = document.getElementById("installBtn");
const skipBtn = document.getElementById("skipBtn");

/* detect app mode */
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

/* ------------------ LOAD ------------------ */

window.addEventListener("load", () => {

    if (isAppInstalled()) {
        handleAppOpen();
        return;
    }

    if (!localStorage.getItem("installSkipped")) {
        setTimeout(() => {
            installScreen.style.display = "flex";
        }, 500);
    }

});

/* ------------------ INSTALL PROMPT ------------------ */

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

/* ------------------ INSTALL CLICK ------------------ */

installBtn.addEventListener("click", async () => {

    if (deferredPrompt) {

        deferredPrompt.prompt();

        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {

            localStorage.setItem("justInstalled", "true");

            installScreen.style.display = "none";
        }

        deferredPrompt = null;

    } else {
        showInstallGuide();
    }

});

/* ------------------ FALLBACK GUIDE ------------------ */

function showInstallGuide() {

    const div = document.createElement("div");

    div.className = "app-welcome";

    div.innerHTML = `
    <div class="welcome-box">
        <h2>📲 Install App</h2>
        <p>Tap ⋮ → Add to Home Screen</p>
    </div>
    `;

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2500);
}

/* ------------------ SKIP ------------------ */

skipBtn.addEventListener("click", () => {
    installScreen.style.display = "none";
    localStorage.setItem("installSkipped", "true");
});

/* ------------------ APP OPEN ------------------ */

async function handleAppOpen() {

    installScreen.style.display = "none";

    // 🔥 IMPORTANT: reward only once
    if (localStorage.getItem("installRewardGiven")) {
        redirectToMain();
        return;
    }

    if (localStorage.getItem("justInstalled")) {

        showWelcome();

        try {
            const res = await rewardAppInstall(); // 🔥 CALL SERVER

            if (res?.data?.success) {
                localStorage.setItem("installRewardGiven", "true");
            }

        } catch (err) {
            console.error("Reward failed:", err);
        }

        localStorage.removeItem("justInstalled");

        setTimeout(() => {
            redirectToMain();
        }, 2000);

    } else {
        redirectToMain();
    }
}

/* ------------------ REDIRECT ------------------ */

function redirectToMain() {
    window.location.replace("/online-earning/listen-enjoy-earn/");
}

/* ------------------ WELCOME ------------------ */

function showWelcome() {

    const div = document.createElement("div");

    div.className = "app-welcome";

    div.innerHTML = `
    <div class="welcome-box">
        <h2>🎉 Welcome to App Mode</h2>
        <p>Reward unlocked!</p>
    </div>
    `;

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2000);
}

/* ------------------ CALL FUNCTION ------------------ */

const rewardAppInstall = async () => {
    return await window.firebase.functions().httpsCallable("rewardAppInstall")();
};

/* ------------------ SERVICE WORKER ------------------ */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
