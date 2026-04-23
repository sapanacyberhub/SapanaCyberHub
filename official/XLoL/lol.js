import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getStorage, ref as storRef,
    uploadBytesResumable, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {
    getFunctions, httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";
import {
    getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ══════════════════════════════════════════════════════════════════════════════
//  FIREBASE INIT
// ══════════════════════════════════════════════════════════════════════════════
const firebaseApp = initializeApp({
    apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
    authDomain: "sapanacyberhub-26310.firebaseapp.com",
    projectId: "sapanacyberhub-26310",
    storageBucket: "sapanacyberhub-26310.firebasestorage.app",
    messagingSenderId: "448116453690",
    appId: "1:448116453690:web:01a91dd284b715bf0a2003",
    measurementId: "G-HKGQ8D55N1",
});

const auth = getAuth(firebaseApp);
const stor = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp);
const db = getFirestore(firebaseApp);

// ══════════════════════════════════════════════════════════════════════════════
//  CLOUD FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════
const cfInitLolUser = httpsCallable(functions, "initLolUser");
const cfTrackEngagement = httpsCallable(functions, "trackEngagement");
const cfCreateLolPost = httpsCallable(functions, "createLolPost");
const cfLoadFeed = httpsCallable(functions, "loadLolFeed");
const cfLoLtoListen = httpsCallable(functions, "transferLolToListenWallet");
const cfClaimLolSessionBonus = httpsCallable(functions, "claimLolSessionBonus");
const cfGetLeaderboard = httpsCallable(functions, "getTodayLeaderboard");
const getPost = httpsCallable(functions, "getLolPostById");
const cfLoadLolProfileHistory = httpsCallable(functions, "loadLolProfileHistory");
const cfDeleteLolPost = httpsCallable(functions, "deleteLolPost");

const LISTEN_URL = "/online-earning/listen-enjoy-earn/index.html";

// ══════════════════════════════════════════════════════════════════════════════
//  AD CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const PASSIVE_AD_SCRIPTS = [
    { id: "monetag-vignette", src: "https://n6wxm.com/vignette.min.js", dataset: { zone: "10246448" } },
    { id: "monetag-inpage-push", src: "https://nap5k.com/tag.min.js", dataset: { zone: "10246441" } },
    { id: "adsterra-social-bar", src: "https://pl28160948.profitablecpmratenetwork.com/a3/f8/7d/a3f87d980e8ae573f535875f32f4c021.js" },
];
const VIGNETTE_AD_CONFIG = PASSIVE_AD_SCRIPTS.find(c => c.id === "monetag-vignette");
const INPAGE_PUSH_AD_CONFIG = PASSIVE_AD_SCRIPTS.find(c => c.id === "monetag-inpage-push");

const ADSTERRA_BANNERS = [
    { key: "be84f4cdee8a397c6208c778695c8973", width: 160, height: 300 },
    { key: "b5d3a37bebdb18ab0d508dc21053382b", width: 728, height: 90 },
    { key: "522259f00affdbfdaf791b01f86b1a64", width: 320, height: 50 },
    { key: "1ec158b6632bf6a6bac690778268b1f7", width: 468, height: 60 },
    { key: "71197c8b1966802bbfa05225ac458a7b", width: 300, height: 250 },
    { key: "73d8d5f56e427b77a8f4c36d202a1097", width: 160, height: 600 },
];

const DIRECT_LINKS = [
    {
        network: "Boost Offer",
        label: "🎁 Unlock 20-100 Score",
        rewardMin: 20,
        rewardMax: 100,
        url: "https://omg10.com/4/10749383"
    },
    {
        network: "Boost Offer",
        label: "⚡ Quick 20-100 Boost",
        rewardMin: 20,
        rewardMax: 100,
        url: "https://www.profitablecpmratenetwork.com/teatfjw7?key=..."
    },
    {
        network: "Boost Offer",
        label: "🔥 Extra Engagement Score",
        rewardMin: 20,
        rewardMax: 100,
        url: "https://omg10.com/4/10216281"
    },
    {
        network: "Boost Offer",
        label: "💎 Mystery Score Boost",
        rewardMin: 20,
        rewardMax: 100,
        url: "https://www.profitablecpmratenetwork.com/w7taatypw?key=..."
    }
];

const AD_CARD_ROTATION = [
    { type: "banner", title: "Sponsor break", copy: "Adsterra banner — stays inside the card, no redirect.", network: "Adsterra" },
    { type: "banner", title: "Sponsor break", copy: "Another Adsterra banner slot to keep revenue flowing.", network: "Adsterra" },
    { type: "native", title: "Sponsored feed card", copy: "Native sponsor content stays inside the feed.", network: "Adsterra Native" },
    { type: "banner", title: "Sponsor break", copy: "Adsterra banner — skippable, inline.", network: "Adsterra" },
    { type: "vignette", title: "Monetag quick overlay", copy: "Only the Monetag vignette fires here, then you keep scrolling.", network: "Monetag" },
    { type: "banner", title: "Sponsor break", copy: "Banner sized automatically to your screen.", network: "Adsterra" },
    { type: "quick-break", title: "Quick break sponsor", copy: "Tap to open the sponsor offer now, or skip and keep scrolling.", network: "Direct Sponsor" },
    { type: "banner", title: "Sponsor break", copy: "Adsterra banner — picks the best size for your device.", network: "Adsterra" },
    { type: "smart-link", title: "Tap-only sponsor", copy: "Smart links open only when you tap them.", network: "Mixed" },
    { type: "banner", title: "Sponsor break", copy: "Final banner in the cycle — then back to more LoLs.", network: "Adsterra" },
];

const NATIVE_BANNER_CONTAINER_ID = "container-b4d913493bf7a8df560d9a7b633f5918";
const NATIVE_BANNER_SCRIPT = "https://pl28037543.profitablecpmratenetwork.com/b4d913493bf7a8df560d9a7b633f5918/invoke.js";

// ══════════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
const SESSION_ENGAGEMENT_POINTS = { view: 10, like: 20, share: 30 };
const BONUS_CARD_MIN_ENGAGEMENT = 50;
const AD_COOLDOWN_MIN_SWIPES = 5;
const AD_COOLDOWN_MAX_SWIPES = 7;
const AD_IMPRESSION_LOCK_MS = 5000;
const BONUS_CARD_MIN_SWIPES = 7;
const BONUS_CARD_MAX_SWIPES = 12;
const BONUS_SPONSOR_MIN_VISIT_MS = 2500;
const WATCH_INSIGHT_MIN_MS = 3000;
const VIEW_REWARD_MIN_WATCH_MS = 5000;
const QUICK_LINK_REWARD_MIN = 20;
const QUICK_LINK_REWARD_MAX = 100;
const PASSIVE_AD_AUTO_REMOVE_MS = 5000;
const VIDEO_HOLD_DELAY_MS = 180;
const VIDEO_HOLD_MOVE_TOLERANCE = 18;
const FEED_LOAD_LIMIT = 10;
const FEED_SEEN_STORAGE_KEY = "lol_seen_post_ids";
const FEED_SEEN_LIMIT = 100;
const MAX_PRELOADED_VIDEOS = 10;
const MAX_THUMB_CACHE = 30;

const likeLocks = new Set();

// ══════════════════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════════════════
let currentUser = null;
let listenUserData = null;
let lolUserData = null;
let posts = [];
let cardIndex = 0;
let lastCreatedAt = null;
let isLoading = false;
let isNavigating = false;
let noMorePosts = false;
let swipeCount = 0;
let viewTimer = null;
let activeViewSession = null;
let activePostId = null;
let selectedFile = null;
let selectedFileURL = null;
let touchStartX = 0, touchStartY = 0;
let touchCurrentX = 0, touchCurrentY = 0;
let swipeFired = false;
let swipeNavigationLocked = false;
let lastWheelNavigateAt = 0;
let isFeedFullscreen = false;
let passiveAdsInitialized = false;
const passiveAdCleanupTimers = {};
let feedAdIndex = 0, bannerIndex = 0, sponsorLinkIndex = 0;
let quickBreakRedirectTimer = null;
let quickBreakRedirectInterval = null;
let nextAdSwipeAt = Number.POSITIVE_INFINITY;
let nextBonusSwipeAt = Number.POSITIVE_INFINITY;
let sessionEngagementScore = 0;
let bonusCardPending = false;
let bonusFlowCompleted = false;
let bonusClaimPending = false;
let sponsorVisitPending = false;
let sessionBonusClaimToken = "";
const sessionEngagementLedger = { view: new Set(), like: new Set(), share: new Set() };
let _qbSkipTick = null;

// ── Smart video system ────────────────────────────────────────────────────────
let activeVideoElement = null;
let preloadedVideos = new Map();
let lastSwipeTime = 0;
let lastSwipeDelta = 999;
let swipeTrend = 1;
let connectionSpeed = "fast";
let soundEnabled = localStorage.getItem("soundEnabled") === "true";
let isInteracted = false;

function detectConnection() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return;
    const t = conn.effectiveType || "";
    connectionSpeed = t.includes("2g") ? "slow" : t.includes("3g") ? "medium" : "fast";
}
detectConnection();

// ── Back / route state ────────────────────────────────────────────────────────
let appView = "feed";
let backTrapReady = false;

// ── Upload modal ──────────────────────────────────────────────────────────────
let createUploadModal = null;
let createUploadThumbURL = null;
let postLock = false;

// ══════════════════════════════════════════════════════════════════════════════
//  QUICK-BREAK TICK HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function _clearQbTick() {
    if (_qbSkipTick) { clearInterval(_qbSkipTick); _qbSkipTick = null; }
}

// ══════════════════════════════════════════════════════════════════════════════
//  DOM HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

function showToast(msg, dur = 2800) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => t.classList.add("hidden"), dur);
}

function showScreen(id) {
    clearPendingAdRedirect();
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id)?.classList.add("active");
}

function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function createBonusClaimToken() { return `lol_bonus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`; }

function setNavState(view) {
    $("nav-feed")?.classList.toggle("active", view === "feed");
    $("nav-profile")?.classList.toggle("active", view === "profile");
}

function openFeed() {
    appView = "feed";
    setNavState("feed");
    showScreen("app-screen");
    resumeFeedVideos();
}

function setFeedFullscreen(enabled) {
    isFeedFullscreen = Boolean(enabled);
    document.body.classList.toggle("feed-fullscreen", isFeedFullscreen);

    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");
    if (isFeedFullscreen) {
        nextBtn?.classList.add("hidden");
        prevBtn?.classList.add("hidden");
    } else {
        nextBtn?.classList.remove("hidden");
        prevBtn?.classList.remove("hidden");
    }
    $("btn-feed-exit")?.classList.toggle("hidden", !isFeedFullscreen);
}

function clearPendingAdRedirect() {
    if (quickBreakRedirectTimer) { clearTimeout(quickBreakRedirectTimer); quickBreakRedirectTimer = null; }
    if (quickBreakRedirectInterval) { clearInterval(quickBreakRedirectInterval); quickBreakRedirectInterval = null; }
    _clearQbTick();
}

function scheduleNextFeedAd(min = AD_COOLDOWN_MIN_SWIPES, max = AD_COOLDOWN_MAX_SWIPES) {
    nextAdSwipeAt = swipeCount + randomBetween(min, max);
}
function scheduleNextBonusCard(min = BONUS_CARD_MIN_SWIPES, max = BONUS_CARD_MAX_SWIPES) {
    nextBonusSwipeAt = swipeCount + randomBetween(min, max);
}

function resetSessionExperience() {
    swipeCount = sessionEngagementScore = 0;
    bonusCardPending = bonusFlowCompleted = bonusClaimPending = false;
    sponsorVisitPending = false;
    sessionBonusClaimToken = createBonusClaimToken();
    nextAdSwipeAt = nextBonusSwipeAt = Number.POSITIVE_INFINITY;
    touchStartX = touchStartY = touchCurrentX = touchCurrentY = 0;
    swipeNavigationLocked = false;
    swipeFired = false;
    isNavigating = false;
    lastWheelNavigateAt = 0;
    feedAdIndex = bannerIndex = sponsorLinkIndex = 0;
    Object.values(sessionEngagementLedger).forEach(b => b.clear());
    scheduleNextFeedAd();
    scheduleNextBonusCard();
}

