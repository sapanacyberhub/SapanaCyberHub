import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// ─── Firebase ───────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1"
};

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const storage   = getStorage(app);
const functions = getFunctions(app);

// ─── Callables ──────────────────────────────────────────────────────────────
const dailyCheckIn             = httpsCallable(functions, "dailyCheckIn");
const connectUser              = httpsCallable(functions, "loadUserData");
// FIX: was `functions.httpsCallable(...)` — old v8 syntax, throws with modular SDK
const getPlayList              = httpsCallable(functions, "getPlayList");
const startListeningSession    = httpsCallable(functions, "startListeningSession");
const completeListeningSession = httpsCallable(functions, "completeListeningSession");
const getEvents                = httpsCallable(functions, "getEvents");
const joinvibeEvents           = httpsCallable(functions, "vibeInEvent");
const vibeInSponsor            = httpsCallable(functions, "vibeInSponsor");
const getSponsorTasks          = httpsCallable(functions, "getSponsorAppTasks");
const getSponsorTaskLeaderBoard = httpsCallable(functions, "getLeaderBoard");
const claimSponsorReward       = httpsCallable(functions, "claimMyReward");

// ─── DOM References ─────────────────────────────────────────────────────────
const eventPPage    = document.getElementById("event-page");
const dialog        = document.getElementById("over-hidden");
const dialogCloseBtn = document.getElementById("dialog-close");
const dialogTitle   = document.getElementById("event-tittle");
const dialogPrize   = document.getElementById("event-prize");
const explain       = document.getElementById("prizePoolExplain");
const closeBtn      = document.getElementById("dialog-close");
const joinVibe      = document.getElementById("join-now");
const a_t_d_overlay = document.getElementById("app-task-overlay");
const userNameEl    = document.getElementById("user_name");
const userBalance   = document.getElementById("user_earning");
const vibingBtns    = document.querySelectorAll(".vibing-btn");
const vibingOverBtns = document.querySelectorAll(".vibing-over-btn");
const fireContainer = document.getElementById("fire");
const checkInBtn    = document.getElementById("check-in-btn");

// player / header
const floatGirl   = document.getElementById("floatingGirl");
const vibe        = document.getElementById("audio-ring");
const timmer      = document.getElementById("accumulated-timmer");
const frame       = document.querySelector(".player-frame");
const eventIdEl   = document.getElementById("vibing-event-id");
const suggestEvent = document.getElementById("suggest-event");
const c_s_p       = document.getElementById("custom-yt-playlist");
const c_s_input   = document.getElementById("c-s");

const checkInOverlay  = document.getElementById("d-v-c-s-overlay");
const rewardContainer = document.getElementById("r-b");
const hit_grid        = document.getElementById("hit-event-grid");
const listen_grid     = document.getElementById("listen-event-grid");
const premiumLegue    = document.getElementById("lakhpati-loop");
const appTaskList     = document.getElementById("task-list");

// ─── Ad Links ───────────────────────────────────────────────────────────────
const linksL   = [
  "https://omg10.com/4/10260662",
  "https://omg10.com/4/10260660",
  "https://www.effectivegatecpm.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861"
];
const linksH   = [
  "https://omg10.com/4/10619467",
  "https://omg10.com/4/10216281",
  "https://www.effectivegatecpm.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861"
];
const linksDCI = ["https://omg10.com/4/10619475"];

// ─── Constants ──────────────────────────────────────────────────────────────
const EVENT_TYPE_INDEX = { listen: 1, hit: 2, lakhpati: 3, cash: 4 };
const AD_WAIT_MS       = { listen: 10000, hit: 10000, dc: 10000 };

// ─── Global State ───────────────────────────────────────────────────────────
let uiData              = null;
let currentUser         = null;
let currentLottieInstance = null;

const listenEvents       = [];
const listenEventsJoin   = [];
const hitEvents          = [];
const hitEventsJoin      = [];
const lakhpatiLoops      = [];
const lakhpatiLoopsJoin  = [];
const cashHaandis        = [];
const cashHaandisJoin    = [];
const sponsorAppTasks    = [];
const sponsorAppTasksJoin = [];

let adOpenTime          = 0;
let adLocked            = false;
let pendingJoinEventId  = null;
let pendingJoinEventType = null;
let pendingSponsorApkPath = null;
let pendingSponsorId    = null;
let sponsorAdOpenTime   = 0;
let adIndexL            = 0;
let isJoinedList        = false;
let joinedType          = null;

// ─── YT Player State ────────────────────────────────────────────────────────
let player         = null;   // YT.Player instance
let seconds        = 0;      // accumulated UI display seconds — FIX: reset per song
let timerInterval  = null;   // UI tick interval
let vibingEventId  = null;   // FIX: was declared but never assigned — now set in updatePlayerVisibility
let sessionId      = null;   // active server session
let sessionToken   = null;   // active server session token
let currentVideoId = null;   // youtube video id in player
let playerReady    = false;  // has onYouTubeIframeAPIReady fired?
let playlist       = [];     // songs from Firebase + user additions
let playlistIndex  = 0;      // current position

// ─── Bootstrap ──────────────────────────────────────────────────────────────
showSkeletons(listen_grid);
showSkeletons(hit_grid);
showSkeletons(premiumLegue);
showSkeletons(appTaskList);
setupNetworkBanner();
setupPullToRefresh();

// ══════════════════════════════════════════════════════════════════════════════
//  YOUTUBE IFRAME API
//  FIX: was defined inside handleplayer() async function — YouTube calls
//       window.onYouTubeIframeAPIReady as a global, so it was invisible to YT
//       and the player NEVER initialized.
//  FIX: handleplayer() was async and could be called multiple times from
//       updatePlayerVisibility, leaking intervals and YT instances each call.
//       All player logic is now flat at module scope, initialized exactly once.
// ══════════════════════════════════════════════════════════════════════════════
window.onYouTubeIframeAPIReady = function () {
  playerReady = true;

  player = new YT.Player("player", {
    events: {
      onReady:       _onPlayerReady,
      onStateChange: _onPlayerStateChange
    }
  });
};

function _onPlayerReady() {
  // FIX: syncSapanaPlaylist was defined but never called — now called here
  syncSapanaPlaylist();
}

