// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const connectUser = httpsCallable(functions, "loadUserData");
const getEvents = httpsCallable(functions, "getEvents");
const dailyCheckIn = httpsCallable(functions, "dailyCheckIn");

// global ui data
let uiData = null;

// =======================
// DOM References
// =======================
const eventPPage = document.getElementById("event-page");

const dialog = document.getElementById("over-hidden");
const dialogCloseBtn = document.getElementById("dialog-close");
const dialogTitle = document.getElementById("event-tittle");
const dialogPrize = document.getElementById("event-prize");
const explain = document.getElementById("prizePoolExplain")
const closeBtn = document.getElementById("dialog-close");


const userNameEl = document.getElementById("user_name");
const userBalance = document.getElementById("user_earning");

const vibingBtn = document.getElementById("vibing-btn");
const vibingOverBtn = document.getElementById("vibing-over-btn");





const fireContainer = document.getElementById("fire");
const checkInBtn = document.getElementById("check-in-btn");


// globle holder
const listenEvents = [];
const listenEventsJoin = [];
const hitEvents = [];
const hitEventsJoin = [];
const lakhpatiLoops = [];
const lakhpatiLoopsJoin = [];
const cashHaandis = [];
const cashHaandisJoin = [];


let adOpenTime = 0;
let pendingJoinEventId = null;

//track which link just have opened to avoid multiple open on multiple clicks
let adIndexL = 0;

// player
const frame = document.querySelector(".player-frame");
const eventId = document.getElementById("vibing-event-id"); // Updated to match HTML
const suggestEvent = document.getElementById("suggest-event");
const c_s_p = document.getElementById("custom-yt-playlist"); // The container
const c_s_input = document.getElementById("c-s"); // The actual input

const checkInOverlay = document.getElementById("d-v-c-s-overlay");
const rewardContainer = document.getElementById("r-b");


// Hit Event DOM
const hit_grid = document.getElementById("hit-event-grid");

// Listen Event DOM
const listen_grid = document.getElementById("listen-event-grid");
// lakhpatiLoop
const premiumLegue = document.getElementById("lakhpati-loop");

const linksL = [
  "https://omg10.com/4/10260662",
  "https://omg10.com/4/10260660",
  "https://www.effectivegatecpm.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861"
];

const linksH = [
  "https://omg10.com/4/10619467",
  "https://omg10.com/4/10216281",
  "https://www.effectivegatecpm.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861"
];

const linksDCI = [
  "https://omg10.com/4/10619475"
]



// =======================
// Global User State
// =======================
let currentUser = null;
// 1. Single source of truth for current animation
let currentLottieInstance = null;

showSkeletons(listen_grid);
showSkeletons(hit_grid);
showSkeletons(premiumLegue);
// =======================
// Auth Listener
// =======================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const displayName = user.displayName || user.email?.split("@")[0];
    if (userNameEl) userNameEl.textContent = displayName;

    await getUser();

    checkusercheckin();
    renderVibingListenEvents();
    renderVibingHitEvents();
    renderLakhpatiLoops();
  } else {
    currentUser = null;
    if (userNameEl) userNameEl.textContent = "Log In";

    await getEventList();
    renderVibingListenEvents();
    renderVibingHitEvents();
    renderLakhpatiLoops();
  }
});

// checkuser check-in status

function checkusercheckin() {

 const alreadyCheckedIn = verifyDCI(uiData?.lastCheckIn);

if (!alreadyCheckedIn) {
  // Show daily check-in popup
  showDailyCheckInRewardDialog(false);
} else {
  // Skip dialog, continue normal flow
  console.log("User already checked in today, skipping popup");
}

}

function verifyDCI(lastCheckIn) {
  // If never checked in before -> show dialog
  if (!lastCheckIn?._seconds) return false;

  const last = new Date(lastCheckIn._seconds * 1000);
  const now = new Date();

  // Compare only date (ignore time)
  const lastY = last.getFullYear();
  const lastM = last.getMonth();
  const lastD = last.getDate();

  const nowY = now.getFullYear();
  const nowM = now.getMonth();
  const nowD = now.getDate();

  // If same day -> already checked in -> SKIP dialog
  const alreadyCheckedInToday =
    lastY === nowY && lastM === nowM && lastD === nowD;

  return alreadyCheckedInToday;
}