// ══════════════════════════════════════════════════════════════════════════════
//  SEEN-POST HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function getStoredSeenPostIds() {
    try {
        const ids = JSON.parse(localStorage.getItem(FEED_SEEN_STORAGE_KEY) || "[]");
        return Array.isArray(ids) ? ids.filter(id => typeof id === "string") : [];
    } catch { return []; }
}
function saveSeenPostIds(ids) {
    localStorage.setItem(FEED_SEEN_STORAGE_KEY, JSON.stringify(ids.slice(-FEED_SEEN_LIMIT)));
}
function rememberSeenPost(postId) {
    if (!postId) return;
    const ids = getStoredSeenPostIds().filter(id => id !== postId);
    ids.push(postId);
    saveSeenPostIds(ids);
}
function getFeedExcludeIds() {
    const ids = new Set(getStoredSeenPostIds());
    posts.forEach(p => { if (p?.id) ids.add(p.id); });
    return [...ids].slice(-FEED_SEEN_LIMIT);
}

// ══════════════════════════════════════════════════════════════════════════════
//  NORMALIZE FEED POSTS
// ══════════════════════════════════════════════════════════════════════════════
function normalizeFeedPosts(items) {
    const existingIds = new Set(posts.map(p => p.id));
    const now = Date.now();
    return (items || [])
        .filter(post => {
            if (!post?.id) return false;
            if (existingIds.has(post.id)) return false;
            const lastView = Number(localStorage.getItem(`viewed_${post.id}`) || 0);
            if (!lastView) return true;
            const diff = now - lastView;
            if (diff < 30 * 60 * 1000) return false;
            if (diff < 2 * 60 * 60 * 1000) return Math.random() < 0.2;
            if (diff < 6 * 60 * 60 * 1000) return Math.random() < 0.5;
            return true;
        })
        .map(post => {
            // Ensure mediaURL is absolute
            if (post.mediaURL && !post.mediaURL.startsWith('http')) {
                post.mediaURL = 'https://storage.googleapis.com/sapanacyberhub-26310.appspot.com/' + post.mediaURL;
            }
            if (post.thumbnail && !post.thumbnail.startsWith('http')) {
                post.thumbnail = 'https://storage.googleapis.com/sapanacyberhub-26310.appspot.com/' + post.thumbnail;
            }
            return { ...post, createdAtMs: postDateToMillis(post.createdAt) };
        });
}

// ══════════════════════════════════════════════════════════════════════════════
//  TAB-RETURN LISTENER
// ══════════════════════════════════════════════════════════════════════════════
let _bonusTabReturnHandler = null;

function attachBonusTabReturnListener(context = "bonus", onReturn = null, startedAt = Date.now()) {
    detachBonusTabReturnListener();
    _bonusTabReturnHandler = () => {
        if (document.visibilityState !== "visible") return;
        const visitDurationMs = Date.now() - startedAt;
        if (visitDurationMs < 1000) return;
        showToast(
            context === "bonus"
                ? "👋 Welcome back! Checking your engagement boost..."
                : "✅ Back from sponsor. Checking your boost...",
            context === "bonus" ? 6000 : 3500
        );
        detachBonusTabReturnListener();
        if (typeof onReturn === "function") onReturn(visitDurationMs);
    };
    document.addEventListener("visibilitychange", _bonusTabReturnHandler);
    window.addEventListener("focus", _bonusTabReturnHandler);
}
function detachBonusTabReturnListener() {
    if (_bonusTabReturnHandler) {
        document.removeEventListener("visibilitychange", _bonusTabReturnHandler);
        window.removeEventListener("focus", _bonusTabReturnHandler);
        _bonusTabReturnHandler = null;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  GESTURE HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function resolveGestureDirection(diffX, diffY) {
    const absX = Math.abs(diffX), absY = Math.abs(diffY);
    if (Math.max(absX, absY) < 50) return 0;
    return absY > absX ? (diffY > 0 ? 1 : -1) : (diffX > 0 ? 1 : -1);
}

function tryGestureNavigate(diffX, diffY) {
    if (swipeFired || swipeNavigationLocked || isNavigating) return false;
    const dir = resolveGestureDirection(diffX, diffY);
    if (!dir) return false;
    swipeFired = true;
    swipeNavigationLocked = true;
    navigate(dir);
    return true;
}

function bindFeedGestures() {
    const stack = $("card-stack");
    if (!stack || stack.dataset.gesturesBound === "1") return;
    stack.dataset.gesturesBound = "1";

    stack.addEventListener("touchstart", e => {
        const t = e.touches[0]; if (!t) return;
        touchStartX = t.clientX; touchStartY = t.clientY;
        touchCurrentX = touchStartX; touchCurrentY = touchStartY;
        swipeFired = false;
        swipeNavigationLocked = false;
    }, { passive: true });

    stack.addEventListener("touchmove", e => {
        const t = e.touches[0]; if (!t) return;
        touchCurrentX = t.clientX; touchCurrentY = t.clientY;
        const dX = touchStartX - touchCurrentX;
        const dY = touchStartY - touchCurrentY;
        if (Math.max(Math.abs(dX), Math.abs(dY)) > 10) e.preventDefault();
        tryGestureNavigate(dX, dY);
    }, { passive: false });

    stack.addEventListener("touchend", e => {
        if (!swipeFired) {
            const ch = e.changedTouches[0];
            if (ch) tryGestureNavigate(touchStartX - ch.clientX, touchStartY - ch.clientY);
        }
        if (!isNavigating) {
            swipeFired = false;
            swipeNavigationLocked = false;
        }
    }, { passive: true });

    stack.addEventListener("touchcancel", () => {
        swipeFired = false;
        swipeNavigationLocked = false;
    }, { passive: true });

    stack.addEventListener("wheel", e => {
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(delta) < 24) return;
        const now = Date.now();
        if (now - lastWheelNavigateAt < 420) { e.preventDefault(); return; }
        lastWheelNavigateAt = now;
        e.preventDefault();
        if (!isNavigating) navigate(delta > 0 ? 1 : -1);
    }, { passive: false });
}

// ══════════════════════════════════════════════════════════════════════════════
//  SMART VIDEO SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
function isElementOpen(id, openClass = null) {
    const el = $(id);
    if (!el) return false;
    if (openClass) return el.classList.contains(openClass);
    return !el.classList.contains("hidden");
}

function isFeedBlockedByOverlay() {
    return isElementOpen("create-overlay") ||
        isElementOpen("lolLeaderBoard-overlay") ||
        isElementOpen("create-upload-modal", "show") ||
        isElementOpen("post-analytics-overlay", "open") ||
        isElementOpen("leave-feed-popup", "show");
}

function canFeedVideoPlay() {
    return appView === "feed" &&
        !document.hidden &&
        $("app-screen")?.classList.contains("active") &&
        !isFeedBlockedByOverlay();
}

function isVideoReallyPlaying(video) {
    return Boolean(video && !video.paused && !video.ended && video.readyState >= 2);
}

function setActiveVideo(video) {
    if (activeVideoElement && activeVideoElement !== video) activeVideoElement.pause();
    activeVideoElement = video;
    if (video) {
        video.muted = !(isInteracted || soundEnabled);
        video.volume = 1;
    }
    if (canFeedVideoPlay()) video?.play().catch(() => { });
    else video?.pause();
}
function pauseFeedVideos() {
    activeVideoElement?.pause();
    stopViewTimer(); // FIX: stop view timer when feed is backgrounded
}
function resumeFeedVideos() {
    if (!canFeedVideoPlay()) {
        pauseFeedVideos();
        return;
    }
    if (!activeVideoElement) return;
    const currentVideo = document.querySelector(".lol-card .card-video");
    if (currentVideo && currentVideo === activeVideoElement) currentVideo.play().catch(() => { });
}
document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseFeedVideos(); else resumeFeedVideos();
});

// Aggressive predictive preload – runs on every swipe, no throttle
async function predictivePreload() {
    const toPreload = [];

    // Next 2 videos
    for (let i = 1; i <= 2; i++) {
        const nextPost = posts[cardIndex + i];
        if (nextPost && nextPost.mediaType === "video" && !preloadedVideos.has(nextPost.id)) {
            toPreload.push(nextPost);
        }
    }

    // Previous 1 (for swipe back)
    const prevPost = posts[cardIndex - 1];
    if (prevPost && prevPost.mediaType === "video" && !preloadedVideos.has(prevPost.id)) {
        toPreload.push(prevPost);
    }

    await Promise.all(toPreload.map(post => preloadVideoPromise(post)));
}

function preloadVideoPromise(post) {
    return new Promise((resolve) => {
        if (!post || post.mediaType !== "video") return resolve();
        if (preloadedVideos.has(post.id)) return resolve();

        const v = document.createElement("video");
        v.src = post.mediaURL;
        v.muted = true;
        v.playsInline = true;

        v.oncanplay = () => {
            preloadedVideos.set(post.id, v);
            // Limit cache size
            if (preloadedVideos.size > MAX_PRELOADED_VIDEOS) {
                const firstKey = preloadedVideos.keys().next().value;
                const oldVid = preloadedVideos.get(firstKey);
                oldVid.src = "";
                oldVid.load();
                preloadedVideos.delete(firstKey);
            }
            resolve();
        };
        v.onerror = () => resolve();
        v.load();
    });
}

