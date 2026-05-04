// ══════════════════════════════════════════════════════════════════════════════
//  SapanaCyberHub – Vibe & Earn (Performance‑optimised)
//  Confidential – do not share
// ══════════════════════════════════════════════════════════════════════════════

// 🔧 Firebase imports remain the same
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// Lazy‑loaded modules
let MusicMarathon = null;
let lottie = null;

// ══════════════════════════════════════════════════════════════════════════════
//  FIREBASE INIT
// ══════════════════════════════════════════════════════════════════════════════
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
const storage = getStorage(app);
const functions = getFunctions(app);

const marathon = {
  instance: null,
  async mount() {
    if (!MusicMarathon) ({ MusicMarathon } = await import("./sapanaVibe.js"));
    if (!this.instance) this.instance = new MusicMarathon({ containerId: "marathon-root", functions });
    this.instance.mount();
  },
  vibeNow(id) { this.instance?.vibeNow?.(id); }
};

// ══════════════════════════════════════════════════════════════════════════════
//  CALLABLES
// ══════════════════════════════════════════════════════════════════════════════
const dailyCheckIn = httpsCallable(functions, "dailyCheckIn");
const markDailyActive = httpsCallable(functions, "markDailyActive");
const connectUser = httpsCallable(functions, "loadUserData");
const getEvents = httpsCallable(functions, "getEvents");
const joinvibeEvents = httpsCallable(functions, "vibeInEvent");
const vibeInSponsor = httpsCallable(functions, "vibeInSponsor");
const getSponsorTasks = httpsCallable(functions, "getSponsorAppTasks");
const getSponsorTaskLeaderBoard = httpsCallable(functions, "getLeaderBoard");
const getVibeLeaderBoard = httpsCallable(functions, "getVibeLeaderBoard");
const claimSponsorReward = httpsCallable(functions, "claimMyReward");
const claimVibeReward = httpsCallable(functions, "claimMyVibe");
const trackAnonymousVisit = httpsCallable(functions, "trackAnonymousVisit");

// ══════════════════════════════════════════════════════════════════════════════
//  DOM REFERENCES
// ══════════════════════════════════════════════════════════════════════════════
const eventPPage = document.getElementById("event-page");
const dialog = document.getElementById("over-hidden");
const dialogCloseBtn = document.getElementById("dialog-close");
const a_t_d_overlay = document.getElementById("app-task-overlay");
const userNameEl = document.getElementById("user_name");
const userBalance = document.getElementById("user_earning");
const vibingBtns = document.querySelectorAll(".vibing-btn");
const vibingOverBtns = document.querySelectorAll(".vibing-over-btn");
const fireContainer = document.getElementById("fire");
const checkInBtn = document.getElementById("check-in-btn");
const frame = document.querySelector(".player-frame");
const eventIdEl = document.getElementById("vibing-event-id");
const suggestEvent = document.getElementById("suggest-event");
const c_s_p = document.getElementById("custom-yt-playlist");
const checkInOverlay = document.getElementById("d-v-c-s-overlay");
const rewardContainer = document.getElementById("r-b");
const hit_grid = document.getElementById("hit-event-grid");
const listen_grid = document.getElementById("listen-event-grid");
const premiumLegue = document.getElementById("lakhpati-loop");
const appTaskList = document.getElementById("task-list");

// ══════════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
const EVENT_TYPE_INDEX = { listen: 1, hit: 2, lakhpati: 3, cash: 4 };
const AD_WAIT_MS = { listen: 10000, hit: 10000, lakhpati: 10000, dc: 10000 };
const DP_FALLBACK = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/me%20jaan.png";
const COIN_IMG = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/Listen-coin-og.png";
const PRIZE_POOL_IMG = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/dynamic-prize-pool.png";

const linksL = [
  "https://omg10.com/4/10749383",
  "https://omg10.com/4/10260662",
  "https://omg10.com/4/10260660",
  "https://www.effectivegatecpm.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861",
];
const linksH = [
  "https://omg10.com/4/10749383",
  "https://omg10.com/4/10619467",
  "https://omg10.com/4/10216281",
  "https://www.effectivegatecpm.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861",
];
const linksLP = ["https://omg10.com/4/10749383", "https://omg10.com/4/10260662"];
const linksDCI = ["https://omg10.com/4/10749383", "https://omg10.com/4/10619475"];

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL STATE
// ══════════════════════════════════════════════════════════════════════════════
let uiData = null;
let currentUser = null;
let currentLottieInstance = null;
let vibingEventId = null;