async function getUser() {
  try {
    const result = await connectUser();
    if (!result || !result.data) return null;

    const { success, userData } = result.data;
    if (!success) return null;

    uiData = userData;
    init();
    await getEventList(); // FIXED: await
    return uiData;
  } catch (err) {
    console.error("Failed to load user data:", err);
    return null;
  }
}

// onClick profile
if (userNameEl) {
  userNameEl.addEventListener("click", () => {
    if (currentUser === null) {
      window.location.href = "/online-earning/listen-enjoy-earn/create-vibers/index.html";
    } else {
      window.location.href = "/online-earning/listen-enjoy-earn/profile/index.html";
    }
  });
}

// =======================
// Fetch Events
// =======================
async function getEventList() {
  try {
    // prevent duplicates
    listenEvents.length = 0;
    hitEvents.length = 0;
    lakhpatiLoops.length = 0;
    cashHaandis.length = 0;

    listenEventsJoin.length = 0;
    hitEventsJoin.length = 0;
    lakhpatiLoopsJoin.length = 0;
    cashHaandisJoin.length = 0;

    const [
      res1, resJoin1,
      res2, resJoin2,
      res3, resJoin3,
      res4, resJoin4
    ] = await Promise.all([
      getEvents({ i: 1, needJoined: false }),
      getEvents({ i: 1, needJoined: true }),

      getEvents({ i: 2, needJoined: false }),
      getEvents({ i: 2, needJoined: true }),

      getEvents({ i: 3, needJoined: false }),
      getEvents({ i: 3, needJoined: true }),

      getEvents({ i: 4, needJoined: false }),
      getEvents({ i: 4, needJoined: true })
    ]);

    if (res1.data?.events) listenEvents.push(...res1.data.events);
    if (resJoin1.data?.events) listenEventsJoin.push(...resJoin1.data.events);

    if (res2.data?.events) hitEvents.push(...res2.data.events);
    if (resJoin2.data?.events) hitEventsJoin.push(...resJoin2.data.events);

    if (res3.data?.events) lakhpatiLoops.push(...res3.data.events);
    if (resJoin3.data?.events) lakhpatiLoopsJoin.push(...resJoin3.data.events);

    if (res4.data?.events) cashHaandis.push(...res4.data.events);
    if (resJoin4.data?.events) cashHaandisJoin.push(...resJoin4.data.events);

    console.log("Listen Events:", listenEvents.length);
    console.log("Joined Listen Events:", listenEventsJoin.length);

    console.log("Hit Events:", hitEvents.length);
    console.log("Joined Hit Events:", hitEventsJoin.length);

  } catch (error) {
    console.error("Failed to fetch events:", error);
  }
}

// =======================
// Prize Pool
// =======================
function calculatePrizePool(totalViber) {
  const BASE_PRIZE = 100;
  const REVENUE_PER_JOIN = 0.30;
  const PAYOUT_RATE = 0.4;
  const MAX_PRIZE = 50000;
  return Math.min(Math.floor(BASE_PRIZE + totalViber * REVENUE_PER_JOIN * PAYOUT_RATE), MAX_PRIZE);
}

// =======================
// Countdown
// =======================
function startCountdown(el, endTime) {
  if (!el || !endTime?._seconds) {
    if (el) el.textContent = "Live";
    return;
  }

  const endMs = endTime._seconds * 1000;

  const tick = () => {
    const diff = Math.max(0, endMs - Date.now());
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    el.textContent = diff > 0 ? `${h}:${m}:${s}` : "Ended";
  };

  tick();
  setInterval(tick, 1000);
}

