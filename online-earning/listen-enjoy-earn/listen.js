// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


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

// =======================
// DOM References
// =======================
const eventsContainer = document.querySelector(".event-grid");
const dialog = document.querySelector(".overlay_hidden");
const dialogCloseBtn = document.querySelector(".dialog-close");
const dialogTitle = document.querySelector(".event-tittle");
const dialogPrize = document.querySelector(".prize-pool");
const userNameEl = document.getElementById("user_name");

const vibingBtn = document.getElementById("vibing-btn");
const vibingOverBtn = document.getElementById("vibing-over-btn");

// player
const frame = document.querySelector(".player-frame");
const iframe = frame.querySelector("iframe");

// =======================
// Global User State
// =======================
let currentUser = null;

// =======================
// Auth Listener
// =======================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;

    const displayName =
      user.displayName ||
      user.email?.split("@")[0];

    userNameEl.textContent = displayName;
    renderVibingEvents();
  } else {
    currentUser = null;
    userNameEl.textContent = "logIn";
    renderVibingEvents();
  }
});

// onClick profile
userNameEl.addEventListener("click", () => {
  if (currentUser === null) {
    window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/create-vibers/";
  } else {
    window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/profile/";
  }
});


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
  }
];

// =======================
// Render Vibing Events
// =======================
function renderVibingEvents() {
  if (!currentUser) return;

  eventsContainer.innerHTML = "";

  
    events.forEach(event => {
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

        <div class="event-meta">
          <span>Duration: ${event.duration}</span>
          <span>Slots: ${event.slots}</span>
        </div>

        <div class="event-progress">
          <span style="width:${event.progress}"></span>
        </div>

        <div class="event-actions">
          <button class="join" data-id="${event.id}">JOIN</button>
        </div>
      `;

      eventsContainer.appendChild(card);
    });
}

// =======================
// Render Vibing Over Events
// =======================
function renderVibingOverEvents() {
  if (!currentUser) return;

  eventsContainer.innerHTML = "";

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

      eventsContainer.appendChild(card);
    });
}

// =======================
// Dialog
// =======================
function showEventDetails(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  dialogTitle.textContent = event.title;
  dialogPrize.textContent = event.prize;
  dialog.style.display = "flex";
}

// =======================
// Prize Logic
// =======================
function getWinPrize(eventId) {
  if (!currentUser) return "Login Required";

  const event = events.find(e => e.id === eventId);
  if (!event?.leaderboard) return "No Result";

  const entry = event.leaderboard.find(
    e => e.uid === currentUser.uid
  );

  if (!entry) return "Not Participated";

  return entry.win
    ? `You Won ₹${entry.amount}`
    : "Better Luck Next Time";
}

// =======================
// Events
// =======================
vibingBtn.addEventListener("click", renderVibingEvents);
vibingOverBtn.addEventListener("click", renderVibingOverEvents);

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("join")) {
    showEventDetails(e.target.dataset.id);
  }
});

dialogCloseBtn.addEventListener("click", () => {
  dialog.style.display = "none";
});

// =======================
// Player
// =======================
iframe.src = "https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1";
frame.classList.remove("not-joined");
