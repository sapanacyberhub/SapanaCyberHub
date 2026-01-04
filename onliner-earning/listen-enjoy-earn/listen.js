// Dummy event data (simulating Firestore docs)
const events = [
  {
    id: "psg-001",
    date: "12-Dec-2025",
    title: "Neon Night Vibes — Main Session",
    prize: "₹1,000",
    duration: "2 days",
    slots: "♾️",
    progress: "100%",
    status: "vibing",
    joinedusers: [
      { name: "UserA", uid: "psg-U101", joinedAt: "2025-12-15T10:00:00Z", ListenedH: "10:12:18" },
      { name: "UserB", uid: "psg-U102", joinedAt: "2025-12-15T10:05:00Z", ListenedH: "09:45:32" },
      { name: "UserC", uid: "psg-U103", joinedAt: "2025-12-15T10:10:00Z", ListenedH: "08:30:10" },
      { name: "UserD", uid: "psg-U104", joinedAt: "2025-12-15T10:15:00Z", ListenedH: "07:55:44" },
      { name: "UserE", uid: "psg-U105", joinedAt: "2025-12-15T10:20:00Z", ListenedH: "06:20:25" },
      { name: "UserF", uid: "psg-U106", joinedAt: "2025-12-15T10:25:00Z", ListenedH: "05:10:12" },
      { name: "UserG", uid: "psg-U107", joinedAt: "2025-12-15T10:30:00Z", ListenedH: "04:45:00" },
      { name: "UserH", uid: "psg-U108", joinedAt: "2025-12-15T10:35:00Z", ListenedH: "03:30:18" },
      { name: "UserI", uid: "psg-U109", joinedAt: "2025-12-15T10:40:00Z", ListenedH: "02:15:40" },
      { name: "UserJ", uid: "psg-U110", joinedAt: "2025-12-15T10:45:00Z", ListenedH: "01:05:55" }
      // ... more joined users
    ],
    leaderboard: [
      // ... more participants
    ]

  },
  {
    id: "psg-002",
    date: "15-Dec-2025",
    title: "Cyber Cricket League",
    prize: "₹5,000",
    duration: "3 days",
    slots: "♾️",
    progress: "100%",
    status: "vibing-over",
    joinedusers: [
      { name: "UserA", uid: "psg-U101", joinedAt: "2025-12-15T10:00:00Z", ListenedH: "10:12:18" },
      { name: "UserB", uid: "psg-U102", joinedAt: "2025-12-15T10:05:00Z", ListenedH: "09:45:32" },
      { name: "UserC", uid: "psg-U103", joinedAt: "2025-12-15T10:10:00Z", ListenedH: "08:30:10" },
      { name: "UserD", uid: "psg-U104", joinedAt: "2025-12-15T10:15:00Z", ListenedH: "07:55:44" },
      { name: "UserE", uid: "psg-U105", joinedAt: "2025-12-15T10:20:00Z", ListenedH: "06:20:25" },
      { name: "UserF", uid: "psg-U106", joinedAt: "2025-12-15T10:25:00Z", ListenedH: "05:10:12" },
      { name: "UserG", uid: "psg-U107", joinedAt: "2025-12-15T10:30:00Z", ListenedH: "04:45:00" },
      { name: "UserH", uid: "psg-U108", joinedAt: "2025-12-15T10:35:00Z", ListenedH: "03:30:18" },
      { name: "UserI", uid: "psg-U109", joinedAt: "2025-12-15T10:40:00Z", ListenedH: "02:15:40" },
      { name: "UserJ", uid: "psg-U110", joinedAt: "2025-12-15T10:45:00Z", ListenedH: "01:05:55" }
      // ... more joined users
    ],
    leaderboard: [
      { rank: 1, name: "PlayerOne", uid: "psg-U001", win: true, ListenedH: "10:12:18", amount: 1000 },
      { rank: 2, name: "PlayerTwo", uid: "psg-U002", win: true, ListenedH: "09:45:32", amount: 700 },
      { rank: 3, name: "PlayerThree", uid: "psg-U003", win: true, ListenedH: "08:30:10", amount: 500 },
      { rank: 4, name: "PlayerFour", uid: "psg-U004", win: true, ListenedH: "07:55:44", amount: 350 },
      { rank: 5, name: "PlayerFive", uid: "psg-U005", win: true, ListenedH: "06:20:25", amount: 350 },
      { rank: 6, name: "PlayerSix", uid: "psg-U006", win: true, ListenedH: "05:10:12", amount: 200 },
      { rank: 7, name: "PlayerSeven", uid: "psg-U007", win: true, ListenedH: "04:45:00", amount: 200 },
      { rank: 8, name: "PlayerEight", uid: "psg-U008", win: true, ListenedH: "03:30:18", amount: 200 },
      { rank: 9, name: "PlayerNine", uid: "psg-U009", win: true, ListenedH: "02:15:40", amount: 200 },
      { rank: 10, name: "PlayerTen", uid: "psg-U010", win: true, ListenedH: "01:05:55", amount: 200 },
      { rank: 11, name: "PlayerEleven", uid: "psg-U011", win: true, ListenedH: "00:45:22", amount: 100 },
      { rank: 12, name: "PlayerTwelve", uid: "psg-U012", win: true, ListenedH: "00:30:11", amount: 100 },
      { rank: 13, name: "PlayerThirteen", uid: "psg-U013", win: true, ListenedH: "00:20:05", amount: 100 },
      { rank: 14, name: "PlayerFourteen", uid: "psg-U014", win: true, ListenedH: "00:15:00", amount: 100 },
      { rank: 15, name: "PlayerFifteen", uid: "psg-U015", win: true, ListenedH: "00:10:45", amount: 100 },

      { rank: 16, name: "PlayerSixteen", uid: "psg-U016", win: true, ListenedH: "00:09:30", amount: 12 },
      { rank: 17, name: "PlayerSeventeen", uid: "psg-U017", win: true, ListenedH: "00:08:20", amount: 12 },
      { rank: 18, name: "PlayerEighteen", uid: "psg-U018", win: true, ListenedH: "00:07:15", amount: 12 },
      { rank: 19, name: "PlayerNineteen", uid: "psg-U019", win: true, ListenedH: "00:06:10", amount: 12 },
      { rank: 20, name: "PlayerTwenty", uid: "psg-U020", win: true, ListenedH: "00:05:05", amount: 12 },
      { rank: 21, name: "PlayerTwentyOne", uid: "psg-U021", win: true, ListenedH: "00:04:00", amount: 12 },
      { rank: 22, name: "PlayerTwentyTwo", uid: "psg-U022", win: true, ListenedH: "00:03:50", amount: 12 },
      { rank: 23, name: "PlayerTwentyThree", uid: "psg-U023", win: true, ListenedH: "00:02:40", amount: 12 },
      { rank: 24, name: "PlayerTwentyFour", uid: "psg-U024", win: true, ListenedH: "00:01:30", amount: 12 },
      { rank: 25, name: "PlayerTwentyFive", uid: "psg-U025", win: true, ListenedH: "00:00:20", amount: 12 },
      { rank: 26, name: "PlayerTwentySix", uid: "psg-U026", win: true, ListenedH: "00:00:10", amount: 12 },
      { rank: 27, name: "PlayerTwentySeven", uid: "psg-U027", win: true, ListenedH: "00:00:05", amount: 12 },
      // ... more participants


    ]
  },
  {
    id: "psg-003",
    date: "20-Dec-2025",
    title: "Tech Quiz Showdown",
    prize: "₹2,500",
    duration: "1 day",
    slots: "♾️",
    progress: "100%",
    status: "vibing",
     joinedusers: [
      { name: "UserA", uid: "psg-U101", joinedAt: "2025-12-15T10:00:00Z", ListenedH: "10:12:18"},
      { name: "UserB", uid: "psg-U102", joinedAt: "2025-12-15T10:05:00Z", ListenedH: "09:45:32"},
      { name: "UserC", uid: "psg-U103", joinedAt: "2025-12-15T10:10:00Z", ListenedH: "08:30:10"},
      { name: "UserD", uid: "psg-U104", joinedAt: "2025-12-15T10:15:00Z", ListenedH: "07:55:44"},
      { name: "UserE", uid: "psg-U105", joinedAt: "2025-12-15T10:20:00Z", ListenedH: "06:20:25"},
      { name: "UserF", uid: "psg-U106", joinedAt: "2025-12-15T10:25:00Z", ListenedH: "05:10:12"},
      { name: "UserG", uid: "psg-U107", joinedAt: "2025-12-15T10:30:00Z", ListenedH: "04:45:00"},
      { name: "UserH", uid: "psg-U108", joinedAt: "2025-12-15T10:35:00Z", ListenedH: "03:30:18"},
      { name: "UserI", uid: "psg-U109", joinedAt: "2025-12-15T10:40:00Z", ListenedH: "02:15:40"},
      { name: "UserJ", uid: "psg-U110", joinedAt: "2025-12-15T10:45:00Z", ListenedH: "01:05:55"}
      // ... more joined users
    ],
    leaderboard: [
      // ... more participants
    ]
  }
];

