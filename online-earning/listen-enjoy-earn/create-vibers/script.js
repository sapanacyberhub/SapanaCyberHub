/* ---------------- Firebase Config ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBNwCmtWja2xwxhWrU9Ejfz0ggGd796mEI",
  authDomain: "my-application-31862.firebaseapp.com",
  databaseURL: "https://my-application-31862-default-rtdb.firebaseio.com",
  projectId: "my-application-31862",
  storageBucket: "my-application-31862.appspot.com",
  messagingSenderId: "409640627398",
  appId: "1:409640627398:web:e2d1782c77e2ab8d527bc7",
  measurementId: "G-JC06Y12LCB"
};

/* ---------------- Firebase Imports ---------------- */
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------------- Initialization ---------------- */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ---------------- UI Elements ---------------- */
const pageTitle = document.getElementById("title");
const userName  = document.getElementById("name");
const email     = document.getElementById("email");
const password  = document.getElementById("password");
const signInBtn = document.getElementById("btn-secondary");
const submitBtn = document.getElementById("btn-primary");

const dialog = document.getElementById("authProgress");
const title  = document.getElementById("progressTitle");
const text   = document.getElementById("progressText");

let isSignUp = true;

/* ---------------- Toggle SignUp / SignIn ---------------- */
signInBtn.addEventListener("click", () => {
  isSignUp = !isSignUp;

  userName.classList.toggle("is-hidden", !isSignUp);

  pageTitle.textContent = isSignUp
    ? "💖 Create Account 💖"
    : "🎧 Welcome Back 😎";

  signInBtn.textContent = isSignUp
    ? "I'm a Viber?"
    : "New Viber?";
});

/* ---------------- Submit Handler ---------------- */
submitBtn.addEventListener("click", async () => {
  const emailData    = email.value.trim();
  const passwordData = password.value.trim();
  const nameData     = userName.value.trim();

  if (
    !emailData ||
    !passwordData ||
    (isSignUp && !nameData)
  ) {
    document.querySelectorAll("input").forEach(input => {
      if (!input.value.trim()) {
        input.classList.add("shake", "error");
        setTimeout(() =>
          input.classList.remove("shake", "error"), 500);
      }
    });
    return;
  }

  try {
    showProgress(isSignUp);

    /* ---------- SIGN UP FLOW ---------- */
    if (isSignUp) {
      setEqProgress(20);

      const cred = await createUserWithEmailAndPassword(
        auth,
        emailData,
        passwordData
      );

      setEqProgress(50);

      const token = await cred.user.getIdToken(true);

      setEqProgress(70);

      const response = await fetch(
        "https://kzrbqsvvauqugmuwxwse.supabase.co/functions/v1/smart-handler",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            displayName: nameData
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        await cred.user.delete(); // rollback
        throw new Error(result.error || "Signup failed");
      }

      setEqProgress(100);
      setTimeout(hideProgress, 1200);

      window.location.href =
        "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
    }

    /* ---------- SIGN IN FLOW ---------- */
    else {
      setEqProgress(30);

      const cred = await signInWithEmailAndPassword(
        auth,
        emailData,
        passwordData
      );

      await cred.user.getIdToken(true);

      setEqProgress(100);
      setTimeout(hideProgress, 1000);

      window.location.href =
        "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
    }

  } catch (err) {
    alert(err.message);
    hideProgress();
  }
});

/* ---------------- Progress UI ---------------- */
function showProgress(isSignUp) {
  dialog.classList.remove("hidden");

  title.textContent = isSignUp
    ? "Let’s Get You Vibing"
    : "Finding your vibe…";

  text.textContent = isSignUp
    ? "The vibes are waiting for you. Explore, play, and feel every beat."
    : "Hang tight. The vibes are loading…";
}

function setEqProgress(percent) {
  const bars = document.querySelectorAll(".eq-progress span");
  const active = Math.round((percent / 100) * bars.length);

  bars.forEach((bar, i) => {
    bar.style.opacity = i < active ? "1" : "0.25";
  });
}

function hideProgress() {
  dialog.classList.add("hidden");
  setEqProgress(0);
}
