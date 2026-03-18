import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    // 🔥 Firebase config
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
    const functions = getFunctions(app, "us-central1");
    const markSponsorWinner = httpsCallable(functions, "markSponsorWinner");

    let currentUser = null;
    let installHandled = false;
    let deferredPrompt = null;

    // ───── AUTH STATE ─────
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        console.log("✅ User logged in:", user.uid);
      } else {
        currentUser = null;
        console.warn("❌ User not logged in");
      }
    });

    // ───── INSTALL PROMPT ─────
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    // ───── INSTALL BUTTON ─────
    document.getElementById("installBtn").addEventListener("click", async () => {

      // ❌ BLOCK if not logged in
      if (!currentUser) {
        alert("Please login first 😕");
        return;
      }

      if (!deferredPrompt) {
        alert("Install not available 😕");
        return;
      }

      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        console.log("🎉 Install accepted");

        if (!installHandled) {
          installHandled = true;

          const sponsorId = localStorage.getItem("pendingSponsorId");

          if (!sponsorId) {
            console.warn("❌ No sponsorId found");
            return;
          }

          try {
            await markSponsorWinner({
              sponsorId: String(sponsorId)
            });

            console.log("✅ Winner marked");

            localStorage.removeItem("pendingSponsorId");

          } catch (err) {
            console.error("❌ Failed:", err);
          }
        }
      }

      deferredPrompt = null;
    });

    // ───── SKIP BUTTON ─────
    document.getElementById("skipBtn").onclick = () => {
      window.location.href = "/";
    };