// DOM references

// listen event elements
const eventsContainer = document.querySelector(".event-grid");
const dialog = document.querySelector(".overlay_hidden");
const dialogCloseBtn = document.querySelector(".dialog-close");
const dialogTitle = document.querySelector(".event-tittle");
const dialogPrize = document.querySelector(".prize-pool");

const vibingBtn = document.getElementById("vibing-btn");
const vibingOverBtn = document.getElementById("vibing-over-btn");

// creature waiting event cards




// Render  events dynamically: vibing events only, which are not joined by current user
function renderVibingEvents() {
  events.filter(event => event.status === "vibing" && !event.joinedusers.some(entry => entry.uid === "psg-U001")).forEach(event => {
    const card = document.createElement("article");
    card.classList.add("event-card");
    card.innerHTML = `
      <div class="event-tag-row">
        <span class="dot"></span>
        <span class="event-date">${event.date}</span>
      </div>
      <div class="event-thumb">
        <img src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cyber-punk-night.png" alt="${event.title}">
        <div class="event-prize-badge">Prize Pool: ${event.prize}</div>
      </div>
      <div class="event-title">${event.title}</div>
      <div class="event-meta">
        <span>Duration: ${event.duration}</span>
        <span>Slots: ${event.slots}</span>
      </div>
      <div class="event-progress">
        <span style="width:${event.progress};"></span>
      </div>
      <div class="event-actions">
        <button class="join" type="button" data-id="${event.id}">JOIN</button>
      </div>
    `;
    eventsContainer.appendChild(card);
  });
}