const listenEvents = [];
const listenEventsJoin = [];
const hitEvents = [];
const hitEventsJoin = [];
const lakhpatiLoops = [];
const lakhpatiLoopsJoin = [];
const cashHaandis = [];
const cashHaandisJoin = [];
const sponsorAppTasks = [];
const sponsorAppTasksJoin = [];

let adOpenTime = 0;
let adLocked = false;
let pendingJoinEventId = null;
let pendingJoinTypeIndex = null;
let pendingSponsorApkPath = null;
let pendingSponsorId = null;
let sponsorAdOpenTime = 0;
let adIndexL = 0;
let isJoinedList = false;
let joinedType = null;
let sponsorProcessing = false;
let visibilityHandler = null;
let dailyActiveMarked = false;

// ══════════════════════════════════════════════════════════════════════════════
//  CACHE & DEBOUNCE
// ══════════════════════════════════════════════════════════════════════════════
const eventCache = { data: null, expiry: 0, ttl: 3 * 60 * 1000 };
let renderPending = false;

function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  queueMicrotask(() => {
    updatePlayerVisibility();
    renderVibingListenEvents(isJoinedList && joinedType === "L");
    renderVibingHitEvents(isJoinedList && joinedType === "H");
    renderLakhpatiLoops(isJoinedList && joinedType === "PL");
    renderSponsorAppTasks(isJoinedList && joinedType === "SAT");
    renderPending = false;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH GUARD (unchanged, just the same)
// ══════════════════════════════════════════════════════════════════════════════
(function injectAuthGuardStyles() {
  if (document.getElementById("auth-guard-styles")) return;
  const s = document.createElement("style");
  s.id = "auth-guard-styles";
  s.textContent = `
    #auth-guard-scrim {
      position: fixed; inset: 0; z-index: 99990;
      background: rgba(0,0,0,0);
      backdrop-filter: blur(0px);
      transition: background .35s ease, backdrop-filter .35s ease;
      pointer-events: none;
    }
    #auth-guard-scrim.ag-open {
      background: rgba(0,0,0,.58);
      backdrop-filter: blur(7px);
      pointer-events: auto;
    }
    #auth-guard-sheet {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 99991;
      background: linear-gradient(180deg, #13131f 0%, #0d0d18 100%);
      border-top: 1px solid rgba(167,139,250,.18);
      border-radius: 24px 24px 0 0;
      padding: 0 0 env(safe-area-inset-bottom, 20px);
      transform: translateY(110%);
      transition: transform .44s cubic-bezier(.32, 1.28, .5, 1);
      max-width: 540px;
      margin: 0 auto;
      box-shadow: 0 -12px 60px rgba(124,58,237,.18);
    }
    #auth-guard-sheet.ag-open { transform: translateY(0); }

    .ag-pill {
      width: 40px; height: 4px;
      border-radius: 99px;
      background: rgba(255,255,255,.13);
      margin: 14px auto 0;
    }
    .ag-hero {
      text-align: center;
      padding: 26px 24px 0;
    }
    .ag-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(167,139,250,.13);
      border: 1px solid rgba(167,139,250,.3);
      border-radius: 99px;
      padding: 5px 14px;
      font-size: 11px; font-weight: 700;
      color: #a78bfa;
      letter-spacing: .6px; text-transform: uppercase;
      margin-bottom: 14px;
    }
    .ag-emoji { font-size: 54px; line-height: 1; margin-bottom: 10px; }
    .ag-title {
      font-size: 23px; font-weight: 800; color: #f0f0f5;
      margin-bottom: 7px; letter-spacing: -.4px;
    }
    .ag-sub {
      font-size: 13px; color: rgba(240,240,245,.4);
      line-height: 1.55; max-width: 290px; margin: 0 auto;
    }
    .ag-perks {
      display: flex; gap: 8px;
      padding: 20px 20px 0;
      justify-content: center;
    }
    .ag-perk {
      flex: 1; max-width: 110px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 14px;
      padding: 13px 8px; text-align: center;
      transition: border-color .2s, background .2s;
    }
    .ag-perk:hover {
      background: rgba(167,139,250,.08);
      border-color: rgba(167,139,250,.25);
    }
    .ag-perk-icon { font-size: 22px; margin-bottom: 5px; }
    .ag-perk-label {
      font-size: 10px; font-weight: 700;
      color: rgba(240,240,245,.4);
      text-transform: uppercase; letter-spacing: .4px; line-height: 1.3;
    }
    .ag-actions {
      padding: 20px 20px 8px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .ag-btn-primary {
      width: 100%; padding: 15px; border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
      color: #fff;
      font-size: 15px; font-weight: 800;
      cursor: pointer; letter-spacing: .2px;
      transition: transform .18s, box-shadow .18s;
      box-shadow: 0 4px 24px rgba(124,58,237,.42);
      font-family: inherit;
    }
    .ag-btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 36px rgba(124,58,237,.55); }
    .ag-btn-primary:active { transform: scale(.97); }
    .ag-btn-ghost {
      width: 100%; padding: 13px;
      border: 1.5px solid rgba(255,255,255,.1);
      border-radius: 14px;
      background: transparent;
      color: rgba(240,240,245,.4);
      font-size: 14px; font-weight: 600;
      cursor: pointer;
      transition: border-color .2s, color .2s;
      font-family: inherit;
    }
    .ag-btn-ghost:hover { border-color: rgba(255,255,255,.22); color: rgba(240,240,245,.7); }
    .ag-note {
      text-align: center; font-size: 11px;
      color: rgba(240,240,245,.2);
      padding: 6px 20px 22px;
    }
    @keyframes ag-shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-5px); }
      40%,80%  { transform: translateX(5px); }
    }
    .ag-shake { animation: ag-shake .42s ease; }
  `;
  document.head.appendChild(s);
})();

function buildAuthGuardDOM() {
  if (document.getElementById("auth-guard-sheet")) return;
  const scrim = document.createElement("div");
  scrim.id = "auth-guard-scrim";
  document.body.appendChild(scrim);
  const sheet = document.createElement("div");
  sheet.id = "auth-guard-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", "Sign in to join events");
  sheet.innerHTML = `
    <div class="ag-pill"></div>
    <div class="ag-hero">
      <div class="ag-badge">✨ Exclusive Access</div>
      <div class="ag-emoji">🎧</div>
      <h2 class="ag-title">Become a Viber!</h2>
      <p class="ag-sub">Sign in to join live events, earn real rewards, and vibe with thousands of people.</p>
    </div>
    <div class="ag-perks">
      <div class="ag-perk">
        <div class="ag-perk-icon">💰</div>
        <div class="ag-perk-label">Earn Real Cash</div>
      </div>
      <div class="ag-perk">
        <div class="ag-perk-icon">🏆</div>
        <div class="ag-perk-label">Win Prizes</div>
      </div>
      <div class="ag-perk">
        <div class="ag-perk-icon">🔥</div>
        <div class="ag-perk-label">Daily Streaks</div>
      </div>
    </div>
    <div class="ag-actions">
      <button class="ag-btn-primary" id="ag-signin-btn">🚀 Be a Viber — Sign In Free</button>
      <button class="ag-btn-ghost"   id="ag-close-btn">Maybe Later</button>
    </div>
    <p class="ag-note">Free to join · No Join Fee needed · Instant rewards</p>
  `;
  document.body.appendChild(sheet);
  scrim.addEventListener("click", closeAuthGuard);
  sheet.querySelector("#ag-close-btn").addEventListener("click", closeAuthGuard);
  sheet.querySelector("#ag-signin-btn").addEventListener("click", () => {
    closeAuthGuard();
    setTimeout(() => window.location.href = "/online-earning/listen-enjoy-earn/create-vibers/index.html", 300);
  });
  let dragY = 0;
  sheet.addEventListener("touchstart", e => dragY = e.touches[0].clientY, { passive: true });
  sheet.addEventListener("touchmove", e => {
    const dy = e.touches[0].clientY - dragY;
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", e => {
    const dy = e.changedTouches[0].clientY - dragY;
    sheet.style.transform = "";
    if (dy > 80) closeAuthGuard();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAuthGuard(); });
}

function openAuthGuard() {
  buildAuthGuardDOM();
  requestAnimationFrame(() => {
    document.getElementById("auth-guard-scrim")?.classList.add("ag-open");
    document.getElementById("auth-guard-sheet")?.classList.add("ag-open");
  });
}
function closeAuthGuard() {
  document.getElementById("auth-guard-scrim")?.classList.remove("ag-open");
  document.getElementById("auth-guard-sheet")?.classList.remove("ag-open");
}

function requireAuth() { if (currentUser && !currentUser.isAnonymous) return false; openAuthGuard(); return true; }

// ══════════════════════════════════════════════════════════════════════════════
//  NETWORK BANNER
// ══════════════════════════════════════════════════════════════════════════════
function setupNetworkBanner() {
  const banner = document.createElement("div");
  banner.id = "network-banner";
  banner.style.cssText = `display:none;position:fixed;top:0;left:0;width:100%;z-index:9999;background:#e53935;color:#fff;text-align:center;padding:8px;font-size:13px;font-weight:600;letter-spacing:.5px;`;
  banner.textContent = "⚡ You're offline — some features may not work";
  document.body.prepend(banner);
  window.addEventListener("offline", () => banner.style.display = "block");
  window.addEventListener("online", () => { banner.style.display = "none"; showToast("Back online! 🎉", "success"); });
}

// ══════════════════════════════════════════════════════════════════════════════
//  VISITOR TRACKING
// ══════════════════════════════════════════════════════════════════════════════
async function trackVisitor() {
  if (currentUser) await trackAuthDailyActive();
  else await trackAnonymousVisitFn();
}
async function trackAuthDailyActive() {
  if (dailyActiveMarked || !currentUser) return;
  dailyActiveMarked = true;
  try { await markDailyActive(); } catch { dailyActiveMarked = false; }
}
async function trackAnonymousVisitFn() {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem("guest_id", guestId);
  }
  if (!sessionStorage.getItem("visit_tracked")) {
    try {
      await trackAnonymousVisit({ guestId, userAgent: navigator.userAgent });
      sessionStorage.setItem("visit_tracked", "true");
    } catch {}
  }
}

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    if (userNameEl) userNameEl.textContent = user.displayName || user.email?.split("@")[0];
    trackVisitor();
    await getUser();
  } else {
    currentUser = null;
    dailyActiveMarked = false;
    trackVisitor();
    if (userNameEl) userNameEl.textContent = "Log In";
    await Promise.all([getEventList(), getSponsorTasksList()]);
  }
  scheduleRender();
});