// =======================
// Render Vibing Listen Events
// =======================
function renderVibingListenEvents() {
  if (!listen_grid) return;
  listen_grid.innerHTML = "";

  const vibing_events = listenEvents.filter(e =>
    String(e.eventStatus || "").trim().toLowerCase() === "vibing"
  );

  vibing_events.forEach(event => {
    const card = document.createElement("article");

    const fee = Number(event.eventEntryFee || 0);
    const entryFee = fee > 0 ? `₹${fee}` : "Free";

    const vibers = Number(event.totalViber || 0);
    const dynamicPrizePool = calculatePrizePool(vibers);

    card.className = "event-card";
    card.innerHTML = `
      <div class="event-tag-row">
        <span class="vibe-dot"></span>
        <span class="event-date">${event.eventDate ? new Date(event.eventDate._seconds * 1000).toDateString() : ""}</span>
      </div>

      <div class="event-thumb">
        <img class="event-thumb-img" src="${event.eventDpUrl || ''}">
        <div class="event-badge">
          <div class="event-prize-badge">
            Prize Pool: <span class="dynamic-prize">₹${dynamicPrizePool}</span>
          </div>
          <div class="event-fee-badge">Entry Fee: ${entryFee}</div>
        </div>
      </div>

      <div class="event-title">${event.eventTitle || "Untitled Event"}</div>

      <div class="event-meta">
        <span class="event-duration">--:--:--</span>
        <span>Vibers: ${vibers}</span>
      </div>

      <div class="event-progress">
        <span style="width:100%"></span>
      </div>

      <div class="event-actions">
        <button class="join" data-eventid="${event.eventId}">JOIN</button>
      </div>
    `;

    startCountdown(card.querySelector(".event-duration"), event.endTime);

    card.addEventListener("mouseenter", () => {
      const allCards = listen_grid.querySelectorAll(".event-card");
      allCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
    });
    listen_grid.appendChild(card);
  });

  const dynamicCards = listen_grid.querySelectorAll(".event-card");
  enableScrollHighlight(listen_grid, dynamicCards, listenEvents);
}

// =======================
// Render Vibing Hit Events
// =======================
function renderVibingHitEvents() {
  if (!hit_grid) return;
  hit_grid.innerHTML = "";

  const vibing_events = hitEvents.filter(e =>
    String(e.eventStatus || "").trim().toLowerCase() === "vibing"
  );

  vibing_events.forEach(event => {
    const card = document.createElement("div");
    card.className = "hit-card";

    const vibers = Number(event.totalViber || 0);
    const dynamicPrizePool = calculatePrizePool(vibers);

    const fee = Number(event.eventEntryFee || 0);
    const entryFee = fee > 0 ? `₹${fee}` : "Free";

    card.innerHTML = `
      <div class="hit-event-content">
        <div class="hit-top">
          <div class="event-top">
            <img class="content-holder" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/joining%20fee.png">
            <p class="fee-data">${entryFee}</p>
          </div>
          <div class="event-top">
            <img class="content-holder" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/total-hit.png">
            <p class="total-hit-data">${vibers}</p>
          </div>
          <div class="event-top">
            <img class="content-holder" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/event-end-timmer.png">
            <p class="event-end-timmer">00:00:00</p>
          </div>
        </div>

        <div class="prison-hexagon">
          <img class="event-img" src="${event.eventDpUrl || ''}">
          <img class="lock" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/A%20fiery%20iron%20chain%20f.png">
        </div>

        <div class="hit-lock">
          <div class="prize-pool">
            <p class="dynamic-prize">₹${dynamicPrizePool}</p>
            <img class="prize-pool-holder" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/galaxy%20prize%20holder.png">
          </div>
          <img class="hit-btn" data-eventid="${event.eventId}" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/hit-btn.png">
        </div>
      </div>
    `;

    hit_grid.appendChild(card);
    startCountdown(card.querySelector(".event-end-timmer"), event.endTime);

    card.addEventListener("mouseenter", () => {
      const currentActive = hit_grid.querySelector(".hit-card.active");
      if (currentActive) currentActive.classList.remove("active");
      card.classList.add("active");
    });
  });

  const dynamicCards = hit_grid.querySelectorAll(".hit-card");
  enableScrollHighlight(hit_grid, dynamicCards, hitEvents);
}

