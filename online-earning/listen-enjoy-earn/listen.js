import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
import { MusicMarathon } from "./sapanaVibe.js";

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
const marathon = new MusicMarathon({ containerId: "marathon-root", functions });

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
//  AUTH GUARD — "Be a Viber" bottom sheet
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
    setTimeout(() => {
      window.location.href = "/online-earning/listen-enjoy-earn/create-vibers/index.html";
    }, 300);
  });

  let dragY = 0;
  sheet.addEventListener("touchstart", (e) => { dragY = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    const dy = e.touches[0].clientY - dragY;
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    const dy = e.changedTouches[0].clientY - dragY;
    sheet.style.transform = "";
    if (dy > 80) closeAuthGuard();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuthGuard(); });
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

function requireAuth() {
  if (currentUser && !currentUser.isAnonymous) return false;
  openAuthGuard();
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
//  BOOTSTRAP
// ══════════════════════════════════════════════════════════════════════════════
showSkeletons(listen_grid);
showSkeletons(hit_grid);
showSkeletons(premiumLegue);
showSkeletons(appTaskList);
setupNetworkBanner();
setupPullToRefresh();
initPWAInstallPrompt();  // 🆕 Once‑per‑session install banner

// ══════════════════════════════════════════════════════════════════════════════
//  NETWORK BANNER
// ══════════════════════════════════════════════════════════════════════════════
function setupNetworkBanner() {
  const banner = document.createElement("div");
  banner.id = "network-banner";
  banner.style.cssText = `
    display:none;position:fixed;top:0;left:0;width:100%;z-index:9999;
    background:#e53935;color:#fff;text-align:center;
    padding:8px;font-size:13px;font-weight:600;letter-spacing:.5px;`;
  banner.textContent = "⚡ You're offline — some features may not work";
  document.body.prepend(banner);
  window.addEventListener("offline", () => { banner.style.display = "block"; });
  window.addEventListener("online", () => { banner.style.display = "none"; showToast("Back online! 🎉", "success"); });
}

// ══════════════════════════════════════════════════════════════════════════════
//  VISITOR TRACKING
// ══════════════════════════════════════════════════════════════════════════════
async function trackVisitor() {
  if (currentUser) {
    await trackAuthDailyActive();
  } else {
    await trackAnonymousVisitFn();
  }
}

async function trackAuthDailyActive() {
  if (dailyActiveMarked || !currentUser) return;
  dailyActiveMarked = true;
  try {
    await markDailyActive();
  } catch (err) {
    dailyActiveMarked = false;
  }
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
    } catch (err) {
      console.error("Anonymous tracking failed:", err);
    }
  }
}

onAuthStateChanged(auth, async (user) => {
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

  renderVibingListenEvents(false);
  renderVibingHitEvents(false);
  renderLakhpatiLoops(false);
  renderSponsorAppTasks(false);
});

userNameEl?.addEventListener("click", () => {
  window.location.href = currentUser
    ? "/online-earning/listen-enjoy-earn/profile/index.html"
    : "/online-earning/listen-enjoy-earn/create-vibers/index.html";
});

