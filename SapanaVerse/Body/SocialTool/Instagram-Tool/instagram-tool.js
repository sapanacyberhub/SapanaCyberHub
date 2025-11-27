// instagram-tool.js
// Use: <script type="module" src="instagram-tool.js"></script>

/* -------------------------------
   🔥 1) Firebase Imports
----------------------------------*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


/* -------------------------------
   🔥 2) Firebase Config & Init
----------------------------------*/
const firebaseConfig = {
  apiKey: "AIzaSyBNwCmtWja2xwxhWrU9Ejfz0ggGd796mEI",
  authDomain: "my-application-31862.firebaseapp.com",
  databaseURL: "https://my-application-31862-default-rtdb.firebaseio.com",
  projectId: "my-application-31862",
  storageBucket: "my-application-31862.appspot.com",
  messagingSenderId: "409640627398",
  appId: "1:409640627398:web:e2d1782c77e2ab8d527bc7",
};




const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* -------------------------------
   🔥 3) DOM ELEMENTS
----------------------------------*/
const loginInfo = document.getElementById("loginInfo");
const creditValueEl = document.getElementById("creditValue");
const userNameEl = document.getElementById("logIn-userName");

const serviceChips = document.querySelectorAll(".chip-option");
const quantityRange = document.getElementById("quantityRange");
const rangeVal = document.getElementById("rangeVal");
const costLabel = document.getElementById("costLabel");
const createBoostBtn = document.getElementById("createBoostBtn");
const statusMsg = document.getElementById("statusMsg");

const videoUrlInput = document.getElementById("videoUrl");
const previewBox = document.getElementById("previewBox");
const previewFrame = document.getElementById("previewFrame");
const previewText = document.getElementById("previewText");

const tasksContainer = document.getElementById("tasksContainer");
const myBoostsContainer = document.getElementById("myBoostsContainer");

const popBtn = document.getElementById("popBtn");
const popStatus = document.getElementById("popStatus");

const toastEl = document.getElementById("toast");

/* -------------------------------
   🔥 4) GLOBAL STATE
----------------------------------*/
let currentUser = null;
let currentCredits = 0;
let selectedService = "views";

const serviceCostPerUnit = {
  views: 2,
  likes: 2,
  follows: 5
};

const taskRewardPerUnit = {
  views: 2,
  likes: 2,
  follows: 4
};

let unsubTasks = null;
let unsubBoosts = null;

let popRewardGiven = false;
const popReward = 5;


/* -------------------------------
   🔥 TOAST SYSTEM
----------------------------------*/
function toast(message, type = "info") {
  if (!toastEl) {
    console.log("TOAST:", message);
    return;
  }

  const colors = {
    error: "rgba(255,64,64,0.9)",
    success: "rgba(46,204,113,0.9)",
    info: "rgba(0,0,0,0.8)"
  };

  toastEl.textContent = message;
  toastEl.style.background = colors[type];
  toastEl.classList.add("show");

  setTimeout(() => toastEl.classList.remove("show"), 2400);
}

/* -------------------------------
   🔥 COST + CREDIT UI
----------------------------------*/
function updateCreditsDisplay() {
  if (creditValueEl) creditValueEl.textContent = currentCredits;
}

function calcCost() {
  const qty = parseInt(quantityRange.value, 10);
  const per = serviceCostPerUnit[selectedService] || 0.5;
  return Math.ceil(qty * per);
}

function updateCost() {
  rangeVal.textContent = quantityRange.value;
  costLabel.textContent = calcCost();
}

quantityRange?.addEventListener("input", updateCost);

/* -------------------------------
   🔥 SERVICE CHIP SELECTOR
----------------------------------*/
serviceChips.forEach(chip => {
  chip.addEventListener("click", () => {
    serviceChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectedService = chip.dataset.id;
    updateCost();
  });
});

