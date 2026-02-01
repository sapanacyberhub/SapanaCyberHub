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

// ================= SUBMIT =================
submit.addEventListener("click", async () => {
  const emailData = userEmail.value.trim();
  const passwordData = userPassword.value.trim();
  const nameData = userName.value.trim();

  let hasError = false; // Track if any field is invalid

  // Check Email
  if (!emailData) {
    userEmail.classList.add("shake");
    setTimeout(() => userEmail.classList.remove("shake"), 350);
    hasError = true;
  }

  // Check Password
  if (!passwordData) {
    userPassword.classList.add("shake");
    setTimeout(() => userPassword.classList.remove("shake"), 350);
    hasError = true;
  }

  // Check Name (only if signing up)
  if (isSignUp && !nameData) {
    userName.classList.add("shake");
    setTimeout(() => userName.classList.remove("shake"), 350);
    hasError = true;
  }

  // If any field was empty, STOP here
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
    let friendlyMsg = "An error occurred. Please try again.";
    if (err.code === 'auth/email-already-in-use') friendlyMsg = "This email is already registered!";
    // update dialog title or desc for failed
    progressFailed(friendlyMsg);
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
function progressFailed(friendlyMsg) {
  dialogCard.classList.add("failed");
  title.textContent = "Failed !";
  text.textContent = friendlyMsg;
  setTimeout(() => {
    hideProgress();
  }, 3000);
}

function hideProgress() {
  dialog.classList.add("hidden");
}
