// instagram-tool.js
// Use: <script type="module" src="instagram-tool.js"></script>

// ========== Firebase Imports ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
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

// ========== Firebase Config ==========
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

// ========== DOM REFS ==========
const loginInfo = document.getElementById("loginInfo");          // optional (may not exist)
const creditValueEl = document.getElementById("creditValue");
const userName = document.getElementById("logIn-userName");


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

const beMember = document.getElementById(".logIn-userName");

const popBtn = document.getElementById("popBtn");
const popStatus = document.getElementById("popStatus");

// if you add toast div later: <div id="toast" class="toast"></div>
const toastEl = document.getElementById("toast");

// Panels / glasses for animation
const glasses = [
  document.getElementById("glass1"),
  document.getElementById("glass2"),
  document.getElementById("glass3")
];

// ========== STATE ==========
let currentUser = null;
let currentCredits = 0;
let selectedService = "views";

const serviceCostPerUnit = {
  views: 0.5,
  likes: 0.5,
  follows: 1.2
};

const taskRewardPerUnit = {
  views: 1,
  likes: 2,
  follows: 3
};

let unsubTasks = null;
let unsubBoosts = null;
let popRewardGiven = false;
const popReward = 5;

// ========== Helper: Toast ==========
function toast(message, type = "info") {
  if (!toastEl) {
    console.log("TOAST:", message);
    return;
  }
  toastEl.textContent = message;
  toastEl.classList.add("show");
  if (type === "error") toastEl.style.background = "rgba(255,64,64,0.9)";
  else if (type === "success") toastEl.style.background = "rgba(46,204,113,0.9)";
  else toastEl.style.background = "rgba(0,0,0,0.8)";

  setTimeout(() => toastEl.classList.remove("show"), 2500);
}

// ========== Helpers: Credits / Cost ==========
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

// ========== Service Chip Events ==========
serviceChips.forEach(chip => {
  chip.addEventListener("click", () => {
    serviceChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectedService = chip.dataset.id;
    updateCost();
  });
});

if (quantityRange) {
  quantityRange.addEventListener("input", updateCost);
}

// ========== Instagram Preview (embed) ==========
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

if (videoUrlInput) {
  videoUrlInput.addEventListener("input", () => {
    const url = videoUrlInput.value.trim();
    if (!url || url.length < 10) {
      previewBox.style.display = "none";
      previewBox.classList.remove("visible");
      return;
    }

    const embedUrl = makeEmbedUrl(url);
    if (!embedUrl) {
      previewBox.style.display = "none";
      return;
    }

    previewFrame.src = embedUrl;
    previewBox.style.display = "flex";
    previewBox.classList.add("visible");
    previewText.textContent = "Preview loaded (Instagram embed might depend on browser).";
  });
}

// ========== Load User Info ==========
async function loadUserData(user) {
  try {
    const userRef = doc(db, "SapanaCyberHub", "Users-SapanaCyberHub", "SapanaCyberHubMembers", user.uid);
    const snap = await getDoc(userRef);


    if (snap.exists()) {
      const data = snap.data();
      currentCredits = data.boostCredit || 0;
      userName = data.fullName || "unknown";
    } else {
      await setDoc(userRef, {
        fullName: user.displayName || user.email || "User",
        credits: 100,
        createdAt: serverTimestamp()
      });
      currentCredits = 100;
    }
    updateCreditsDisplay();
    if (loginInfo) loginInfo.textContent = `Logged in as: ${user.email || user.uid}`;
  } catch (e) {
    console.error(e);
    if (loginInfo) loginInfo.textContent = "Error loading user data.";
  }
}