/* -------------------------------
   🔥 INSTAGRAM PREVIEW
----------------------------------*/
function makeEmbedUrl(url) {
  try {
    if (!url.includes("instagram.com")) return "";
    let clean = url.split("?")[0];
    if (!clean.endsWith("/")) clean += "/";
    return clean + "embed/";
  } catch {
    return "";
  }
}

videoUrlInput?.addEventListener("input", () => {
  const url = videoUrlInput.value.trim();

  if (!url.includes("instagram.com")) {
    previewBox.style.display = "none";
    return;
  }

  const embed = makeEmbedUrl(url);
  if (!embed) return;

  previewFrame.src = embed;
  previewBox.style.display = "flex";
  previewBox.classList.add("visible");
  previewText.textContent = "Preview loaded 💖";
});

/* -------------------------------
   🔥 LOAD USER DATA
----------------------------------*/
async function loadUserData(user) {
  try {
    const userRef = doc(
      db,
      "SapanaCyberHub",
      "Users-SapanaCyberHub",
      "SapanaCyberHubMembers",
      user.uid
    );

    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      currentCredits = data.credits || 0;
      if (userNameEl) userNameEl.textContent = data.fullName || "User";
    } else {
      await setDoc(userRef, {
        fullName: user.displayName || user.email || "New User",
        credits: 100,
        createdAt: serverTimestamp()
      });

      currentCredits = 100;
      if (userNameEl) userNameEl.textContent = "New User";
    }

    updateCreditsDisplay();
    if (loginInfo)
      loginInfo.textContent = `Logged in as: ${user.email || user.uid}`;

  } catch (e) {
    console.error(e);
    if (loginInfo) loginInfo.textContent = "Error loading user: " + e;
  }
}

/* -------------------------------
   🔥 CREATE A BOOST
----------------------------------*/
createBoostBtn?.addEventListener("click", async () => {

  if (!currentUser) return toast("Please log in first 💖", "error");

  const url = videoUrlInput.value.trim();
  if (!url.includes("instagram.com"))
    return toast("Invalid Instagram URL ❌", "error");

  const quantity = parseInt(quantityRange.value, 10);
  const cost = calcCost();

  if (currentCredits < cost)
    return toast("Not enough credits 💔", "error");

  statusMsg.style.color = "#ffd6ff";
  statusMsg.textContent = "Creating boost...";

  try {
    const boostData = {
      ownerId: currentUser.uid,
      instaUrl: url,
      serviceType: selectedService,
      quantityRequested: quantity,
      quantityDone: 0,
      status: "open",
      cost,
      createdAt: serverTimestamp()
    };

    // Global list
    const ref = await addDoc(
      collection(db, "SapanaCyberHub", "Users-SapanaCyberHub", "BoostList"),
      boostData
    );

    const boostId = ref.id;

    // Personal list
    const myRef = doc(
      db,
      "SapanaCyberHub",
      "Users-SapanaCyberHub",
      "SapanaCyberHubMembers",
      currentUser.uid,
      "BoostedList",
      boostId
    );

    await setDoc(myRef, { ...boostData, boostId });

    // Deduct credit
    const userRef = doc(
      db,
      "SapanaCyberHub",
      "Users-SapanaCyberHub",
      "SapanaCyberHubMembers",
      currentUser.uid
    );

    await updateDoc(userRef, { credits: increment(-cost) });

    currentCredits -= cost;
    updateCreditsDisplay();

    toast("Boost Created Successfully 💖", "success");
    statusMsg.textContent = "Your boost is live!";
    videoUrlInput.value = "";
    previewBox.style.display = "none";

  } catch (error) {
    console.error(error);
    toast("Error creating boost ❌", "error");
  }
});

/* -------------------------------
   🔥 LIVE EARN TASKS
----------------------------------*/
/* ------------------------------------------------------------
   TRUE ANTI-SKIP TIMER
--------------------------------------------------------------*/

