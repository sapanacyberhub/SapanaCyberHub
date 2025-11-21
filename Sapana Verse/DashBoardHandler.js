// ✅ Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBNwCmtWja2xwxhWrU9Ejfz0ggGd796mEI",
  authDomain: "my-application-31862.firebaseapp.com",
  databaseURL: "https://my-application-31862-default-rtdb.firebaseio.com",
  projectId: "my-application-31862",
  storageBucket: "my-application-31862.appspot.com",
  messagingSenderId: "409640627398",
  appId: "1:409640627398:web:e2d1782c77e2ab8d527bc7",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 SapanaCyberHub Firebase initialized successfully!");
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

async function loadLatestBlogs() {
  const container = document.getElementById("blog-container");

  // Show loading UI
  container.innerHTML = `
    <div class="loading-bar">
      <div class="loading-progress"></div>
      <p class="loading-text">Loading latest blogs...</p>
    </div>
  `;

  try {
    // ✅ Firestore Query (fetch latest 3 blogs)
    const blogsRef = collection(db, "SapanaCyberHub","Blogs","Blog-official-public");
    const q = query(blogsRef, orderBy("date", "desc"), limit(3));
    const querySnapshot = await getDocs(blogsRef);

    if (querySnapshot.empty) {
      container.innerHTML = `<p class="no-blogs">No blogs found yet.</p>`;
      return;
    }

    // Clear old content
    container.innerHTML = "";

    // Render each blog card
    querySnapshot.forEach((docSnap) => {
      const blog = docSnap.data();
      const card = document.createElement("div");
      card.classList.add("blog-card");
      card.innerHTML = `
        <img src="${blog.imageUrl || '/Assets/SignUpBg.png'}" alt="${blog.title}">
        <h3>${blog.title || 'Untitled Blog'}</h3>
        <p>${(blog.description || '').slice(0, 100)}...</p>
        <a href="${blog.link || '#'}" class="read-more">Read More →</a>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("🔥 Error loading blogs:", error);
    container.innerHTML = `
      <div class="error-box">
        <span class="error-icon">⚠️</span>
        <p class="error-text">Failed to load blogs!.</p>
        <button class="retry-btn" id="retryBtn">Retry</button>
      </div>
    `;

    const retryBtn = document.getElementById("retryBtn");
    retryBtn.addEventListener("click", () => {
      retryBtn.classList.add("loading");
      retryBtn.textContent = "Loading...";
      setTimeout(() => loadLatestBlogs(), 800);
    });
  }
}

// Call the function after Firebase loads
loadLatestBlogs();

// ===============================
// 👤 USER AUTH & NAVBAR UPDATER
// ===============================

// HTML elements
const beMember = document.querySelector(".beMember");
const userImg = document.querySelector(".user-img");

// Safe image loader with fallback
const setSafeImage = (photo) => {
  if (!photo || photo === "null" || photo.trim() === "") {
    userImg.src = "Assets/SignUpBg.webp";
  } else {
    userImg.src = photo;
  }
  userImg.onerror = () => (userImg.src = "Assets/SignUpBg.webp");
};

// ✅ Watch for user login state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ User logged in:", user.email);

    try {
      const userRef = doc(
        db,
        "SapanaCyberHub",
        "Users-SapanaCyberHub",
        "SapanaCyberHubMembers",
        user.uid
      );
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const displayName = data.fullName || user.displayName || "User";

        beMember.textContent = displayName;
        beMember.href = "Body/profile.html";
        beMember.title = `Hi ${displayName}! Click to view profile.`;

        setSafeImage(data.photoUrl || user.photoURL);
      } else {
        console.warn("⚠️ Firestore user doc not found. Using Auth info.");
        const displayName = user.displayName || "User";

        beMember.textContent = displayName;
        beMember.href = "Body/profile.html";
        beMember.title = `Hi ${displayName}! Click to view profile.`;

        setSafeImage(user.photoURL);
      }
    } catch (err) {
      console.error("❌ Error fetching user data:", err);

      const displayName = user.displayName || "User";
      beMember.textContent = displayName;
      beMember.href = "Body/profile.html";
      beMember.title = `Hi ${displayName}! Click to view profile.`;

      setSafeImage(user.photoURL);
    }
  } else {
    console.log("🚪 No user logged in.");

    beMember.textContent = "Create Account";
    beMember.href = "UserRegistration/signup.html";
    beMember.title = "Create your SapanaCyberHub account";

    userImg.src = "Assets/SignUpBg.png";
    userImg.onerror = () => (userImg.src = "Assets/SignUpBg.png");
  }
});

// ===============================
// 🚪 Optional Logout Handler
// ===============================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("You’ve been logged out 💔");
      window.location.href = "UserRegistration/login.html";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed, please try again.");
    }
  });
}
