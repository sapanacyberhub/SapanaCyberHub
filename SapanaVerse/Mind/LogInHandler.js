import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBNwCmtWja2xwxhWrU9Ejfz0ggGd796mEI",
  authDomain: "my-application-31862.firebaseapp.com",
  projectId: "my-application-31862",
  storageBucket: "my-application-31862.appspot.com",
  messagingSenderId: "409640627398",
  appId: "1:409640627398:web:e2d1782c77e2ab8d527bc7",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =======================================================
   Dialog Utilities
======================================================= */
function showDialog(title, message, showProgress = true) {
  const dialog = document.getElementById("customDialog");
  const titleEl = dialog.querySelector(".dialog-title");
  const msgEl = dialog.querySelector(".dialog-message");
  const progress = dialog.querySelector(".progress-container");
  const button = document.getElementById("closeDialog");

  titleEl.innerText = title;
  msgEl.innerHTML = message;
  dialog.style.display = "flex";
  progress.style.display = showProgress ? "block" : "none";
  button.style.display = showProgress ? "none" : "inline-block";
}

function animateProgressBar() {
  const bar = document.getElementById("progressBar");
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 90) return;
    width += 10;
    bar.style.width = width + "%";
  }, 300);
  return interval;
}

/* =======================================================
   LOGIN HANDLER
======================================================= */
document.getElementById("LogInForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  showDialog("Logging In...", "Please wait while we verify your account 💫", true);
  const progressInterval = animateProgressBar();

  try {
    // ✅ Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Fetch Firestore user info
    const userRef = doc(db, "SapanaCyberHub", "Users-SapanaCyberHub", "SapanaCyberHubMembers", user.uid);
    const userSnap = await getDoc(userRef);

    clearInterval(progressInterval);
    document.getElementById("progressBar").style.width = "100%";

    if (userSnap.exists()) {
      const data = userSnap.data();

      // ✅ Show success
      showDialog(
        "Welcome Back 💖",
        `Hello <b>${data.fullName}</b>! Redirecting you to your dashboard...`,
        false
      );

      // ✅ Redirect
      document.getElementById("closeDialog").onclick = () => {
        window.location.href = "../HomePage/index.html";
      };
    } else {
      showDialog("Error ❌", "Account not found in Firestore!", false);
      document.getElementById("closeDialog").onclick = () => {
        document.getElementById("customDialog").style.display = "none";
      };
    }
  } catch (error) {
    clearInterval(progressInterval);
    showDialog("Login Failed ❌", error.message, false);
    document.getElementById("closeDialog").onclick = () => {
      document.getElementById("customDialog").style.display = "none";
    };
  }
});