function startTaskTimerAntiSkip(task, claimBtn) {

  const requiredStay = 5000; // 8 seconds
  let startTime = Date.now();
  let left = false;

  claimBtn.disabled = true;
  claimBtn.dataset.timerOk = "false";
  claimBtn.textContent = "Open content first";

  // Open Instagram
  const tab = window.open(task.instaUrl, "_blank");

  if (!tab) {
    toast("Popup blocked ❌ Allow popups", "error");
    return;
  }

  toast("Stay at least 8 sec 💖", "info");

  // When user leaves THIS tab
  const onBlur = () => {
    left = true;
    startTime = Date.now();
  };

  // When user RETURNS to this tab
  const onFocus = () => {
    if (!left) return; // means user never left (cheating attempt)

    const spent = Date.now() - startTime;

    if (spent >= requiredStay) {
      // Reward allowed
      claimBtn.disabled = false;
      claimBtn.dataset.timerOk = "true";
      // ⭐ New text you asked for
      claimBtn.textContent = "Claim😎";
      claimBtn.style.background = "rgba(0,255,140,0.25)";
      claimBtn.style.border = "1px solid rgba(0,255,140,0.5)";
      toast("Timer completed 💖 Claim your reward", "success");
      
    } else {
      // Too early
      claimBtn.disabled = true;
      claimBtn.dataset.timerOk = "false";
      claimBtn.textContent = "Returned too early ❌";
      toast(`Stayed only ${Math.floor(spent / 1000)}s. Need 8s.`, "error");
    }

    // remove listeners after use
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("focus", onFocus);
  };

  window.addEventListener("blur", onBlur);
  window.addEventListener("focus", onFocus);
}

/* ------------------------------------------------------------
   🌟 OPEN / CLOSE MODULE
--------------------------------------------------------------*/
const openTaskBtn = document.getElementById("openTaskBtn");
const taskModule = document.getElementById("taskModule");
const closeTaskModule = document.getElementById("closeTaskModule");
const nextRandomTask = document.getElementById("nextRandomTask");

openTaskBtn.onclick = () => {
  taskModule.classList.remove("hidden");
  loadRandomTaskIntoModule();
};

closeTaskModule.onclick = () => {
  taskModule.classList.add("hidden");
};

nextRandomTask.onclick = () => {
  loadRandomTaskIntoModule();
};

// RULES MODAL
const rulesModal = document.getElementById("rulesModal");
const rulesBtn = document.getElementById("rulesBtn");
const closeRules = document.querySelector(".close-rules");

rulesBtn.addEventListener("click", () => {
  rulesModal.classList.add("active");
});

closeRules.addEventListener("click", () => {
  rulesModal.classList.remove("active");
});

/* ------------------------------------------------------------
   🌟 RANDOM ENGINE STORAGE
--------------------------------------------------------------*/
let globalTasks = [];
let lastFiveShown = [];
const maxHistory = 5;

/* ------------------------------------------------------------
   🌟 SUBSCRIBE TASKS FROM FIREBASE
--------------------------------------------------------------*/
function subscribeTasks() {
  const q = query(
    collection(db, "SapanaCyberHub", "Users-SapanaCyberHub", "BoostList"),
    where("status", "==", "open")
  );

  unsubTasks = onSnapshot(q, snap => {
    globalTasks = [];
    snap.forEach(docSnap => {
      const d = { id: docSnap.id, ...docSnap.data() };

      if (currentUser && d.ownerId === currentUser.uid) return;
      if (d.quantityRequested - d.quantityDone <= 0) return;

      globalTasks.push(d);
    });
  });
}

/* ------------------------------------------------------------
   🌟 RANDOM SELECTOR
--------------------------------------------------------------*/
function getRandomTask() {
  if (globalTasks.length === 0) return null;

  const fresh = globalTasks.filter(t => !lastFiveShown.includes(t.id));
  const pool = fresh.length ? fresh : globalTasks;

  const pick = pool[Math.floor(Math.random() * pool.length)];

  lastFiveShown.push(pick.id);
  if (lastFiveShown.length > maxHistory) lastFiveShown.shift();

  return pick;
}

