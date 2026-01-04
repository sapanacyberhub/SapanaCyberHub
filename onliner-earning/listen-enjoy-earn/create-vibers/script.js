
// imports
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



//  initialization

// firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Component
const pageTitle = document.getElementById("title");
const userName = document.getElementById("name");
const signIn = document.getElementById("btn-secondary");
const submit = document.getElementById("btn-primary")
let isSignUp = true;

const dialog = document.getElementById("authProgress");
const fill = document.getElementById("progressFill");
const title = document.getElementById("progressTitle");
const text = document.getElementById("progressText");


// --------------------Functions------------------------
// toggle betwin SignUp & SignIn
signIn.addEventListener("click", () => {
  isSignUp = !isSignUp; // toggle FIRST

  userName.classList.toggle("is-hidden", !isSignUp);

  // set pageTitle
  pageTitle.textContent = isSignUp ? "💖Create Account💖" : "🎧Welcome Back😎"
  signIn.textContent = isSignUp ? "I'm a Viber?" : "New Viber?";

});

// Create Account & Stor User Data
submit.addEventListener("click", async () => {
  const emailData = email.value.trim();
  const passworddata = password.value.trim();
  const namedata = userName.value.trim();

  if (!email.value.trim() || !password.value.trim() || (isSignUp && !userName.value.trim())) {

    document.querySelectorAll("input").forEach(input => {
      if (!input.value.trim()) {
        input.classList.add("shake", "error");

        setTimeout(() => {
          input.classList.remove("shake", "error");
        }, 500);
      }
    });

    return;
  }
  try {
    if (isSignUp) {


      showProgress(true);
      setEqProgress(20);
      const res = await createUserWithEmailAndPassword(auth, emailData, passworddata);



      const id = (res.user.uid);

      // Firebase createUser...
      setEqProgress(50);

      await setDoc(doc(db, "SapanaCyberHub", "Listen", "user", id), {
        namedata, //name
        emailData, //email
        cash: "0", //wallet cash
        listenCoin: "0", //wallet listenCoin
        userId: id, // uUid
        userDp: "", //user profile pic
        createdAt: Date.now(), // date of creating account
        source: "listen-earn"  //source where id created
      });


      // Firestore save...
      setEqProgress(100);

      setTimeout(hideProgress, 1500);
    }
    else {
      showProgress(false)
      setEqProgress(30);
      setEqProgress(70);
      await signInWithEmailAndPassword(auth, emailData, passworddata);

      setEqProgress(100);
      setTimeout(hideProgress, 1500);
      
      window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
    }
  } catch (err) {
    alert(err.message);
    setTimeout(hideProgress, 1)
  }
});




// dialog 
function showProgress(isSignUp) {
  dialog.classList.remove("hidden");
  setEqProgress(30);

  title.textContent = "Let’s Get You Vibing"
  text.textContent = "The vibes are waiting for you. Explore, play, and feel every beat."
  if (!isSignUp) {
    title.textContent = "Finding your vibe… ";
    text.textContent = "Hang tight. The vibes are loading… ";
  }
}

// set progress
function setEqProgress(percent) {
  const bars = document.querySelectorAll(".eq-progress span");
  const activeBars = Math.round((percent / 100) * bars.length);

  bars.forEach((bar, i) => {
    bar.style.opacity = i < activeBars ? "1" : "0.25";
  });
}

function hideProgress() {
  dialog.classList.add("hidden");
  setEqProgress(0);
}

