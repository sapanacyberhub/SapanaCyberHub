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

// global ui data
let uiData = null;

// =======================
// DOM References
// =======================
const suggestEvent = document.getElementById("suggest-event");
const eventPPage = document.getElementById("event-page");
const dialog = document.querySelector(".overlay_hidden");
const dialogCloseBtn = document.querySelector(".dialog-close");
const dialogTitle = document.querySelector(".event-tittle");
const dialogPrize = document.querySelector(".prize-pool");
const userNameEl = document.getElementById("user_name");
const userBalance = document.getElementById("user_earning");

const vibingBtn = document.getElementById("vibing-btn");
const vibingOverBtn = document.getElementById("vibing-over-btn");

// player
const frame = document.querySelector(".player-frame");
const iframe = frame ? frame.querySelector("iframe") : null;

// Hit Event DOM
const hit_grid = document.getElementById('hit-event-grid');
const hit_cards = document.querySelectorAll('.hit-card');

// Listen Event DOM
const listen_grid = document.getElementById('listen-event-grid');
// REMOVED: const listen_cards ... (We will query this dynamically)

// =======================
// Global User State
// =======================
let currentUser = null;

// =======================
// Auth Listener
// =======================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const displayName = user.displayName || user.email?.split("@")[0];
    if (userNameEl) userNameEl.textContent = displayName;

    await getUser();
    renderVibingEvents();
  } else {
    currentUser = null;
    if (userNameEl) userNameEl.textContent = "Log In";
    // Also render for guests so they can see events
    renderVibingEvents();
  }
});