// render lakhpati loops and cash haandi can be implemented similarly to the above functions
function renderLakhpatiLoops() {
  // Similar to renderVibingListenEvents but for lakhpatiLoops
  if (!premiumLegue) return;
  premiumLegue.innerHTML = "";

  const premiumEvents = lakhpatiLoops.filter(e =>
    String(e.eventStatus || "").trim().toLowerCase() === "vibing"
  );

  if (premiumEvents.length === 0) {
    premiumLegue.innerHTML = `<p style="text-align:center; width:100%; padding:20px; color:#888;">No active Lakhpati Loops at the moment. Please check back later!</p>`;
    return;
  }
  premiumEvents.forEach(event => {
    const card = document.createElement("div");
    card.className = "lakhpati-card";

    const vibers = Number(event.totalViber || 0);
    const PrizePool = event.lakhpatiLoopAmountIndex * 100000; // Assuming each lakhpatiLoopAmountIndex is worth 100,000 rupees

    const fee = Number(event.eventEntryFee || 0);
    const entryFee = fee > 0 ? `₹${fee}` : "Free";

    card.innerHTML = `
      <div class="lakhpati-content">
                <div class="lp-top">
                  <img
                    src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/header-%20elements%20of%20lakhpatis.png"
                    alt="lakhpati loop banner">

                </div>
                <div class="lp-center">
                  <div class="lp-c-top">
                    <span class="lakh" id="l1">1 Lakhs</span>
                    <span class="lakh" id="l2">2 Lakhs</span>
                    <span class="lakh" id="l3">3 Lakhs</span>
                    <span class="lakh" id="l4">4 Lakhs</span>
                    <span class="lakh" id="l5">5 Lakhs</span>
                  </div>
                  <div class="l-p-p">
                    <div class="l-p-m">
                      <img
                        src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/motivator-elements%20of%20lakhpatis1.png"
                        alt="">
                      <span class="t-p-p" id="t-p-p">₹${PrizePool}</span>
                      <div class="T-J" id="t-j">
                        0
                      </div>
                    </div>
                    <div class="p-b">
                      <img
                        src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/prize-box%20of%20lakhpatis.png"
                        alt="">

                    </div>
                  </div>
                  <div class="l-p-bottom">
                    <div class="left">
                      <img data-eventid="${event.id}" class="j-m-l"
                        src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/join-btnelements%20of%20lakhpatis.png"
                        alt="">
                      <span class="E-f-l" data-eventid="${event.id}"> Entry Fee : ${entryFee}</span>

                    </div>
                    <div class="right">
                      <strong class="t-h" id="t-h">00:00:00</strong>
                    </div>
                  </div>
                </div>
              </div>
    `;

    // make span lakh active based on event.lakhpatiLoopAmountIndex
    const lakhIndex = event.lakhpatiLoopAmountIndex || 0;
    for (let i = 1; i <= lakhIndex; i++) {
      const lakhSpan = card.querySelector(`#l${i}`);
      if (lakhSpan) lakhSpan.classList.add("active");
    }
    premiumLegue.appendChild(card);

    startCountdown(card.querySelector(".t-h"), event.endTime);

    card.addEventListener("mouseenter", () => {
      const currentActive = premiumLegue.querySelector(".lakhpati-card.active");
      if (currentActive) currentActive.classList.remove("active");
      card.classList.add("active");
    });
  });

  const dynamicCards = premiumLegue.querySelectorAll(".lakhpati-card");
  enableScrollHighlight(premiumLegue, dynamicCards, lakhpatiLoops);

}

premiumLegue.addEventListener("click", (e) => {
  const joinBtn = e.target.closest(".j-m-l");
  const feeCont = e.target.closest(".E-f-l");

  // Only proceed if one of our targets was clicked
  if (joinBtn || feeCont) {
    e.stopPropagation();

    // Safely get the ID from whichever element exists (using lowercase dataset names)
    // We use String() to ensure we compare strings to strings
    const eventId = String(joinBtn?.dataset.eventid || feeCont?.dataset.eventid || "");

    const eventData = lakhpatiLoops.find(ev => String(ev.eventId) === eventId);

    if (eventData) {
      // 1. Check for insufficient balance
      const userCash = uiData?.cash || 0;
      if (eventData.eventEntryFee > 0 && (!currentUser || userCash < eventData.eventEntryFee)) {
        showToast("Insufficient balance. Please top up to join this event.");
        return;
      }

      // 2. Show details if balance is okay
      showEventDetails(eventData, true);

    } else {
      console.error("Event Data not found for ID:", eventId);
    }
  }
});