// Render events dynamically vibing-over event cards
function renderVibingOverEvents() {
  events.filter(event => event.status === "vibing-over").forEach(event => {
    const card = document.createElement("article");
    card.classList.add("event-card");
    card.innerHTML = `
      <div class="event-tag-row">
        <span class="dot"></span>
        <span class="event-date">${event.date}</span>
      </div>
      <div class="event-thumb">
        <img src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cyber-punk-night.png" alt="${event.title}">
        <div class="event-prize-badge">Prize Pool: ${event.prize}</div>
      </div>
      <div class="event-title">${event.title}</div>
      <div class="event-meta">
        <span>Duration: ${event.duration}</span>
        <span>Slots: ${event.slots}</span>
      </div>
      <div class="event-progress">
        <span style="width:${event.progress};"></span>
      </div>
      <div class="event-actions">
        <button class="join" type="button" data-id="${event.id}">"${getWinPrize(event.id)}"</button>
      </div>
    `;
    eventsContainer.appendChild(card);
  });
}

// Show dialog with event data
function showEventDetails(eventId) {
  const event = events.find(e => e.id === eventId);
  if (event) {
    dialogTitle.textContent = event.title || "Event Details";
    dialogPrize.textContent = event.prize || "N/A";
    dialog.style.display = "flex";
  }
}

// show event leaderboard details
function getWinPrize(eventId) {
  // find user in leaderboard and return prize
  const event = events.find(e => e.id === eventId);
  if (event && event.leaderboard) {
    const userId = "psg-U020"; // Simulated current user ID
    const userEntry = event.leaderboard.find(entry => entry.uid === userId);
    if (userEntry) {
      return userEntry.win ? `You Won ₹${userEntry.amount}` : "Better Luck Next Time";
    }
  }
}

// Event listeners
// filter btn clicks for vibing and vibing-over
vibingBtn.addEventListener("click", () => {
  eventsContainer.innerHTML = "";
  renderVibingEvents();
});

vibingOverBtn.addEventListener("click", () => {
  eventsContainer.innerHTML = "";
  renderVibingOverEvents();
});

// creature waiting event card filters btn


document.addEventListener("click", (e) => {
  if (e.target.classList.contains("join") || e.target.classList.contains("ghost")) {
    const eventId = e.target.getAttribute("data-id");
    showEventDetails(eventId);
  }
});

dialogCloseBtn.addEventListener("click", () => {
  dialog.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === dialog) {
    dialog.style.display = "none";
  }
});

// Init
renderVibingEvents();




// --------------------------------------animatio controll--------------------------------------