async function getUser() {
  try {
    const result = await connectUser();
    // Safety check
    if (!result || !result.data) return null;

    const { success, userData } = result.data;
    if (!success) return null;

    uiData = userData;
    init();
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
// Demo Events Data
// =======================
const events = [
  {
    id: "psg-001",
    date: "12-Dec-2025",
    title: "Neon Night Vibes — Main Session",
    prize: "₹1,000",
    duration: "2 days",
    slots: "♾️",
    progress: "100%",
    status: "vibing"
  },
  {
    id: "psg-002",
    date: "15-Dec-2025",
    title: "Cyber Cricket League",
    prize: "₹5,000",
    duration: "3 days",
    slots: "♾️",
    progress: "100%",
    status: "vibing"
  },
  {
    id: "psg-003",
    date: "10-Nov-2025",
    title: "Retro Wave Blast",
    prize: "₹2,000",
    duration: "Ended",
    slots: "0",
    progress: "100%",
    status: "vibing",
    leaderboard: [{ uid: "TEST", amount: 500, win: true }]
  }
];

// =======================
// Render Vibing Events
// =======================
function renderVibingEvents() {
  // Check if grid exists before writing to it
  if (!listen_grid) return;

  listen_grid.innerHTML = "";

  const activeEvents = events.filter(e => e.status === "vibing");

  activeEvents.forEach(event => {
    const card = document.createElement("article");
    card.className = "event-card"; // This class is important for selection later

    card.innerHTML = `
        <div class="event-tag-row">
          <span class="dot"></span>
          <span class="event-date">${event.date}</span>
        </div>
        <div class="event-thumb">
          <img src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cyber-punk-night.png">
          <div class="event-prize-badge">Prize Pool: ${event.prize}</div>
        </div>
        <div class="event-title">${event.title}</div>
        <div class="event-meta">
          <span>Duration: ${event.duration}</span>
          <span>Vibers: ${event.slots}</span>
        </div>
        <div class="event-progress">
          <span style="width:${event.progress}"></span>
        </div>
        <div class="event-actions">
          <button class="join" data-id="${event.id}">JOIN</button>
        </div>
      `;

    card.addEventListener('mouseenter', () => {
      // 1. Remove 'active' from all other cards
      const allCards = listen_grid.querySelectorAll('.event-card');
      allCards.forEach(c => c.classList.remove('active'));

      // 2. Make THIS card active
      card.classList.add('active');
    });

    card.addEventListener('mouseleave', () => {
      // When mouse leaves, re-run the scroll logic to find the center card again
      const allCards = listen_grid.querySelectorAll('.event-card');
      enableScrollHighlight(listen_grid, allCards);
    });

    listen_grid.appendChild(card);
  });

  // FIX: Query the cards NOW, after they have been added to the DOM
  const dynamicCards = listen_grid.querySelectorAll('.event-card');
  enableScrollHighlight(listen_grid, dynamicCards);
}

// =======================
// Render Vibing Over Events
// =======================
function renderVibingOverEvents() {
  if (!listen_grid) return;

  listen_grid.innerHTML = "";

  events
    .filter(event => event.status === "vibing-over")
    .forEach(event => {
      const card = document.createElement("article");
      card.className = "event-card";

      card.innerHTML = `
        <div class="event-tag-row">
          <span class="dot"></span>
          <span class="event-date">${event.date}</span>
        </div>
        <div class="event-thumb">
          <img src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cyber-punk-night.png">
          <div class="event-prize-badge">Prize Pool: ${event.prize}</div>
        </div>
        <div class="event-title">${event.title}</div>
        <div class="event-actions">
          <button class="join" data-id="${event.id}">
            ${getWinPrize(event.id)}
          </button>
        </div>
      `;
      listen_grid.appendChild(card);
    });

  // Also apply highlight to the "Vibing Over" list
  const dynamicCards = listen_grid.querySelectorAll('.event-card');
  enableScrollHighlight(listen_grid, dynamicCards);
}

// =======================
// Dialog
// =======================
function showEventDetails(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event || !dialog) return;

  if (dialogTitle) dialogTitle.textContent = event.title;
  if (dialogPrize) dialogPrize.textContent = event.prize;
  dialog.style.display = "flex";
}

// =======================
// Prize Logic
// =======================
function getWinPrize(eventId) {
  if (!currentUser) return "Login Required";

  const event = events.find(e => e.id === eventId);
  if (!event || !event.leaderboard) return "No Result";

  const entry = event.leaderboard.find(e => e.uid === currentUser.uid);

  if (!entry) return "Not Participated";

  return entry.win
    ? `You Won ₹${entry.amount}`
    : "Better Luck Next Time";
}

// =======================
// Events Listeners
// =======================
if (vibingBtn) vibingBtn.addEventListener("click", renderVibingEvents);
if (vibingOverBtn) vibingOverBtn.addEventListener("click", renderVibingOverEvents);

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("join")) {
    showEventDetails(e.target.dataset.id);
  }
});

if (dialogCloseBtn) {
  dialogCloseBtn.addEventListener("click", () => {
    dialog.style.display = "none";
  });
}

// =======================
// Player
// =======================
if (iframe) iframe.src = "https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1";
if (frame) frame.classList.remove("not-joined");

// =======================
// Reusable Scroll Function
// =======================
function enableScrollHighlight(gridElement, cards) {
  if (!gridElement) return;

  const updateActive = () => {
    if (!cards || cards.length === 0) return;

    let closestCard = null;
    let minDistance = Infinity;
    const gridRect = gridElement.getBoundingClientRect();
    const gridCenter = gridRect.left + gridRect.width / 2;

    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - gridCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    cards.forEach(card => card.classList.remove('active'));
    if (closestCard) closestCard.classList.add('active');
  };

  // Important Fix: Use onscroll property instead of addEventListener
  // This overwrites previous listeners when we re-render new cards
  gridElement.onscroll = updateActive;

  // Run immediately to highlight first item
  updateActive();
}

// Enable Hit Grid (Static)
if (hit_grid && hit_cards.length > 0) {
  enableScrollHighlight(hit_grid, hit_cards);
}

// =======================
// UI Data Init
// =======================
function init() {
  if (!uiData || !userBalance) return;
  userBalance.textContent = "₹" + uiData.cash;
}

if (suggestEvent && eventPPage) {
  suggestEvent.addEventListener("click", () => {
    eventPPage.scrollIntoView({ behavior: "smooth" });
  });
}