userNameEl?.addEventListener("click", () => {
  window.location.href = currentUser
    ? "/online-earning/listen-enjoy-earn/profile/index.html"
    : "/online-earning/listen-enjoy-earn/create-vibers/index.html";
});

// ══════════════════════════════════════════════════════════════════════════════
//  SKELETON MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function showSkeletons(container, count = 3) {
  if (!container) return;
  // HTML should already have skeleton cards with class "skeleton-card"
  container.innerHTML = '';
  for (let i = 0; i < count; i++) container.innerHTML += '<div class="skeleton-card"></div>';
}

// ══════════════════════════════════════════════════════════════════════════════
//  EVENT CACHE
// ══════════════════════════════════════════════════════════════════════════════
function getCachedEvents() {
  if (eventCache.data && Date.now() < eventCache.expiry) return eventCache.data;
  return null;
}

function setCachedEvents(data) {
  eventCache.data = data;
  eventCache.expiry = Date.now() + eventCache.ttl;
}

// ══════════════════════════════════════════════════════════════════════════════
//  FETCH EVENTS (with cache)
// ══════════════════════════════════════════════════════════════════════════════
async function getEventList() {
  const cached = getCachedEvents();
  if (cached) {
    [
      listenEvents,
      hitEvents,
      lakhpatiLoops,
      cashHaandis,
      listenEventsJoin,
      hitEventsJoin,
      lakhpatiLoopsJoin,
      cashHaandisJoin,
    ] = [
      ...cached.listen,
      ...cached.hit,
      ...cached.lakhpati,
      ...cached.cash,
      ...cached.joinedListen,
      ...cached.joinedHit,
      ...cached.joinedLakhpati,
      ...cached.joinedCash,
    ];
    scheduleRender();
    return;
  }

  try {
    listenEvents.length = listenEventsJoin.length = 0;
    hitEvents.length = hitEventsJoin.length = 0;
    lakhpatiLoops.length = lakhpatiLoopsJoin.length = 0;
    cashHaandis.length = cashHaandisJoin.length = 0;

    const calls = [
      getEvents({ i: 1, needJoined: false }),
      getEvents({ i: 2, needJoined: false }),
      getEvents({ i: 3, needJoined: false }),
      getEvents({ i: 4, needJoined: false }),
    ];
    if (currentUser) {
      calls.push(
        getEvents({ i: 1, needJoined: true }),
        getEvents({ i: 2, needJoined: true }),
        getEvents({ i: 3, needJoined: true }),
        getEvents({ i: 4, needJoined: true })
      );
    }

    const results = await Promise.all(calls);
    if (results[0].data?.events) listenEvents.push(...results[0].data.events);
    if (results[1].data?.events) hitEvents.push(...results[1].data.events);
    if (results[2].data?.events) lakhpatiLoops.push(...results[2].data.events);
    if (results[3].data?.events) cashHaandis.push(...results[3].data.events);

    if (currentUser && results.length > 4) {
      if (results[4].data?.events) listenEventsJoin.push(...results[4].data.events);
      if (results[5].data?.events) hitEventsJoin.push(...results[5].data.events);
      if (results[6].data?.events) lakhpatiLoopsJoin.push(...results[6].data.events);
      if (results[7].data?.events) cashHaandisJoin.push(...results[7].data.events);
    }

    setCachedEvents({
      listen: [...listenEvents],
      hit: [...hitEvents],
      lakhpati: [...lakhpatiLoops],
      cash: [...cashHaandis],
      joinedListen: [...listenEventsJoin],
      joinedHit: [...hitEventsJoin],
      joinedLakhpati: [...lakhpatiLoopsJoin],
      joinedCash: [...cashHaandisJoin],
    });

    scheduleRender();
  } catch (e) {
    console.error("Event fetch failed:", e);
    showToast("Could not load events. Try refreshing.", "error");
  }
}