function trigger(eventId, eventType) {
  // check for event type is join like listen or hit or dc(dailyCheckIn) 
    let links = [];

    if (eventType === "listen") {
      links = linksL;
    } else if (eventType === "hit") {
      links = linksH;
    } else if (eventType === "dc") {
      links = linksDCI;
    }

  if (!links || links.length === 0) {
    showToast("No ad links available right now 😕");
    return;
  }

  const url = links[adIndexL % links.length];
  adIndexL++;

  window.open(url, "_blank");
}



// Join button handler
listen_grid.addEventListener("click", (e) => {
  const joinBtn = e.target.closest(".join");
  if (!joinBtn) return;

  e.stopPropagation();

  const eventId = joinBtn.dataset.eventid;
  const eventData = listenEvents.find(ev => ev.eventId === eventId);
  if (!eventData) return;

  // 1️⃣ Paid event → balance check
  if (eventData.eventEntryFee > 0 && (!currentUser || uiData.cash < eventData.eventEntryFee)) {
    showToast("Insufficient balance. Please top up to join this event.", "error");
    return;
  }

  // 2️⃣ Paid event → no ad → show details
  if (eventData.eventEntryFee > 0) {
    showEventDetails(eventData);
    return;
  }

  // 3️⃣ Free event → ad gate
  pendingJoinEventId = eventId;
  adOpenTime = Date.now();

  trigger(eventId, "listen");
  showToast("Please stay on the ad for 5 seconds to join this event ⏳", "info");
});


// Detect return from ad tab and validate time
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;

  if (!pendingJoinEventId || !adOpenTime) return;

  const stayedMs = Date.now() - adOpenTime;

  if (stayedMs >= 10000) {
    const eventData = listenEvents.find(e => e.eventId === pendingJoinEventId);
    if (eventData) {
      showEventDetails(eventData);
      showToast("Ad watched successfully! You can join now 🎉", "success");
    }
  } else {
    showToast("Please watch the ad for at least 10 seconds to join this event.", "error");
  }

  // Reset
  pendingJoinEventId = null;
  adOpenTime = 0;
});


hit_grid.addEventListener("click", (e) => {
  const hitBtn = e.target.closest(".hit-btn")
  if (hitBtn) {
    e.stopPropagation();
    const eventId = hitBtn.dataset.eventid;
    const eventData = hitEvents.find(e => e.eventId === eventId);
    if (eventData) {
      if (eventData.eventEntryFee > 0 && (!currentUser || uiData.cash < eventData.eventEntryFee)) {
        // show dynamic toast for insufficient balance
        showToast("Insufficient balance. Please top up to join this event.", "error");
        return;
      }

      // 2️⃣ Paid event → no ad → show details
      if (eventData.eventEntryFee > 0) {
        showEventDetails(eventData);
        return;
      }

      // 3️⃣ Free event → ad gate
      pendingJoinEventId = eventId;
      adOpenTime = Date.now();

      trigger(eventId, "hit");
      showToast("Please stay on the ad for 5 seconds to join this event ⏳", "info");
    }
  }
});

closeBtn.addEventListener("click", () => {
  dialog.style.display = "none";
});

// Lightweight Toast Implementation
function showToast(message, type = "info") {
  // Create toast element if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  // Close button
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  });

  return toast;
}

function showEventDetails(ED, isLakhpati) {
  // Ensure we have a valid index or pool amount, defaulting to 0 to avoid NaN
  const poolIndex = ED.lakhpatiLoopAmountIndex ?? 0;
  const rawPrize = ED.eventPrizePool ?? (poolIndex * 100000);

  // Format the number to Indian Currency style (e.g., 1,00,000)
  const formattedPrize = rawPrize.toLocaleString('en-IN');

  // Set Dialog Title with a default fallback
  dialogTitle.textContent = !ED.eventTitle ? "Best of Luck, Viber!" : ED.eventTitle.length > 30 ? ED.eventTitle.slice(0, 27) + "..." : ED.eventTitle;

  // Set Prize Text
  dialogPrize.textContent = isLakhpati ? `₹ ${formattedPrize}` : `Dynamic Prize Pool`;

  // Set Explanation Text (Fixed typo 'weak' -> 'week')
  explain.innerHTML = isLakhpati
    ? `Lakhpati Prize Pool Increase!</b><br>Today: ₹1 Lakh ⮕ Next 5 Days: ₹5 Lakh ⮕ Weekly Goal: <b>₹18 Lakh!`
    : `The more who join, the bigger the pot! Every new listener scales the rewards, creating more winning spots for everyone.`;

  // Show Dialog
  dialog.style.display = "flex";
}