/* ------------------------------------------------------------
   🌟 LOAD RANDOM TASK INSIDE POPUP
--------------------------------------------------------------*/
function loadRandomTaskIntoModule() {
  const box = document.getElementById("randomTaskBox");
  if (!box) return;

  const task = getRandomTask();
  if (!task) {
    box.innerHTML = `<div class="empty-random">No tasks available 💖</div>`;
    return;
  }

  const remaining = task.quantityRequested - task.quantityDone;
  const reward = taskRewardPerUnit[task.serviceType];

  box.innerHTML = `
    <div class="task-preview">
      <div class="task-left">
        <div class="task-icon">${task.serviceType === "views" ? "👁" :
      task.serviceType === "likes" ? "❤️" : "⭐"
    }</div>
      </div>

      <div class="task-info">
        <h3>${task.serviceType.toUpperCase()} Task</h3>
        <p>Remaining: <b>${remaining}</b></p>
        <p>Reward: <b>+${reward} credits</b></p>
        <a href="${task.instaUrl}" target="_blank" class="task-link">${task.instaUrl}</a>
      </div>
    </div>

    <div class="task-buttons">
      <button id="openRandomContent" class="open-btn">Open</button>
      <button id="claimRandomEarn" class="claim-btn" disabled>Open First</button>
    </div>
  `;

  const openBtn = document.getElementById("openRandomContent");
  const claimBtn = document.getElementById("claimRandomEarn");

  /* 🕒 START TIMER */
  openBtn.onclick = () => {
    startTaskTimerAntiSkip(task, claimBtn);
  };


  /* ❤️ CLAIM */
  claimBtn.onclick = async () => {

  // ⛔ Still no timer completed
  if (claimBtn.dataset.timerOk !== "true") {
    claimBtn.classList.add("btn-error");
    claimBtn.textContent = "Please wait 💞";
    setTimeout(() => claimBtn.classList.remove("btn-error"), 600);
    return toast("Wait for timer 💞", "error");
  }

  // Disable to prevent double claim
  claimBtn.disabled = true;
  claimBtn.textContent = "Applying reward...";

  try {
    // Update global task (increment done)
    await updateDoc(
      doc(db, "SapanaCyberHub", "Users-SapanaCyberHub", "BoostList", task.id),
      { quantityDone: increment(1) }
    );

    // Reward user
    await updateDoc(
      doc(db, "SapanaCyberHub", "Users-SapanaCyberHub", "SapanaCyberHubMembers", currentUser.uid),
      { credits: increment(reward) }
    );

    // Update UI credits
    currentCredits += reward;
    updateCreditsDisplay();

    // Success Toast
    toast(`+${reward} credits earned 💖`, "success");

    // 💖 NEW: Make button beautiful after success
    claimBtn.textContent = "Rewarded ✓💖";
    claimBtn.style.background = "rgba(255, 80, 200, 0.25)";
    claimBtn.style.border = "1px solid rgba(255,80,200,0.6)";
    claimBtn.style.color = "#ffbff4";
    claimBtn.classList.add("rewarded");

    // 💎 Small delay before loading next task
    setTimeout(() => {
      loadRandomTaskIntoModule();
    }, 800);

  } catch (err) {
    console.error(err);
    toast("Error ✖", "error");
    claimBtn.disabled = false;
    claimBtn.textContent = "Try again ❌";
  }
};

}