function trackSwipe(dir) {
    const now = Date.now();
    lastSwipeDelta = now - lastSwipeTime;
    lastSwipeTime = now;
    swipeTrend = dir;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PASSIVE AD SCRIPTS
// ══════════════════════════════════════════════════════════════════════════════
function loadPassiveAdScript(config, { force = false } = {}) {
    const existing = document.getElementById(config.id);
    if (existing) { if (!force) return; existing.remove(); }
    const s = document.createElement("script");
    s.id = config.id; s.src = config.src; s.async = true;
    Object.entries(config.dataset || {}).forEach(([k, v]) => { s.dataset[k] = v; });
    Object.entries(config.attributes || {}).forEach(([k, v]) => { s.setAttribute(k, v); });
    document.body.appendChild(s);
}

function cleanupPassiveAdScript(configOrId) {
    const id = typeof configOrId === "string" ? configOrId : configOrId?.id;
    if (!id) return;
    if (passiveAdCleanupTimers[id]) {
        clearTimeout(passiveAdCleanupTimers[id]);
        passiveAdCleanupTimers[id] = null;
    }
    document.getElementById(id)?.remove();
}

function schedulePassiveAdCleanup(config, durationMs = PASSIVE_AD_AUTO_REMOVE_MS) {
    if (!config?.id) return;
    clearTimeout(passiveAdCleanupTimers[config.id]);
    passiveAdCleanupTimers[config.id] = setTimeout(() => {
        document.getElementById(config.id)?.remove();
        passiveAdCleanupTimers[config.id] = null;
    }, durationMs);
}

function triggerPassiveAdPulse(mode = "random") {
    const candidates = [];
    if ((mode === "random" || mode === "vignette") && VIGNETTE_AD_CONFIG) candidates.push(VIGNETTE_AD_CONFIG);
    if ((mode === "random" || mode === "push") && INPAGE_PUSH_AD_CONFIG) candidates.push(INPAGE_PUSH_AD_CONFIG);
    if (!candidates.length) return;
    const config = candidates[randomBetween(0, candidates.length - 1)];
    loadPassiveAdScript(config, { force: true });
    schedulePassiveAdCleanup(config);
}

function maybeTriggerPassiveAdPulse(chance = 0.45) {
    if (Math.random() > chance) return;
    triggerPassiveAdPulse(Math.random() < 0.5 ? "vignette" : "push");
}

// ══════════════════════════════════════════════════════════════════════════════
//  QUICK LINKS
// ══════════════════════════════════════════════════════════════════════════════
function buildQuickLinksMarkup() {
    return DIRECT_LINKS.map((link, index) => `
      <a class="quick-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer sponsored" data-sponsor-index="${index}">
        <span class="quick-link-name">${esc(link.label)}</span>
        <span class="quick-link-meta">Link offer: ${link.rewardMin || QUICK_LINK_REWARD_MIN}-${link.rewardMax || QUICK_LINK_REWARD_MAX} score</span>
      </a>`).join("");
}
function renderQuickLinks(target) {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    el.innerHTML = buildQuickLinksMarkup();
    el.querySelectorAll(".quick-link").forEach(linkEl => {
        linkEl.addEventListener("click", event => {
            event.preventDefault();
            const index = Number(linkEl.dataset.sponsorIndex);
            const link = DIRECT_LINKS[index];
            openSponsorLink(link, {
                context: "quick-break",
                source: "quick-link-offer",
                claimToken: createBonusClaimToken()
            });
        });
    });
}
function getNextSponsorLink() {
    const link = DIRECT_LINKS[sponsorLinkIndex % DIRECT_LINKS.length];
    sponsorLinkIndex++;
    return link;
}
function openSponsorLink(link, options = {}) {
    if (!link?.url) return Promise.resolve({ success: false, message: "Sponsor link is unavailable." });
    if (sponsorVisitPending) {
        showToast("Finish the current offer visit first.");
        return Promise.resolve({ success: false, message: "Finish the current offer visit first." });
    }

    const startedAt = Date.now();
    const sponsorTab = window.open(link.url, "_blank");
    if (!sponsorTab) {
        showToast("Allow popups to open the link offer.");
        return Promise.resolve({ success: false, message: "Allow popups to open the link offer." });
    }
    try { sponsorTab.opener = null; } catch { }

    sponsorVisitPending = true;
    showToast(`Open the link offer, then come back to unlock ${link.rewardMin || QUICK_LINK_REWARD_MIN}-${link.rewardMax || QUICK_LINK_REWARD_MAX} engagement score.`, 4200);

    return new Promise(resolve => {
        attachBonusTabReturnListener(options.context || "quick-break", async visitDurationMs => {
            sponsorVisitPending = false;

            if (visitDurationMs < BONUS_SPONSOR_MIN_VISIT_MS) {
                const message = "Stay a little longer on the offer to unlock the boost.";
                showToast(message, 3800);
                resolve({ success: false, message });
                return;
            }

            const result = await claimSessionBonusReward(link, {
                claimToken: options.claimToken || createBonusClaimToken(),
                source: options.source || "quick-link-offer",
                sponsorVisited: true,
                visitDurationMs
            });

            showToast(result.message, result.success ? 4200 : 4800);
            resolve(result);
            navigate(0); // Refresh current card to show updated score
        }, startedAt);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  BANNER / NATIVE / AD MOUNTS
// ══════════════════════════════════════════════════════════════════════════════
function pickBannerConfig(target) {
    const slotWidth = target?.clientWidth || window.innerWidth || 360;
    const candidates = ADSTERRA_BANNERS.filter(b => b.width <= slotWidth + 24);
    const pool = candidates.length ? candidates : ADSTERRA_BANNERS.filter(b => b.width <= 320);
    const banner = pool[bannerIndex % pool.length];
    bannerIndex++;
    return banner;
}

function mountAdsterraBanner(target) {
    if (!target) return;
    const banner = pickBannerConfig(target);
    target.innerHTML = "";
    const opt = document.createElement("script");
    opt.text = `window.atOptions={key:"${banner.key}",format:"iframe",height:${banner.height},width:${banner.width},params:{}};`;
    const inv = document.createElement("script");
    inv.src = `https://www.highperformanceformat.com/${banner.key}/invoke.js`;
    inv.async = true;
    target.appendChild(opt);
    target.appendChild(inv);
}

function mountNativeBanner(target) {
    if (!target) return;
    target.innerHTML = `<div id="${NATIVE_BANNER_CONTAINER_ID}"></div>`;
    const s = document.createElement("script");
    s.src = NATIVE_BANNER_SCRIPT; s.async = true;
    s.setAttribute("data-cfasync", "false");
    target.appendChild(s);
}

function mountSmartLinkPanel(target) { if (target) mountFeaturedLink(target, getNextSponsorLink()); }

function mountVignetteBreakPanel(target) {
    if (!target) return;
    mountFeaturedLink(target, getNextSponsorLink(), "Short visit unlocks a 20-100 score boost.");
    triggerPassiveAdPulse("vignette");
}

function mountQuickBreakPanel(target) {
    if (!target) return;
    const mode = Math.random() < 0.6 ? "A" : "B";
    const link = getNextSponsorLink();
    if (mode === "A") _renderQuickBreakModeA(target, link);
    else _renderQuickBreakModeB(target);
}

function _renderQuickBreakModeA(target, sponsorLink) {
    target.innerHTML = `
      <div class="qb-panel" id="qb-panel-a">
        <div class="qb-support-badge"><span class="qb-support-dot"></span>LINK OFFER</div>
        <p class="qb-msg"><strong>Unlock extra engagement score.</strong><br/>Visit the offer, come back, and get a random 20-100 score boost.</p>
        <a class="qb-support-btn" href="${esc(sponsorLink.url)}" target="_blank" rel="noopener noreferrer sponsored" id="qb-support-link">Open Link Offer</a>
        <div class="qb-ad-slot" id="qb-ad-slot-a"></div>
        <button class="qb-skip-btn" id="qb-skip-a">Skip ➡</button>
      </div>`;
    triggerPassiveAdPulse("vignette");
    target.querySelector("#qb-support-link")?.addEventListener("click", event => {
        event.preventDefault();
        openSponsorLink(sponsorLink, {
            context: "quick-break",
            source: "quick-break-offer",
            claimToken: createBonusClaimToken()
        });
    });
    target.querySelector("#qb-skip-a")?.addEventListener("click", () => { clearPendingAdRedirect(); navigate(1); });
    lockNavigationButtons(5000);
}

function _renderQuickBreakModeB(target) {
    target.innerHTML = `
      <div class="qb-panel" id="qb-panel-b">
        <div class="qb-support-badge"><span class="qb-support-dot"></span>SPONSOR BREAK</div>
        <p class="qb-msg"><strong>A quick message from our sponsors.</strong><br/>Helps us keep the creator economy running 🙏</p>
        <div class="qb-ad-slot" id="qb-ad-slot-b"></div>
        <p class="qb-passive-note">Vignette ad may appear — close it to continue.</p>
        <button class="qb-skip-btn" id="qb-skip-b" disabled>Skip in <span class="qb-skip-countdown" id="qb-countdown">3</span>s</button>
      </div>`;
    triggerPassiveAdPulse("vignette");
    mountAdsterraBanner(target.querySelector("#qb-ad-slot-b"));
    const skipBtn = target.querySelector("#qb-skip-b");
    const cntEl = target.querySelector("#qb-countdown");
    let remaining = 3;

    _qbSkipTick = setInterval(() => {
        remaining--;
        if (cntEl) cntEl.textContent = remaining;
        if (remaining <= 0) {
            _clearQbTick();
            if (skipBtn) { skipBtn.disabled = false; skipBtn.innerHTML = "Skip ➡"; }
        }
    }, 1000);

    skipBtn?.addEventListener("click", () => {
        if (skipBtn.disabled) return;
        clearPendingAdRedirect();
        navigate(1);
    });
    lockNavigationButtons(5000);
}

function mountFeaturedLink(target, link, note = "Short visit unlocks a 20-100 score boost") {
    if (!target || !link) return;
    target.innerHTML = `
      <a class="featured-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer sponsored">
        <span class="quick-link-meta">${esc(link.network)}</span>
        <strong>${esc(link.label)}</strong>
        <small>${esc(note)}</small>
      </a>`;
    target.querySelector(".featured-link")?.addEventListener("click", event => {
        event.preventDefault();
        openSponsorLink(link, {
            context: "quick-break",
            source: "featured-link-offer",
            claimToken: createBonusClaimToken()
        });
    });
}

function getNextFeedAdConfig() {
    const config = AD_CARD_ROTATION[feedAdIndex % AD_CARD_ROTATION.length];
    feedAdIndex++;
    return config;
}

function mountFeedAdExperience(config, target) {
    if (!target || !config) return;
    const handlers = {
        "banner": () => mountAdsterraBanner(target),
        "native": () => mountNativeBanner(target),
        "vignette": () => mountVignetteBreakPanel(target),
        "quick-break": () => mountQuickBreakPanel(target),
        "smart-link": () => mountSmartLinkPanel(target),
    };
    (handlers[config.type] || handlers["banner"])();
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROFILE SPONSOR
// ══════════════════════════════════════════════════════════════════════════════
function renderProfileSponsor() {
    const sec = $("profile-sponsor");
    if (!sec) return;
    if (!bonusFlowCompleted) { sec.classList.add("hidden"); return; }
    sec.classList.remove("hidden");
    mountAdsterraBanner($("profile-ad-slot"));
    renderQuickLinks("profile-quick-links");
}

function initializeAds() { passiveAdsInitialized = true; }

// ══════════════════════════════════════════════════════════════════════════════
//  SESSION ENGAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function registerSessionEngagement(type, postId) {
    const bucket = sessionEngagementLedger[type];
    if (!bucket || !postId || bucket.has(postId)) return;

    bucket.add(postId);
    const points = SESSION_ENGAGEMENT_POINTS[type] || 0;
    sessionEngagementScore += points;
    xpCollectedBuffer += points;

    if (xpCollectedBuffer >= 100) {
        showXPProgress(xpCollectedBuffer);
        xpCollectedBuffer = 0;
    }

    const TARGET = 1000;
    if (sessionEngagementScore >= TARGET) {
        const earnedCredits = Math.floor(sessionEngagementScore / TARGET);
        sessionEngagementScore = sessionEngagementScore % TARGET;
        lolUserData.lolCreatorCredits = (lolUserData.lolCreatorCredits || 0) + earnedCredits;
        showToast(`🎉 +${earnedCredits} Creator Credit earned!`);
    }
    updateHeaderUI();
}

function initXPSystem() {
    if (!document.getElementById("xp-style")) {
        const style = document.createElement("style");
        style.id = "xp-style";
        style.innerHTML = `
        .xp-popup {
            position: fixed;
            top: 80px;
            right: 16px;
            z-index: 9999;
            pointer-events: none;
        }
        .xp-card {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 12px 16px;
            min-width: 200px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            transform: translateY(-20px);
            opacity: 0;
            animation: xpIn 0.4s ease forwards;
        }
        @keyframes xpIn {
            to { transform: translateY(0); opacity: 1; }
        }
        .xp-title {
            font-size: 16px;
            font-weight: 700;
            color: #22c55e;
        }
        .xp-sub {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 4px;
        }
        .xp-bar {
            margin-top: 6px;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 999px;
            overflow: hidden;
        }
        .xp-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #22c55e, #06b6d4);
            transition: width 0.4s ease;
        }`;
        document.head.appendChild(style);
    }

    if (!document.getElementById("xp-popup")) {
        const div = document.createElement("div");
        div.id = "xp-popup";
        div.className = "xp-popup hidden";
        div.innerHTML = `
        <div class="xp-card">
            <div class="xp-title">+<span id="xp-earned">0</span> XP</div>
            <div class="xp-sub">
                <span id="xp-current">0</span> / 1000 to next Creator Credit
            </div>
            <div class="xp-bar">
                <div class="xp-fill" id="xp-fill"></div>
            </div>
        </div>`;
        document.body.appendChild(div);
    }
}

let xpTimeout;

function showXPProgress(earnedXP) {
    const popup = document.getElementById("xp-popup");
    if (!popup) return;

    const earnedEl = document.getElementById("xp-earned");
    const currentEl = document.getElementById("xp-current");
    const fill = document.getElementById("xp-fill");

    const TARGET = 1000;
    // Use lolUserData.engagementScore (persistent) instead of sessionEngagementScore
    const currentScore = lolUserData?.engagementScore || 0;
    const progress = currentScore % TARGET;
    const percent = (progress / TARGET) * 100;

    earnedEl.textContent = earnedXP;
    currentEl.textContent = progress;
    fill.style.width = percent + "%";

    popup.classList.remove("hidden");

    const card = popup.querySelector(".xp-card");
    card.style.animation = "none";
    card.offsetHeight;
    card.style.animation = "";

    clearTimeout(xpTimeout);
    xpTimeout = setTimeout(() => {
        popup.classList.add("hidden");
    }, 2000);
}

let xpCollectedBuffer = 0;
let xpIntervalStarted = false;

function startXPInterval() {
    if (xpIntervalStarted) return;
    xpIntervalStarted = true;

    setInterval(() => {
        if (xpCollectedBuffer <= 0) return;
        showXPProgress(xpCollectedBuffer);
        xpCollectedBuffer = 0;
    }, 60000);
}

function completeBonusFlow() {
    bonusCardPending = false; bonusFlowCompleted = true; bonusClaimPending = false;
    sessionBonusClaimToken = createBonusClaimToken();
    initializeAds();
    scheduleNextFeedAd();
    scheduleNextBonusCard();
}

function resetBonusState() {
    if (!bonusFlowCompleted) {
        bonusClaimPending = false;
        sponsorVisitPending = false;
        detachBonusTabReturnListener();
    }
}

async function claimSessionBonusReward(link, options = {}) {
    try {
        const visitDurationMs = Math.max(0, Math.floor(Number(options.visitDurationMs) || 0));
        const sponsorVisited = options.sponsorVisited === true || visitDurationMs >= BONUS_SPONSOR_MIN_VISIT_MS;
        const claimScore = Math.max(BONUS_CARD_MIN_ENGAGEMENT, Math.floor(Number(sessionEngagementScore) || 0));
        const res = await cfClaimLolSessionBonus({
            sessionEngagementScore: claimScore,
            claimToken: options.claimToken || sessionBonusClaimToken,
            sponsorNetwork: link?.network || "",
            sponsorLabel: link?.label || "",
            sponsorUrl: link?.url || "",
            source: options.source || "lol-feed-bonus",
            sponsorVisited,
            visitDurationMs,
            rewardMin: Math.max(QUICK_LINK_REWARD_MIN, Number(link?.rewardMin) || QUICK_LINK_REWARD_MIN),
            rewardMax: Math.min(QUICK_LINK_REWARD_MAX, Number(link?.rewardMax) || QUICK_LINK_REWARD_MAX),
        });
        if (res?.data?.listenUser) listenUserData = res.data.listenUser;
        if (res?.data?.lolUser) { lolUserData = res.data.lolUser; updateHeaderUI(); }
        if (res?.data?.success === false) return { success: false, message: res.data.message || "Bonus service not ready yet." };
        const reward = Number(res?.data?.engagementScoreAwarded || 0);
        return {
            success: true,
            reward,
            message: reward > 0
                ? `Boost unlocked: +${reward} engagement score.`
                : "Claim submitted. Engagement boost will reflect shortly.",
        };
    } catch (err) {
        console.warn("[LoL] claimLolSessionBonus failed", err.code || err.message);
        return { success: false, message: "Bonus server unavailable. Try again later." };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  GATE SCREENS
// ══════════════════════════════════════════════════════════════════════════════
function renderEmptyFeed() {
    $("card-stack").innerHTML = `<div class="lol-card"><div class="empty-feed"><h3>No LoLs yet</h3><p>Fresh posts will show up here soon. Try again in a moment.</p></div></div>`;
}
function showGateLoading(msg = "Checking your Viber status…") {
    $("gate-loading").classList.remove("hidden");
    $("gate-noaccount").classList.add("hidden");
    $("gate-error").classList.add("hidden");
    $("gate-loading-text").textContent = msg;
    showScreen("gate-screen");
}
function showGateNoAccount() {
    $("gate-loading").classList.add("hidden");
    $("gate-noaccount").classList.remove("hidden");
    $("gate-error").classList.add("hidden");
    showScreen("gate-screen");
}
function showGateError(msg = "Something went wrong. Please retry.") {
    $("gate-loading").classList.add("hidden");
    $("gate-noaccount").classList.add("hidden");
    $("gate-error").classList.remove("hidden");
    $("gate-error-msg").textContent = msg;
    showScreen("gate-screen");
}

// ══════════════════════════════════════════════════════════════════════════════
//  GATE BUTTONS
// ══════════════════════════════════════════════════════════════════════════════
$("btn-join-listen").addEventListener("click", () => { window.location.href = LISTEN_URL; });
$("btn-retry").addEventListener("click", () => {
    const u = auth.currentUser;
    if (u) { showGateLoading("Retrying…"); bootApp(u); } else showGateNoAccount();
});
$("btn-error-retry").addEventListener("click", () => {
    const u = auth.currentUser;
    if (u) { showGateLoading("Retrying…"); bootApp(u); } else showGateNoAccount();
});

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH STATE
// ══════════════════════════════════════════════════════════════════════════════
showGateLoading("Checking your Viber status…");
onAuthStateChanged(auth, async user => {
    if (!user) { showGateNoAccount(); return; }
    await bootApp(user);
});

// ══════════════════════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════════════════════
async function bootApp(user) {
    currentUser = user;
    resetSessionExperience();
    setFeedFullscreen(false);
    showGateLoading("Loading your profile…");
    try {
        const res = await cfInitLolUser();
        if (!res?.data?.success) { showGateNoAccount(); return; }
        listenUserData = res.data.listenUser;
        lolUserData = res.data.lolUser;
    } catch (err) {
        console.error("init failed", err.code || err.message);
        showGateError("Something went wrong. Retry.");
        return;
    }
    updateHeaderUI();
    initXPSystem();
    startXPInterval();
    ensureBackTrap();
    openFeed();
    bindFeedGestures();
    initializeAds();
    await loadPosts(true);
    renderCard();
    checkDeepLink();
    setTimeout(() => { const h = $("swipe-hint"); if (h) h.style.opacity = "0"; }, 4000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  HEADER UI
// ══════════════════════════════════════════════════════════════════════════════
function updateHeaderUI() {
    if (!lolUserData) return;
    $("credit-count").textContent = lolUserData.lolCreatorCredits || 0;
    $("user-avatar").src = lolUserData.userDp || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${lolUserData.uid}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOAD POSTS
// ══════════════════════════════════════════════════════════════════════════════
async function loadPosts(initial = false) {
    if (initial) {
        posts = []; cardIndex = 0; lastCreatedAt = null; noMorePosts = false;
        preloadedVideos.forEach(v => { v.src = ""; v.load(); });
        preloadedVideos.clear();
    }
    if (isLoading || noMorePosts) return;
    isLoading = true;
    $("feed-loader").style.display = "flex";
    try {
        let addedCount = 0;
        for (let attempt = 0; attempt < 2 && addedCount === 0; attempt++) {
            const res = await cfLoadFeed({
                lastCreatedAt,
                limitCount: FEED_LOAD_LIMIT,
                seenPostIds: getFeedExcludeIds(),
            });
            const incoming = res.data.posts || [];
            const fresh = normalizeFeedPosts(incoming);
            if (res.data.lastCreatedAt) lastCreatedAt = res.data.lastCreatedAt;
            if (fresh.length) {
                posts.push(...fresh);
                addedCount = fresh.length;
                cardIndex = Math.min(cardIndex, posts.length - 1);
            }
            if (!incoming.length) { noMorePosts = true; break; }
        }
        if (!addedCount) noMorePosts = true;
        if (!addedCount && !initial) showToast("No fresh LoLs right now. Try again soon.");
    } catch (err) {
        console.error("load feed error", err.code || err.message);
        showToast("Failed to load posts");
    }
    $("feed-loader").style.display = "none";
    isLoading = false;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CARD RENDER
// ══════════════════════════════════════════════════════════════════════════════
function renderCard() {
    stopViewTimer();
    clearPendingAdRedirect();
    detachBonusTabReturnListener();
    PASSIVE_AD_SCRIPTS.forEach(c => cleanupPassiveAdScript(c.id));

    if (!posts.length) { renderEmptyFeed(); return; }

    if (swipeCount > 0 && swipeCount >= nextBonusSwipeAt) {
        if (sessionEngagementScore >= BONUS_CARD_MIN_ENGAGEMENT) {
            bonusCardPending = true;
            renderBonusCard();
            return;
        }
        scheduleNextBonusCard();
    }
    if (swipeCount > 0 && swipeCount >= nextAdSwipeAt) {
        scheduleNextFeedAd();
        renderAdCard();
        return;
    }

    cardIndex = Math.min(Math.max(cardIndex, 0), posts.length - 1);
    const post = posts[cardIndex];
    if (!post) return;

    preloadThumbnail(post);
    if (posts[cardIndex + 1]) preloadThumbnail(posts[cardIndex + 1]);
    if (posts[cardIndex - 1]) preloadThumbnail(posts[cardIndex - 1]);

    rememberSeenPost(post.id);
    $("card-stack").innerHTML = buildCard(post);
    attachCardEvents(post);
    console.log(`[LoL] Viewing post ${post.id} at index ${cardIndex} (swipeCount: ${swipeCount})`);
    setTimeout(predictivePreload, 100);
    startViewTimer(post);
}

function buildCard(post) {
    const tags = (post.hashtags || []).map(t => `<span class="tag">${t}</span>`).join("");
    const liked = localStorage.getItem(`liked_${post.id}`) === "1";
    const navArrows = isFeedFullscreen ? "" : `
      <div class="nav-arrows">
        <button class="arrow-btn prev-btn">⬅</button>
        <button class="arrow-btn next-btn">➡</button>
      </div>`;

    return `
  <div class="lol-card" data-id="${post.id}">
    <div class="card-creator">
      <img class="c-dp"
        src="${post.creatorPhoto || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${post.uid}`}"
        onerror="this.src='https://api.dicebear.com/7.x/fun-emoji/svg?seed=x'" />
      <div class="c-info">
        <span class="c-name">${esc(post.creatorName || "Anonymous")}</span>
        <span class="c-time">${timeAgo(postDateToDate(post.createdAtMs || post.createdAt))}</span>
      </div>
      <div class="card-counter">${cardIndex + 1} / ${posts.length}</div>
    </div>

    <div class="card-title-wrap">
      <h2 class="card-title">${esc(post.title)}</h2>
      <div class="tag-scroll-area">${tags}</div>
    </div>

    <div class="card-media">${buildMedia(post)}</div>

    <div class="card-footer">
      <div class="card-stats">
        <span>👁 <span class="stat-v">${fmt(post.views || 0)}</span></span>
        <span>💖 <span class="stat-l">${fmt(post.likes || 0)}</span></span>
        <span>ᯓ➤ <span class="stat-s">${fmt(post.shares || 0)}</span></span>
      </div>
      <div class="card-actions">
        <button class="act-btn like-btn ${liked ? "liked" : ""}" data-id="${post.id}">
          ${liked ? "💖" : "🤍"} Like
        </button>
        <button class="act-btn share-btn" data-id="${post.id}">
          ᯓ➤ Share
        </button>
      </div>
      ${navArrows}
    </div>
  </div>`;
}

function buildMedia(post) {
    if (!post.mediaURL) return `<div class="no-media">😂</div>`;

    if (post.mediaType === "video") {
        const posterUrl = post.thumbnail || post.mediaURL;

        return `
          <div class="video-stage">
            <video 
              class="card-video"  
              src="${post.mediaURL}"
              poster="${posterUrl}"
              autoplay 
              loop 
              muted
              playsinline>
            </video>

            <div class="video-loading-overlay" id="video-loading-${post.id}">
              <div class="video-loading-content">
                <div class="lol-loading-icon"><img src="/assets/logo/lol-ic.png" alt=""></div>
                <div class="loading-text">Loading LoL...</div>
              </div>
            </div>
          </div>`;
    }

    return `<img class="card-img" src="${post.mediaURL}" alt="${esc(post.title)}" loading="lazy" />`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIDEO CONTROLS
// ══════════════════════════════════════════════════════════════════════════════
function attachVideoControls(surface, video) {
    if (!surface || !video) return;
    

    let holdTimer = null;
    let holdTriggered = false;
    let resumeAfterHold = false;
    let pressX = 0, pressY = 0;
    let suppressClick = false;
    let clickTimeout = null;

    const clearHold = () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } };

    const startPress = (x, y) => {
        pressX = x; pressY = y; holdTriggered = false;
        resumeAfterHold = !video.paused;
        clearHold();
        holdTimer = setTimeout(() => { holdTriggered = true; video.pause(); }, VIDEO_HOLD_DELAY_MS);
    };
    const movePress = (x, y) => {
        if (Math.abs(x - pressX) > VIDEO_HOLD_MOVE_TOLERANCE ||
            Math.abs(y - pressY) > VIDEO_HOLD_MOVE_TOLERANCE) clearHold();
    };
    const endPress = () => {
        clearHold();
        if (!holdTriggered) return;
        holdTriggered = false;
        if (resumeAfterHold) video.play().catch(() => { });
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 260);
    };

    surface.addEventListener("pointerdown", e => { if (e.pointerType === "mouse" && e.button !== 0) return; startPress(e.clientX, e.clientY); });
    surface.addEventListener("pointermove", e => movePress(e.clientX, e.clientY));
    surface.addEventListener("pointerup", endPress);
    surface.addEventListener("pointercancel", endPress);
    surface.addEventListener("pointerleave", endPress);

    surface.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        if (suppressClick) { suppressClick = false; return; }

        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            setFeedFullscreen(!isFeedFullscreen);
            return;
        }
        clickTimeout = setTimeout(() => {
            video.muted = !video.muted;
            soundEnabled = !video.muted;
            isInteracted = !video.muted; // treat unmute as interaction for ad purposes
            localStorage.setItem("soundEnabled", soundEnabled);
            clickTimeout = null;
        }, 200);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  ATTACH CARD EVENTS (UPDATED – overlay hides on 'playing' only)
// ══════════════════════════════════════════════════════════════════════════════
function attachCardEvents(post) {
    const s = $("card-stack");

    s.querySelector(".like-btn")?.addEventListener("click", () => handleLike(post));
    s.querySelector(".share-btn")?.addEventListener("click", () => handleShare(post));
    s.querySelector(".next-btn")?.addEventListener("click", () => { if (!isNavigating) navigate(1); });
    s.querySelector(".prev-btn")?.addEventListener("click", () => { if (!isNavigating) navigate(-1); });

    const vs = s.querySelector(".video-stage");
    const vid = s.querySelector(".card-video");
    const loadingOverlay = s.querySelector(`#video-loading-${post.id}`);

    if (!vs || !vid || !loadingOverlay) return;

    const pre = preloadedVideos.get(post.id);
    if (pre && pre.src) {
        vid.src = pre.src;   // ✅ Fixed: use .src, not .currentSrc
        vid.load();
    }

    // Show loading overlay initially
    loadingOverlay.classList.remove("hidden");

    // Helper to safely hide overlay
    const hideOverlay = () => {
        if (loadingOverlay) loadingOverlay.classList.add("hidden");
    };

    // ✅ PRIMARY: Hide when video has enough data to start playing
    vid.addEventListener("canplay", () => {
        if (vid.readyState >= 2 && vid.videoWidth > 0) {
            hideOverlay();
        }
    }, { once: true });

    // Secondary: hide when playback actually starts
    vid.addEventListener("playing", hideOverlay, { once: true });

    // Fallback: loadeddata + short delay
    vid.addEventListener("loadeddata", () => {
        setTimeout(() => {
            if (loadingOverlay && !loadingOverlay.classList.contains("hidden")) {
                hideOverlay();
            }
        }, 1200);
    }, { once: true });

    // Error fallback
    vid.addEventListener("error", () => {
        console.warn("Video failed to load:", post.mediaURL);
        hideOverlay();
    }, { once: true });

    // Ultimate safety: hide after 5 seconds no matter what
    setTimeout(hideOverlay, 5000);

    vid.muted = !soundEnabled;
    vid.volume = 1;
    vid.playsInline = true;
    vid.play().catch(() => {});  // Attempt autoplay

    attachVideoControls(vs, vid);
    setActiveVideo(vid);
}
// ══════════════════════════════════════════════════════════════════════════════
//  NAVIGATE
// ══════════════════════════════════════════════════════════════════════════════
async function navigate(dir) {
    if (!posts.length || isNavigating) return;
    isNavigating = true;
    swipeNavigationLocked = true;

    try {
        swipeCount++;
        trackSwipe(dir);

        if (dir > 0) {
            if (cardIndex >= posts.length - 3) await loadPosts(false);
            if (cardIndex < posts.length - 1) {
                cardIndex++;
            } else {
                await loadPosts(false);
                if (cardIndex < posts.length - 1) cardIndex++;
                else showToast("");
            }
        } else {
            cardIndex = Math.max(0, cardIndex - 1);
        }

        predictivePreload();
        renderCard();
    } finally {
        isNavigating = false;
        swipeNavigationLocked = false;
        swipeFired = false;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIEW TIMER
// ══════════════════════════════════════════════════════════════════════════════
function createWatchSessionId(postId) {
    return `${postId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function sendWatchEngagement(post, session, { rewarded = false } = {}) {
    if (!post || !session || session.postId !== post.id) return null;
    const watchTimeMs = Math.max(0, Math.floor(session.watchTimeMs || 0));
    if (watchTimeMs < 1000) return null;
    session.lastQueuedWatchTimeMs = Math.max(session.lastQueuedWatchTimeMs || 0, watchTimeMs);

    const res = await cfTrackEngagement({
        postId: post.id,
        type: "view",
        watchTimeMs,
        watchTime: watchTimeMs,
        watchTimeSeconds: Math.floor(watchTimeMs / 1000),
        watchSessionId: session.id,
        insightOnly: !rewarded,
        rewardedView: rewarded
    });

    session.lastSentWatchTimeMs = Math.max(session.lastSentWatchTimeMs || 0, watchTimeMs);
    return res;
}

function shouldCountWatchTime(post, video) {
    if (!post || activePostId !== post.id || !canFeedVideoPlay()) return false;
    return post.mediaType === "video" ? isVideoReallyPlaying(video) : true;
}

async function maybeSendWatchProgress(post, video, session, key) {
    if (!session || session.postId !== post.id) return;

    const now = Date.now();
    const delta = Math.min(Math.max(now - session.lastTickAt, 0), 1000);
    session.lastTickAt = now;

    if (!shouldCountWatchTime(post, video)) return;
    session.watchTimeMs += delta;

    if (!session.shortInsightSent && session.watchTimeMs >= WATCH_INSIGHT_MIN_MS) {
        session.shortInsightSent = true;
        sendWatchEngagement(post, session, { rewarded: false }).catch(err => {
            console.warn("[LoL] watch insight failed", err.code || err.message);
        });
    }

    if (!session.rewardSent && session.watchTimeMs >= VIEW_REWARD_MIN_WATCH_MS) {
        if (!session.rewardEligible) {
            if (!session.longInsightSent) {
                session.longInsightSent = true;
                sendWatchEngagement(post, session, { rewarded: false }).catch(err => {
                    console.warn("[LoL] long watch insight failed", err.code || err.message);
                });
            }
            return;
        }

        session.rewardSent = true;
        try {
            const res = await sendWatchEngagement(post, session, { rewarded: true });
            if (res?.data?.rewarded !== false) {
                // ✅ Update global user data from server response
                if (res?.data?.lolUser) {
                    lolUserData = res.data.lolUser;
                }
                localStorage.setItem(key, String(Date.now()));
                registerSessionEngagement("view", post.id);
                updateHeaderUI();
            }
        } catch (err) {
            session.rewardSent = false;
            console.warn("[LoL] view tracking failed", err.code || err.message);
        }
    }
}

function startViewTimer(post) {
    stopViewTimer();
    activePostId = post.id;
    const key = `viewed_${post.id}`;
    const lastView = Number(localStorage.getItem(key) || 0);
    const now = Date.now();
    const video = document.querySelector(".lol-card .card-video");

    activeViewSession = {
        id: createWatchSessionId(post.id),
        postId: post.id,
        watchTimeMs: 0,
        lastSentWatchTimeMs: 0,
        lastQueuedWatchTimeMs: 0,
        lastTickAt: Date.now(),
        shortInsightSent: false,
        longInsightSent: false,
        rewardSent: false,
        rewardEligible: now - lastView >= 30 * 60 * 1000
    };

    viewTimer = setInterval(() => {
        maybeSendWatchProgress(post, video, activeViewSession, key);
    }, 250);
}
function stopViewTimer() {
    if (viewTimer) {
        clearInterval(viewTimer);
        viewTimer = null;
    }

    const session = activeViewSession;
    activeViewSession = null;
    if (
        session &&
        session.watchTimeMs >= WATCH_INSIGHT_MIN_MS &&
        !session.rewardSent &&
        session.watchTimeMs - Math.max(session.lastSentWatchTimeMs || 0, session.lastQueuedWatchTimeMs || 0) >= 1000
    ) {
        const post = posts.find(p => p.id === session.postId);
        if (post) {
            sendWatchEngagement(post, session, { rewarded: false }).catch(err => {
                console.warn("[LoL] final watch insight failed", err.code || err.message);
            });
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  LIKE
// ══════════════════════════════════════════════════════════════════════════════
async function handleLike(post) {
    const key = `liked_${post.id}`;
    if (likeLocks.has(post.id)) return;
    likeLocks.add(post.id);

    const card = $("card-stack");
    if (!card) { likeLocks.delete(post.id); return; }

    const likeBtn = card.querySelector(".like-btn");
    const likeEl = card.querySelector(".stat-l");

    // Prevent double‑like if already marked
    if (localStorage.getItem(key) === "1") {
        showToast("Already liked! 💖");
        likeLocks.delete(post.id);
        return;
    }

    // Optimistic UI feedback (will be corrected if server fails)
    const oldLikes = post.likes || 0;
    likeBtn?.classList.add("liked");
    if (likeBtn) likeBtn.textContent = "💖 Liked";
    if (likeEl) likeEl.textContent = fmt(oldLikes + 1);
    post.likes = oldLikes + 1;

    try {
        const res = await cfTrackEngagement({ postId: post.id, type: "like" });

        // ✅ Sync with server response
        if (res?.data?.lolUser) {
            lolUserData = res.data.lolUser;
            updateHeaderUI();
        }

        // ✅ Only now mark as liked in local storage
        localStorage.setItem(key, "1");
        registerSessionEngagement("like", post.id);
        showToast("Liked! 💖");

    } catch (err) {
        console.warn("Like failed", err.code || err.message);
        // Revert optimistic changes
        localStorage.removeItem(key);
        likeBtn?.classList.remove("liked");
        if (likeBtn) likeBtn.textContent = "🤍 Like";
        if (likeEl) likeEl.textContent = fmt(oldLikes);
        post.likes = oldLikes;
        showToast("Like failed ❌");
    } finally {
        likeLocks.delete(post.id);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHARE
// ══════════════════════════════════════════════════════════════════════════════
async function handleShare(post) {
    const url = `${location.origin}${location.pathname}?lol=${post.id}`;
    const startTime = Date.now();
    let nativeShared = false;

    // Attempt native share
    try {
        const file = thumbCache.get(post.id);
        if (file && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: post.title, text: post.title, url, files: [file] });
        } else {
            await navigator.share({ title: post.title, text: post.title, url });
        }
        const shareDuration = Date.now() - startTime;
        if (shareDuration < 1200) {
            showToast("⚠️ Share dismissed too quickly — no reward given.");
            return;
        }
        nativeShared = true;
    } catch (err) {
        console.warn("Native share failed, falling back to clipboard", err.message);
    }

    if (nativeShared) {
        const key = `shared_${post.id}`;
        if (localStorage.getItem(key) === "1") {
            showToast("Already shared 👍");
            return;
        }

        // Optimistic UI update (shares count)
        const shareEl = document.querySelector(".stat-s");
        const oldShares = post.shares || 0;
        if (shareEl) shareEl.textContent = fmt(oldShares + 1);
        post.shares = oldShares + 1;

        try {
            const res = await cfTrackEngagement({
                postId: post.id,
                type: "share",
                shareConfirmed: true,
                visitDurationMs: Date.now() - startTime
            });

            // ✅ Sync with server response
            if (res?.data?.lolUser) {
                lolUserData = res.data.lolUser;
                updateHeaderUI();
            }

            localStorage.setItem(key, "1");
            registerSessionEngagement("share", post.id);
            showToast("🚀 Share counted!");

        } catch (err) {
            console.warn("Share tracking failed", err.code || err.message);
            // Revert optimistic share count
            if (shareEl) shareEl.textContent = fmt(oldShares);
            post.shares = oldShares;
            showToast("Share not counted ❌");
        }
        return;
    }

    // Fallback: clipboard copy (no reward)
    try {
        await navigator.clipboard.writeText(url);
        showToast("🔗 Link copied to clipboard!");
    } catch (clipErr) {
        console.warn("Clipboard write failed", clipErr.message);
        showToast("❌ Unable to share or copy link.");
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  THUMBNAIL PRELOAD CACHE (with size limit)
// ══════════════════════════════════════════════════════════════════════════════

const failedThumbUrls = new Set();
const thumbCache = new Map();

async function preloadThumbnail(post) {
    const url = post?.thumbnail;
    if (!url || thumbCache.has(post.id) || failedThumbUrls.has(url)) return;
    try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const file = new File([blob], "thumb.jpg", { type: blob.type || "image/jpeg" });
        thumbCache.set(post.id, file);
        if (thumbCache.size > MAX_THUMB_CACHE) {
            const firstKey = thumbCache.keys().next().value;
            thumbCache.delete(firstKey);
        }
    } catch (err) {
        failedThumbUrls.add(url);   // never retry this URL
        console.warn("Thumbnail preload failed:", err.message);
    }
}

function lockNavigationButtons(duration = AD_IMPRESSION_LOCK_MS) {
    const nextBtn = document.querySelector(".next-btn, .next-btn-ad");
    const prevBtn = document.querySelector(".prev-btn, .prev-btn-ad");

    if (!nextBtn && !prevBtn) return;

    let remaining = Math.ceil(duration / 1000);

    const updateText = () => {
        if (nextBtn) nextBtn.textContent = `➡ ${remaining}s`;
        if (prevBtn) prevBtn.textContent = `⬅ ${remaining}s`;
    };

    nextBtn && (nextBtn.disabled = true);
    prevBtn && (prevBtn.disabled = true);

    updateText();

    const interval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            updateText();
        } else {
            clearInterval(interval);

            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.textContent = "➡";
            }
            if (prevBtn) {
                prevBtn.disabled = false;
                prevBtn.textContent = "⬅";
            }
        }
    }, 1000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  AD CARD
// ══════════════════════════════════════════════════════════════════════════════
function renderAdCard() {
    const config = getNextFeedAdConfig();
    $("card-stack").innerHTML = `
  <div class="lol-card ad-card">
    <div class="ad-head">
      <div class="ad-label">Sponsored</div>
      <div class="ad-network-pill">${esc(config.network)}</div>
    </div>
    <h3 class="ad-title">${esc(config.title)}</h3>
    <p class="ad-copy">${esc(config.copy)}</p>
    <div class="inline-ad-slot inline-ad-slot--feed" id="feed-ad-stage"><p class="ad-loading">Loading sponsor…</p></div>
    <div class="quick-links quick-links--compact" id="feed-ad-links"></div>
    <div class="nav-arrows">
      <button class="arrow-btn prev-btn-ad">⬅</button>
      <button class="arrow-btn next-btn-ad">➡ Skip</button>
    </div>
  </div>`;
    mountFeedAdExperience(config, $("feed-ad-stage"));
    if (config.type === "smart-link") maybeTriggerPassiveAdPulse(0.5);
    renderQuickLinks("feed-ad-links");
    $("card-stack").querySelector(".next-btn-ad").addEventListener("click", () => { clearPendingAdRedirect(); if (!isNavigating) navigate(1); });
    $("card-stack").querySelector(".prev-btn-ad").addEventListener("click", () => { clearPendingAdRedirect(); if (!isNavigating) navigate(-1); });
    lockNavigationButtons(5000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  BONUS CARD
// ══════════════════════════════════════════════════════════════════════════════
function renderBonusCard() {
    resetBonusState();
    const sponsorLink = getNextSponsorLink();
    $("card-stack").innerHTML = `
  <div class="lol-card bonus-card">
    <div class="bonus-inner">
      <div class="bonus-emoji">🎁</div>
      <h2 class="bonus-title">Bonus Available</h2>
      <p class="bonus-sub">
        You've reached <strong>${sessionEngagementScore}</strong> session engagement points.
        Open a link offer, come back after a short visit, and unlock a
        <strong>random 20-100 engagement score boost</strong>.
        The final reward is confirmed server-side.
        Skipping has no penalty.
      </p>
      <div class="bonus-cta-row">
        <button class="btn-claim" id="btn-claim">Open Link Offer &amp; Unlock Boost</button>
      </div>
      <div class="inline-ad-slot inline-ad-slot--bonus" id="bonus-ad-slot"><p class="ad-loading">Sponsor banner loads after claim.</p></div>
      <div class="quick-links quick-links--compact" id="bonus-quick-links"></div>
      <button class="arrow-btn" id="skip-bonus">Skip ➡</button>
    </div>
  </div>`;
    renderQuickLinks("bonus-quick-links");

    $("btn-claim").addEventListener("click", async () => {
        if (bonusClaimPending) return;
        bonusClaimPending = true;
        $("btn-claim").disabled = true;
        $("btn-claim").textContent = "Visit offer, then return...";
        triggerPassiveAdPulse("vignette");
        mountAdsterraBanner($("bonus-ad-slot"));
        const result = await openSponsorLink(sponsorLink, {
            context: "bonus",
            source: "lol-feed-bonus",
            claimToken: sessionBonusClaimToken
        });

        if (result.success) {
            completeBonusFlow();
            setTimeout(() => { if (!isNavigating) navigate(1); }, 2000);
            return;
        }

        bonusClaimPending = false;
        $("btn-claim").disabled = false;
        $("btn-claim").textContent = "Open Link Offer & Unlock Boost";
    });

    $("skip-bonus").addEventListener("click", () => {
        resetBonusState();
        completeBonusFlow();
        if (!isNavigating) navigate(1);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  DEEP LINK
// ══════════════════════════════════════════════════════════════════════════════
async function checkDeepLink() {
    const id = new URLSearchParams(location.search).get("lol");
    if (!id) return;

    try {
        const res = await getPost({ postId: id });

        if (!res?.data?.success || !res.data.post) return;

        const deepPost = res.data.post;
        deepPost.createdAtMs = postDateToMillis(deepPost.createdAt);

        posts = [deepPost, ...posts.filter(p => p.id !== id)];
        cardIndex = 0;

        renderCard();
    } catch (err) {
        if (err.code === "not-found") {
            showToast("This LoL post is no longer available 😔");
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  BACK / ROUTE STATE
// ══════════════════════════════════════════════════════════════════════════════
function ensureBackTrap() {
    if (backTrapReady) return;
    backTrapReady = true;
    history.replaceState({ view: "root" }, "", location.href);
    if (!window._backLock) {
        window._backLock = true;
        history.pushState({ view: "feed" }, "", location.href);
        setTimeout(() => { window._backLock = false; }, 300);
    }
    window.removeEventListener("popstate", handleAppBack);
    window.addEventListener("popstate", handleAppBack);
}

function handleAppBack() {
    if (!$("create-overlay").classList.contains("hidden") || appView === "create") {
        appView = "feed";
        closeCreateOverlay(true);
        openFeed();
        return;
    }
    if (appView === "profile") {
        appView = "feed";
        openFeed();
        resumeFeedVideos();
        return;
    }
    if (isFeedFullscreen) { setFeedFullscreen(false); return; }
    showLeaveFeedPopup();
    if (!window._backLock) {
        window._backLock = true;
        history.pushState({ view: "feed" }, "", location.href);
        setTimeout(() => { window._backLock = false; }, 300);
    }
}

function showLeaveFeedPopup() {
    ensureLeavePopupStyles();
    let popup = document.getElementById("leave-feed-popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "leave-feed-popup";
        popup.className = "leave-popup hidden";
        popup.innerHTML = `
          <div class="leave-popup-card">
            <div class="leave-popup-badge">👋 Leaving LoL?</div>
            <h3>Do you want to leave LoL?</h3>
            <p>Switch to SapanaCyberHub x Listen or exit this screen.</p>
            <div class="leave-popup-actions">
              <button class="leave-btn leave-btn-secondary" id="leave-stay">Stay here</button>
              <button class="leave-btn leave-btn-primary"   id="leave-listen">Go to x Listen</button>
            </div>
            <button class="leave-text-link" id="leave-exit">Exit anyway</button>
          </div>`;
        document.body.appendChild(popup);
        popup.querySelector("#leave-stay").addEventListener("click", () => { popup.classList.add("hidden"); popup.classList.remove("show"); resumeFeedVideos(); });
        popup.querySelector("#leave-listen").addEventListener("click", () => { window.location.href = LISTEN_URL; });
        popup.querySelector("#leave-exit").addEventListener("click", () => { popup.classList.add("hidden"); popup.classList.remove("show"); history.back(); });
    }
    popup.classList.remove("hidden");
    requestAnimationFrame(() => popup.classList.add("show"));
    pauseFeedVideos();
}

function ensureLeavePopupStyles() {
    if (document.getElementById("leave-popup-styles")) return;
    const style = document.createElement("style");
    style.id = "leave-popup-styles";
    style.textContent = `
      .leave-popup{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(5,8,18,.58);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:.22s ease;padding:20px;}
      .leave-popup.show{opacity:1;pointer-events:auto;}
      .leave-popup-card{width:min(100%,420px);border-radius:28px;background:linear-gradient(180deg,rgba(18,24,42,.98),rgba(10,14,26,.98));border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 60px rgba(0,0,0,.45);padding:22px;color:#fff;text-align:center;}
      .leave-popup-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.06);color:#dbe4ff;font-size:.82rem;margin-bottom:12px;}
      .leave-popup-card h3{margin:0 0 8px;font-size:1.35rem;}
      .leave-popup-card p{margin:0 0 18px;color:#aab2cf;line-height:1.5;}
      .leave-popup-actions{display:grid;gap:10px;}
      .leave-btn{border:none;border-radius:16px;padding:14px 16px;font-weight:700;cursor:pointer;}
      .leave-btn-primary{background:linear-gradient(135deg,#7c5cff,#00d4ff);color:#09111f;}
      .leave-btn-secondary{background:rgba(255,255,255,.06);color:#fff;}
      .leave-text-link{margin-top:12px;background:none;border:none;color:#9fb1ff;cursor:pointer;font-size:.95rem;}`;
    document.head.appendChild(style);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE UPLOAD POPUP
// ══════════════════════════════════════════════════════════════════════════════
function ensureCreateUploadModal() {
    if (createUploadModal) return createUploadModal;
    const wrap = document.createElement("div");
    wrap.id = "create-upload-modal";
    wrap.className = "upload-modal hidden";
    wrap.innerHTML = `
  <div class="upload-card">
    <div class="upload-top">
      <div class="upload-title-wrap">
        <div class="upload-badge">Uploading…</div>
        <h3>Posting your LoL</h3>
        <p class="upload-sub">Almost there. Please do not close this screen.</p>
      </div>
      <button class="upload-close" id="upload-cancel-btn">✕</button>
    </div>
    <div class="upload-body">
      <div class="upload-thumb-box">
        <div class="upload-thumb" id="upload-thumb"></div>
      </div>
      <div class="upload-progress-box">
        <div class="upload-percent" id="upload-percent-text">0%</div>
        <div class="upload-bar"><div class="upload-bar-fill" id="upload-bar-fill"></div></div>
        <div class="upload-status" id="upload-status-text">Preparing...</div>
      </div>
    </div>
  </div>`;
    document.body.appendChild(wrap);
    wrap.querySelector("#upload-cancel-btn").addEventListener("click", () => {
        hideCreateUploadModal();
        btnEnableCreate();
        showToast("Upload cancelled.");
        postLock = false;
    });
    createUploadModal = wrap;
    return wrap;
}

function ensureCreateUploadStyles() {
    if (document.getElementById("create-upload-styles")) return;
    const style = document.createElement("style");
    style.id = "create-upload-styles";
    style.textContent = `
      .upload-modal{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;background:rgba(4,7,16,.62);backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:.22s ease;padding:18px;}
      .upload-modal.show{opacity:1;pointer-events:auto;}
      .upload-card{width:min(100%,460px);border-radius:30px;background:linear-gradient(180deg,rgba(18,24,42,.98),rgba(10,14,26,.98));border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 80px rgba(0,0,0,.5);padding:18px;color:#fff;}
      .upload-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;}
      .upload-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:rgba(0,212,255,.12);color:#8be7ff;font-size:.78rem;font-weight:700;}
      .upload-title-wrap h3{margin:10px 0 4px;font-size:1.35rem;}
      .upload-sub{margin:0;color:#aab2cf;font-size:.92rem;line-height:1.45;}
      .upload-close{width:40px;height:40px;border:none;border-radius:14px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;}
      .upload-body{display:flex;flex-direction:column;gap:14px;}
      .upload-thumb-box{width:100%;aspect-ratio:4/3;border-radius:18px;overflow:hidden;background:#0c1224;border:1px solid rgba(255,255,255,.08);}
      .upload-thumb img,.upload-thumb video{width:100%;height:100%;object-fit:cover;transform:translateZ(0);}
      .upload-percent{font-size:1.6rem;font-weight:700;}
      .upload-bar{width:100%;height:12px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;}
      .upload-bar-fill{height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg,#7c5cff,#00d4ff);transition:width .25s ease;}
      .upload-status{font-size:.9rem;color:#aab2cf;}
      .card-media video{opacity:0;transition:opacity .12s ease;}
      .card-media video.ready{opacity:1;}`;
    document.head.appendChild(style);
}

function showCreateUploadModal(file, percent = 0, label = "Uploading", tip = "") {
    ensureCreateUploadStyles();
    const modal = ensureCreateUploadModal();
    const thumb = modal.querySelector("#upload-thumb");
    if (thumb && file) {
        if (createUploadThumbURL) { URL.revokeObjectURL(createUploadThumbURL); createUploadThumbURL = null; }
        const url = URL.createObjectURL(file);
        createUploadThumbURL = url;
        if (file.type.startsWith("video/")) {
            thumb.innerHTML = `<video src="${url}" playsinline></video>`;
            const vid = thumb.querySelector("video");
            vid.addEventListener("loadeddata", () => { vid.currentTime = 0.2; vid.pause(); }, { once: true });
        } else {
            thumb.innerHTML = `<img src="${url}" />`;
        }
    }
    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("show"));
    updateCreateUploadModal(percent, label, tip);
    pauseFeedVideos();
}

function updateCreateUploadModal(percent, label = "Uploading", tip = "") {
    const p = Math.min(99, Math.round(percent));
    const fill = $("upload-bar-fill");
    const pctEl = $("upload-percent-text");
    const stEl = $("upload-status-text");
    if (fill) fill.style.width = p + "%";
    if (pctEl) pctEl.textContent = p + "%";
    if (stEl && (label || tip)) stEl.textContent = tip || label;
}

function hideCreateUploadModal() {
    const modal = document.getElementById("create-upload-modal");
    if (!modal) return;
    modal.classList.remove("show");
    setTimeout(() => {
        modal.classList.add("hidden");
        if (createUploadThumbURL) { URL.revokeObjectURL(createUploadThumbURL); createUploadThumbURL = null; }
        const thumb = modal.querySelector("#upload-thumb");
        if (thumb) {
            thumb.querySelectorAll("video").forEach(v => { v.pause(); v.src = ""; });
            thumb.innerHTML = "";
        }
    }, 220);
    resumeFeedVideos();
}

function btnDisableCreate() { const b = $("btn-post-submit"); if (!b) return; b.disabled = true; b.textContent = "Uploading…"; }
function btnEnableCreate() { const b = $("btn-post-submit"); if (!b) return; b.disabled = false; b.textContent = "🚀 Post LoL"; }

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE BUTTONS
// ══════════════════════════════════════════════════════════════════════════════
$("btn-create").addEventListener("click", () => {
    ensureBackTrap();
    appView = "create";
    history.pushState({ view: "create" }, "", location.href);
    refreshCreateReqs();
    $("create-overlay").classList.remove("hidden");
    pauseFeedVideos();
});

$("close-create").onclick = () => {
    if (history.length > 1) history.back();
    else closeCreateOverlay(true);
};

function closeCreateOverlay(silent = false) {
    clearCreateMedia();
    resetCreateForm();
    $("create-overlay").classList.add("hidden");
    hideCreateUploadModal();
    if (!silent) appView = "feed";
    resumeFeedVideos();
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUBMIT POST
// ══════════════════════════════════════════════════════════════════════════════
$("btn-post-submit").onclick = submitPost;

async function submitPost() {
    if (postLock) return;
    const title = $("post-title").value.trim();
    if (!title) return showToast("Add a title! 😅");
    if (!selectedFile) return showToast("Pick a media! 📸");

    postLock = true;
    btnDisableCreate();
    $("create-overlay").classList.add("hidden");

    let thumbnailFile = null;

    try {
        showCreateUploadModal(selectedFile, 0, "Preparing", "Reading file…");

        if (selectedFile.type.startsWith("video/")) {
            showCreateUploadModal(selectedFile, 10, "Preparing", "Generating thumbnail...");
            thumbnailFile = await generateVideoThumbnail(selectedFile, 1.0);
        }

        const ext = selectedFile.name.split(".").pop();
        const path = `SapanaCyberHub/LoL/posts/${currentUser.uid}/${Date.now()}.${ext}`;
        const sRef = storRef(stor, path);

        const task = uploadBytesResumable(sRef, selectedFile);

        const uploadSnap = await new Promise((resolve, reject) => {
            task.on("state_changed",
                snap => {
                    const pct = Math.min(99, Math.floor((snap.bytesTransferred / snap.totalBytes) * 100));
                    updateCreateUploadModal(pct, pct >= 95 ? "Almost done" : "Uploading", "Uploading video...");
                },
                reject,
                () => resolve(task.snapshot)
            );
        });

        const mediaURL = await getDownloadURL(uploadSnap.ref);

        let thumbnailURL = null;
        if (thumbnailFile) {
            updateCreateUploadModal(95, "Almost done", "Uploading thumbnail...");
            const thumbPath = path.replace(`.${ext}`, `_thumb.jpg`);
            const thumbRef = storRef(stor, thumbPath);
            await uploadBytesResumable(thumbRef, thumbnailFile);
            thumbnailURL = await getDownloadURL(thumbRef);
        }

        await cfCreateLolPost({
            title,
            description: $("post-desc").value.trim(),
            hashtags: ($("post-tags").value || "").match(/#\w+/g) || [],
            mediaURL,
            mediaType: selectedFile.type.startsWith("video") ? "video" : "image",
            thumbnail: thumbnailURL || null
        });

        updateCreateUploadModal(100, "Done", "Your LoL is live! 🎉");
        await new Promise(r => setTimeout(r, 400));

        showToast("🚀 LoL posted successfully!");
        hideCreateUploadModal();
        resetCreateForm();
        openFeed();
        await loadPosts(true);
        cardIndex = 0;
        renderCard();

    } catch (err) {
        console.error("Upload failed", err.code || err.message);
        hideCreateUploadModal();
        showToast("Upload failed: " + (err.message || "Try again"));
        $("create-overlay").classList.remove("hidden");
    }

    btnEnableCreate();
    postLock = false;
}

async function generateVideoThumbnail(videoFile, timestamp = 1.0) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(videoFile);
        const video = document.createElement("video");

        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(timestamp, video.duration - 0.1);
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 720;
            canvas.height = video.videoHeight || 1280;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    resolve(new File([blob], "thumbnail.jpg", { type: "image/jpeg" }));
                } else {
                    reject(new Error("Canvas toBlob failed"));
                }
            }, "image/jpeg", 0.85);
        };

        video.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
    });
}

function refreshCreateReqs() {
    const streak = lolUserData?.lolStreak || 0;
    const credits = lolUserData?.lolCreatorCredits || 0;
    $("req-streak-val").textContent = `${streak}/5`;
    $("req-credit-val").textContent = credits;
    const can = streak >= 5 && credits >= 1;
    $("create-form").style.opacity = can ? "1" : "0.4";
    $("create-form").style.pointerEvents = can ? "auto" : "none";
    if (!can) {
        const m = [];
        if (streak < 5) m.push(`🔥 Need ${5 - streak} more streak day(s)`);
        if (credits < 1) m.push("🪙 Need at least 1 LoL CC — keep engaging!");
        showToast(m.join(" · "), 4000);
    }
}

$("media-dropzone").addEventListener("click", () => $("media-input").click());

$("media-input").addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;
    if (selectedFileURL) { URL.revokeObjectURL(selectedFileURL); selectedFileURL = null; }
    selectedFile = file;
    selectedFileURL = URL.createObjectURL(file);
    const inner = $("dropzone-inner");
    inner.innerHTML = file.type.startsWith("video")
        ? `<video src="${selectedFileURL}" class="preview-media" loop autoplay playsinline></video>`
        : `<img src="${selectedFileURL}" class="preview-media" />`;
});

function clearCreateMedia() {
    const inner = $("dropzone-inner");
    if (inner) {
        inner.querySelectorAll("video").forEach(v => { v.pause(); v.src = ""; });
    }
    if (selectedFileURL) { URL.revokeObjectURL(selectedFileURL); selectedFileURL = null; }
    selectedFile = null;
    const input = $("media-input");
    if (input) input.value = "";
    if (inner) inner.innerHTML = `<span class="dropzone-icon">🎬</span><p>Tap to select Photo / Video / GIF</p>`;
}

function resetCreateForm() {
    clearCreateMedia();
    ["post-title", "post-desc", "post-tags"].forEach(id => { const el = $(id); if (el) el.value = ""; });
}

// ══════════════════════════════════════════════════════════════════════════════
//  OPEN PROFILE
// ══════════════════════════════════════════════════════════════════════════════
async function openProfile() {
    ensureBackTrap();
    appView = "profile";
    history.pushState({ view: "profile" }, "", location.href);
    setFeedFullscreen(false);
    setNavState("profile");
    showScreen("profile-screen");
    pauseFeedVideos();
    renderProfileSponsor();

    $("p-avatar").src = listenUserData?.userDp || lolUserData.userDp || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${lolUserData.uid}`;
    $("p-name").textContent = listenUserData?.name || lolUserData.name || "LoLer";
    $("p-email").textContent = maskEmail(listenUserData?.email || lolUserData.email || "");
    $("p-listen-balance").textContent = `₹${listenUserData?.cash ?? 0}`;
    $("p-streak").textContent = lolUserData.lolStreak || 0;
    $("p-score").textContent = lolUserData.engagementScore || 0;
    $("p-credits").textContent = lolUserData.lolCreatorCredits || 0;
    $("p-earning").textContent = `₹${(lolUserData.estimatedEarning || 0).toFixed(2)}`;
    $("transfer-amount").textContent = `₹${((lolUserData.estimatedEarning || 0) * 0.7).toFixed(2)}`;

    const pct = Math.min(100, ((lolUserData.engagementScore || 0) / 1000) * 100);
    $("progress-fill").style.width = pct + "%";
    $("progress-text").textContent = `${lolUserData.engagementScore || 0} / 1000`;

    await loadProfileHistory();
}

function maskEmail(email) {
    if (!email) return "";
    const [name, domain] = email.split('@');
    if (!domain) return email;
    return name.slice(0, 2) + '😂💖😘😎@' + domain;
}

$("back-from-profile").onclick = () => {
    if (history.length > 1) history.back(); else openFeed();
};

// ══════════════════════════════════════════════════════════════════════════════
//  NAV
// ══════════════════════════════════════════════════════════════════════════════
$("btn-feed-fullscreen").addEventListener("click", () => setFeedFullscreen(!isFeedFullscreen));
$("btn-feed-exit").addEventListener("click", () => setFeedFullscreen(false));
$("nav-profile").addEventListener("click", openProfile);
$("nav-feed").addEventListener("click", openFeed);
$("user-avatar-wrap").addEventListener("click", openProfile);

$("nav-leaderboard").addEventListener("click", async () => {
    $("lolLeaderBoard-overlay").classList.remove("hidden");
    pauseFeedVideos();
    await loadLeaderboard();
});
$("back").addEventListener("click", () => {
    $("lolLeaderBoard-overlay").classList.add("hidden");
    resumeFeedVideos();
});

// ══════════════════════════════════════════════════════════════════════════════
//  LEADERBOARD
// ══════════════════════════════════════════════════════════════════════════════
async function loadLeaderboard() {
    const container = document.querySelector(".leaderboard-data");
    if (!container) return;

    container.innerHTML = `
      <div class="leaderboard-header">
        <h2>🔥 Today's Top LoLs</h2>
        <p class="leaderboard-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
      </div>
      <div class="loading-state" style="display:flex;">
        <div class="loader-emoji"><img src="/assets/logo/lol-ic.png" alt=""></div>
        <p>Loading today's best LoLs...</p>
      </div>`;

    try {
        const res = await cfGetLeaderboard();
        const topPosts = res.data.data || [];

        if (!topPosts.length) {
            container.innerHTML = `
              <div class="leaderboard-header">
                <h2>🔥 Today's Top LoLs</h2>
              </div>
              <p style="text-align:center; padding:40px 20px; color:#aab2cf;">No LoLs today yet 😴<br>Be the first to post and rank #1!</p>`;
            return;
        }

        let html = `<div class="leaderboard-header"><h2>🔥 Today's Top LoLs</h2></div>`;

        topPosts.forEach((post, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            const thumb = post.thumbnail || post.mediaURL;
            const isVideo = post.mediaType === "video";

            html += `
            <div class="top-post-card ${isTop3 ? 'top-3' : ''}" data-post-id="${post.id}">
              <div class="rank-badge">#${rank}</div>
              
              <div class="post-preview">
                ${isVideo ?
                    `<video src="${thumb}" muted playsinline loop></video>` :
                    `<img src="${thumb}" alt="${esc(post.title)}" loading="lazy">`}
                ${isVideo ? `<span class="play-icon">▶</span>` : ''}
              </div>

              <div class="post-info">
                <h3 class="post-title">${esc(post.title)}</h3>
                <div class="post-meta">
                  <span class="creator">👤 ${esc(post.creatorName || 'LoLer')}</span>
                  <span class="score">⚡ ${post.engagementScore?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('.top-post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.dataset.postId;
                openLeaderboardPost(postId);
            });
        });

    } catch (err) {
        container.innerHTML = `
          <p style="text-align:center; padding:40px 20px; color:#ff6b6b;">Failed to load today's top LoLs 😵<br>Please try again.</p>`;
    }
}

async function openLeaderboardPost(postId) {
    $("lolLeaderBoard-overlay").classList.add("hidden");
    resumeFeedVideos();

    try {
        const res = await getPost({ postId });

        if (!res?.data?.success || !res.data.post) {
            showToast("This LoL is no longer available 😔");
            return;
        }

        const deepPost = res.data.post;
        deepPost.createdAtMs = postDateToMillis(deepPost.createdAt);

        posts = [deepPost, ...posts.filter(p => p.id !== postId)];
        cardIndex = 0;

        openFeed();
        renderCard();
        showToast("Opened Top LoL for inspiration", 2000);

    } catch (err) {
        if (err.code === "not-found") {
            showToast("This LoL post is no longer available");
        } else {
            showToast("Couldn't open this LoL 😔");
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROFILE HISTORY
// ══════════════════════════════════════════════════════════════════════════════
function setHistoryLoading(id, label = "Loading...") {
    const el = $(id);
    if (el) el.innerHTML = `<p class="empty-history">${esc(label)}</p>`;
}

let _postHistoryCache = [];

function renderPostHistory(items) {
    _postHistoryCache = items || [];
    const list = document.getElementById("post-history-list");
    if (!list) return;
    if (!items.length) {
        list.innerHTML = `<div class="post-thumb-grid"><div class="post-grid-empty">No LoLs yet 🚀<br/>Post your first funny!</div></div>`;
        return;
    }
    list.innerHTML = `<div class="post-thumb-grid">${items.map((d, i) => buildThumb(d, i)).join("")}</div>`;
    list.querySelectorAll(".post-thumb").forEach(el => {
        el.addEventListener("click", () => {
            const idx = parseInt(el.dataset.idx, 10);
            openAnalyticsModal(_postHistoryCache[idx]);
        });
    });
}

function buildThumb(d, idx) {
    const isVideo = d.postType === "video";
    const isLive = d.status === "active";
    const earning = (d.earning || 0).toFixed(2);
    const mediaEl = d.postURL
        ? (isVideo
            ? `<video src="${esc(d.postURL)}" muted playsinline preload="metadata" loop></video>`
            : `<img src="${esc(d.postURL)}" loading="lazy" alt="${esc(d.title)}" />`)
        : `<div style="width:100%;height:100%;background:#1a1f2e;display:grid;place-items:center;font-size:2rem">😂</div>`;
    return `
    <div class="post-thumb" data-idx="${idx}">
      ${mediaEl}
      ${isLive ? `<span class="post-thumb-live">LIVE</span>` : ""}
      <span class="post-thumb-type">${isVideo ? "▶" : "🖼"}</span>
      <span class="post-thumb-views">👁 ${fmt(d.views || 0)}</span>
      <div class="post-thumb-overlay"><span class="post-thumb-earn">₹${earning}</span></div>
    </div>`;
}

function ensureAnalyticsOverlay() {
    if (document.getElementById("post-analytics-overlay")) return;
    const el = document.createElement("div");
    el.id = "post-analytics-overlay";
    el.innerHTML = `
      <div class="analytics-media" id="am-media">
        <button class="analytics-close" id="am-close">✕</button>
        <button class="analytics-mute-btn" id="am-mute" style="display:none">🔇 Mute</button>
      </div>
      <div class="analytics-panel" id="am-panel"></div>`;
    document.body.appendChild(el);
    document.getElementById("am-close").addEventListener("click", closeAnalyticsModal);
    el.addEventListener("click", e => { if (e.target === el) closeAnalyticsModal(); });
}

function openAnalyticsModal(post) {
    ensureAnalyticsOverlay();
    pauseFeedVideos();
    const overlay = document.getElementById("post-analytics-overlay");
    const mediaWrap = document.getElementById("am-media");
    const panel = document.getElementById("am-panel");
    const muteBtn = document.getElementById("am-mute");
    mediaWrap.querySelectorAll("video, img, .analytics-status-badge").forEach(n => n.remove());

    const isVideo = post.postType === "video";
    const isLive = post.status === "active";
    const badge = document.createElement("span");
    badge.className = `analytics-status-badge ${isLive ? "live" : "done"}`;
    badge.textContent = isLive ? "🟢 LIVE" : "✅ DONE";
    mediaWrap.insertBefore(badge, mediaWrap.querySelector(".analytics-close"));

    if (post.postURL) {
        if (isVideo) {
            const vid = document.createElement("video");
            Object.assign(vid, { src: post.postURL, autoplay: true, loop: true, playsInline: true, muted: false, controls: false });
            mediaWrap.insertBefore(vid, muteBtn);
            muteBtn.style.display = "";
            muteBtn.textContent = "🔇 Mute";
            muteBtn.onclick = () => { vid.muted = !vid.muted; muteBtn.textContent = vid.muted ? "🔊 Unmute" : "🔇 Mute"; };
            vid.play().catch(() => { vid.muted = true; vid.play().catch(() => { }); });
        } else {
            const img = document.createElement("img"); img.src = post.postURL; img.alt = post.title || "";
            mediaWrap.insertBefore(img, muteBtn); muteBtn.style.display = "none";
        }
    } else {
        const ph = document.createElement("div");
        ph.style.cssText = "width:100%;height:200px;display:grid;place-items:center;font-size:3rem";
        ph.textContent = "😂";
        mediaWrap.insertBefore(ph, muteBtn); muteBtn.style.display = "none";
    }

    const createdDate = post.createdAtMs
        ? new Date(post.createdAtMs).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "";
    const expiresDate = post.expiresAtMs
        ? new Date(post.expiresAtMs).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
        : null;
    const earning = (post.earning || 0).toFixed(2);
    const watchTime = formatWatchTime(post.watchTimeMs || 0);
    const shareUrl = `${location.origin}${location.pathname}?lol=${post.id}`;

    panel.innerHTML = `
      <h2 class="analytics-title">${esc(post.title || "Untitled")}</h2>
      <p class="analytics-date">${createdDate ? "Posted " + createdDate : ""}</p>
      <div class="analytics-stats">
        <div class="a-stat"><div class="a-stat-val">${fmt(post.views || 0)}</div><div class="a-stat-lbl">👁 Views</div></div>
        <div class="a-stat"><div class="a-stat-val">${fmt(post.likes || 0)}</div><div class="a-stat-lbl">💖 Likes</div></div>
        <div class="a-stat"><div class="a-stat-val">${fmt(post.shares || 0)}</div><div class="a-stat-lbl">🔗 Shares</div></div>
        <div class="a-stat"><div class="a-stat-val">${watchTime}</div><div class="a-stat-lbl">⏱ Watch</div></div>
        <div class="a-stat"><div class="a-stat-val">${post.engagementScore || 0}</div><div class="a-stat-lbl">⚡ Score</div></div>
      </div>
      <div class="analytics-earning-banner">
        <div>
          <div class="aeb-label">Estimated Earning</div>
          <div class="aeb-value">₹${earning}</div>
          <div class="aeb-status">${isLive ? "🟢 Post still earning" : "✅ Final earning"}</div>
        </div>
        <div style="font-size:2.2rem">💰</div>
      </div>
      ${expiresDate ? `<div class="analytics-expiry">⏱ ${isLive ? "Expires" : "Expired"}: <strong style="color:#e8eaf0">${expiresDate}</strong></div>` : ""}
      <div class="analytics-actions">
        <button class="aa-btn aa-share"  id="am-share-btn">🔗 Share Post</button>
        <button class="aa-btn aa-delete" id="am-delete-btn">🗑 Delete</button>
      </div>
      <p id="am-action-msg" style="text-align:center;font-size:.8rem;color:#7a8099;margin-top:.8rem"></p>`;

    panel.querySelector("#am-share-btn").addEventListener("click", async () => {
        try { await navigator.share({ title: post.title, url: shareUrl }); }
        catch { await navigator.clipboard.writeText(shareUrl); showToast("Link copied! 🔗"); }
    });
    const deleteBtn = panel.querySelector("#am-delete-btn");
    const actionMsg = panel.querySelector("#am-action-msg");
    deleteBtn.addEventListener("click", () => handleDeletePost(post, deleteBtn, actionMsg));
    requestAnimationFrame(() => overlay.classList.add("open"));
}

function closeAnalyticsModal() {
    const overlay = document.getElementById("post-analytics-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    setTimeout(() => { overlay.querySelectorAll("video").forEach(v => { v.pause(); v.src = ""; }); }, 350);
    resumeFeedVideos();
}

async function handleDeletePost(post, deleteBtn, msgEl) {
    if (deleteBtn.dataset.confirm !== "1") {
        deleteBtn.dataset.confirm = "1";
        deleteBtn.textContent = "⚠️ Confirm Delete";
        deleteBtn.style.background = "rgba(255,69,96,.25)";
        msgEl.textContent = "Tap again to permanently delete this post.";
        setTimeout(() => {
            if (deleteBtn.dataset.confirm === "1") {
                deleteBtn.dataset.confirm = "";
                deleteBtn.textContent = "🗑 Delete";
                deleteBtn.style.background = "";
                msgEl.textContent = "";
            }
        }, 4000);
        return;
    }
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting…";
    msgEl.textContent = "";
    try {
        const res = await cfDeleteLolPost({ postId: post.id });
        if (res?.data?.success === false) throw new Error(res.data.message || "Delete failed");
        showToast("Post deleted ✅");
        closeAnalyticsModal();
        _postHistoryCache = _postHistoryCache.filter(p => p.id !== post.id);
        renderPostHistory(_postHistoryCache);
    } catch (err) {
        console.error("[LoL] delete", err.code || err.message);
        deleteBtn.disabled = false;
        deleteBtn.textContent = "🗑 Delete";
        deleteBtn.dataset.confirm = "";
        msgEl.textContent = "Delete failed: " + (err.message || "try again");
        showToast("Delete failed ❌");
    }
}

function renderTransferHistory(items) {
    const list = $("transfer-history-list");
    if (!list) return;
    if (!items.length) { list.innerHTML = `<p class="empty-history">No transfers yet.</p>`; return; }
    list.innerHTML = items.map(item => {
        const amount = Number(item.amount || 0);
        const fullAmount = Number(item.fullAmount || 0);
        const transferTime = item.timestampMs ? new Date(item.timestampMs) : null;
        const retained = Math.max(0, fullAmount - amount);
        return `
    <div class="history-item">
      <div class="hi-top"><span class="hi-title">Listen Wallet Transfer</span><span class="hi-badge badge-done">Wallet</span></div>
      <div class="hi-earn"><span>Transferred</span><span class="hi-earning">₹${amount.toFixed(2)}</span></div>
      <div class="hi-stats">Gross LoL earning: ₹${fullAmount.toFixed(2)}</div>
      ${retained > 0 ? `<div class="hi-exp">Platform share: ₹${retained.toFixed(2)}</div>` : ""}
      ${transferTime ? `<div class="hi-exp">Transferred: ${transferTime.toLocaleString()}</div>` : ""}
    </div>`;
    }).join("");
}

async function loadProfileHistory() {
    setHistoryLoading("post-history-list");
    setHistoryLoading("transfer-history-list");
    try {
        const res = await cfLoadLolProfileHistory({ limitCount: 20 });
        renderPostHistory(res?.data?.posts || []);
        renderTransferHistory(res?.data?.transfers || []);
    } catch (err) {
        console.log("history", err.code || err.message);
        $("post-history-list").innerHTML = `<p class="empty-history">History unavailable right now.</p>`;
        $("transfer-history-list").innerHTML = `<p class="empty-history">Transfer history unavailable right now.</p>`;
        showToast("Failed to load history");
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  TRANSFER
// ══════════════════════════════════════════════════════════════════════════════
$("btn-transfer").addEventListener("click", async () => {
    try {
        const estimated = Number(lolUserData.estimatedEarning || 0);
        if (estimated <= 0) { showToast("Nothing to transfer yet! 🎯"); return; }
        if (estimated < 2500) { showToast(`Earn ₹${(2500 - estimated).toFixed(0)} more to unlock transfer 🔓`); return; }
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        if (lolUserData.lastTransferMonth === monthKey) { showToast("You already claimed this month 💸"); return; }
        const res = await cfLoLtoListen();
        showToast(`₹${res.data.amount} transferred to Listen Wallet 💸`);
        lolUserData.estimatedEarning = 0;
        lolUserData.lastTransferMonth = monthKey;
        openProfile();
    } catch (e) {
        console.error(e.code || e.message);
        switch (e.code) {
            case "already-exists": showToast("You already claimed this month 💸"); break;
            case "failed-precondition": showToast(e.details || "Condition not met ⚠️"); break;
            case "unauthenticated": showToast("Please login first 🔐"); break;
            default: showToast(e.details || "Transfer failed ❌");
        }
    }
});

// ══════════════════════════════════════════════════════════════════════════════
//  DOUBLE-TAP LOGO → LISTEN
// ══════════════════════════════════════════════════════════════════════════════
const sapanacyberhubRetun = document.querySelector(".h-logo");
if (sapanacyberhubRetun) {
    let lastTap = 0;
    sapanacyberhubRetun.addEventListener("click", e => {
        const now = Date.now();
        if (now - lastTap < 300 && now - lastTap > 0) { e.preventDefault(); window.location.href = LISTEN_URL; }
        lastTap = now;
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════════════════════════
function esc(s) {
    return String(s || "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
}
function formatWatchTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) return `${minutes}m ${seconds}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}
function postDateToMillis(value) {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    if (typeof value.seconds === "number") return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1e6);
    if (typeof value._seconds === "number") return (value._seconds * 1000) + Math.floor((value._nanoseconds || 0) / 1e6);
    return Number(value) || 0;
}
function postDateToDate(value) {
    const ms = postDateToMillis(value);
    return ms ? new Date(ms) : new Date();
}
function timeAgo(date) {
    const d = (Date.now() - date.getTime()) / 1000;
    if (d < 60) return "just now";
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
}

// Revoke object URLs on page unload
window.addEventListener('beforeunload', () => {
    if (selectedFileURL) URL.revokeObjectURL(selectedFileURL);
    if (createUploadThumbURL) URL.revokeObjectURL(createUploadThumbURL);
});