
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,          
  where,          
  getDocs,        
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

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



// Utility: Show / Update Dialog
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

// Progress simulation (optional visual)
function animateProgressBar() {
    const bar = document.getElementById("progressBar");
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 90) return; // stay near completion until Firebase finishes
        width += 10;
        bar.style.width = width + "%";
    }, 300);
    return interval;
}

// ✅ Handle click on custom button
document
    .getElementById("SignUpBtn")
    .addEventListener("click", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        function showInputAlert(id, message) {
            const input = document.getElementById(id);

            alert(message);

            input.style.border = "2px solid red";
            input.style.transition = "0.3s";

            // Optional: shake animation
            input.animate(
                [
                    { transform: "translateX(0)" },
                    { transform: "translateX(-5px)" },
                    { transform: "translateX(5px)" },
                    { transform: "translateX(0)" },
                ], {
                duration: 300,
                iterations: 1
            }); input.focus();

            // Remove red border after a few seconds
            setTimeout(() => {
                input.style.border = "";
            }, 2000);
        }

        // Validation
        if (!name) {
            showInputAlert("name", "Please enter your full name!");
            return;
        }

        if (!email) {
            showInputAlert("email", "Please enter your email!");
            return;
        }

        if (!password) {
            showInputAlert("password", "Please enter your password!");
            return;
        }

        // 💖 Show Dialog + Progress
        showDialog("Creating Account...", "Please wait while we set up your account 💫", true);
        const progressInterval = animateProgressBar();

        try {
            // ✅ Firebase Signup
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // make sure username is unique
            const userTag = await generateUniqueUsername(name);



            // ✅ Save to Firestore (fixed)

            await setDoc(
                doc(db, "SapanaCyberHub", "Users-SapanaCyberHub", "SapanaCyberHubMembers", user.uid),
                {
                    fullName: name,
                    email: email,
                    password: password,
                    userTag: userTag,    // ✅ unique, not taken
                    uerUid: user.uid,      
                    createdAt: serverTimestamp(),
                }
            );


            clearInterval(progressInterval);
            document.getElementById("progressBar").style.width = "100%";

            // ✅ Update Dialog to Success
            showDialog(
                "Account Created ",
                `Welcome <b>${name}</b> to <b>SapanaCyberHub</b>!<br>Your account was created successfully.`,
                false
            );

            document.getElementById("closeDialog").onclick = () => {
                window.location.href ="../index.html"
            };
        } catch (error) {
            clearInterval(progressInterval);
            showDialog("Error ❌", error.message, false);
            document.getElementById("closeDialog").onclick = () => {
                document.getElementById("customDialog").style.display = "none";
            };
        }

        /**
 * 🔹 Generate a unique @username (e.g. @sapana54324)
 * Ensures it's not already used in Firestore
 */
        async function generateUniqueUsername(baseName = "sapana") {
            let username;
            let exists = true;

            while (exists) {
                // generate random name
                username = "@" + baseName.toLowerCase() + Math.floor(10000 + Math.random() * 90000);

                // check Firestore if it exists
                const q = query(
                    collection(db, "SapanaCyberHub", "Users-SapanaCyberHub", "SapanaCyberHubMembers"),
                    where("userTag", "==", username)
                );
                const snapshot = await getDocs(q);

                // if no document found → username is free
                exists = !snapshot.empty;
            }

            return username;
        }
    });