/* -------------------------------
   🔥 MY BOOST LIST
----------------------------------*/
function subscribeMyBoosts() {
  if (!currentUser) return;

  const col = collection(
    db,
    "SapanaCyberHub",
    "Users-SapanaCyberHub",
    "SapanaCyberHubMembers",
    currentUser.uid,
    "BoostedList"
  );

  unsubBoosts = onSnapshot(col, snap => {
    if (snap.empty) {
      myBoostsContainer.innerHTML =
        "<div class='small-note'>No boosts yet 💖</div>";
      return;
    }

    myBoostsContainer.innerHTML = "";

    snap.forEach(docSnap => {
      const b = docSnap.data();
      const remain = b.quantityRequested - b.quantityDone;

      const card = document.createElement("div");
      card.className = "my-boost-item";

      card.innerHTML = `
        <div class="my-boost-header">
          <span>${b.serviceType.toUpperCase()} · ${b.quantityRequested}</span>
          <span class="my-boost-status ${remain <= 0 ? "status-completed" : "status-open"
        }">${remain <= 0 ? "completed" : "open"
        }</span>
        </div>

        <div class="my-boost-body">
          <div>Done: ${b.quantityDone} | Remaining: ${remain}</div>
          <div>${b.instaUrl}</div>
        </div>
      `;
      myBoostsContainer.appendChild(card);
    });
  });
}


// --------------------------------------------
// SMARTLINK REWARD + TIMER
// --------------------------------------------

const smartLink = "https://www.effectivegatecpm.com/w7taatypw?key=9d400c5aa174b33787aecef1ac2c8203";
const staySeconds = 5;
const reward = 5;
const cooldownSeconds = 30;

let lastRewardTime = 0;

function updateTimerUI() {
  const timerDiv = document.getElementById("cooldownTimer");

  const now = Date.now();
  const diff = now - lastRewardTime;

  if (diff >= cooldownSeconds * 1000) {
    timerDiv.textContent = "Ready to Earn ✨";
    return;
  }

  const remaining = Math.ceil((cooldownSeconds * 1000 - diff) / 1000);
  timerDiv.textContent = `Wait ${remaining}s ⏳`;

  setTimeout(updateTimerUI, 1000);
}

updateTimerUI(); // start timer logic

popBtn?.addEventListener("click", async () => {
  if (!currentUser)
    return toast("Login to earn 💖", "error");

  const now = Date.now();

  if (now - lastRewardTime < cooldownSeconds * 1000) {
    updateTimerUI();
    return toast("Please wait for cooldown ⏳", "info");
  }

  const offerWindow = window.open(smartLink, "_blank");

  if (!offerWindow) {
    return toast("Popup blocked ❌ Allow popups", "error");
  }

  toast("Stay 5 seconds to earn 🌟", "info");

  setTimeout(async () => {
    try {
      const userRef = doc(
        db,
        "SapanaCyberHub",
        "Users-SapanaCyberHub",
        "SapanaCyberHubMembers",
        currentUser.uid
      );

      await updateDoc(userRef, { credits: increment(reward) });

      currentCredits += reward;
      updateCreditsDisplay();

      popStatus.textContent = `+${reward} credits added 💖`;
      toast(`Earned ${reward} credits 🌟`, "success");

      lastRewardTime = Date.now();
      updateTimerUI();

    } catch (e) {
      toast("Reward error ❌", "error");
    }
  }, staySeconds * 1000);
});


/* -------------------------------
   🔥 PANEL ANIMATION OBSERVER
----------------------------------*/
function setupPanelObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        const panel = entry.target.closest(".panel");
        if (panel) panel.classList.add("panel-active");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".glass").forEach(g => observer.observe(g));
  document.querySelectorAll(".panel").forEach(p => observer.observe(p));
}

/* -------------------------------
   🔥 AUTH LISTENER
----------------------------------*/
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    currentCredits = 0;
    updateCreditsDisplay();
    window.open("https://sapanacyberhub.in/UserRegistration/signup")
    if (userNameEl) {
      userNameEl.textContent = "Guest";
      userNameEl.href = "https://sapanacyberhub.in/UserRegistration/login";
    }


  }

  currentUser = user;
  await loadUserData(user);
  subscribeTasks()
  subscribeMyBoosts();

  toast("Welcome back 💖", "success");
});

/* -------------------------------
   🔥 INIT
----------------------------------*/
updateCost();
setupPanelObserver();