// ========== Create Boost ==========
if (createBoostBtn) {
  createBoostBtn.addEventListener("click", async () => {
    if (!currentUser) {
      statusMsg.style.color = "#ff9a9a";
      statusMsg.textContent = "Please log in to create a boost request.";
      toast("Please log in to create a boost.", "error");
      return;
    }

    const url = videoUrlInput.value.trim();
    if (!url || !url.includes("instagram.com")) {
      statusMsg.style.color = "#ff9a9a";
      statusMsg.textContent = "Please enter a valid Instagram reel/post URL.";
      toast("Invalid Instagram URL.", "error");
      return;
    }

    const quantity = parseInt(quantityRange.value, 10);
    const cost = calcCost();

    if (currentCredits < cost) {
      statusMsg.style.color = "#ff9a9a";
      statusMsg.textContent = "Not enough credits. Earn more by completing tasks or supporting us.";
      toast("Not enough credits.", "error");
      return;
    }

    statusMsg.style.color = "#ffd6ff";
    statusMsg.textContent = "Creating boost request...";

    try {
      const boostData = {
        ownerId: currentUser.uid,
        instaUrl: url,
        serviceType: selectedService,
        quantityRequested: quantity,
        quantityDone: 0,
        status: "open",
        cost: cost,
        createdAt: serverTimestamp()
      };

      // 1) Global boost list
      const globalRef = await addDoc(
        collection(db, "SapanaCyberHub", "Users-SapanaCyberHub", "boostList"),
        boostData
      );
      const boostId = globalRef.id;

      // 2) User personal BoostedList
      const userBoostRef = doc(
        db,
        "SapanaCyberHub",
        "Users-SapanaCyberHub",
        "SapanaCyberHubMembers",
        currentUser.uid,
        "BoostedList",
        boostId
      );
      await setDoc(userBoostRef, { ...boostData, boostId });

      // 3) Deduct credits from user
      const userRef = doc(db, "SapanaCyberHub", "Users-SapanaCyberHub", "SapanaCyberHubMembers", currentUser.uid);
      await updateDoc(userRef, {
        credits: increment(-cost)
      });
      currentCredits -= cost;
      updateCreditsDisplay();

      statusMsg.style.color = "#b4ffce";
      statusMsg.textContent = "Boost request created successfully! Other users can now see it in Earn Tasks.";
      toast("Boost created 💖", "success");
      videoUrlInput.value = "";
      previewBox.style.display = "none";
    } catch (e) {
      console.error(e);
      statusMsg.style.color = "#ff9a9a";
      statusMsg.textContent = "Error creating boost. Please try again.";
      toast("Error creating boost.", "error");
    }
  });
}

// ========== Render Tasks ==========
function renderTasks(tasks) {
  if (!tasksContainer) return;

  // filter out own tasks
  const filtered = currentUser
    ? tasks.filter(t => t.ownerId !== currentUser.uid)
    : tasks;

  if (!filtered.length) {
    tasksContainer.innerHTML = "<div class='small-note'>No active tasks from others right now. Check back soon 💖</div>";
    return;
  }

  tasksContainer.innerHTML = "";

  filtered.forEach(task => {
    const remaining = (task.quantityRequested || 0) - (task.quantityDone || 0);
    if (remaining <= 0) return;

    const rewardPer = taskRewardPerUnit[task.serviceType] || 1;
    const reward = rewardPer;

    const div = document.createElement("div");
    div.className = "earn-item";
    div.innerHTML = `
      <div class="earn-icon">
        ${task.serviceType === "views" ? "👁" : task.serviceType === "likes" ? "❤️" : "⭐"}
      </div>
      <div class="earn-content">
        <div class="earn-title">${task.serviceType.toUpperCase()} on a Reel/Post</div>
        <div class="earn-desc">${remaining} actions still needed. Open, support honestly, then claim.</div>
        <div class="earn-credit">+${reward} credits per completion</div>
      </div>
      <div class="earn-actions">
        <button class="earn-open">Open content</button>
        <button class="earn-btn">I completed 1</button>
      </div>
    `;

    const openBtn = div.querySelector(".earn-open");
    const claimBtn = div.querySelector(".earn-btn");

    openBtn.addEventListener("click", () => {
      window.open(task.instaUrl, "_blank");
      startTaskTimer(task.id, claimBtn);
    });

    claimBtn.addEventListener("click", async () => {
      if (!currentUser) {
        alert("Please log in to earn credits.");
        return;
      }

      if (claimBtn.dataset.timerOk !== "true") {
        alert("You returned too quickly or didn't complete the timer. Please support properly, then claim again.");
        return;
      }

      claimBtn.disabled = true;

      try {
        // Update global boostList doc
        const boostRef = doc(
          db,
          "SapanaCyberHub",
          "Users-SapanaCyberHub",
          "boostList",
          task.id
        );
        await updateDoc(boostRef, {
          quantityDone: increment(1)
        });

        // Reward user
        const userRef = doc(
          db,
          "SapanaCyberHub",
          "Users-SapanaCyberHub",
          "SapanaCyberHubMembers",
          currentUser.uid
        );
        await updateDoc(userRef, {
          credits: increment(reward)
        });

        currentCredits += reward;
        updateCreditsDisplay();

        claimBtn.classList.add("completed");
        claimBtn.textContent = "Done ✓";
        toast(`+${reward} credits earned 🌟`, "success");
      } catch (e) {
        console.error(e);
        claimBtn.disabled = false;
        alert("Error claiming task. Try again.");
      }
    });

    tasksContainer.appendChild(div);
  });
}

