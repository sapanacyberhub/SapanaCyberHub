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
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// ================= INITIALIZE =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const functions = getFunctions(app, "us-central1");
const createOrUpdateUser = httpsCallable(functions, "createOrUpdateUser");

// ================= UI ELEMENTS =================
const pageTitle = document.getElementById("title");
const userName = document.getElementById("name");
const userEmail = document.getElementById("email");
const userPassword = document.getElementById("password");
const signIn = document.getElementById("btn-secondary");
const submit = document.getElementById("btn-primary");

const dialog = document.getElementById("authProgress");
const dialogCard = document.getElementById("progress-card");
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

// ================= HELPER: GET FRIENDLY ERROR MESSAGE =================
function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return "This email is already registered! Try signing in.";
    case 'auth/weak-password':
      return "Password is too weak. Use at least 6 characters.";
    case 'auth/invalid-email':
      return "Invalid email address format.";
    case 'auth/user-not-found':
      return "No account found with this email.";
    case 'auth/wrong-password':
      return "Incorrect password. Please try again.";
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please wait a few minutes.";
    case 'auth/network-request-failed':
      return "Network error. Check your connection and try again.";
    case 'auth/internal-error':
      return "Something went wrong. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
}

// ================= SUBMIT =================
submit.addEventListener("click", async () => {
  const emailData = userEmail.value.trim();
  const passwordData = userPassword.value.trim();
  const nameData = userName.value.trim();

  let hasError = false;

  if (!emailData) {
    userEmail.classList.add("shake");
    setTimeout(() => userEmail.classList.remove("shake"), 350);
    hasError = true;
  }
  if (!passwordData) {
    userPassword.classList.add("shake");
    setTimeout(() => userPassword.classList.remove("shake"), 350);
    hasError = true;
  }
  if (isSignUp && !nameData) {
    userName.classList.add("shake");
    setTimeout(() => userName.classList.remove("shake"), 350);
    hasError = true;
  }

  if (hasError) return;

  try {
    if (isSignUp) {
      showProgress(true);

      // 1️⃣ CREATE AUTH USER
      const res = await createUserWithEmailAndPassword(
        auth,
        emailData,
        passwordData
      );

      // 2️⃣ SINGLE SERVER CALL – creates profile & sets name
      const result = await createOrUpdateUser({
        name: nameData,
        email: emailData   // optional but explicit
      });

      if (!result.data.success) {
        throw new Error("Profile creation failed");
      }

      // ✅ Success → redirect
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
    let friendlyMsg;

    if (err.code) {
      friendlyMsg = getFriendlyErrorMessage(err.code);
    } else if (err.message === "Profile creation failed") {
      friendlyMsg = "Account could not be set up. Please try again.";
    } else {
      friendlyMsg = "An error occurred. Please try again.";
    }

    progressFailed(friendlyMsg);
  }
});

// ================= UI HELPERS =================
function showProgress(isSignUp) {
  // Reset any previous error styling
  if (dialogCard) dialogCard.classList.remove("failed");
  dialog.classList.remove("hidden");
  title.textContent = isSignUp
    ? "Creating account…"
    : "Signing in…";
  text.textContent = "Please wait";
}

function progressFailed(friendlyMsg) {
  if (dialogCard) dialogCard.classList.add("failed");
  title.textContent = "Failed !";
  text.textContent = friendlyMsg;
  setTimeout(() => {
    hideProgress();
  }, 3000);
}

function hideProgress() {
  dialog.classList.add("hidden");
}