// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1"
};

// ================= IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// ================= INITIALIZE =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const functions = getFunctions(app, "us-central1");
const updateUserName = httpsCallable(functions, "updateUserName");

// ================= UI ELEMENTS =================
const pageTitle = document.getElementById("title");
const userName = document.getElementById("name");
const signIn = document.getElementById("btn-secondary");
const submit = document.getElementById("btn-primary");

const dialog = document.getElementById("authProgress");
const title = document.getElementById("progressTitle");
const text = document.getElementById("progressText");

let isSignUp = true;

// ================= TOGGLE =================
signIn.addEventListener("click", () => {
  isSignUp = !isSignUp;
  userName.classList.toggle("is-hidden", !isSignUp);

  pageTitle.textContent = isSignUp
    ? "💖Create Account💖"
    : "🎧Welcome Back😎";

  signIn.textContent = isSignUp
    ? "I'm a Viber?"
    : "New Viber?";
});

// ================= SUBMIT =================
submit.addEventListener("click", async () => {
  const emailData = email.value.trim();
  const passwordData = password.value.trim();
  const nameData = userName.value.trim();

  if (!emailData || !passwordData || (isSignUp && !nameData)) {
    alert("Fill all fields");
    return;
  }

  try {
    if (isSignUp) {
      showProgress(true);
      

      // 1️⃣ CREATE AUTH USER
      const res = await createUserWithEmailAndPassword(
        auth,
        emailData,
        passwordData
      );

      // 2️⃣ SET AUTH DISPLAY NAME
      await updateProfile(res.user, {
        displayName: nameData
      });

      // 3️⃣ FORCE TOKEN
      await res.user.getIdToken(true);

      // 4️⃣ SERVER WRITE (SECURE)
      const result = await updateUserName({ name: nameData });

      if (!result.data.success) {
        throw new Error("Profile creation failed");
      }

      window.location.href =
        "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";

    } else {
      showProgress(false);

      await signInWithEmailAndPassword(
        auth,
        emailData,
        passwordData
      );

      window.location.href =
        "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
    }

  } catch (err) {
    // 🚨 cleanup client auth if server failed
    if (auth.currentUser) {
      await auth.currentUser.delete().catch(() => {});
    }

    alert(err.message || "Signup failed. Retry.");
    hideProgress();
  }
});

// ================= UI HELPERS =================
function showProgress(isSignUp) {
  dialog.classList.remove("hidden");
  title.textContent = isSignUp
    ? "Creating account…"
    : "Signing in…";
  text.textContent = "Please wait";
}

function hideProgress() {
  dialog.classList.add("hidden");
}