// ══════════════════════════════════════════════════════════════════════════════
//  USER DATA
// ══════════════════════════════════════════════════════════════════════════════
async function getUser() {
  let userAvailable = false;
  try {
    const result = await connectUser();
    if (result?.data?.success && result.data.userData) {
      uiData = result.data.userData;
      userAvailable = true;
    } else {
      uiData = null;
    }
  } catch (err) {
    console.error("User fetch failed:", err);
    uiData = null;
    showToast("Failed to load your data. Please refresh.", "error");
  }
  init(userAvailable);
  await Promise.all([getEventList(), getSponsorTasksList()]);
  return uiData;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CHECK-IN HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function checkusercheckin() {
  if (!uiData) return;
  const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (uiData.lastCheckInDay !== today) showDailyCheckInRewardDialog();
}

// ══════════════════════════════════════════════════════════════════════════════
//  FETCH EVENTS
// ══════════════════════════════════════════════════════════════════════════════
async function getEventList() {
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

    updatePlayerVisibility();
    renderVibingListenEvents(isJoinedList && joinedType === "L");
    renderVibingHitEvents(isJoinedList && joinedType === "H");
    renderLakhpatiLoops(isJoinedList && joinedType === "PL");

  } catch (err) {
    console.error("Event fetch failed:", err);
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
    if (resJoin && resJoin.data?.success && resJoin.data.sponsors) sponsorAppTasksJoin.push(...resJoin.data.sponsors);
    renderSponsorAppTasks(isJoinedList && joinedType === "SAT");
  } catch (err) {
    console.error("Sponsor fetch failed:", err);
    showToast("Could not load sponsor tasks.", "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PURE HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const isEnded = (endTime) => !!(endTime?._seconds && Date.now() > endTime._seconds * 1000);
const calculatePrizePool = (totalViber) => Math.min(Math.floor(100 + Number(totalViber) * 0.30 * 0.4), 50000);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function startCountdown(el, endTime) {
  if (!el) return;
  if (!endTime?._seconds) { el.textContent = "Live"; return; }
  const endMs = endTime._seconds * 1000;
  const tick = () => {
    const diff = Math.max(0, endMs - Date.now());
    const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
    el.textContent = diff > 0 ? `${h}:${m}:${s}` : "Ended";
  };
  tick();
  setInterval(tick, 1000);
}

function formatListenTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `Listen : ${h}:${m}:${s}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  DIALOG
// ══════════════════════════════════════════════════════════════════════════════
const openDialog = () => { if (dialog) dialog.style.display = "flex"; };
const closeDialog = () => { if (dialog) dialog.style.display = "none"; };
dialogCloseBtn?.addEventListener("click", closeDialog);

// ══════════════════════════════════════════════════════════════════════════════
//  AD TRIGGER
// ══════════════════════════════════════════════════════════════════════════════
function trigger(eventId, eventType) {
  if (adLocked) return;
  adLocked = true;

  const links =
    eventType === "listen" ? linksL :
      eventType === "hit" ? linksH :
        eventType === "lakhpati" ? linksLP :
          eventType === "dc" ? linksDCI : [];

  if (!links.length) { showToast("No ad links available 😕", "error"); adLocked = false; return; }

  window.open(links[adIndexL++ % links.length], "_blank");
  adOpenTime = Date.now();
  setTimeout(() => { adLocked = false; }, 2000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  AD RETURN — VISIBILITY CHANGE  (Listen / Hit / Lakhpati)
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (visibilityHandler) return;
  if (!pendingJoinEventId || !adOpenTime) return;

  const stayedMs = Date.now() - adOpenTime;
  const typeKey =
    pendingJoinTypeIndex === EVENT_TYPE_INDEX.hit ? "hit" :
      pendingJoinTypeIndex === EVENT_TYPE_INDEX.lakhpati ? "lakhpati" : "listen";

  const required = AD_WAIT_MS[typeKey] ?? 10000;

  if (stayedMs >= required) {
    const pool =
      typeKey === "hit" ? hitEvents :
        typeKey === "lakhpati" ? lakhpatiLoops : listenEvents;

    const isLakhpati = typeKey === "lakhpati";
    const eventData = pool.find((ev) => ev.eventId === pendingJoinEventId);

    if (eventData) {
      showEventDetails(eventData, isLakhpati, pendingJoinTypeIndex);
      showToast("Thanks, Viber! 🎉 You're all set to join!", "success");
    } else {
      showToast("Event not found — please refresh.", "error");
    }
  } else {
    const secLeft = Math.ceil((required - stayedMs) / 1000);
    showToast(`Stay on the ad for ${secLeft} more second(s) to continue.`, "error");
  }

  pendingJoinEventId = null;
  adOpenTime = 0;
});

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER — SPONSOR TASKS
// ══════════════════════════════════════════════════════════════════════════════
function renderSponsorAppTasks(vibeOver = false) {
  if (!appTaskList) return;
  appTaskList.innerHTML = "";
  const fullList = vibeOver ? sponsorAppTasksJoin : sponsorAppTasks;
  const tasks = vibeOver
    ? fullList
    : fullList.filter((t) => !sponsorAppTasksJoin.some((j) => j.sponsorId === t.sponsorId));

  if (!tasks.length) {
    appTaskList.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any sponsor tasks yet!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No sponsor tasks available right now. Try again later.</p></div>`;
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "t-b";
    const progressHTML = vibeOver && !task.isComplete
      ? `<div class="task-progress-bar"><div class="task-progress-fill" style="width:${Math.round(((task.stepsCompleted || 0) / (task.allSteps || 1)) * 100)}%"></div></div>`
      : "";
    const label = vibeOver ? (task.isComplete ? "Completed" : `${task.stepsCompleted || 0}/${task.allSteps || 0}`) : "Vibe";

    card.innerHTML = `
      <div class="a-t-h">
        <img class="app-icon" loading="lazy"
          src="${task.sponsorAppLogoUrl || "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/app-icon-placeholder.png"}"
          alt="app-task"/>
        <strong class="a-n">${task.sponsorAppName || ""}</strong>
      </div>
      ${progressHTML}
      <span class="t-d">
        <strong class="t-p-p">₹${task.taskPool || 0}</strong>
        <strong class="a-t-get" data-task-id="${task.sponsorId}">${label}</strong>
      </span>`;
    appTaskList.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER — LISTEN EVENTS
// ══════════════════════════════════════════════════════════════════════════════
function renderVibingListenEvents(vibeOver = false) {
  if (!listen_grid) return;
  listen_grid.innerHTML = "";
  const fullList = vibeOver ? listenEventsJoin : listenEvents;
  const events = vibeOver
    ? fullList
    : fullList.filter((e) => !listenEventsJoin.some((j) => j.eventId === e.eventId));

  if (!events.length) {
    listen_grid.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No active listen events right now. Check back soon!</p></div>`;
    return;
  }

  events.forEach((event) => {
    const card = document.createElement("article");
    const fee = Number(event.eventEntryFee || 0);
    const vibers = Number(event.totalViber || 0);
    const prizePool = calculatePrizePool(vibers);
    const ended = isEnded(event.endTime);

    card.className = "event-card";
    card.innerHTML = `
      <div class="event-tag-row">
        <span class="vibe-dot"></span>
        <span class="event-date">${event.eventDate ? new Date(event.eventDate._seconds * 1000).toDateString() : ""}</span>
      </div>
      <div class="event-thumb">
        <img class="event-thumb-img" src="${event.eventDpUrl || ""}" loading="lazy">
        <div class="event-badge">
          <div class="event-prize-badge">Prize Pool: <span class="dynamic-prize">₹${prizePool}</span></div>
          <div class="event-fee-badge">Entry Fee: ${fee > 0 ? `₹${fee}` : "Free"}</div>
        </div>
      </div>
      <div class="event-title">${event.eventTitle || "Untitled Event"}</div>
      <div class="event-meta">
        <span class="event-duration">--:--:--</span>
        <span>${vibeOver ? formatListenTime(event.curatedMs) : `Vibers: ${vibers}`}</span>
      </div>
      <div class="event-progress"><span style="width:100%"></span></div>
      <div class="event-actions">
        <button class="${vibeOver ? "joinNow" : "join"}" data-eventid="${event.eventId}">
          ${ended ? "⏰ Ended" : vibeOver ? "Vibe 🎧" : "Join"}
        </button>
      </div>`;

    startCountdown(card.querySelector(".event-duration"), event.endTime);
    card.addEventListener("mouseenter", () => {
      listen_grid.querySelectorAll(".event-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
    listen_grid.appendChild(card);
  });

  enableScrollHighlight(listen_grid, listen_grid.querySelectorAll(".event-card"), listenEvents);
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER — HIT EVENTS
// ══════════════════════════════════════════════════════════════════════════════
function renderVibingHitEvents(vibeOver = false) {
  if (!hit_grid) return;
  hit_grid.innerHTML = "";
  const fullList = vibeOver ? hitEventsJoin : hitEvents;
  const events = vibeOver
    ? fullList
    : fullList.filter((e) => !hitEventsJoin.some((j) => j.eventId === e.eventId));

  if (!events.length) {
    hit_grid.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No active hit events right now. Check back soon!</p></div>`;
    return;
  }

  events.forEach((event) => {
    const card = document.createElement("div");
    const vibers = Number(event.totalViber || 0);
    const prizePool = calculatePrizePool(vibers);
    const fee = Number(event.eventEntryFee || 0);

    card.className = "hit-card";
    card.innerHTML = `
      <div class="hit-event-content">
        <div class="hit-top">
          <div class="event-top">
            <img class="content-holder" loading="lazy"
              src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/joining%20fee.png">
            <p class="fee-data">${fee > 0 ? `₹${fee}` : "Free"}</p>
          </div>
          <div class="event-top">
            <img class="content-holder" loading="lazy"
              src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/total-hit.png">
            <p class="total-hit-data">${vibers}</p>
          </div>
          <div class="event-top">
            <img class="content-holder" loading="lazy"
              src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/event-end-timmer.png">
            <p class="event-end-timmer">00:00:00</p>
          </div>
        </div>
        <div class="prison-hexagon">
          <img class="event-img" loading="lazy" src="${event.eventDpUrl || ""}">
          <img class="lock" loading="lazy" style="visibility:${event.hasEnded ? "hidden" : "visible"};"
            src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/A%20fiery%20iron%20chain%20f.png">
        </div>
        <div class="hit-lock">
          <div class="prize-pool">
            <p class="dynamic-prize">₹${prizePool}</p>
            <img class="prize-pool-holder" loading="lazy"
              src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/galaxy%20prize%20holder.png">
          </div>
          <img class="hit-btn" data-eventid="${event.eventId}" loading="lazy"
            src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/hit-btn.png">
        </div>
      </div>`;

    hit_grid.appendChild(card);
    startCountdown(card.querySelector(".event-end-timmer"), event.endTime);
    card.addEventListener("mouseenter", () => {
      hit_grid.querySelector(".hit-card.active")?.classList.remove("active");
      card.classList.add("active");
    });
  });

  enableScrollHighlight(hit_grid, hit_grid.querySelectorAll(".hit-card"), hitEvents);
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER — LAKHPATI LOOPS
// ══════════════════════════════════════════════════════════════════════════════
function renderLakhpatiLoops(vibeOver = false) {
  if (!premiumLegue) return;
  premiumLegue.innerHTML = "";
  const fullList = vibeOver ? lakhpatiLoopsJoin : lakhpatiLoops;
  const events = vibeOver
    ? fullList
    : fullList.filter((e) => !lakhpatiLoopsJoin.some((j) => j.eventId === e.eventId));

  if (!events.length) {
    premiumLegue.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No Lakhpati events active right now. Check back soon!</p></div>`;
    return;
  }

  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "lakhpati-card";
    const prizePool = (event.lakhpatiLoopAmountIndex || 0) * 100_000;
    const fee = Number(event.eventEntryFee || 0);

    card.innerHTML = `
      <div class="lakhpati-content">
        <div class="lp-top">
          <img loading="lazy"
            src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/header-%20elements%20of%20lakhpatis.png"
            alt="lakhpati loop banner">
        </div>
        <div class="lp-center">
          <div class="lp-c-top">
            <span class="lakh lakh-1">1 Lakhs</span>
            <span class="lakh lakh-2">2 Lakhs</span>
            <span class="lakh lakh-3">3 Lakhs</span>
            <span class="lakh lakh-4">4 Lakhs</span>
            <span class="lakh lakh-5">5 Lakhs</span>
          </div>
          <div class="l-p-p">
            <div class="l-p-m">
              <img loading="lazy"
                src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/motivator-elements%20of%20lakhpatis1.png" alt="">
              <span class="t-p-p">₹${prizePool.toLocaleString("en-IN")}</span>
              <div class="T-J">0</div>
            </div>
            <div class="p-b">
              <img loading="lazy"
                src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/prize-box%20of%20lakhpatis.png" alt="">
            </div>
          </div>
          <div class="l-p-bottom">
            <div class="left">
              <img class="j-m-l" data-eventid="${event.eventId}" loading="lazy"
                src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/join-btnelements%20of%20lakhpatis.png" alt="">
              <span class="E-f-l" data-eventid="${event.eventId}">
                Entry Fee : ${fee > 0 ? `₹${fee}` : "Free"}
              </span>
            </div>
            <div class="right"><strong class="t-h">00:00:00</strong></div>
          </div>
        </div>
      </div>`;

    card.querySelector(`.lakh-${event.lakhpatiLoopAmountIndex || 0}`)?.classList.add("active");
    premiumLegue.appendChild(card);
    startCountdown(card.querySelector(".t-h"), event.endTime);
    card.addEventListener("mouseenter", () => {
      premiumLegue.querySelector(".lakhpati-card.active")?.classList.remove("active");
      card.classList.add("active");
    });
  });

  enableScrollHighlight(premiumLegue, premiumLegue.querySelectorAll(".lakhpati-card"), lakhpatiLoops);
}

// ══════════════════════════════════════════════════════════════════════════════
//  TAB BUTTONS
// ══════════════════════════════════════════════════════════════════════════════
vibingOverBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    isJoinedList = true;
    joinedType = e.currentTarget.dataset.eventType;
    if (joinedType === "L") renderVibingListenEvents(true);
    else if (joinedType === "H") renderVibingHitEvents(true);
    else if (joinedType === "PL") renderLakhpatiLoops(true);
    else if (joinedType === "SAT") renderSponsorAppTasks(true);
  });
});

vibingBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    isJoinedList = false;
    joinedType = null;
    const t = e.currentTarget.dataset.eventType;
    if (t === "L") renderVibingListenEvents(false);
    else if (t === "H") renderVibingHitEvents(false);
    else if (t === "PL") renderLakhpatiLoops(false);
    else if (t === "SAT") renderSponsorAppTasks(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  LISTEN GRID CLICK  🔒 AUTH GUARDED
// ══════════════════════════════════════════════════════════════════════════════
listen_grid?.addEventListener("click", (e) => {
  if (e.target.closest(".start-joining-btn")) { renderVibingListenEvents(false); return; }

  const vibeNowBtn = e.target.closest(".joinNow");
  if (vibeNowBtn) {
    e.stopPropagation();
    if (!isJoinedList || joinedType !== "L") return;
    if (requireAuth()) return;

    const eventId = vibeNowBtn.dataset.eventid;
    if (!eventId) { showToast("Event ID missing — try refreshing", "error"); return; }

    const eventData = listenEventsJoin.find((ev) => ev.eventId === eventId);
    if (isEnded(eventData?.endTime)) { showEventDetails(eventData, false, EVENT_TYPE_INDEX.listen); return; }

    vibingEventId = eventId;
    frame?.classList.replace("not-joined", "joined");
    suggestEvent?.classList.remove("enable");
    c_s_p?.classList.add("enable");
    const playerCard = document.querySelector(".layout-two-col");
    if (playerCard) playerCard.scrollIntoView({ behavior: "smooth", block: "center" });
    if (eventIdEl) eventIdEl.style.display = "none";
    marathon.vibeNow(eventId);
    return;
  }

  const joinBtn = e.target.closest(".join");
  if (!joinBtn) return;
  e.stopPropagation();
  if (isJoinedList && joinedType === "L") return;
  if (requireAuth()) return;

  const eventId = joinBtn.dataset.eventid;
  const eventData = listenEvents.find((ev) => ev.eventId === eventId);
  if (!eventData) return;

  if (isEnded(eventData.endTime)) {
    showToast("⏰ This event has ended. Check for new events!", "error"); return;
  }

  if (eventData.eventEntryFee) {
    const fee = eventData.eventEntryFee;
    if (typeof fee === "string" && fee.toUpperCase().includes("LC")) {
      const lcAmount = parseInt(fee.replace(/\D/g, "")) || 0;
      if ((uiData?.listenCoins || 0) < lcAmount) {
        showToast("Not enough Listen Coins.", "error"); return;
      }
    } else if ((uiData?.cash || 0) < Number(fee)) {
      showToast("Insufficient balance. You can go with free events.", "error"); return;
    }
  }

  pendingJoinEventId = eventId;
  pendingJoinTypeIndex = EVENT_TYPE_INDEX.listen;
  showAdCountdownToast(10, "Watch the ad for 10 s, then your event details will open 🎧");
  trigger(eventId, "listen");
});

// ══════════════════════════════════════════════════════════════════════════════
//  HIT GRID CLICK  🔒 AUTH GUARDED
// ══════════════════════════════════════════════════════════════════════════════
hit_grid?.addEventListener("click", (e) => {
  if (e.target.closest(".start-joining-btn")) { renderVibingHitEvents(false); return; }

  const hitBtn = e.target.closest(".hit-btn");
  if (!hitBtn) return;
  e.stopPropagation();

  const evId = hitBtn.dataset.eventid;

  if (isJoinedList && joinedType === "H") {
    if (requireAuth()) return;
    const eventData = hitEventsJoin.find((ev) => ev.eventId === evId);
    if (!eventData) return;
    if (isEnded(eventData.endTime)) showEventDetails(eventData, false, EVENT_TYPE_INDEX.hit);
    else showToast("⏳ Event is still running — results coming soon!", "info");
    return;
  }

  if (requireAuth()) return;

  const eventData = hitEvents.find((ev) => ev.eventId === evId);
  if (!eventData) return;

  if (isEnded(eventData.endTime)) {
    showToast("⏰ This event has ended. Check for new events!", "error"); return;
  }

  if (eventData.eventEntryFee) {
    const fee = eventData.eventEntryFee;
    if (typeof fee === "string" && fee.toUpperCase().includes("LC")) {
      const lcAmount = parseInt(fee.replace(/\D/g, "")) || 0;
      if ((uiData?.listenCoins || 0) < lcAmount) {
        showToast("Not enough Listen Coins.", "error"); return;
      }
    } else if ((uiData?.cash || 0) < Number(fee)) {
      showToast("Insufficient balance. You can go with free events.", "error"); return;
    }
  }

  const card = hitBtn.closest(".hit-card");
  const lock = card?.querySelector(".lock");

  const proceed = () => {
    pendingJoinEventId = evId;
    pendingJoinTypeIndex = EVENT_TYPE_INDEX.hit;
    showAdCountdownToast(10, "Watch the ad for 10 s, then your event details will open 🎯");
    trigger(evId, "hit");
  };

  if (lock) {
    lock.classList.add("shaking");
    setTimeout(() => { lock.classList.remove("shaking"); proceed(); }, 400);
  } else {
    proceed();
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  LAKHPATI GRID CLICK  🔒 AUTH GUARDED
// ══════════════════════════════════════════════════════════════════════════════
premiumLegue?.addEventListener("click", (e) => {
  if (e.target.closest(".start-joining-btn")) { renderLakhpatiLoops(false); return; }

  const joinBtn = e.target.closest(".j-m-l");
  const feeCont = e.target.closest(".E-f-l");
  if (!joinBtn && !feeCont) return;
  e.stopPropagation();

  const evId = String(joinBtn?.dataset.eventid || feeCont?.dataset.eventid || "");
  if (requireAuth()) return;

  if (isJoinedList && joinedType === "PL") {
    const eventData = lakhpatiLoopsJoin.find((ev) => String(ev.eventId) === evId);
    if (!eventData) return;
    if (isEnded(eventData.endTime)) showEventDetails(eventData, true, EVENT_TYPE_INDEX.lakhpati);
    else showToast("⏳ Event is still running — results coming soon!", "info");
    return;
  }

  const eventData = lakhpatiLoops.find((ev) => String(ev.eventId) === evId);
  if (!eventData) return;

  if (isEnded(eventData.endTime)) {
    showToast("⏰ This event has ended. Check for new events!", "error"); return;
  }
  if (eventData.eventEntryFee > 0 && (uiData?.cash || 0) < eventData.eventEntryFee) {
    showToast("Insufficient balance. Please top up to join.", "error"); return;
  }
  if (Number(uiData?.streakDays || 0) <= 3) {
    showToast("🔥 Build a 3-day streak to unlock the Lakhpati Loop challenge!", "info"); return;
  }

  pendingJoinEventId = evId;
  pendingJoinTypeIndex = EVENT_TYPE_INDEX.lakhpati;
  showAdCountdownToast(10, "Watch the ad for 10 s, then your Lakhpati event will open 💰");
  trigger(evId, "lakhpati");
});

// ══════════════════════════════════════════════════════════════════════════════
//  SHOW EVENT DETAILS
// ══════════════════════════════════════════════════════════════════════════════
async function showEventDetails(ED, isLakhpati = false, eventTypeIndex) {
  const dialogC = document.querySelector(".eventData");
  if (!dialogC) return;
  openDialog();
  const vibe = document.querySelector(".join-now");
  if (vibe) vibe.textContent = "Loading Your Vibe...";

  if (isJoinedList && isEnded(ED?.endTime)) {
    try {
      const res = await getVibeLeaderBoard({ eventId: ED.eventId, eventType: eventTypeIndex });
      const data = res.data;
      if (data.success && data.winners?.length) {
        renderLeaderboard(dialogC, ED, data.winners, data.myRank || 0, data.myWinAmount || 0, eventTypeIndex);
      } else {
        dialogC.innerHTML = `
          <div style="padding:32px;text-align:center">
            <div style="font-size:48px">⏳</div>
            <p style="color:rgba(255,255,255,.45);font-size:13px;text-align:center;">
              Results will be published shortly.<br>Check back soon!
            </p>
          </div>
          <div class="btm"><div class="join-now" id="join-now">Event is not Finish yet!</div></div>`;
        document.querySelector(".join-now")?.addEventListener("click", () => {
          closeDialog();
          showToast("Leaderboard in progress. Your rewards are coming soon! 🏆", "info");
        });
      }
    } catch {
      dialogC.innerHTML = `<div style="padding:32px;text-align:center"><div style="font-size:48px">😕</div><p style="color:rgba(255,255,255,.45)">Could not load results. Please try again.</p></div>`;
      showToast("Could not load leaderboard", "error");
    }
    return;
  }

  const poolIndex = ED.lakhpatiLoopAmountIndex ?? 0;
  const rawPrize = ED.eventPrizePool ?? (poolIndex * 100_000);
  const title = !ED.eventTitle ? "Best of Luck, Viber!"
    : ED.eventTitle.length > 30 ? `${ED.eventTitle.slice(0, 27)}…` : ED.eventTitle;
  const prizeText = isLakhpati ? `₹ ${rawPrize.toLocaleString("en-IN")}` : "Dynamic Prize Pool";
  const explainText = isLakhpati
    ? `Lakhpati Prize Pool Increase!</b><br>Today: ₹1 Lakh ⮕ Next 5 Days: ₹5 Lakh ⮕ Weekly Goal: <b>₹18 Lakh!`
    : `The more who join, the bigger the pot! Every new listener scales the rewards, creating more winning spots for everyone.`;

  dialogC.innerHTML = `
    <h3>Event Title</h3>
    <span class="event-tittle">${title}</span>
    <h3>Prize Pool</h3>
    <div class="dynamic">
      <img class="dynamic-prize-pool" src="${PRIZE_POOL_IMG}">
      <strong class="dynamic-prize-text">${prizeText}</strong>
      <p class="dynamic-explain">${explainText}</p>
    </div>
    <h3>How It Works</h3>
    <ul class="guide">
      <li>Join the event by tapping the <strong>"Vibe 🎧"</strong> button.</li>
      <li>The top <strong>vibers</strong> at the end of the event win rewards from the prize pool.</li>
      <li>Bonus rewards come in the form of <strong>Listen Coins &amp; Luck Credits</strong>.</li>
      <li><strong>Secret: Your Daily Activity increases your Luck Credit!</strong></li>
    </ul>
    <div class="btm"><div class="join-now" id="join-now">Vibe Now 🎧</div></div>`;

  document.querySelector(".join-now")?.addEventListener("click", async () => {
    closeDialog();
    await handleJoinEvent(ED, isLakhpati, eventTypeIndex);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER LEADERBOARD
// ══════════════════════════════════════════════════════════════════════════════
function renderLeaderboard(dialogC, ED, leaderboard, myRank = 0, myWinAmount = 0, eventType) {
  const safe = (u) => ({
    rank: u?.rank || 0, viberDp: u?.viberDp || DP_FALLBACK,
    viberName: u?.viberName || "Unknown", winAmount: u?.winAmount || 0,
  });
  const [first, second, third] = leaderboard.slice(0, 3).map(safe);
  const rest = leaderboard.slice(3);

  dialogC.innerHTML = `
    <div class="l-card">
      <div class="leaderBoard">
        <div class="high-rank">
          ${second ? `<div class="rank two"><img class="rank-two-frame" src="/assets/leaderboard/rank-2.png"><img class="viberDp" src="${second.viberDp}"><div class="n-wa"><strong>₹${second.winAmount}</strong><span>${second.viberName}</span></div></div>` : ""}
          ${first ? `<div class="rank one"><img class="rank-one-frame" src="/assets/leaderboard/rank-1.png"><img class="viberDp" src="${first.viberDp}"><div class="n-wa"><strong>₹${first.winAmount}</strong><span>${first.viberName}</span></div></div>` : ""}
          ${third ? `<div class="rank three"><img class="rank-three-frame" src="/assets/leaderboard/rank-3.png"><img class="viberDp" src="${third.viberDp}"><div class="n-wa"><strong>₹${third.winAmount}</strong><span>${third.viberName}</span></div></div>` : ""}
        </div>
        <div class="midRank">
          ${rest.map((u) => `
            <div class="winnerData">
              <div class="winner-details">
                <span class="rank">#${u.rank}</span>
                <img class="winnerDp" src="${u.viberDp}">
                <strong>${u.viberName}</strong>
              </div>
              <span>₹${u.winAmount}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>`;

  const lCard = dialogC.querySelector(".l-card");
  if (ED.isClaim) {
    const thanks = document.createElement("p");
    thanks.style.cssText = "text-align:center;color:#22c55e;font-weight:600;padding:12px 0 4px";
    thanks.textContent = "❤️ Reward already claimed — Thank you!";
    lCard.appendChild(thanks);
  } else if (myRank > 0 && myWinAmount > 0) {
    const claimBtn = document.createElement("button");
    claimBtn.className = "vibe-btn";
    claimBtn.textContent = `🏆 Claim ₹${myWinAmount}`;
    claimBtn.addEventListener("click", async () => {
      claimBtn.disabled = true;
      claimBtn.textContent = "Claiming…";
      try {
        const res = await claimVibeReward({ eventId: ED.eventId, eventType });
        const data = res?.data;
        if (!data?.success) throw new Error(data?.message || "Claim failed");
        claimBtn.textContent = "❤️ Claimed!";
        spawnConfetti();
        showToast(`₹${myWinAmount} reward claimed! 🎉`, "success");
        await getUser();
      } catch (err) {
        console.error("Claim error:", err);
        showToast(err.message || "Claim failed 😕", "error");
        claimBtn.disabled = false;
        claimBtn.textContent = `🏆 Claim ₹${myWinAmount}`;
      }
    });
    lCard.appendChild(claimBtn);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  HANDLE JOIN EVENT
// ══════════════════════════════════════════════════════════════════════════════
async function handleJoinEvent(ED, isLakhpati, eventTypeIndex) {
  const isFree = !ED.eventEntryFee || Number(ED.eventEntryFee) === 0;
  const feeLabel = isFree ? "Free entry ✓" : `Deducting ₹${ED.eventEntryFee}`;
  const steps = [
    "Verifying your account",
    feeLabel,
    ...(eventTypeIndex !== EVENT_TYPE_INDEX.listen ? ["Assigning lucky tickets 🎲"] : []),
    "Registering you in the event",
    "All done! 🎉",
  ];
  const progress = showProgressToast(steps);

  try {
    progress.update(0); await delay(400);
    progress.update(1); await delay(300);
    if (eventTypeIndex !== EVENT_TYPE_INDEX.listen) { progress.update(2); await delay(300); }
    progress.update(steps.length - 2);

    const res = await joinvibeEvents({ eventId: ED.eventId, eventTypeIndex });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Vibe returned failure");

    progress.update(steps.length - 1);
    progress.finish(true, "You're in! Good luck, Viber 🎉");
    spawnConfetti();
    await getUser();

    if (eventTypeIndex === EVENT_TYPE_INDEX.lakhpati) renderLakhpatiLoops(false);
    else if (eventTypeIndex === EVENT_TYPE_INDEX.listen) { renderVibingListenEvents(false); updatePlayerVisibility(); }
    else if (eventTypeIndex === EVENT_TYPE_INDEX.hit) renderVibingHitEvents(false);

    pendingJoinEventId = null;
    pendingJoinTypeIndex = null;

  } catch (err) {
    console.error("Join failed:", err);
    const map = {
      "already-exists": "You've already joined this event!",
      "failed-precondition": err.message?.includes("LC") ? "Not enough Listen Coins."
        : err.message?.includes("cash") ? "Insufficient balance. Please top up."
          : "This event has ended.",
      "not-found": "Event not found. It may have just ended.",
      "unauthenticated": "Please log in first.",
      "resource-exhausted": "Server busy. Please try again in a moment.",
    };
    const code = err?.code?.replace("functions/", "") || "";
    const message = map[code] || err.message || "Something went wrong.";
    progress.finish(false, message);
    showToast(message, "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SPONSOR TASK LIST CLICK  🔒 AUTH GUARDED
// ══════════════════════════════════════════════════════════════════════════════
appTaskList?.addEventListener("click", async (e) => {
  if (e.target.closest(".start-joining-btn")) { renderSponsorAppTasks(false); isJoinedList = false; return; }

  const btn = e.target.closest(".a-t-get");
  if (!btn) return;
  if (requireAuth()) return;

  const taskId = btn.dataset.taskId;
  a_t_d_overlay.classList.add("active");

  const resolvedTask =
    (isJoinedList ? sponsorAppTasksJoin : sponsorAppTasks).find((t) => String(t.sponsorId) === String(taskId)) ||
    sponsorAppTasksJoin.find((t) => String(t.sponsorId) === String(taskId)) ||
    sponsorAppTasks.find((t) => String(t.sponsorId) === String(taskId));

  if (!resolvedTask) {
    a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><h2>Task not found</h2><button class="a-t-d-close">Close</button></div>`;
    return;
  }

  a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><div class="eq-progress loadingEventStatus">${"<span></span>".repeat(10)}</div></div>`;

  if (isJoinedList && joinedType === "SAT") {
    try {
      const res = await getSponsorTaskLeaderBoard({ sponsorId: resolvedTask.sponsorId });
      const leaderboard = res?.data?.leaderboard || [];
      if (leaderboard.length) { renderLeaderboardCard(resolvedTask, leaderboard); return; }
    } catch { /* fallthrough */ }
  }

  renderTaskDetailCard(resolvedTask);
});

function renderTaskDetailCard(taskData) {
  a_t_d_overlay.innerHTML = `
    <div class="a-t-d-card">
      <div class="a-t-d-header">
        <span></span>
        <h2>${taskData.sponsorAppName}</h2>
        <div class="a-t-d-close">&times;</div>
      </div>
      <ul class="a-t-d-guide">
        ${taskData.taskCompleteSteps?.length
      ? taskData.taskCompleteSteps.map((s, i) => `<li>Step ${i + 1}: ${s}</li>`).join("")
      : `<li>No specific steps provided.</li>`}
      </ul>
      <div class="a-t-d-reward"><strong>Reward:</strong> ₹${taskData.taskPool}</div>
      <button class="vibe-btn" data-sponsor="${taskData.sponsorId}">
        ${isJoinedList ? "Complete All Steps to get Rewarded" : "Vibe &amp; Earn"}
      </button>
    </div>`;
}

function renderLeaderboardCard(taskData, leaderboard) {
  const safe = (u) => ({
    viberDp: u?.viberDp || DP_FALLBACK, viberName: u?.viberName || "Unknown",
    winAmount: u?.winAmount || 0, rank: u?.rank || 0,
  });
  const [first, second, third] = leaderboard.slice(0, 3).map(safe);
  const rest = leaderboard.slice(3);

  a_t_d_overlay.innerHTML = `
    <div class="a-t-d-card">
      <div class="leaderBoard">
        <div class="high-rank">
          ${second ? `<div class="rank two"><img class="rank-two-frame" src="/assets/leaderboard/rank-2.png"><img class="viberDp" src="${second.viberDp}"><div class="n-wa"><strong>₹${second.winAmount}</strong><span>${second.viberName}</span></div></div>` : ""}
          ${first ? `<div class="rank one"><img class="rank-one-frame" src="/assets/leaderboard/rank-1.png"><img class="viberDp" src="${first.viberDp}"><div class="n-wa"><strong>₹${first.winAmount}</strong><span>${first.viberName}</span></div></div>` : ""}
          ${third ? `<div class="rank three"><img class="rank-three-frame" src="/assets/leaderboard/rank-3.png"><img class="viberDp" src="${third.viberDp}"><div class="n-wa"><strong>₹${third.winAmount}</strong><span>${third.viberName}</span></div></div>` : ""}
        </div>
        <div class="midRank">
          ${rest.map((u) => `
            <div class="winnerData">
              <div class="winner-details">
                <span class="rank">#${u.rank}</span>
                <img class="winnerDp" src="${u.viberDp}">
                <strong>${u.viberName}</strong>
              </div>
              <span>₹${u.winAmount}</span>
            </div>`).join("")}
        </div>
      </div>
      <button class="vibe-btn claim-btn" data-sponsor="${taskData.sponsorId}">
        ${taskData.isClaim ? "❤️ Thanks ❤️" : "Claim"}
      </button>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP TASK OVERLAY ACTIONS
// ══════════════════════════════════════════════════════════════════════════════
a_t_d_overlay?.addEventListener("click", async (e) => {
  const closeButton = e.target.closest(".a-t-d-close");
  const claimBtn = e.target.closest(".claim-btn");
  const vibeBtn = e.target.closest(".vibe-btn");

  if (closeButton) { a_t_d_overlay.classList.remove("active"); return; }

  if (claimBtn) {
    a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><div class="eq-progress loadingEventStatus">${"<span></span>".repeat(10)}</div></div>`;
    try {
      const res = await claimSponsorReward({ sponsorId: claimBtn.dataset.sponsor });
      const data = res?.data;
      if (!data?.success) { showToast("Claim failed 😕", "error"); return; }

      const icons = {
        cash: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cash-ic.png",
        listenCoin: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/SapanaCyberHub-Logo-X-Listen-og.png",
        luckCredit: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/luckCreditIcon1.png",
      };
      const labels = { cash: "Cash Reward", listenCoin: "Listen Coins", luckCredit: "Luck Credit" };

      spawnConfetti();
      a_t_d_overlay.innerHTML = `
        <div class="reward-box-a">
          <img class="reward-icon" src="${icons[data.rewardType] || ""}">
          <h2>${labels[data.rewardType] || "Reward"}</h2>
          <div class="reward-value">${data.rewardType === "cash" ? "₹" : ""}${data.rewardAmount || 0}</div>
          <button class="a-t-d-close">Close</button>
        </div>`;
      showToast("Reward claimed 🎉", "success");
      await getUser();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong 😕", "error");
    }
    return;
  }

  // ── VIBE ──────────────────────────────────────────────────────────────────
  if (!vibeBtn) return;
  const sponsorId = vibeBtn.dataset.sponsor;
  if (!sponsorId) return;

  const taskData =
    sponsorAppTasks.find((t) => String(t.sponsorId) === String(sponsorId)) ||
    sponsorAppTasksJoin.find((t) => String(t.sponsorId) === String(sponsorId));

  if (!taskData) { showToast("Task not found 😕", "error"); return; }

  // ── NOT JOINED — ad gate ──────────────────────────────────────────────────
  if (!isJoinedList) {
    if (!taskData.sponsorLink) { showToast("Download link not found 😕", "error"); return; }

    pendingJoinEventId = null;
    adOpenTime = 0;
    const isApkLink = taskData.sponsorLink.toLowerCase().endsWith(".apk");

    showAdCountdownToast(10, "Watch the ad for 10 s to activate your reward 🎁");
    pendingSponsorApkPath = taskData.sponsorLink;
    pendingSponsorId = sponsorId;
    sponsorAdOpenTime = Date.now();

    trigger(sponsorId, "dc");

    if (visibilityHandler) {
      document.removeEventListener("visibilitychange", visibilityHandler);
      visibilityHandler = null;
    }

    visibilityHandler = async () => {
      if (document.hidden) return;
      if (sponsorProcessing) return;
      sponsorProcessing = true;

      const stayed = Date.now() - sponsorAdOpenTime;
      try {
        if (stayed >= AD_WAIT_MS.dc) {
          if (pendingSponsorId) localStorage.setItem("pendingSponsorId", String(pendingSponsorId));
          showToast("Verifying reward... ⏳", "info");
          const res = await vibeInSponsor({ sponsorId: pendingSponsorId });
          await getUser();
          if (res?.data?.success) {
            showToast("Reward Activated 🎉 – tap below to open", "success");
            // 🔥 Manual open toast instead of auto window.open
            showManualOpenToast(pendingSponsorApkPath, isApkLink);
          } else {
            showToast(res?.data?.message || "Reward pending ⏳", "info");
          }
        } else {
          const secLeft = Math.ceil((AD_WAIT_MS.dc - stayed) / 1000);
          showToast(`Stay at least ${secLeft} more second(s) on the ad page.`, "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Reward failed 😕", "error");
      }

      pendingSponsorApkPath = null;
      pendingSponsorId = null;
      sponsorAdOpenTime = 0;
      document.removeEventListener("visibilitychange", visibilityHandler);
      visibilityHandler = null;
      sponsorProcessing = false;
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    a_t_d_overlay.classList.remove("active");

  // ── JOINED — redirect ─────────────────────────────────────────────────────
  } else {
    const link = taskData.sponsorLink;
    if (!link) { showToast("No link found for this task 😕", "error"); return; }
    a_t_d_overlay.classList.remove("active");

    // 🔥 Manual redirect toast (no auto-open)
    showManualOpenToast(link, link.toLowerCase().endsWith(".apk"));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  MANUAL OPEN TOAST (Popup‑blocker proof)
// ══════════════════════════════════════════════════════════════════════════════
function showManualOpenToast(url, isApk = false) {
  document.getElementById("manual-open-toast")?.remove();

  const toast = document.createElement("div");
  toast.id = "manual-open-toast";
  toast.className = "dtc-redirect-toast";
  toast.innerHTML = `
    <div class="dtc-rt-top">
      <div class="dtc-rt-info">
        <h4>${isApk ? "📲 Open App" : "🔗 Visit Sponsor"}</h4>
        <p>Tap the button below to open the link</p>
      </div>
    </div>
    <button class="dtc-rt-btn" id="manual-open-btn">${isApk ? "Open App" : "Open Link"}</button>
    <button class="a-t-d-close" id="manual-close-btn" style="margin-top:8px;">✕ Close</button>`;

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("dtc-show"));

  document.getElementById("manual-open-btn")?.addEventListener("click", () => {
    if (isApk) {
      downloadSponsorApk(url);
    } else {
      window.open(url, "_blank");
    }
    toast.remove();
  });

  document.getElementById("manual-close-btn")?.addEventListener("click", () => toast.remove());
  setTimeout(() => toast.remove(), 30000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  DOWNLOAD SPONSOR APK (handles both URLs and storage paths)
// ══════════════════════════════════════════════════════════════════════════════
async function downloadSponsorApk(apkPath) {
  try {
    if (apkPath.startsWith("http://") || apkPath.startsWith("https://")) {
      window.open(apkPath, "_blank");
      showToast("Downloading app… 📥", "success");
      return;
    }
    const url = await getDownloadURL(ref(storage, apkPath));
    window.open(url, "_blank");
    showToast("Downloading app… 📥", "success");
  } catch (err) {
    console.error("APK download failed:", err);
    showToast("Download failed 😕", "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROGRESS TOAST
// ══════════════════════════════════════════════════════════════════════════════
function showProgressToast(steps = []) {
  document.querySelector(".progress-toast")?.remove();
  if (!document.getElementById("progress-toast-styles")) {
    const s = document.createElement("style");
    s.id = "progress-toast-styles";
    s.textContent = `
      .progress-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;
        background:#1a1a2e;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px 20px;
        min-width:300px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.4);
        animation:ptUp .35s cubic-bezier(.34,1.56,.64,1) forwards;}
      .progress-toast.pt-exit{animation:ptDown .3s ease-in forwards;}
      @keyframes ptUp  {from{opacity:0;transform:translateX(-50%) translateY(30px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      @keyframes ptDown{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(30px)}}
      .pt-header{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
      .pt-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.15);border-top-color:#a78bfa;
        border-radius:50%;animation:ptSpin .7s linear infinite;flex-shrink:0;}
      .pt-spinner.done,.pt-spinner.error{border:none;font-size:16px;line-height:18px;animation:none;}
      @keyframes ptSpin{to{transform:rotate(360deg)}}
      .pt-title{color:#e2e8f0;font-size:13px;font-weight:600;flex:1;}
      .pt-steps{display:flex;flex-direction:column;gap:6px;}
      .pt-step{display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,.35);transition:color .3s;}
      .pt-step.active{color:#a78bfa;}.pt-step.done{color:rgba(255,255,255,.65);}
      .pt-step-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.15);flex-shrink:0;transition:background .3s,box-shadow .3s;}
      .pt-step.active .pt-step-dot{background:#a78bfa;box-shadow:0 0 8px #a78bfa;}
      .pt-step.done  .pt-step-dot{background:#22c55e;}
      .pt-bar-wrap{margin-top:12px;height:4px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;}
      .pt-bar{height:100%;width:0%;background:linear-gradient(90deg,#a78bfa,#818cf8);border-radius:4px;transition:width .5s cubic-bezier(.4,0,.2,1);}
      .pt-result{margin-top:10px;font-size:12px;font-weight:600;text-align:center;border-radius:8px;padding:6px 10px;}
      .pt-result.success{color:#22c55e;background:rgba(34,197,94,.1);}
      .pt-result.error  {color:#ef4444;background:rgba(239,68,68,.1);}`;
    document.head.appendChild(s);
  }

  const toast = document.createElement("div");
  toast.className = "progress-toast";
  toast.innerHTML = `
    <div class="pt-header">
      <div class="pt-spinner" id="pt-spinner"></div>
      <span class="pt-title" id="pt-title">Joining event…</span>
    </div>
    <div class="pt-steps">
      ${steps.map((s, i) => `<div class="pt-step" data-step="${i}"><div class="pt-step-dot"></div><span>${s}</span></div>`).join("")}
    </div>
    <div class="pt-bar-wrap"><div class="pt-bar" id="pt-bar"></div></div>`;
  document.body.appendChild(toast);

  const spinnerEl = toast.querySelector("#pt-spinner");
  const titleEl = toast.querySelector("#pt-title");
  const barEl = toast.querySelector("#pt-bar");

  const update = (idx) => {
    toast.querySelectorAll(".pt-step").forEach((el, i) => {
      el.classList.remove("active", "done");
      if (i < idx) el.classList.add("done");
      if (i === idx) el.classList.add("active");
    });
    barEl.style.width = (steps.length > 1 ? Math.round((idx / (steps.length - 1)) * 90) : 50) + "%";
  };

  const finish = (ok, message) => {
    if (ok) toast.querySelectorAll(".pt-step").forEach((el) => { el.classList.remove("active"); el.classList.add("done"); });
    barEl.style.width = ok ? "100%" : barEl.style.width;
    barEl.style.background = ok
      ? "linear-gradient(90deg,#22c55e,#16a34a)"
      : "linear-gradient(90deg,#ef4444,#dc2626)";
    spinnerEl.className = `pt-spinner ${ok ? "done" : "error"}`;
    spinnerEl.textContent = ok ? "✅" : "❌";
    titleEl.textContent = ok ? "Done!" : "Failed";
    const r = document.createElement("div");
    r.className = `pt-result ${ok ? "success" : "error"}`;
    r.textContent = message;
    toast.appendChild(r);
    setTimeout(() => { toast.classList.add("pt-exit"); setTimeout(() => toast.remove(), 350); }, ok ? 3000 : 4000);
  };

  update(0);
  return { update, finish };
}

// ══════════════════════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════════════════════
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close">&times;</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("fade-out"); setTimeout(() => toast.remove(), 300); }, 5000);
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.add("fade-out"); setTimeout(() => toast.remove(), 300);
  });
  return toast;
}

// ══════════════════════════════════════════════════════════════════════════════
//  AD COUNTDOWN TOAST
// ══════════════════════════════════════════════════════════════════════════════
function showAdCountdownToast(seconds, label = `Stay on the ad for ${seconds} s to continue`) {
  const toast = showToast(`⏳ ${label} — <strong id="ad-cd">${seconds}</strong>s remaining`, "info");
  const cdEl = toast?.querySelector("#ad-cd");
  if (!cdEl) return;
  let remaining = seconds;
  const iv = setInterval(() => {
    remaining--;
    if (cdEl.isConnected) cdEl.textContent = remaining;
    if (remaining <= 0) clearInterval(iv);
  }, 1000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SCROLL HIGHLIGHT
// ══════════════════════════════════════════════════════════════════════════════
function enableScrollHighlight(gridEl, cards, events) {
  if (!gridEl || !cards?.length) return;
  const update = () => {
    const center = gridEl.getBoundingClientRect().left + gridEl.getBoundingClientRect().width / 2;
    let closest = null, minDist = Infinity;
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - center);
      if (d < minDist) { minDist = d; closest = c; }
    });
    cards.forEach((c) => { if (c !== closest) { c.classList.remove("active"); c.dataset.animated = "false"; } });
    if (closest && !closest.classList.contains("active")) {
      closest.classList.add("active");
      const prizeSpan = closest.querySelector(".dynamic-prize");
      const eId = closest.querySelector(".hit-btn")?.dataset.eventid || closest.querySelector(".join")?.dataset.eventid;
      const ed = events.find((e) => e.eventId === eId);
      if (prizeSpan && ed && closest.dataset.animated !== "true") {
        animatePrizeValue(prizeSpan, 0, calculatePrizePool(Number(ed.totalViber || 0)), 2000);
        closest.dataset.animated = "true";
      }
    }
  };
  gridEl.addEventListener("scroll", update, { passive: true });
  update();
}

// ══════════════════════════════════════════════════════════════════════════════
//  UI INIT
// ══════════════════════════════════════════════════════════════════════════════
function init() {
  if (!uiData || !userBalance) return;
  userBalance.textContent = `₹${uiData.cash}`;
  checkusercheckin();
}

function animatePrizeValue(element, start, end, duration) {
  let ts0 = null;
  const fv = typeof end === "string" ? parseInt(end.replace(/\D/g, "")) : end;
  const ease = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const step = (ts) => {
    if (!ts0) ts0 = ts;
    const p = Math.min((ts - ts0) / duration, 1);
    element.textContent = `₹${Math.max(0, Math.floor(ease(p) * (fv - start) + start)).toLocaleString("en-IN")}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showSkeletons(container, count = 3) {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "skeleton-card";
    container.appendChild(s);
  }
}

suggestEvent?.addEventListener("click", () => eventPPage?.scrollIntoView({ behavior: "smooth" }));

// ══════════════════════════════════════════════════════════════════════════════
//  LOTTIE
// ══════════════════════════════════════════════════════════════════════════════
function playLottie(path, loop = true) {
  if (currentLottieInstance) { currentLottieInstance.destroy(); currentLottieInstance = null; fireContainer.innerHTML = ""; }
  currentLottieInstance = lottie.loadAnimation({ container: fireContainer, renderer: "svg", loop, autoplay: true, path });
  return currentLottieInstance;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CHECK-IN BUTTON  🔒 AUTH GUARDED
// ══════════════════════════════════════════════════════════════════════════════
checkInBtn?.addEventListener("click", () => {
  if (requireAuth()) return;

  fireContainer.classList.add("active");
  checkInBtn.classList.add("active-check");
  playLottie("/assets/anim/fire.json");
  let streakDays = getStreakDays(uiData);
  updateStreakUI(streakDays + 1, streakDays || 0);
  checkInBtn.style.pointerEvents = "none";
});

function getStreakDays(uiData) {
  if (!uiData?.lastCheckInDay) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const lastDay = uiData.lastCheckInDay;
  if (lastDay === today) return uiData.streakDays || 0;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastDay === yesterday) return uiData.streakDays || 0;
  return 0;
}

function showDailyCheckInRewardDialog() {
  if (!uiData) return;
  const today = new Date().toISOString().slice(0, 10);
  if (uiData.lastCheckInDay === today) return;
  let streakDays = getStreakDays(uiData);
  checkInOverlay?.classList.add("active");
  const streak = document.getElementById("count");
  if (streak) streak.textContent = streakDays;
  fireContainer?.classList.add("active");
  currentLottieInstance = playLottie("/assets/anim/Gift.json", true);
}

async function updateStreakUI(newVal, startVal) {
  const countEl = document.getElementById("count");
  if (!countEl) return;
  try {
    trigger("", "dc");
    const result = await dailyCheckIn();
    if (!result?.data) throw new Error("No data");
    const finalVal = result.data.newStreak;
    let ts0 = null;
    const duration = 800;
    const step = (ts) => {
      if (!ts0) ts0 = ts;
      const p = Math.min((ts - ts0) / duration, 1);
      countEl.textContent = Math.floor(p * (finalVal - startVal) + startVal);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        countEl.classList.add("trigger-bounce");
        fireContainer.classList.remove("active");
        checkInBtn.classList.remove("active-check");
        if (currentLottieInstance) { currentLottieInstance.destroy(); currentLottieInstance = null; fireContainer.innerHTML = ""; }
        rewardContainer?.classList.add("active");
        setTimeout(() => {
          countEl.classList.remove("trigger-bounce");
          showRewardBox(result.data.isLCReward, result.data.rewardAmount);
          getUser();
        }, 1200);
      }
    };
    requestAnimationFrame(step);
  } catch (err) {
    console.error("Check-in failed:", err.message);
    showToast("Check-in failed. Please try again.", "error");
    checkInBtn?.classList.remove("active-check");
  }
}

function showRewardBox(isLC = true, amount = 0) {
  if (!rewardContainer) return;
  const rewardText = document.getElementById("a");
  const iconBox = document.getElementById("r-i");
  if (!rewardText || !iconBox) return;
  rewardText.textContent = isLC ? `${amount} LC` : `₹${amount}`;
  iconBox.src = isLC
    ? "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/SapanaCyberHub-Logo-X-Listen-og.png"
    : "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cash-ic.png";
  rewardContainer.classList.add("active");
  spawnConfetti();
  setTimeout(() => {
    rewardContainer.classList.remove("active");
    checkInOverlay?.classList.remove("active");
    currentLottieInstance?.destroy();
  }, 4000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONFETTI
// ══════════════════════════════════════════════════════════════════════════════
function spawnConfetti(count = 80) {
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
  if (!document.getElementById("confetti-kf")) {
    const s = document.createElement("style");
    s.id = "confetti-kf";
    s.textContent = `@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}`;
    document.head.appendChild(s);
  }
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    const size = Math.random() * 8 + 4;
    d.style.cssText = `position:fixed;pointer-events:none;z-index:99999;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw;top:-10px;
      animation:confettiFall ${Math.random() * 2 + 1.5}s ease-in ${Math.random() * .5}s forwards;`;
    document.body.appendChild(d);
    d.addEventListener("animationend", () => d.remove());
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PLAYER VISIBILITY
// ══════════════════════════════════════════════════════════════════════════════
function updatePlayerVisibility() {
  if (!frame) return;
  if (!listenEventsJoin.length) {
    frame.classList.add("not-joined");
    frame.classList.remove("joined");
    if (eventIdEl) eventIdEl.textContent = "Join an event to stream here!";
    c_s_p?.classList.remove("enable");
    suggestEvent?.classList.add("enable");
    return;
  }
  frame.classList.add("joined");
  frame.classList.remove("not-joined");
  suggestEvent?.classList.remove("enable");
  if (eventIdEl) eventIdEl.style.display = "none";
  c_s_p?.classList.add("enable");
  marathon.mount();
}

// ══════════════════════════════════════════════════════════════════════════════
//  PULL-TO-REFRESH
// ══════════════════════════════════════════════════════════════════════════════
function setupPullToRefresh() {
  let startY = 0, pulling = false;
  document.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchmove", (e) => { if (window.scrollY === 0 && e.touches[0].clientY - startY > 80) pulling = true; }, { passive: true });
  document.addEventListener("touchend", async () => {
    if (!pulling) return;
    pulling = false;
    showToast("Refreshing… 🔄", "info");
    await getUser();
    const jo = isJoinedList;
    renderVibingListenEvents(jo && joinedType === "L");
    renderVibingHitEvents(jo && joinedType === "H");
    renderLakhpatiLoops(jo && joinedType === "PL");
    renderSponsorAppTasks(jo && joinedType === "SAT");
    showToast("Refreshed! ✅", "success");
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  PWA INSTALL PROMPT (once per session, for non‑standalone)
// ══════════════════════════════════════════════════════════════════════════════
function initPWAInstallPrompt() {
  // Only show if not already installed as PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return;
  // Only once per session
  if (sessionStorage.getItem("installPromptShown")) return;
  sessionStorage.setItem("installPromptShown", "1");

  // Wait a bit for page to settle
  setTimeout(showInstallBanner, 3000);
}

function showInstallBanner() {
  // Don't show if user already dismissed in previous sessions? We'll use session only.
  const banner = document.createElement("div");
  banner.id = "pwa-install-banner";
  banner.innerHTML = `
    <div class="pwa-install-card">
      <div class="pwa-install-close">&times;</div>
      <div class="pwa-install-icon">📲</div>
      <h3>Get the Official App</h3>
      <p>Install SapanaCyberHub for a better experience and earn <strong>₹20 bonus!</strong></p>
      <button class="pwa-install-btn" id="pwa-install-btn">Install Now &amp; Earn ₹20</button>
    </div>`;
  // Minimal styles inline to avoid collisions
  const style = document.createElement("style");
  style.textContent = `
    #pwa-install-banner {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      z-index: 100000; width: 90%; max-width: 400px;
      animation: pwaSlideUp 0.4s ease;
    }
    @keyframes pwaSlideUp {
      from { transform: translateX(-50%) translateY(100px); opacity: 0; }
      to   { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    .pwa-install-card {
      background: linear-gradient(135deg, #1e1e2f, #151522);
      border: 1px solid rgba(167,139,250,.25);
      border-radius: 20px;
      padding: 24px 20px 20px;
      color: #fff;
      text-align: center;
      box-shadow: 0 12px 40px rgba(0,0,0,.5);
      position: relative;
    }
    .pwa-install-close {
      position: absolute; top: 10px; right: 14px;
      font-size: 22px; color: rgba(255,255,255,.5);
      cursor: pointer;
    }
    .pwa-install-icon { font-size: 48px; margin-bottom: 8px; }
    .pwa-install-card h3 { margin: 0 0 6px; font-size: 18px; font-weight: 700; }
    .pwa-install-card p { margin: 0 0 16px; font-size: 13px; color: rgba(255,255,255,.6); line-height: 1.5; }
    .pwa-install-btn {
      background: linear-gradient(135deg, #a78bfa, #7c3aed);
      border: none; border-radius: 14px;
      padding: 14px 20px; color: #fff; font-size: 15px; font-weight: 700;
      cursor: pointer; width: 100%; font-family: inherit;
      transition: transform .15s, box-shadow .15s;
      box-shadow: 0 4px 18px rgba(124,58,237,.4);
    }
    .pwa-install-btn:active { transform: scale(.97); }
  `;
  document.head.appendChild(style);
  document.body.appendChild(banner);

  document.querySelector(".pwa-install-close")?.addEventListener("click", () => banner.remove());
  document.getElementById("pwa-install-btn")?.addEventListener("click", () => {
    banner.remove();
    // Navigate to the sponsor app tasks tab
    const tabBtn = document.querySelector(`.vibing-btn[data-event-type="SAT"]`);
    if (tabBtn) {
      tabBtn.click();  // switch to "Sponsor App Tasks" tab
      setTimeout(() => {
        appTaskList?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else {
      // fallback: just scroll to task list
      appTaskList?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  PARTICLES
// ══════════════════════════════════════════════════════════════════════════════
const pc = document.getElementById("particles");
for (let i = 0; i < 45; i++) {
  const p = document.createElement("div");
  p.className = "particle";
  const s = Math.random() * 2.5 + 1;
  p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;--dur:${(Math.random() * 5 + 3).toFixed(1)}s;--delay:-${(Math.random() * 8).toFixed(1)}s;--op:${(Math.random() * .28 + .08).toFixed(2)};`;
  pc?.appendChild(p);
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMING SOON BUTTONS
// ══════════════════════════════════════════════════════════════════════════════
document.querySelector(".lol-btn")?.addEventListener("click", () =>   window.location.href = "/official/XLoL/");
document.querySelector(".arena-btn")?.addEventListener("click", () => {showToast("E-Sport Arena is coming soon!", "info")});