// if (vibingOverBtn) vibingOverBtn.addEventListener("click", renderVibingOverEvents);

if (dialogCloseBtn) {
  dialogCloseBtn.addEventListener("click", () => {
    dialog.style.display = "none";
  });
}


// =======================
// Scroll Highlight (kept + fixed selector)
// =======================
function enableScrollHighlight(gridElement, cards, events) {
  if (!gridElement) return;

  const updateActive = () => {
    if (!cards || cards.length === 0) return;

    let closestCard = null;
    let minDistance = Infinity;
    const gridRect = gridElement.getBoundingClientRect();
    const gridCenter = gridRect.left + gridRect.width / 2;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(center - gridCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    cards.forEach(card => {
      if (card !== closestCard) {
        card.classList.remove("active");
        card.dataset.animated = "false";
      }
    });

    if (closestCard && !closestCard.classList.contains("active")) {
      closestCard.classList.add("active");

      const prizeSpan = closestCard.querySelector(".dynamic-prize");
      const eventId =
        closestCard.querySelector(".hit-btn")?.dataset.eventid ||
        closestCard.querySelector(".join")?.dataset.eventid;

      const eventData = events.find(e => e.eventId === eventId);

      if (prizeSpan && eventData && closestCard.dataset.animated !== "true") {
        animatePrizeValue(prizeSpan, 0, calculatePrizePool(Number(eventData.totalViber || 0)), 2000);
        closestCard.dataset.animated = "true";
      }
    }
  };

  gridElement.onscroll = updateActive;
  updateActive();
}

// =======================
// UI Data Init
// =======================
function init() {
  if (!uiData || !userBalance) return;
  userBalance.textContent = "₹" + uiData.cash;
  updatePlayerVisibility();
}

// =======================
// Animate Prize
// =======================
function animatePrizeValue(element, start, end, duration) {
  let startTimestamp = null;
  const finalValue = typeof end === "string" ? parseInt(end.replace(/\D/g, "")) : end;

  const easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const step = (ts) => {
    if (!startTimestamp) startTimestamp = ts;
    const p = Math.min((ts - startTimestamp) / duration, 1);
    const eased = easeOutBack(p);
    const value = Math.floor(eased * (finalValue - start) + start);
    element.textContent = "₹" + Math.max(0, value).toLocaleString("en-IN");
    if (p < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}
// loader animation
function showSkeletons(container, count = 3) {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skel = document.createElement("div");
    skel.className = "skeleton-card";
    container.appendChild(skel);
  }
}

function updatePlayerVisibility() {
  if (!frame) return;

  // Check if any events are joined
  if (listenEventsJoin.length === 0) {
    frame.classList.add("not-joined");
    frame.classList.remove("joined");
    eventId.textContent = "Join an event to stream here!";
    c_s_p.classList.remove("enable");
    suggestEvent.classList.add("enable");
  } else {
    frame.classList.add("joined");
    frame.classList.remove("not-joined");
    suggestEvent.classList.remove("enable");
    eventId.style.display = "none"; // Hide the event ID when joined
    c_s_p.classList.add("enable");

  }
}

// on click suggest event  scroll to suggest event page
if (suggestEvent && eventPPage) {
  suggestEvent.addEventListener("click", () => {
    // console.log("Suggest Event Clicked");
    eventPPage.scrollIntoView({
      behavior: "smooth"
    });
  });
}

function playLottie(path, isLooping = true) {
  // Destroy previous animation if exists
  if (currentLottieInstance) {
    currentLottieInstance.destroy();
    currentLottieInstance = null;
    fireContainer.innerHTML = ""; // cleanup SVG leftovers
  }

  // Create new animation
  currentLottieInstance = lottie.loadAnimation({
    container: fireContainer,
    renderer: "svg",
    loop: isLooping,
    autoplay: true,
    path: path
  });

  return currentLottieInstance;
}

checkInBtn.addEventListener("click", () => {
  // Show container and button effect
  fireContainer.classList.add("active");
  checkInBtn.classList.add("active-check");

  // A. Start with FIRE animation
  playLottie("/assets/anim/fire.json");

  const startStreak = uiData ? (uiData.streakDays || 0) : 0;
  const nextStreak = startStreak + 1;
  // B. Run streak counter
  updateStreakUI(nextStreak, startStreak);


  // C. After 1 second, swap to GIFT

  // D. Cleanup after gift animation
  setTimeout(() => {
    fireContainer.classList.remove("active");
    checkInBtn.classList.remove("active-check");

    if (currentLottieInstance) {
      currentLottieInstance.destroy();
      currentLottieInstance = null;
      fireContainer.innerHTML = "";

      if (rewardContainer) rewardContainer.classList.add("active");
    }
  }, 2000); // Total duration for both animations
});

function showDailyCheckInRewardDialog(isCheckIn = true) {
  // show check-in dialog with fire animation if isCheckIn is true, otherwise show reward dialog
  if (isCheckIn) return;
  checkInOverlay.classList.add("active");

  // 1. Show container
  fireContainer.classList.add("active");

  // 2. Destroy previous animation (Fire or anything)
  if (currentLottieInstance) {
    currentLottieInstance.destroy();
    currentLottieInstance = null;
    fireContainer.innerHTML = "";
  }

  // 3. Load Gift animation
  currentLottieInstance = playLottie("/assets/anim/Gift.json", true);

  // 4. Ensure it plays from start
  currentLottieInstance.goToAndPlay(0, true);


}


// update ui for streak count with animation
async function updateStreakUI(newStreakValue, startValue) {
  const countEl = document.getElementById("count");
  const duration = 1000;
  let startTimestamp = null;

  const step = async (timestamp) => { // Added async here
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    const currentNumber = Math.floor(progress * (newStreakValue - startValue) + startValue);
    countEl.innerHTML = currentNumber;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      // --- THE FINALE ---
      countEl.classList.add("trigger-bounce");

      try {
        // before next trigger and direct link for daily checkin
        trigger("", "dc");
        // 1. Await the server response so 'result' actually has data
        const result = await dailyCheckIn();

        if (result && result.data) {
          console.log("Check-in successful:", result);

          // 2. Wait for the bounce animation to breathe, then show reward
          setTimeout(() => {
            countEl.classList.remove("trigger-bounce");
            // Pass the actual data from the server result
            showRewardBox(result.data.isLCReward, result.data.rewardAmount);
          }, 800);

        } else {
          throw new Error("No data returned");
        }
      } catch (error) {
        console.error("Check-in failed:", error.message);
        // Optional: show an error message to the user
      }
    }
  };

  window.requestAnimationFrame(step);
}
// show reward box with animation
function showRewardBox(isLCReward = true, rewardAmount = 0) {
  if (rewardContainer) {
    const rewardText = document.getElementById("a");
    const iconBox = document.getElementById("r-i");

    // Dynamic Text
    rewardText.textContent = isLCReward ? `${rewardAmount} LC` : `₹${rewardAmount}`;

    // Dynamic Icons - using the specific ones you provided
    iconBox.src = isLCReward
      ? "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/SapanaCyberHub-Logo-X-Listen-og.png"
      : "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cash-ic.png";

    // Show the box
    rewardContainer.classList.add("active");

    // Auto-close everything
    setTimeout(() => {
      rewardContainer.classList.remove("active");
      if (typeof checkInOverlay !== 'undefined') {
        checkInOverlay.classList.remove("active");
      }

      // Clear lottie if necessary
      if (activeLottie) activeLottie.destroy();
    }, 4000); // 4 seconds feels more "rewarding" and readable
  }
}