// ========== Live Tasks Listener ==========
function subscribeTasks() {
  if (!tasksContainer) return;

  if (unsubTasks) unsubTasks();

  const q = query(
    collection(db, "SapanaCyberHub", "Users-SapanaCyberHub", "boostList"),
    where("status", "==", "open")
  );

  unsubTasks = onSnapshot(q, snap => {
    const tasks = [];
    snap.forEach(docSnap => {
      tasks.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderTasks(tasks);
  }, err => {
    console.error(err);
    tasksContainer.innerHTML = "<div class='small-note'>Error loading tasks.</div>";
  });
}

// --- Timer-based task completion (anti-skip check) ---
function startTaskTimer(taskId, claimBtn) {
  // simple 15s timer so user cannot instant-claim
  let required = 15;
  claimBtn.dataset.timerOk = "false";
  claimBtn.disabled = true;
  claimBtn.style.background = "rgba(255,255,255,0.15)";
  claimBtn.textContent = `Wait ${required}s...`;

  const interval = setInterval(() => {
    required--;
    if (required > 0) {
      claimBtn.textContent = `Wait ${required}s...`;
    } else {
      clearInterval(interval);
      claimBtn.dataset.timerOk = "true";
      claimBtn.disabled = false;
      claimBtn.style.background = "rgba(0,255,120,0.3)";
      claimBtn.textContent = "I completed (verified ✓)";
    }
  }, 1000);
}

// ========== Live My Boosts Listener ==========
function subscribeMyBoosts() {
  if (!myBoostsContainer) return;
  if (!currentUser) {
    myBoostsContainer.innerHTML = "<div class='small-note'>Log in to see your boost requests.</div>";
    return;
  }

  if (unsubBoosts) unsubBoosts();

  const colRef = collection(
    db,
    "SapanaCyberHub",
    "Users-SapanaCyberHub",
    "SapanaCyberHubMembers",
    currentUser.uid,
    "BoostedList"
  );

  unsubBoosts = onSnapshot(colRef, snap => {
    if (snap.empty) {
      myBoostsContainer.innerHTML = "<div class='small-note'>You haven't created any boost requests yet.</div>";
      return;
    }

    myBoostsContainer.innerHTML = "";
    snap.forEach(docSnap => {
      const b = docSnap.data();
      const remaining = (b.quantityRequested || 0) - (b.quantityDone || 0);
      const statusText = b.status || (remaining > 0 ? "open" : "completed");
      const statusClass = statusText === "completed" ? "status-completed" : "status-open";

      const div = document.createElement("div");
      div.className = "my-boost-item";
      div.innerHTML = `
        <div class="my-boost-header">
          <span>${b.serviceType?.toUpperCase() || "SERVICE"} · ${b.quantityRequested} requested</span>
          <span class="my-boost-status ${statusClass}">${statusText}</span>
        </div>
        <div class="my-boost-body">
          <div style="font-size:11px; opacity:.85; margin-top:4px;">
            Done: ${b.quantityDone || 0} · Remaining: ${remaining < 0 ? 0 : remaining}
          </div>
          <div style="font-size:11px; opacity:.8; margin-top:4px; overflow-wrap:anywhere;">
            ${b.instaUrl}
          </div>
        </div>
      `;
      myBoostsContainer.appendChild(div);
    });
  }, err => {
    console.error(err);
    myBoostsContainer.innerHTML = "<div class='small-note'>Error loading your boosts.</div>";
  });
}

// ========== PopUnder Sponsor Integration ==========
if (popBtn) {
  popBtn.addEventListener("click", async () => {
    // Inject popunder script
    (function (s) {
      s.dataset.zone = '10228494';
      s.src = 'https://al5sm.com/tag.min.js';
    })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));

    // Prevent multiple rewards
    if (popRewardGiven) {
      popStatus.textContent = "Already rewarded 💖 Thank you!";
      popStatus.style.color = "#b4ffce";
      toast("Already rewarded for this sponsor 💖", "info");
      return;
    }

    popRewardGiven = true;

    // Reward user
    if (currentUser) {
      const userRef = doc(
        db,
        "SapanaCyberHub",
        "Users-SapanaCyberHub",
        "SapanaCyberHubMembers",
        currentUser.uid
      );

      try {
        await updateDoc(userRef, {
          credits: increment(popReward)
        });
        currentCredits += popReward;
        updateCreditsDisplay();

        popStatus.textContent = `🌟 +${popReward} credits added! Thank you for supporting us 💖`;
        popStatus.style.color = "#b4ffce";
        toast(`+${popReward} credits for support 🌟`, "success");
      } catch (e) {
        console.error(e);
        popStatus.textContent = "Error applying reward.";
        popStatus.style.color = "#ff9a9a";
        toast("Error applying sponsor reward.", "error");
      }
    } else {
      popStatus.textContent = "Login to earn credits 💖";
      popStatus.style.color = "#ff9a9a";
      toast("Please log in to earn credits.", "error");
    }
  });
}