function _onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    _startTimer();
    vibe?.classList.add("active-audio");
    floatGirl?.classList.add("vibe-active");
  } else {
    _stopTimer();
    vibe?.classList.remove("active-audio");
    floatGirl?.classList.remove("vibe-active");
  }

  // FIX: showFinishPopup was called but never defined → ReferenceError every song end
  if (event.data === YT.PlayerState.ENDED) {
    _onSongEnd();
  }
}

// ── Fetch playlist from Firebase and load a random starting song
async function syncSapanaPlaylist() {
  if (!player || !playerReady) return;
  try {
    const result = await getPlayList();
    const songs  = result?.data;
    if (songs && songs.length > 0) {
      playlist      = songs;
      playlistIndex = Math.floor(Math.random() * songs.length);
      _loadSong(playlist[playlistIndex]);
      showToast("Playlist ready! Press play to vibe 🎧", "success");
    } else {
      showToast("No songs in playlist yet", "info");
    }
  } catch (err) {
    console.error("syncSapanaPlaylist error:", err);
    showToast("Could not load playlist. Try refreshing.", "error");
  }
}

// ── Load a song into YT player and start a server session
// FIX: was cueVideoById — doesn't autoplay. loadVideoById autoplays.
async function _loadSong(song) {
  if (!player || !song?.youtubeId) return;

  currentVideoId = song.youtubeId;

  // FIX: seconds was never reset between songs — accumulated forever
  seconds = 0;
  _updateTimerUI();

  player.loadVideoById(currentVideoId);

  if (!vibingEventId) return;
  try {
    const res    = await startListeningSession({ videoId: currentVideoId, eventId: vibingEventId });
    sessionId    = res.data.sessionId;
    sessionToken = res.data.sessionToken;
  } catch (err) {
    console.error("startListeningSession error:", err);
    showToast("Session start failed. Progress may not be tracked.", "error");
  }
}

// ── Song finished naturally → complete session → show ad popup
async function _onSongEnd() {
  await _completeSession();
  _showSongEndPopup();
}

// ── Complete server session gracefully
async function _completeSession() {
  if (!sessionId || !sessionToken) return;
  try {
    await completeListeningSession({ sessionId, sessionToken });
  } catch (err) {
    const code = err?.code?.replace("functions/", "");
    if (code === "failed-precondition") {
      showToast("Not enough watch time for full credit 🎧", "info");
    } else {
      console.error("completeListeningSession error:", err);
    }
  } finally {
    sessionId    = null;
    sessionToken = null;
  }
}

// ── Ad popup after song ends: watch ad → next song
function _showSongEndPopup() {
  document.querySelector(".song-end-popup")?.remove();

  const popup = document.createElement("div");
  popup.className = "song-end-popup listen-popup";
  popup.innerHTML = `
    <div class="listen-popup-inner">
      <h2>🎧 Song Finished!</h2>
      <p>Watch a short ad to unlock the next song and keep growing your listening time.</p>
      <button id="sep-watch-ad">Watch Ad &amp; Continue</button>
      <button id="sep-stop">Stop Listening</button>
    </div>`;
  document.body.appendChild(popup);

  popup.querySelector("#sep-watch-ad").addEventListener("click", () => {
    trigger("", "listen");
    const adStart = Date.now();

    const handleReturn = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", handleReturn);
      const stayed = Date.now() - adStart;
      if (stayed >= 5000) {
        popup.remove();
        _playNextSong();
      } else {
        showToast(`Stay on the ad a bit longer (${Math.ceil((5000 - stayed) / 1000)}s more) 🙏`, "error");
      }
    };
    document.addEventListener("visibilitychange", handleReturn);
  });

  popup.querySelector("#sep-stop").addEventListener("click", () => {
    popup.remove();
    player?.stopVideo();
  });
}

// ── Advance to the next song (wraps around)
async function _playNextSong() {
  if (!playlist.length) { showToast("Playlist is empty 🎧", "info"); return; }
  playlistIndex = (playlistIndex + 1) % playlist.length;
  await _loadSong(playlist[playlistIndex]);
}

// ── UI timer
function _startTimer() {
  if (timerInterval) return; // guard: don't double-start
  timerInterval = setInterval(() => { seconds++; _updateTimerUI(); }, 1000);
}

function _stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function _updateTimerUI() {
  if (!timmer) return;
  const hrs  = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  timmer.innerHTML = `${hrs}:${mins}:${secs} <strong>• SapanaCyberHub X Listen</strong>`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CUSTOM PLAYLIST INPUT
// ══════════════════════════════════════════════════════════════════════════════
if (c_s_input) {
  const handleCustomInput = () => {
    const link = c_s_input.value.trim();
    if (!link) return;
    const id = _extractYouTubeId(link);
    if (!id) {
      showToast("That link isn't supported. Paste a YouTube URL 🎵", "error");
      return;
    }
    playlist.push({ youtubeId: id, title: "Custom Song" });
    c_s_input.value = "";
    showToast("Song added to playlist 🎵", "success");
  };

  c_s_input.addEventListener("paste",  () => setTimeout(handleCustomInput, 50));
  c_s_input.addEventListener("keydown", e => { if (e.key === "Enter") handleCustomInput(); });
  c_s_input.addEventListener("change",  handleCustomInput);
}

function _extractYouTubeId(url) {
  try {
    const u    = new URL(url.trim());
    const host = u.hostname.replace("www.", "");
    if (host === "youtube.com") {
      if (u.searchParams.get("v"))            return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/"))  return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/live/"))    return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/embed/"))   return u.pathname.split("/")[2];
    }
    if (host === "youtu.be") return u.pathname.slice(1).split("?")[0];
  } catch { /* fall through */ }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
//  updatePlayerVisibility
//  FIX: vibingEventId now assigned from the first joined event
//  FIX: handleplayer() removed — was async, called repeatedly, leaked instances
// ══════════════════════════════════════════════════════════════════════════════
function updatePlayerVisibility() {
  if (!frame) return;

  if (listenEventsJoin.length === 0) {
    frame.classList.add("not-joined");
    frame.classList.remove("joined");
    if (eventIdEl) eventIdEl.textContent = "Join an event to stream here!";
    c_s_p?.classList.remove("enable");
    suggestEvent?.classList.add("enable");
    vibingEventId = null;
    _stopTimer();
    return;
  }

  frame.classList.add("joined");
  frame.classList.remove("not-joined");
  suggestEvent?.classList.remove("enable");
  if (eventIdEl) eventIdEl.style.display = "none";
  c_s_p?.classList.add("enable");

  // FIX: assign vibingEventId so session calls have the correct event
  vibingEventId = listenEventsJoin[0]?.eventId || null;

  // If YT player already ready, sync playlist now; otherwise
  // window.onYouTubeIframeAPIReady → _onPlayerReady will call it
  if (playerReady && player) syncSapanaPlaylist();
}

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
  window.addEventListener("online",  () => {
    banner.style.display = "none";
    showToast("Back online! 🎉", "success");
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    if (userNameEl) userNameEl.textContent = user.displayName || user.email?.split("@")[0];
    await getUser();
    renderVibingListenEvents(false);
    renderVibingHitEvents(false);
    renderLakhpatiLoops(false);
    renderSponsorAppTasks();
  } else {
    currentUser = null;
    if (userNameEl) userNameEl.textContent = "Log In";
    renderVibingListenEvents(false);
    renderVibingHitEvents(false);
    renderLakhpatiLoops(false);
    renderSponsorAppTasks();
  }
});