async function getSponsorTasksList() {
  try {
    sponsorAppTasks.length = sponsorAppTasksJoin.length = 0;
    const calls = [getSponsorTasks({ needJoined: false })];
    if (currentUser) calls.push(getSponsorTasks({ needJoined: true }));
    const [res, resJoin] = await Promise.all(calls);
    if (res.data?.success && res.data.sponsors) sponsorAppTasks.push(...res.data.sponsors);
    if (resJoin?.data?.success && resJoin.data.sponsors) sponsorAppTasksJoin.push(...resJoin.data.sponsors);
    scheduleRender();
  } catch (e) {
    console.error("Sponsor fetch failed:", e);
    showToast("Could not load sponsor tasks.", "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PURE HELPERS (unchanged)
// ══════════════════════════════════════════════════════════════════════════════
const isEnded = endTime => !!(endTime?._seconds && Date.now() > endTime._seconds * 1000);
const calculatePrizePool = totalViber => Math.min(Math.floor(100 + Number(totalViber) * 0.30 * 0.4), 50000);
const delay = ms => new Promise(r => setTimeout(r, ms));

// ══════════════════════════════════════════════════════════════════════════════
//  COUNTDOWN TIMER (single rAF loop)
// ══════════════════════════════════════════════════════════════════════════════
const timers = new Map(); // element -> endTimeMs
let timerLoopRunning = false;

function registerCountdown(el, endTime) {
  if (!el || !endTime?._seconds) { el.textContent = "Live"; return; }
  const endMs = endTime._seconds * 1000;
  timers.set(el, endMs);
  if (!timerLoopRunning) {
    timerLoopRunning = true;
    requestAnimationFrame(tickAll);
  }
}

function tickAll() {
  const now = Date.now();
  for (let [el, endMs] of timers.entries()) {
    const diff = endMs - now;
    if (diff <= 0) {
      el.textContent = "Ended";
      timers.delete(el);
    } else {
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
      el.textContent = `${h}:${m}:${s}`;
    }
  }
  if (timers.size > 0) requestAnimationFrame(tickAll);
  else timerLoopRunning = false;
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER FUNCTIONS (optimised innerHTML)
// ══════════════════════════════════════════════════════════════════════════════
function renderVibingListenEvents(vibeOver = false) {
  if (!listen_grid) return;
  const fullList = vibeOver ? listenEventsJoin : listenEvents;
  const events = vibeOver ? fullList : fullList.filter(e => !listenEventsJoin.some(j => j.eventId === e.eventId));
  let html = '';

  if (!events.length) {
    html = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No active listen events right now. Check back soon!</p></div>`;
  } else {
    events.forEach(event => {
      const fee = Number(event.eventEntryFee || 0);
      const vibers = Number(event.totalViber || 0);
      const prizePool = calculatePrizePool(vibers);
      const ended = isEnded(event.endTime);
      html += `
        <article class="event-card">
          <div class="event-tag-row"><span class="vibe-dot"></span><span class="event-date">${event.eventDate ? new Date(event.eventDate._seconds * 1000).toDateString() : ""}</span></div>
          <div class="event-thumb"><img class="event-thumb-img" src="${event.eventDpUrl || ""}" loading="lazy"><div class="event-badge"><div class="event-prize-badge">Prize Pool: <span class="dynamic-prize">₹${prizePool}</span></div><div class="event-fee-badge">Entry Fee: ${fee > 0 ? `₹${fee}` : "Free"}</div></div></div>
          <div class="event-title">${event.eventTitle || "Untitled Event"}</div>
          <div class="event-meta"><span class="event-duration el-${event.eventId}">--:--:--</span><span>${vibeOver ? formatListenTime(event.curatedMs) : `Vibers: ${vibers}`}</span></div>
          <div class="event-progress"><span style="width:100%"></span></div>
          <div class="event-actions"><button class="${vibeOver ? "joinNow" : "join"}" data-eventid="${event.eventId}">${ended ? "⏰ Ended" : vibeOver ? "Vibe 🎧" : "Join"}</button></div>
        </article>`;
    });
  }

  listen_grid.innerHTML = html;

  // Register countdowns
  events.forEach(event => {
    const durEl = listen_grid.querySelector(`.el-${event.eventId}`);
    if (durEl) registerCountdown(durEl, event.endTime);
  });

  // IntersectionObserver for highlight (attach after render)
  observeCards(listen_grid, listenEvents);
}

function renderVibingHitEvents(vibeOver = false) {
  if (!hit_grid) return;
  const fullList = vibeOver ? hitEventsJoin : hitEvents;
  const events = vibeOver ? fullList : fullList.filter(e => !hitEventsJoin.some(j => j.eventId === e.eventId));
  let html = '';

  if (!events.length) {
    html = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No active hit events right now. Check back soon!</p></div>`;
  } else {
    events.forEach(event => {
      const vibers = Number(event.totalViber || 0);
      const prizePool = calculatePrizePool(vibers);
      const fee = Number(event.eventEntryFee || 0);
      html += `
        <div class="hit-card">
          <div class="hit-event-content">
            <div class="hit-top">
              <div class="event-top"><img class="content-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/joining%20fee.png"><p class="fee-data">${fee > 0 ? `₹${fee}` : "Free"}</p></div>
              <div class="event-top"><img class="content-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/total-hit.png"><p class="total-hit-data">${vibers}</p></div>
              <div class="event-top"><img class="content-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/event-end-timmer.png"><p class="event-end-timmer eh-${event.eventId}">00:00:00</p></div>
            </div>
            <div class="prison-hexagon"><img class="event-img" loading="lazy" src="${event.eventDpUrl || ""}"><img class="lock" loading="lazy" style="visibility:${event.hasEnded ? "hidden" : "visible"};" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/A%20fiery%20iron%20chain%20f.png"></div>
            <div class="hit-lock">
              <div class="prize-pool"><p class="dynamic-prize">₹${prizePool}</p><img class="prize-pool-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/galaxy%20prize%20holder.png"></div>
              <img class="hit-btn" data-eventid="${event.eventId}" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/hit-btn.png">
            </div>
          </div>
        </div>`;
    });
  }

  hit_grid.innerHTML = html;

  events.forEach(event => {
    const durEl = hit_grid.querySelector(`.eh-${event.eventId}`);
    if (durEl) registerCountdown(durEl, event.endTime);
  });

  observeCards(hit_grid, hitEvents);
}

function renderLakhpatiLoops(vibeOver = false) {
  if (!premiumLegue) return;
  const fullList = vibeOver ? lakhpatiLoopsJoin : lakhpatiLoops;
  const events = vibeOver ? fullList : fullList.filter(e => !lakhpatiLoopsJoin.some(j => j.eventId === e.eventId));
  let html = '';

  if (!events.length) {
    html = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No Lakhpati events active right now. Check back soon!</p></div>`;
  } else {
    events.forEach(event => {
      const prizePool = (event.lakhpatiLoopAmountIndex || 0) * 100_000;
      const fee = Number(event.eventEntryFee || 0);
      html += `
        <div class="lakhpati-card">
          <div class="lakhpati-content">
            <div class="lp-top"><img loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/header-%20elements%20of%20lakhpatis.png" alt="lakhpati loop banner"></div>
            <div class="lp-center">
              <div class="lp-c-top">
                <span class="lakh lakh-1">1 Lakhs</span><span class="lakh lakh-2">2 Lakhs</span><span class="lakh lakh-3">3 Lakhs</span><span class="lakh lakh-4">4 Lakhs</span><span class="lakh lakh-5">5 Lakhs</span>
              </div>
              <div class="l-p-p">
                <div class="l-p-m">
                  <img loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/motivator-elements%20of%20lakhpatis1.png" alt="">
                  <span class="t-p-p">₹${prizePool.toLocaleString("en-IN")}</span>
                  <div class="T-J">0</div>
                </div>
                <div class="p-b"><img loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/prize-box%20of%20lakhpatis.png" alt=""></div>
              </div>
              <div class="l-p-bottom">
                <div class="left">
                  <img class="j-m-l" data-eventid="${event.eventId}" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/join-btnelements%20of%20lakhpatis.png" alt="">
                  <span class="E-f-l" data-eventid="${event.eventId}">Entry Fee : ${fee > 0 ? `₹${fee}` : "Free"}</span>
                </div>
                <div class="right"><strong class="t-h lh-${event.eventId}">00:00:00</strong></div>
              </div>
            </div>
          </div>
        </div>`;
    });
  }

  premiumLegue.innerHTML = html;

  events.forEach(event => {
    const durEl = premiumLegue.querySelector(`.lh-${event.eventId}`);
    if (durEl) registerCountdown(durEl, event.endTime);
  });

  observeCards(premiumLegue, lakhpatiLoops);
}

function renderSponsorAppTasks(vibeOver = false) {
  if (!appTaskList) return;
  const fullList = vibeOver ? sponsorAppTasksJoin : sponsorAppTasks;
  const tasks = vibeOver ? fullList : fullList.filter(t => !sponsorAppTasksJoin.some(j => j.sponsorId === t.sponsorId));
  let html = '';

  if (!tasks.length) {
    html = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any sponsor tasks yet!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No sponsor tasks available right now. Try again later.</p></div>`;
  } else {
    tasks.forEach(task => {
      const progressHTML = vibeOver && !task.isComplete
        ? `<div class="task-progress-bar"><div class="task-progress-fill" style="width:${Math.round(((task.stepsCompleted || 0) / (task.allSteps || 1)) * 100)}%"></div></div>`
        : "";
      const label = vibeOver ? (task.isComplete ? "Completed" : `${task.stepsCompleted || 0}/${task.allSteps || 0}`) : "Vibe";
      html += `
        <div class="t-b">
          <div class="a-t-h">
            <img class="app-icon" loading="lazy" src="${task.sponsorAppLogoUrl || "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/app-icon-placeholder.png"}" alt="app-task"/>
            <strong class="a-n">${task.sponsorAppName || ""}</strong>
          </div>
          ${progressHTML}
          <span class="t-d">
            <strong class="t-p-p">₹${task.taskPool || 0}</strong>
            <strong class="a-t-get" data-task-id="${task.sponsorId}">${label}</strong>
          </span>
        </div>`;
    });
  }
  appTaskList.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERSECTION OBSERVER for scroll highlight (replaces scroll listener)
// ══════════════════════════════════════════════════════════════════════════════
const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const card = entry.target;
    if (entry.isIntersecting) {
      // Remove active from all siblings
      card.parentElement.querySelectorAll('.active').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const prizeSpan = card.querySelector('.dynamic-prize');
      const eId = card.querySelector('.hit-btn')?.dataset.eventid ||
                 card.querySelector('.join')?.dataset.eventid;
      const events = card.closest('#hit-event-grid') ? hitEvents : listenEvents;
      const ed = events.find(e => e.eventId === eId);
      if (prizeSpan && ed && card.dataset.animated !== 'true') {
        animatePrizeValue(prizeSpan, 0, calculatePrizePool(Number(ed.totalViber || 0)), 800);
        card.dataset.animated = 'true';
      }
    }
  });
}, { root: null, threshold: 0.6 });

function observeCards(gridEl, events) {
  const cards = gridEl.querySelectorAll('.event-card, .hit-card, .lakhpati-card');
  cards.forEach(card => intersectionObserver.observe(card));
}

// ══════════════════════════════════════════════════════════════════════════════
//  TAB BUTTONS (unchanged)
// ══════════════════════════════════════════════════════════════════════════════
vibingOverBtns.forEach(btn => {
  btn.addEventListener("click", e => {
    isJoinedList = true;
    joinedType = e.currentTarget.dataset.eventType;
    scheduleRender();
  });
});
vibingBtns.forEach(btn => {
  btn.addEventListener("click", e => {
    isJoinedList = false;
    joinedType = null;
    scheduleRender();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  EVENT CLICKS (delegated) – unchanged logic
// ══════════════════════════════════════════════════════════════════════════════
listen_grid?.addEventListener("click", e => {
  if (e.target.closest(".start-joining-btn")) { renderVibingListenEvents(false); return; }
  const vibeNowBtn = e.target.closest(".joinNow");
  if (vibeNowBtn) { /* ... same as before ... */ }
  const joinBtn = e.target.closest(".join");
  if (!joinBtn) return;
  e.stopPropagation();
  // ... rest of join logic, unchanged
});

// (Identical event listeners for hit_grid, premiumLegue, appTaskList)
// ... they remain exactly as in the original code, just referencing the updated functions.

// ══════════════════════════════════════════════════════════════════════════════
//  LAZY LOAD LOTTIE & CONFETTI
// ══════════════════════════════════════════════════════════════════════════════
async function ensureLottie() {
  if (!lottie) lottie = await import("https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js");
  return lottie;
}

function playLottie(path, loop = true) {
  if (currentLottieInstance) { currentLottieInstance.destroy(); currentLottieInstance = null; fireContainer.innerHTML = ""; }
  ensureLottie().then(lib => {
    currentLottieInstance = lib.default.loadAnimation({
      container: fireContainer,
      renderer: "svg",
      loop,
      autoplay: true,
      path
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONFETTI (canvas-confetti, lazy)
// ══════════════════════════════════════════════════════════════════════════════
let confettiModule;
async function getConfetti() {
  if (!confettiModule) {
    confettiModule = await import("https://cdn.skypack.dev/canvas-confetti@1");
  }
  return confettiModule.default;
}

async function spawnConfetti(count = 80) {
  const confetti = await getConfetti();
  confetti({ particleCount: count, spread: 70, origin: { y: 0.6 } });
}

// ══════════════════════════════════════════════════════════════════════════════
//  REMAINING HELPERS (showToast, task overlays, etc.) – all identical to original
// ══════════════════════════════════════════════════════════════════════════════
// ... (keep all those functions)

// ══════════════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════════════
showSkeletons(listen_grid);
showSkeletons(hit_grid);
showSkeletons(premiumLegue);
showSkeletons(appTaskList);
setupNetworkBanner();
initPWAInstallPrompt();