// ========== Glass / Panel Animation ==========
function setupPanelObserver() {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {

        // animate glass panels
        entry.target.classList.add("visible");

        // activate panel bot animation
        const panel = entry.target.closest(".panel");
        if (panel) panel.classList.add("panel-active");
      }
    });
  }, { threshold: 0.10 }); // <-- FIXED THRESHOLD

  // observe glass containers
  document.querySelectorAll(".glass").forEach(g => observer.observe(g));

  // observe entire panels too (important for panel 4)
  document.querySelectorAll(".panel").forEach(p => observer.observe(p));
}


// ========== Auth Listener ==========
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    currentUser = null;
    currentCredits = 0;

    beMember.textContent = 'unknown';
    beMember.href = "Body/UserRegistration/login.html";
    beMember.title = `Hi there! Click to be our CommunityMember.`;

    updateCreditsDisplay();
    if (loginInfo) loginInfo.textContent = "Not logged in. Please log in on your main site.";

    if (unsubBoosts) {
      unsubBoosts();
      unsubBoosts = null;
    }

    // Still show tasks list, but without filtering out own tasks
    subscribeTasks();
    if (myBoostsContainer)
      myBoostsContainer.innerHTML = "<div class='small-note'>Log in to see your boosts.</div>";
    return;
  }

  currentUser = user;
  await loadUserData(user);
  subscribeTasks();
  subscribeMyBoosts();
});



// ========== INIT ==========
updateCost();
setupPanelObserver();
