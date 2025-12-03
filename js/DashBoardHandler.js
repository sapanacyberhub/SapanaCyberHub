// ============================================
// 🔥 SAPANACYBERHUB - DASHBOARD / NAV AUTH SYSTEM
// Version: 2025 Super Optimized Edition
// ============================================

// ------------------------
// 1️⃣ Import Firebase
// ------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ------------------------
// 2️⃣ Firebase Config
// ------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBNwCmtWja2xwxhWrU9Ejfz0ggGd796mEI",
  authDomain: "my-application-31862.firebaseapp.com",
  databaseURL: "https://my-application-31862-default-rtdb.firebaseio.com",
  projectId: "my-application-31862",
  storageBucket: "my-application-31862.appspot.com",
  messagingSenderId: "409640627398",
  appId: "1:409640627398:web:e2d1782c77e2ab8d527bc7",
};


// ------------------------
// 3️⃣ Initialize Firebase
// ------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 SapanaCyberHub Firebase connected");


// ------------------------
// 4️⃣ HTML TARGET ELEMENTS
// ------------------------
const profileName = document.querySelector(".profile-name");
const profileBtn = document.querySelector(".profile-btn");
const userImg = document.querySelector(".user-img");


// ------------------------
// 5️⃣ Fallback Image Loader
// ------------------------
const loadUserImage = (photo) => {
  if (!photo || photo === "null" || photo.trim() === "") {
    userImg.src = "aAssets/SignUpBg.webp";
  } else {
    userImg.src = photo;
  }

  userImg.onerror = () => userImg.src = "aAssets/SignUpBg.webp";
};


// ------------------------
// 6️⃣ AUTH STATE CHECKER
// ------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("👤 Logged In:", user.email);

    // Firestore reference
    const userRef = doc(
      db,
      "SapanaCyberHub",
      "Users-SapanaCyberHub",
      "SapanaCyberHubMembers",
      user.uid
    );

    try {
      const snap = await getDoc(userRef);

      let name = user.displayName || "User";
      let photo = user.photoURL;

      if (snap.exists()) {
        const data = snap.data();
        name = data.fullName || name;
        photo = data.photoUrl || photo;
      }

      // Update navbar
      profileName.textContent = name;
      profileBtn.href = "https://sapanacyberhub.in/pages/user/profile";
      profileBtn.title = "View your profile";

      loadUserImage(photo);

    } catch (err) {
      console.error("❌ Firestore error:", err);

      profileName.textContent = user.displayName || "User";
      profileBtn.href = "/pages/user/profile.html";

      loadUserImage(user.photoURL);
    }

  } else {
    console.log("🚪 No user logged in");

    // When no user logged in → show SignUp
    profileName.textContent = "Create Account";
    profileBtn.href = "https://sapanacyberhub.in/pages/user/signup";
    profileBtn.title = "Create your SapanaCyberHub account";

    userImg.src = "/assets/SignUpBg.webp";
  }
});


// ------------------------
// 7️⃣ LOGOUT HANDLER
// ------------------------
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully 💛");
      window.location.href = "/";
    } catch (error) {
      alert("Logout failed. Please retry.");
      console.log(error);
    }
  });
}