if (userNameEl) {
  userNameEl.addEventListener("click", () => {
    window.location.href = currentUser
      ? "/online-earning/listen-enjoy-earn/profile/index.html"
      : "/online-earning/listen-enjoy-earn/create-vibers/index.html";
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  USER DATA
// ══════════════════════════════════════════════════════════════════════════════
async function getUser() {
  try {
    const result = await connectUser();
    if (!result?.data) return null;
    const { success, userData } = result.data;
    if (!success) return null;
    uiData = userData;
    init();
    await Promise.all([getEventList(), getSponsorTasksList()]);
    return uiData;
  } catch (err) {
    console.error("Failed to load user data:", err);
    showToast("Failed to load your data. Please refresh.", "error");
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CHECK-IN
// ══════════════════════════════════════════════════════════════════════════════
function checkusercheckin() {
  if (!verifyDCI(uiData?.lastCheckIn)) showDailyCheckInRewardDialog(false);
}

function verifyDCI(lastCheckIn) {
  if (!lastCheckIn?._seconds) return false;
  const last = new Date(lastCheckIn._seconds * 1000);
  const now  = new Date();
  return last.getFullYear() === now.getFullYear()
    && last.getMonth()      === now.getMonth()
    && last.getDate()       === now.getDate();
}

// ══════════════════════════════════════════════════════════════════════════════
//  FETCH EVENTS
// ══════════════════════════════════════════════════════════════════════════════
async function getEventList() {
  try {
    listenEvents.length = listenEventsJoin.length = 0;
    hitEvents.length    = hitEventsJoin.length    = 0;
    lakhpatiLoops.length = lakhpatiLoopsJoin.length = 0;
    cashHaandis.length  = cashHaandisJoin.length  = 0;

    const [r1, rj1, r2, rj2, r3, rj3, r4, rj4] = await Promise.all([
      getEvents({ i: 1, needJoined: false }), getEvents({ i: 1, needJoined: true }),
      getEvents({ i: 2, needJoined: false }), getEvents({ i: 2, needJoined: true }),
      getEvents({ i: 3, needJoined: false }), getEvents({ i: 3, needJoined: true }),
      getEvents({ i: 4, needJoined: false }), getEvents({ i: 4, needJoined: true }),
    ]);

    if (r1.data?.events)  listenEvents.push(...r1.data.events);
    if (rj1.data?.events) listenEventsJoin.push(...rj1.data.events);
    if (r2.data?.events)  hitEvents.push(...r2.data.events);
    if (rj2.data?.events) hitEventsJoin.push(...rj2.data.events);
    if (r3.data?.events)  lakhpatiLoops.push(...r3.data.events);
    if (rj3.data?.events) lakhpatiLoopsJoin.push(...rj3.data.events);
    if (r4.data?.events)  cashHaandis.push(...r4.data.events);
    if (rj4.data?.events) cashHaandisJoin.push(...rj4.data.events);

    updatePlayerVisibility();
  } catch (err) {
    console.error("Failed to fetch events:", err);
    showToast("Could not load events. Try refreshing.", "error");
  }
}

async function getSponsorTasksList() {
  try {
    sponsorAppTasks.length = sponsorAppTasksJoin.length = 0;
    const [res, resJoin] = await Promise.all([
      getSponsorTasks({ needJoined: false }),
      getSponsorTasks({ needJoined: true }),
    ]);
    if (res.data?.success     && res.data.sponsors)     sponsorAppTasks.push(...res.data.sponsors);
    if (resJoin.data?.success && resJoin.data.sponsors) sponsorAppTasksJoin.push(...resJoin.data.sponsors);
  } catch (err) {
    console.error("Failed to fetch sponsor tasks:", err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function calculatePrizePool(totalViber) {
  return Math.min(Math.floor(100 + totalViber * 0.30 * 0.4), 50000);
}

function startCountdown(el, endTime) {
  if (!el || !endTime?._seconds) { if (el) el.textContent = "Live"; return; }
  const endMs = endTime._seconds * 1000;
  const tick  = () => {
    const diff = Math.max(0, endMs - Date.now());
    const h    = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m    = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s    = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    el.textContent = diff > 0 ? `${h}:${m}:${s}` : "Ended";
  };
  tick();
  setInterval(tick, 1000);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadSponsorApk(apkPath) {
  try {
    const url = await getDownloadURL(ref(storage, apkPath));
    window.open(url, "_blank");
    showToast("Downloading app… 📥", "success");
  } catch (err) {
    console.error("APK download failed:", err);
    showToast("Download failed 😕", "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  RENDER — SPONSOR TASKS
// ══════════════════════════════════════════════════════════════════════════════
function renderSponsorAppTasks(vibeOver = false) {
  if (!appTaskList) return;
  appTaskList.innerHTML = "";

  const fullList = vibeOver ? sponsorAppTasksJoin : sponsorAppTasks;
  const tasks    = vibeOver
    ? fullList
    : fullList.filter(t => !sponsorAppTasksJoin.some(j => j.sponsorId === t.sponsorId));

  if (!tasks.length) {
    appTaskList.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any sponsor tasks yet!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No sponsor tasks available right now. Try again later.</p></div>`;
    return;
  }

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "t-b";

    const progressHTML = (vibeOver && !task.isComplete)
      ? `<div class="task-progress-bar"><div class="task-progress-fill" style="width:${Math.round(((task.stepsCompleted || 0) / (task.allSteps || 1)) * 100)}%"></div></div>`
      : "";

    const stepsText = vibeOver
      ? (task.isComplete ? "✅ Completed" : `${task.stepsCompleted || 0}/${task.allSteps || 0}`)
      : "Vibe";

    card.innerHTML = `
      <div class="a-t-h">
        <img class="app-icon" loading="lazy"
          src="${task.sponsorAppLogoUrl || 'https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/app-icon-placeholder.png'}"
          alt="app-task"/>
        <strong class="a-n">${task.sponsorAppName || ""}</strong>
      </div>
      ${progressHTML}
      <span class="t-d">
        <strong class="t-p-p">₹${task.taskPool || 0}</strong>
        <strong class="a-t-get" data-task-id="${task.sponsorId}">${stepsText}</strong>
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
  const events   = vibeOver
    ? fullList
    : fullList.filter(e => !listenEventsJoin.some(j => j.eventId === e.eventId));

  if (!events.length) {
    listen_grid.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No active listen events right now. Check back soon!</p></div>`;
    return;
  }

  events.forEach(event => {
    const card      = document.createElement("article");
    const fee       = Number(event.eventEntryFee || 0);
    const vibers    = Number(event.totalViber || 0);
    const prizePool = calculatePrizePool(vibers);

    card.className = "event-card";
    card.innerHTML = `
      <div class="event-tag-row">
        <span class="vibe-dot"></span>
        <span class="event-date">${event.eventDate ? new Date(event.eventDate._seconds * 1000).toDateString() : ""}</span>
      </div>
      <div class="event-thumb">
        <img class="event-thumb-img" src="${event.eventDpUrl || ''}" loading="lazy">
        <div class="event-badge">
          <div class="event-prize-badge">Prize Pool: <span class="dynamic-prize">₹${prizePool}</span></div>
          <div class="event-fee-badge">Entry Fee: ${fee > 0 ? `₹${fee}` : "Free"}</div>
        </div>
      </div>
      <div class="event-title">${event.eventTitle || "Untitled Event"}</div>
      <div class="event-meta">
        <span class="event-duration">--:--:--</span>
        <span>Vibers: ${vibers}</span>
      </div>
      <div class="event-progress"><span style="width:100%"></span></div>
      <div class="event-actions">
        <button class="join" data-eventid="${event.eventId}">Vibe</button>
      </div>`;

    startCountdown(card.querySelector(".event-duration"), event.endTime);
    card.addEventListener("mouseenter", () => {
      listen_grid.querySelectorAll(".event-card").forEach(c => c.classList.remove("active"));
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
  const events   = vibeOver
    ? fullList
    : fullList.filter(e =>
        String(e.eventStatus || "").trim().toLowerCase() === "vibing" &&
        !hitEventsJoin.some(j => j.eventId === e.eventId)
      );

  if (!events.length) {
    hit_grid.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No active hit events right now. Check back soon!</p></div>`;
    return;
  }

  events.forEach(event => {
    const card      = document.createElement("div");
    const vibers    = Number(event.totalViber || 0);
    const prizePool = calculatePrizePool(vibers);
    const fee       = Number(event.eventEntryFee || 0);

    card.className = "hit-card";
    card.innerHTML = `
      <div class="hit-event-content">
        <div class="hit-top">
          <div class="event-top">
            <img class="content-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/joining%20fee.png">
            <p class="fee-data">${fee > 0 ? `₹${fee}` : "Free"}</p>
          </div>
          <div class="event-top">
            <img class="content-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/total-hit.png">
            <p class="total-hit-data">${vibers}</p>
          </div>
          <div class="event-top">
            <img class="content-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/event-end-timmer.png">
            <p class="event-end-timmer">00:00:00</p>
          </div>
        </div>
        <div class="prison-hexagon">
          <img class="event-img" loading="lazy" src="${event.eventDpUrl || ''}">
          <img class="lock" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/A%20fiery%20iron%20chain%20f.png">
        </div>
        <div class="hit-lock">
          <div class="prize-pool">
            <p class="dynamic-prize">₹${prizePool}</p>
            <img class="prize-pool-holder" loading="lazy" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/galaxy%20prize%20holder.png">
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
  const events   = vibeOver
    ? fullList
    : fullList.filter(e => !lakhpatiLoopsJoin.some(j => j.eventId === e.eventId));

  if (!events.length) {
    premiumLegue.innerHTML = vibeOver
      ? `<div class="no-events-container"><div class="no-events-icon">📭</div><p class="no-events-text">You haven't joined any events yet, baby!</p><button class="start-joining-btn">START JOINING NOW</button></div>`
      : `<div class="no-events-container"><p class="no-events-text">No Lakhpati events active right now. Check back soon!</p></div>`;
    return;
  }

  events.forEach(event => {
    const card     = document.createElement("div");
    card.className = "lakhpati-card";
    const prizePool = (event.lakhpatiLoopAmountIndex || 0) * 100000;
    const fee       = Number(event.eventEntryFee || 0);

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
              <img data-eventid="${event.eventId}" class="j-m-l" loading="lazy"
                src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/join-btnelements%20of%20lakhpatis.png" alt="">
              <span class="E-f-l" data-eventid="${event.eventId}">Entry Fee : ${fee > 0 ? `₹${fee}` : "Free"}</span>
            </div>
            <div class="right">
              <strong class="t-h">00:00:00</strong>
            </div>
          </div>
        </div>
      </div>`;

    const lakhIndex = event.lakhpatiLoopAmountIndex || 0;
    card.querySelector(`.lakh-${lakhIndex}`)?.classList.add("active");

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
vibingOverBtns.forEach(btn => {
  btn.addEventListener("click", e => {
    isJoinedList = true;
    const t = e.currentTarget.dataset.eventType;
    if      (t === "L")   { renderVibingListenEvents(true); joinedType = "L";   }
    else if (t === "H")   { renderVibingHitEvents(true);    joinedType = "H";   }
    else if (t === "PL")  { renderLakhpatiLoops(true);      joinedType = "PL";  }
    else if (t === "SAT") { renderSponsorAppTasks(true);    joinedType = "SAT"; }
  });
});

vibingBtns.forEach(btn => {
  btn.addEventListener("click", e => {
    isJoinedList = false;
    const t = e.currentTarget.dataset.eventType;
    if      (t === "L")   { renderVibingListenEvents(false); joinedType = "L";   }
    else if (t === "H")   { renderVibingHitEvents(false);    joinedType = "H";   }
    else if (t === "PL")  { renderLakhpatiLoops(false);      joinedType = "PL";  }
    else if (t === "SAT") { renderSponsorAppTasks(false);    joinedType = "SAT"; }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  LAKHPATI GRID CLICK
// ══════════════════════════════════════════════════════════════════════════════
if (premiumLegue) {
  premiumLegue.addEventListener("click", e => {
    if (e.target.closest(".start-joining-btn")) { renderLakhpatiLoops(false); return; }

    const joinBtn = e.target.closest(".j-m-l");
    const feeCont = e.target.closest(".E-f-l");
    if (!joinBtn && !feeCont) return;

    e.stopPropagation();
    const evId      = String(joinBtn?.dataset.eventid || feeCont?.dataset.eventid || "");
    const eventData = lakhpatiLoops.find(ev => String(ev.eventId) === evId);
    if (!eventData) return;

    if (eventData.eventEntryFee > 0 && (!currentUser || (uiData?.cash || 0) < eventData.eventEntryFee)) {
      showToast("Insufficient balance. Please top up to join this event.", "error");
      return;
    }

    pendingJoinEventType = "lakhpati";
    showEventDetails(eventData, true);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  HIT GRID CLICK
// ══════════════════════════════════════════════════════════════════════════════
if (hit_grid) {
  hit_grid.addEventListener("click", e => {
    if (e.target.closest(".start-joining-btn")) { renderVibingHitEvents(false); return; }

    const hitBtn = e.target.closest(".hit-btn");
    if (!hitBtn) return;
    e.stopPropagation();

    const evId      = hitBtn.dataset.eventid;
    const eventData = hitEvents.find(ev => ev.eventId === evId);
    if (!eventData) return;

    if (eventData.eventEntryFee > 0 && (!currentUser || (uiData?.cash || 0) < eventData.eventEntryFee)) {
      showToast("Insufficient balance. Please top up to join this event.", "error");
      return;
    }

    if (eventData.eventEntryFee > 0) {
      pendingJoinEventType = "hit";
      showEventDetails(eventData);
      return;
    }

    pendingJoinEventId   = evId;
    pendingJoinEventType = "hit";
    adOpenTime           = Date.now();
    trigger(evId, "hit");
    showAdCountdownToast(AD_WAIT_MS.hit / 1000);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  LISTEN GRID CLICK
//  FIX: `isJoinedList ? listenEventsJoin : listenEvents.find(...)`
//       returned the whole array when isJoinedList=true. Always use .find().
// ══════════════════════════════════════════════════════════════════════════════
if (listen_grid) {
  listen_grid.addEventListener("click", e => {
    if (e.target.closest(".start-joining-btn")) { renderVibingListenEvents(false); return; }

    const joinBtn = e.target.closest(".join");
    if (!joinBtn) return;
    e.stopPropagation();

    const evId = joinBtn.dataset.eventid;

    // FIX: always .find() — never return raw array as eventData
    const eventData = isJoinedList
      ? listenEventsJoin.find(ev => ev.eventId === evId)
      : listenEvents.find(ev => ev.eventId === evId);

    if (!eventData) return;

    if (isJoinedList && joinedType === "L") {
      showEventDetails(eventData);
      return;
    }

    if (eventData.eventEntryFee > 0 && (!currentUser || (uiData?.cash || 0) < eventData.eventEntryFee)) {
      showToast("Insufficient balance. You can go with free events.", "error");
      return;
    }

    if (eventData.eventEntryFee > 0) {
      pendingJoinEventType = "listen";
      showEventDetails(eventData);
      return;
    }

    pendingJoinEventId   = evId;
    pendingJoinEventType = "listen";
    adOpenTime           = Date.now();
    trigger(evId, "listen");
    showAdCountdownToast(AD_WAIT_MS.listen / 1000);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  AD TRIGGER
// ══════════════════════════════════════════════════════════════════════════════
function trigger(evId, eventType) {
  if (adLocked) return;
  adLocked = true;

  const links = eventType === "listen" ? linksL
    : eventType === "hit"  ? linksH
    : eventType === "dc"   ? linksDCI
    : [];

  if (!links.length) { showToast("No ad links available right now 😕", "error"); adLocked = false; return; }

  window.open(links[adIndexL++ % links.length], "_blank");
  setTimeout(() => { adLocked = false; }, 2000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  AD RETURN — VISIBILITY CHANGE
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener("visibilitychange", () => {
  if (document.hidden || !pendingJoinEventId || !adOpenTime) return;

  const stayedMs  = Date.now() - adOpenTime;
  const eventType = pendingJoinEventType || "listen";
  const required  = AD_WAIT_MS[eventType] || 10000;

  if (stayedMs >= required) {
    const eventData = eventType === "hit"
      ? hitEvents.find(ev => ev.eventId === pendingJoinEventId)
      : listenEvents.find(ev => ev.eventId === pendingJoinEventId);

    if (eventData) {
      showEventDetails(eventData);
      showToast("Thanks, Dear Viber! You can now join 🎉", "success");
    }
  } else {
    const secLeft = Math.ceil((required - stayedMs) / 1000);
    showToast(`Please watch the ad for at least ${secLeft} more second(s).`, "error");
  }

  pendingJoinEventId = null;
  adOpenTime         = 0;
});

// ══════════════════════════════════════════════════════════════════════════════
//  DIALOG
// ══════════════════════════════════════════════════════════════════════════════
closeBtn?.addEventListener("click",       () => { dialog.style.display = "none"; });
dialogCloseBtn?.addEventListener("click", () => { dialog.style.display = "none"; });

function showEventDetails(ED, isLakhpati = false) {
  const poolIndex = ED.lakhpatiLoopAmountIndex ?? 0;
  const rawPrize  = ED.eventPrizePool ?? (poolIndex * 100000);

  dialogTitle.textContent = !ED.eventTitle
    ? "Best of Luck, Viber!"
    : ED.eventTitle.length > 30 ? ED.eventTitle.slice(0, 27) + "..." : ED.eventTitle;

  dialogPrize.textContent = isLakhpati
    ? `₹ ${rawPrize.toLocaleString("en-IN")}`
    : "Dynamic Prize Pool";

  explain.innerHTML = isLakhpati
    ? `Lakhpati Prize Pool Increase!</b><br>Today: ₹1 Lakh ⮕ Next 5 Days: ₹5 Lakh ⮕ Weekly Goal: <b>₹18 Lakh!`
    : `The more who join, the bigger the pot! Every new listener scales the rewards, creating more winning spots for everyone.`;

  joinVibe._eventData         = ED;
  joinVibe.dataset.isLakhpati = isLakhpati ? "true" : "false";
  joinVibe.dataset.eventType  = pendingJoinEventType || "";

  dialog.style.display = "flex";
}

if (joinVibe) {
  joinVibe.addEventListener("click", async () => {
    const ED         = joinVibe._eventData;
    const isLakhpati = joinVibe.dataset.isLakhpati === "true";
    const eventType  = joinVibe.dataset.eventType || pendingJoinEventType;
    if (!ED) return;
    dialog.style.display = "none";
    await handleJoinEvent(ED, isLakhpati, eventType);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  HANDLE JOIN EVENT
// ══════════════════════════════════════════════════════════════════════════════
async function handleJoinEvent(ED, isLakhpati, eventType) {
  let eventTypeIndex;
  if      (isLakhpati)             eventTypeIndex = EVENT_TYPE_INDEX.lakhpati;
  else if (eventType === "listen") eventTypeIndex = EVENT_TYPE_INDEX.listen;
  else if (eventType === "hit")    eventTypeIndex = EVENT_TYPE_INDEX.hit;
  else { showToast("Unknown event type. Please try again.", "error"); return; }

  const isFree   = !ED.eventEntryFee || Number(ED.eventEntryFee) === 0;
  const feeLabel = isFree ? "Free entry ✓" : `Deducting ₹${ED.eventEntryFee}`;
  const steps    = [
    "Verifying your account",
    feeLabel,
    ...(eventTypeIndex !== EVENT_TYPE_INDEX.listen ? ["Assigning lucky tickets 🎲"] : []),
    "Registering you in the event",
    "All done! 🎉"
  ];

  const progress = showProgressToast(steps);

  try {
    progress.update(0); await delay(400);
    progress.update(1); await delay(300);

    if (eventTypeIndex !== EVENT_TYPE_INDEX.listen) {
      progress.update(2);
      await delay(300);
    }

    progress.update(steps.length - 2);

    const res = await joinvibeEvents({ eventId: ED.eventId, eventTypeIndex });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Vibe returned failure");

    progress.update(steps.length - 1);
    progress.finish(true, "You're in! Good luck, Viber 🎉");
    spawnConfetti();

    await getUser();

    if (isLakhpati) {
      lakhpatiLoopsJoin.push({ ...ED });
      renderLakhpatiLoops(false);
    } else if (eventType === "listen") {
      listenEventsJoin.push({ ...ED });
      renderVibingListenEvents(false);
      updatePlayerVisibility();
    } else if (eventType === "hit") {
      hitEventsJoin.push({ ...ED });
      renderVibingHitEvents(false);
    }

    pendingJoinEventId   = null;
    pendingJoinEventType = null;

  } catch (err) {
    console.error("Join failed:", err);
    const map = {
      "already-exists":      "You've already joined this event!",
      "failed-precondition": err.message?.includes("LC")
        ? "Not enough Listen Coins."
        : err.message?.includes("cash")
          ? "Insufficient balance. Please top up."
          : "This event has ended.",
      "not-found":          "Event not found. It may have just ended.",
      "unauthenticated":    "Please log in first.",
      "resource-exhausted": "Server busy. Please try again in a moment.",
    };
    const code    = err?.code?.replace("functions/", "") || "";
    const message = map[code] || err.message || "Something went wrong.";
    progress.finish(false, message);
    showToast(message, "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SPONSOR TASK LIST CLICK
// ══════════════════════════════════════════════════════════════════════════════
if (appTaskList) {
  appTaskList.addEventListener("click", async e => {
    if (e.target.closest(".start-joining-btn")) {
      renderSponsorAppTasks(false);
      isJoinedList = false;
      return;
    }

    const btn = e.target.closest(".a-t-get");
    if (!btn) return;

    const taskId = btn.dataset.taskId;
    a_t_d_overlay.classList.add("active");

    const resolvedTask =
      (isJoinedList ? sponsorAppTasksJoin : sponsorAppTasks).find(t => String(t.sponsorId) === String(taskId))
      || sponsorAppTasksJoin.find(t => String(t.sponsorId) === String(taskId))
      || sponsorAppTasks.find(t => String(t.sponsorId) === String(taskId));

    if (!resolvedTask) {
      a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><h2>Task not found</h2><button class="a-t-d-close">Close</button></div>`;
      return;
    }

    a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><div class="eq-progress loadingEventStatus">${"<span></span>".repeat(10)}</div></div>`;

    try {
      const res         = await getSponsorTaskLeaderBoard({ sponsorId: resolvedTask.sponsorId });
      const leaderboard  = res?.data?.leaderboard || [];
      leaderboard.length
        ? renderLeaderboardCard(resolvedTask, leaderboard)
        : renderTaskDetailCard(resolvedTask);
    } catch {
      renderTaskDetailCard(resolvedTask);
    }
  });
}

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
  const safe = u => ({
    viberDp:   u?.viberDp   || "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/me%20jaan.png",
    viberName: u?.viberName || "Unknown",
    winAmount: u?.winAmount || 0
  });
  const [first, second, third] = leaderboard.slice(0, 3).map(safe);
  const rest = leaderboard.slice(3);

  a_t_d_overlay.innerHTML = `
    <div class="a-t-d-card">
      <div class="leaderBoard">
        <div class="high-rank">
          ${second ? `<div class="rank two"><img class="rank-two-frame" src="/assets/leaderboard/rank-2.png"><img class="viberDp" src="${second.viberDp}"><div class="n-wa"><strong>₹${second.winAmount}</strong><span>${second.viberName}</span></div></div>` : ""}
          ${first  ? `<div class="rank one"><img class="rank-one-frame" src="/assets/leaderboard/rank-1.png"><img class="viberDp" src="${first.viberDp}"><div class="n-wa"><strong>₹${first.winAmount}</strong><span>${first.viberName}</span></div></div>` : ""}
          ${third  ? `<div class="rank three"><img class="rank-three-frame" src="/assets/leaderboard/rank-3.png"><img class="viberDp" src="${third.viberDp}"><div class="n-wa"><strong>₹${third.winAmount}</strong><span>${third.viberName}</span></div></div>` : ""}
        </div>
        <div class="midRank">
          ${rest.map(u => `
            <div class="winnerData">
              <div class="winner-details">
                <span class="rank">#${u.rank}</span>
                <img class="winnerDp" src="${u.viberDp || 'https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/me%20jaan.png'}">
                <strong>${u.viberName}</strong>
              </div>
              <span>₹${u.winAmount || 0}</span>
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
if (a_t_d_overlay) {
  a_t_d_overlay.addEventListener("click", async e => {
    const closeButton = e.target.closest(".a-t-d-close");
    const claimBtn    = e.target.closest(".claim-btn");
    const vibeBtn     = e.target.closest(".vibe-btn");

    if (closeButton) { a_t_d_overlay.classList.remove("active"); return; }

    if (claimBtn) {
      a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><div class="eq-progress loadingEventStatus">${"<span></span>".repeat(10)}</div></div>`;
      try {
        const res  = await claimSponsorReward({ sponsorId: claimBtn.dataset.sponsor });
        const data = res?.data;
        if (!data?.success) { showToast("Claim failed 😕", "error"); return; }

        const icons  = {
          cash:       "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cash-ic.png",
          listenCoin: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/SapanaCyberHub-Logo-X-Listen-og.png",
          luckCredit: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/luckCreditIcon1.png"
        };
        const labels = { cash: "Cash Reward", listenCoin: "Listen Coins", luckCredit: "Luck Credit" };

        spawnConfetti();
        a_t_d_overlay.innerHTML = `
          <div class="reward-box-a">
            <img class="reward-icon" src="${icons[data.rewardType] || ''}">
            <h2>${labels[data.rewardType] || "Reward"}</h2>
            <div class="reward-value">${data.rewardType === "cash" ? "₹" : ""}${data.rewardAmount || 0}</div>
            <button class="a-t-d-close">Close</button>
          </div>`;
        showToast("Reward claimed 🎉", "success");
        await getUser();

      } catch (err) {
        console.error(err);
        a_t_d_overlay.innerHTML = `<div class="a-t-d-card"><h2>Claim Failed</h2><button class="a-t-d-close">Close</button></div>`;
        showToast("Something went wrong 😕", "error");
      }
      return;
    }

    if (!vibeBtn) return;

    const sponsorId = vibeBtn.dataset.sponsor;
    if (!sponsorId) return;

    const taskData = sponsorAppTasks.find(t => String(t.sponsorId) === String(sponsorId))
      || sponsorAppTasksJoin.find(t => String(t.sponsorId) === String(sponsorId));

    if (!taskData) { showToast("Task not found 😕", "error"); return; }

    if (!isJoinedList) {
      if (!taskData.sponsorLink) { showToast("Download link not found 😕", "error"); return; }

      showAdCountdownToast(10);
      pendingSponsorApkPath = taskData.sponsorLink;
      pendingSponsorId      = sponsorId;
      sponsorAdOpenTime     = Date.now();

      trigger(sponsorId, "dc");

      const handleVisibility = async () => {
        if (document.hidden) return;
        const stayedMs = Date.now() - sponsorAdOpenTime;
        if (stayedMs >= AD_WAIT_MS.dc) {
          try {
            await downloadSponsorApk(pendingSponsorApkPath);
            const res = await vibeInSponsor({ sponsorId: pendingSponsorId });
            showToast(res?.data?.success ? "Reward Activated 🎉" : "Reward pending ⏳",
              res?.data?.success ? "success" : "info");
          } catch { showToast("Reward failed 😕", "error"); }
        } else {
          showToast("Stay at least 10 seconds on the sponsor page.", "error");
        }
        pendingSponsorApkPath = pendingSponsorId = null;
        sponsorAdOpenTime = 0;
        document.removeEventListener("visibilitychange", handleVisibility);
      };
      document.addEventListener("visibilitychange", handleVisibility);
      a_t_d_overlay.classList.remove("active");

    } else {
      showToast(
        `Open <strong style="color:red;text-transform:uppercase">${taskData.sponsorAppName}</strong> and complete tasks to claim reward.`,
        "info"
      );
    }
  });
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
      .pt-step.active{color:#a78bfa;} .pt-step.done{color:rgba(255,255,255,.65);}
      .pt-step-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.15);flex-shrink:0;transition:background .3s,box-shadow .3s;}
      .pt-step.active .pt-step-dot{background:#a78bfa;box-shadow:0 0 8px #a78bfa;}
      .pt-step.done .pt-step-dot{background:#22c55e;}
      .pt-bar-wrap{margin-top:12px;height:4px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;}
      .pt-bar{height:100%;width:0%;background:linear-gradient(90deg,#a78bfa,#818cf8);border-radius:4px;transition:width .5s cubic-bezier(.4,0,.2,1);}
      .pt-result{margin-top:10px;font-size:12px;font-weight:600;text-align:center;border-radius:8px;padding:6px 10px;}
      .pt-result.success{color:#22c55e;background:rgba(34,197,94,.1);}
      .pt-result.error{color:#ef4444;background:rgba(239,68,68,.1);}
      .listen-popup{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;}
      .listen-popup-inner{background:#1a1a2e;border-radius:20px;padding:28px 32px;text-align:center;min-width:280px;box-shadow:0 16px 48px rgba(0,0,0,.5);}
      .listen-popup-inner h2{color:#e2e8f0;margin:0 0 8px;}
      .listen-popup-inner p{color:rgba(255,255,255,.55);font-size:13px;margin:0 0 20px;}
      #sep-watch-ad{background:linear-gradient(135deg,#a78bfa,#818cf8);color:#fff;border:none;border-radius:12px;padding:12px 28px;font-size:15px;font-weight:600;cursor:pointer;width:100%;}
      #sep-stop{background:transparent;border:none;color:rgba(255,255,255,.35);font-size:12px;cursor:pointer;margin-top:12px;display:block;width:100%;}
    `;
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
      ${steps.map((s, i) => `
        <div class="pt-step" data-step="${i}">
          <div class="pt-step-dot"></div>
          <span>${s}</span>
        </div>`).join("")}
    </div>
    <div class="pt-bar-wrap"><div class="pt-bar" id="pt-bar"></div></div>`;
  document.body.appendChild(toast);

  const spinnerEl = toast.querySelector("#pt-spinner");
  const titleEl   = toast.querySelector("#pt-title");
  const barEl     = toast.querySelector("#pt-bar");

  function update(idx) {
    toast.querySelectorAll(".pt-step").forEach((el, i) => {
      el.classList.remove("active", "done");
      if (i < idx)   el.classList.add("done");
      if (i === idx) el.classList.add("active");
    });
    barEl.style.width = (steps.length > 1 ? Math.round((idx / (steps.length - 1)) * 90) : 50) + "%";
  }

  function finish(ok, message) {
    if (ok) toast.querySelectorAll(".pt-step").forEach(el => { el.classList.remove("active"); el.classList.add("done"); });
    barEl.style.width      = ok ? "100%" : barEl.style.width;
    barEl.style.background = ok ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#ef4444,#dc2626)";
    spinnerEl.className    = `pt-spinner ${ok ? "done" : "error"}`;
    spinnerEl.textContent  = ok ? "✅" : "❌";
    titleEl.textContent    = ok ? "Done!" : "Failed";
    const r = document.createElement("div");
    r.className   = `pt-result ${ok ? "success" : "error"}`;
    r.textContent = message;
    toast.appendChild(r);
    setTimeout(() => {
      toast.classList.add("pt-exit");
      setTimeout(() => toast.remove(), 350);
    }, ok ? 3000 : 4000);
  }

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
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  });
  return toast;
}

function showAdCountdownToast(seconds) {
  const toast = showToast(`⏳ Stay on the ad for <strong id="ad-cd">${seconds}</strong> second(s) to continue`, "info");
  const cdEl  = toast?.querySelector("#ad-cd");
  if (!cdEl) return;
  let remaining = seconds;
  const iv = setInterval(() => {
    remaining--;
    if (cdEl) cdEl.textContent = remaining;
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
    cards.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - center);
      if (d < minDist) { minDist = d; closest = c; }
    });
    cards.forEach(c => {
      if (c !== closest) { c.classList.remove("active"); c.dataset.animated = "false"; }
    });
    if (closest && !closest.classList.contains("active")) {
      closest.classList.add("active");
      const prizeSpan = closest.querySelector(".dynamic-prize");
      const eId       = closest.querySelector(".hit-btn")?.dataset.eventid
                     || closest.querySelector(".join")?.dataset.eventid;
      const ed        = events.find(e => e.eventId === eId);
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
  userBalance.textContent = "₹" + uiData.cash;
  checkusercheckin();
}

function animatePrizeValue(element, start, end, duration) {
  let ts0 = null;
  const fv   = typeof end === "string" ? parseInt(end.replace(/\D/g, "")) : end;
  const ease = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const step = ts => {
    if (!ts0) ts0 = ts;
    const p = Math.min((ts - ts0) / duration, 1);
    element.textContent = "₹" + Math.max(0, Math.floor(ease(p) * (fv - start) + start)).toLocaleString("en-IN");
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
  if (currentLottieInstance) {
    currentLottieInstance.destroy();
    currentLottieInstance = null;
    fireContainer.innerHTML = "";
  }
  currentLottieInstance = lottie.loadAnimation({
    container: fireContainer, renderer: "svg", loop, autoplay: true, path
  });
  return currentLottieInstance;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CHECK-IN BUTTON
// ══════════════════════════════════════════════════════════════════════════════
checkInBtn?.addEventListener("click", () => {
  fireContainer.classList.add("active");
  checkInBtn.classList.add("active-check");
  playLottie("/assets/anim/fire.json");
  const startStreak = uiData?.streakDays || 0;
  updateStreakUI(startStreak + 1, startStreak);
});

function showDailyCheckInRewardDialog(isCheckIn = true) {
  if (isCheckIn) return;
  checkInOverlay?.classList.add("active");
  const streak = document.getElementById("count");
  if (streak && uiData) streak.textContent = uiData.streakDays || 0;
  fireContainer.classList.add("active");
  currentLottieInstance = playLottie("/assets/anim/Gift.json", true);
  currentLottieInstance.goToAndPlay(0, true);
}

async function updateStreakUI(newVal, startVal) {
  const countEl = document.getElementById("count");
  if (!countEl) return;
  let ts0 = null;
  const duration = 1000;
  const step = async ts => {
    if (!ts0) ts0 = ts;
    const p = Math.min((ts - ts0) / duration, 1);
    countEl.innerHTML = Math.floor(p * (newVal - startVal) + startVal);
    if (p < 1) { window.requestAnimationFrame(step); return; }
    countEl.classList.add("trigger-bounce");
    try {
      trigger("", "dc");
      const result = await dailyCheckIn();
      if (!result?.data) throw new Error("No data");
      fireContainer.classList.remove("active");
      checkInBtn.classList.remove("active-check");
      if (currentLottieInstance) {
        currentLottieInstance.destroy();
        currentLottieInstance = null;
        fireContainer.innerHTML = "";
      }
      rewardContainer?.classList.add("active");
      setTimeout(() => {
        countEl.classList.remove("trigger-bounce");
        showRewardBox(result.data.isLCReward, result.data.rewardAmount);
        getUser();
      }, 1500);
    } catch (err) {
      console.error("Check-in failed:", err.message);
      showToast("Check-in failed. Please try again.", "error");
      checkInBtn?.classList.remove("active-check");
    }
  };
  window.requestAnimationFrame(step);
}

function showRewardBox(isLC = true, amount = 0) {
  if (!rewardContainer) return;
  const rewardText = document.getElementById("a");
  const iconBox    = document.getElementById("r-i");
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
    const d    = document.createElement("div");
    const size = Math.random() * 8 + 4;
    d.style.cssText = `position:fixed;pointer-events:none;z-index:99999;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw;top:-10px;
      animation:confettiFall ${Math.random() * 2 + 1.5}s ease-in ${Math.random() * 0.5}s forwards;`;
    document.body.appendChild(d);
    d.addEventListener("animationend", () => d.remove());
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PULL-TO-REFRESH
// ══════════════════════════════════════════════════════════════════════════════
function setupPullToRefresh() {
  let startY  = 0;
  let pulling = false;
  document.addEventListener("touchstart", e => { startY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchmove",  e => {
    if (window.scrollY === 0 && e.touches[0].clientY - startY > 80) pulling = true;
  }, { passive: true });
  document.addEventListener("touchend", async () => {
    if (!pulling) return;
    pulling = false;
    showToast("Refreshing… 🔄", "info");
    await getUser();
    renderVibingListenEvents(isJoinedList);
    renderVibingHitEvents(isJoinedList);
    renderLakhpatiLoops(isJoinedList);
    renderSponsorAppTasks(isJoinedList);
    showToast("Refreshed! ✅", "success");
  });
}