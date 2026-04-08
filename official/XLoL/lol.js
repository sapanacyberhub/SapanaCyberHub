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
const cfLoadLolProfileHistory = httpsCallable(functions, "loadLolProfileHistory");

// ══════════════════════════════════════════════════════════════════════════════
//  FIRESTORE PATHS
// ══════════════════════════════════════════════════════════════════════════════
const lolUserRef = (uid) => doc(db, "SapanaCyberHub", "LoL", "user", uid);
const lolPostsCol = () => collection(db, "SapanaCyberHub", "LoL", "posts");
const lolTransfersCol = () => collection(db, "SapanaCyberHub", "LoL", "transfers");

const LISTEN_URL = "/online-earning/listen-enjoy-earn/index.html";

const PASSIVE_AD_SCRIPTS = [
    { id: "monetag-vignette", src: "https://n6wxm.com/vignette.min.js", dataset: { zone: "10246448" } },
    { id: "monetag-inpage-push", src: "https://nap5k.com/tag.min.js", dataset: { zone: "10246441" } },
    { id: "adsterra-social-bar", src: "https://pl28160948.profitablecpmratenetwork.com/a3/f8/7d/a3f87d980e8ae573f535875f32f4c021.js" },
];
const VIGNETTE_AD_CONFIG = PASSIVE_AD_SCRIPTS.find((c) => c.id === "monetag-vignette");
const INPAGE_PUSH_AD_CONFIG = PASSIVE_AD_SCRIPTS.find((c) => c.id === "monetag-inpage-push");

const ADSTERRA_BANNERS = [
    { key: "be84f4cdee8a397c6208c778695c8973", width: 160, height: 300 },
    { key: "b5d3a37bebdb18ab0d508dc21053382b", width: 728, height: 90 },
    { key: "522259f00affdbfdaf791b01f86b1a64", width: 320, height: 50 },
    { key: "1ec158b6632bf6a6bac690778268b1f7", width: 468, height: 60 },
    { key: "71197c8b1966802bbfa05225ac458a7b", width: 300, height: 250 },
    { key: "73d8d5f56e427b77a8f4c36d202a1097", width: 160, height: 600 },
];

const DIRECT_LINKS = [
    { network: "Monetag", label: "Monetag Offer 1", url: "https://omg10.com/4/10749383" },
    { network: "Adsterra", label: "Adsterra Offer 1", url: "https://www.profitablecpmratenetwork.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861" },
    { network: "Monetag", label: "Monetag Offer 2", url: "https://omg10.com/4/10216281" },
    { network: "Adsterra", label: "Adsterra Offer 2", url: "https://www.profitablecpmratenetwork.com/w7taatypw?key=9d400c5aa174b33787aecef1ac2c8203" },
];

// Banner-dominant rotation — multiformat fully removed
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

const SESSION_ENGAGEMENT_POINTS = { view: 10, like: 20, share: 3 };

// Bonus card only shown when session engagement reaches this floor
const BONUS_CARD_MIN_ENGAGEMENT = 100;

const AD_COOLDOWN_MIN_SWIPES = 6;
const AD_COOLDOWN_MAX_SWIPES = 8;
const BONUS_CARD_MIN_SWIPES = 8;
const BONUS_CARD_MAX_SWIPES = 12;
const PASSIVE_AD_AUTO_REMOVE_MS = 5000;

// Quick-break opens sponsor in a new tab after 1.5 s, then auto-advances feed
const QUICK_BREAK_REDIRECT_MS = 1500;

const VIDEO_HOLD_DELAY_MS = 180;
const VIDEO_HOLD_MOVE_TOLERANCE = 18;

let lastCreatedAt = null;
let isLoading = false;
let noMorePosts = false;

// ══════════════════════════════════════════════════════════════════════════════
//  DOM HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const $ = (id) => document.getElementById(id);

function showToast(msg, dur = 2800) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), dur);
}

function showScreen(id) {
    clearPendingAdRedirect();
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBonusClaimToken() {
    return `lol_bonus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function setNavState(view) {
    $("nav-feed")?.classList.toggle("active", view === "feed");
    $("nav-profile")?.classList.toggle("active", view === "profile");
}

function openFeed() {
    setNavState("feed");
    showScreen("app-screen");
}

function setFeedFullscreen(enabled) {
    isFeedFullscreen = Boolean(enabled);
    document.body.classList.toggle("feed-fullscreen", isFeedFullscreen);
    $("btn-feed-exit")?.classList.toggle("hidden", !isFeedFullscreen);
}

function clearPendingAdRedirect() {
    if (quickBreakRedirectTimer) { clearTimeout(quickBreakRedirectTimer); quickBreakRedirectTimer = null; }
    if (quickBreakRedirectInterval) { clearInterval(quickBreakRedirectInterval); quickBreakRedirectInterval = null; }
}

function scheduleNextFeedAd(min = AD_COOLDOWN_MIN_SWIPES, max = AD_COOLDOWN_MAX_SWIPES) {
    nextAdSwipeAt = swipeCount + randomBetween(min, max);
}

function scheduleNextBonusCard(min = BONUS_CARD_MIN_SWIPES, max = BONUS_CARD_MAX_SWIPES) {
    nextBonusSwipeAt = swipeCount + randomBetween(min, max);
}

function resetSessionExperience() {
    swipeCount = 0;
    sessionEngagementScore = 0;
    bonusCardPending = false;
    bonusFlowCompleted = false;
    bonusClaimPending = false;
    sessionBonusClaimToken = createBonusClaimToken();
    nextAdSwipeAt = Number.POSITIVE_INFINITY;
    nextBonusSwipeAt = Number.POSITIVE_INFINITY;
    touchStartX = touchStartY = touchCurrentX = touchCurrentY = 0;
    swipeNavigationLocked = false;
    lastWheelNavigateAt = 0;
    feedAdIndex = bannerIndex = sponsorLinkIndex = 0;
    Object.values(sessionEngagementLedger).forEach((b) => b.clear());
    scheduleNextFeedAd();
    scheduleNextBonusCard();
}

// ══════════════════════════════════════════════════════════════════════════════
//  TAB-RETURN LISTENER
//  Attached around bonus / quick-break so we can greet the user when they
//  come back from a sponsor page and explain exactly what happened.
// ══════════════════════════════════════════════════════════════════════════════
let _bonusTabReturnHandler = null;

function attachBonusTabReturnListener(context = "bonus") {
    detachBonusTabReturnListener(); // never stack listeners

    _bonusTabReturnHandler = () => {
        if (document.visibilityState !== "visible") return;

        if (context === "bonus") {
            showToast(
                "👋 Welcome back! You visited a sponsor offer. " +
                "Listen Coin rewards and score updates are processed server-side — " +
                "no guarantee every visit results in a reward. Keep engaging to earn more!",
                6000
            );
        } else {
            // quick-break context
            showToast(
                "✅ Back from sponsor — the feed never redirected. Keep scrolling! 😄",
                3500
            );
        }

        detachBonusTabReturnListener();
    };

    document.addEventListener("visibilitychange", _bonusTabReturnHandler);
}

function detachBonusTabReturnListener() {
    if (_bonusTabReturnHandler) {
        document.removeEventListener("visibilitychange", _bonusTabReturnHandler);
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
    if (swipeNavigationLocked) return false;
    const direction = resolveGestureDirection(diffX, diffY);
    if (!direction) return false;
    swipeNavigationLocked = true;
    navigate(direction);
    return true;
}

function bindFeedGestures() {
    const stack = $("card-stack");
    if (!stack || stack.dataset.gesturesBound === "1") return;
    stack.dataset.gesturesBound = "1";

    stack.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0]?.clientX || 0;
        touchStartY = e.touches[0]?.clientY || 0;
        touchCurrentX = touchStartX; touchCurrentY = touchStartY;
        swipeNavigationLocked = false;
    }, { passive: true });

    stack.addEventListener("touchmove", (e) => {
        const touch = e.touches[0]; if (!touch) return;
        touchCurrentX = touch.clientX; touchCurrentY = touch.clientY;
        const diffX = touchStartX - touchCurrentX, diffY = touchStartY - touchCurrentY;
        if (Math.max(Math.abs(diffX), Math.abs(diffY)) > 10) e.preventDefault();
        tryGestureNavigate(diffX, diffY);
    }, { passive: false });

    stack.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0]?.clientX, endY = e.changedTouches[0]?.clientY;
        if (typeof endX !== "number" || typeof endY !== "number") return;
        touchCurrentX = endX; touchCurrentY = endY;
        tryGestureNavigate(touchStartX - endX, touchStartY - endY);
        swipeNavigationLocked = false;
    }, { passive: true });

    stack.addEventListener("touchcancel", () => { swipeNavigationLocked = false; }, { passive: true });

    stack.addEventListener("wheel", (e) => {
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(delta) < 24) return;
        const now = Date.now();
        if (now - lastWheelNavigateAt < 420) { e.preventDefault(); return; }
        lastWheelNavigateAt = now;
        e.preventDefault();
        navigate(delta > 0 ? 1 : -1);
    }, { passive: false });
}

// ══════════════════════════════════════════════════════════════════════════════
//  PASSIVE AD SCRIPTS
// ══════════════════════════════════════════════════════════════════════════════
function loadPassiveAdScript(config, options = {}) {
    const { force = false } = options;
    const existing = document.getElementById(config.id);
    if (existing) { if (!force) return; existing.remove(); }
    const script = document.createElement("script");
    script.id = config.id; script.src = config.src; script.async = true;
    Object.entries(config.dataset || {}).forEach(([k, v]) => { script.dataset[k] = v; });
    Object.entries(config.attributes || {}).forEach(([k, v]) => { script.setAttribute(k, v); });
    document.body.appendChild(script);
}

function cleanupPassiveAdScript(configOrId) {
    const id = typeof configOrId === "string" ? configOrId : configOrId?.id;
    if (id) document.getElementById(id)?.remove();
}

function schedulePassiveAdCleanup(config, durationMs = PASSIVE_AD_AUTO_REMOVE_MS) {
    if (!config?.id) return;
    clearTimeout(passiveAdCleanupTimers[config.id]);
    passiveAdCleanupTimers[config.id] = setTimeout(() => {
        cleanupPassiveAdScript(config.id);
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
    return DIRECT_LINKS.map((link) => `
      <a class="quick-link" href="${link.url}" target="_blank" rel="noopener noreferrer sponsored">
        <span class="quick-link-name">${esc(link.label)}</span>
        <span class="quick-link-meta">${esc(link.network)}</span>
      </a>`).join("");
}

function renderQuickLinks(target) {
    const el = typeof target === "string" ? $(target) : target;
    if (el) el.innerHTML = buildQuickLinksMarkup();
}

function getNextSponsorLink() {
    const link = DIRECT_LINKS[sponsorLinkIndex % DIRECT_LINKS.length];
    sponsorLinkIndex++;
    return link;
}

// ══════════════════════════════════════════════════════════════════════════════
//  QUICK-BREAK REDIRECT
//  Opens sponsor in a NEW TAB after 1.5 s, then auto-advances the feed card.
//  The feed page is NEVER hijacked. Tab-return listener toasts an explanation.
// ══════════════════════════════════════════════════════════════════════════════
function scheduleQuickBreakRedirect(link, labelEl, delayMs = QUICK_BREAK_REDIRECT_MS) {
    if (!link?.url) return;

    clearPendingAdRedirect();
    const startedAt = Date.now();

    const renderCountdown = () => {
        const remainingMs = Math.max(0, delayMs - (Date.now() - startedAt));
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        if (labelEl) {
            labelEl.textContent = remainingMs <= 300
                ? "Opening sponsor now…"
                : `Quick sponsor break — opening in ${remainingSeconds}s. Tap Skip to stay.`;
        }
    };

    renderCountdown();
    quickBreakRedirectInterval = setInterval(renderCountdown, 250);

    quickBreakRedirectTimer = setTimeout(() => {
        clearPendingAdRedirect();
        const popup = window.open(link.url, "_blank", "noopener,noreferrer");
        if (!popup) showToast("Tap the offer button if your browser blocked the new tab.", 3600);
        attachBonusTabReturnListener("quick-break");
        navigate(1); // auto-advance — feed page stays intact
    }, delayMs);
}

function openSponsorLink(link) {
    if (!link?.url) return;
    const popup = window.open(link.url, "_blank", "noopener,noreferrer");
    if (!popup) showToast("Use the sponsor buttons if your browser blocks new tabs.", 3600);
}

// ══════════════════════════════════════════════════════════════════════════════
//  BANNER / NATIVE / AD MOUNTS
// ══════════════════════════════════════════════════════════════════════════════
function pickBannerConfig(target) {
    const slotWidth = target?.clientWidth || window.innerWidth || 360;
    const candidates = ADSTERRA_BANNERS.filter((b) => b.width <= slotWidth + 24);
    const pool = candidates.length ? candidates : ADSTERRA_BANNERS.filter((b) => b.width <= 320);
    const banner = pool[bannerIndex % pool.length];
    bannerIndex++;
    return banner;
}

function mountAdsterraBanner(target) {
    if (!target) return;
    const banner = pickBannerConfig(target);
    target.innerHTML = "";
    const optScript = document.createElement("script");
    optScript.text = [
        "window.atOptions = {",
        `  key: "${banner.key}",`,
        '  format: "iframe",',
        `  height: ${banner.height},`,
        `  width: ${banner.width},`,
        "  params: {}",
        "};"
    ].join("\n");
    const invScript = document.createElement("script");
    invScript.src = `https://www.highperformanceformat.com/${banner.key}/invoke.js`;
    invScript.async = true;
    target.appendChild(optScript);
    target.appendChild(invScript);
}

function mountNativeBanner(target) {
    if (!target) return;
    target.innerHTML = `<div id="${NATIVE_BANNER_CONTAINER_ID}"></div>`;
    const script = document.createElement("script");
    script.src = NATIVE_BANNER_SCRIPT; script.async = true;
    script.setAttribute("data-cfasync", "false");
    target.appendChild(script);
}

function mountSmartLinkPanel(target) { if (target) mountFeaturedLink(target, getNextSponsorLink()); }

function mountVignetteBreakPanel(target) {
    if (!target) return;
    mountFeaturedLink(target, getNextSponsorLink(), "Vignette only — close it and keep scrolling.");
    triggerPassiveAdPulse("vignette");
}

function mountQuickBreakPanel(target) {
    if (!target) return;
    const link = getNextSponsorLink();
    target.innerHTML = `
      <div class="quick-break-panel">
        <p class="ad-break-note" id="feed-quick-break-note">Quick sponsor break — opening in 1s. Tap Skip to stay.</p>
        <a class="featured-link" href="${link.url}" target="_blank" rel="noopener noreferrer sponsored">
          <span class="quick-link-meta">${esc(link.network)}</span>
          <strong>${esc(link.label)}</strong>
          <small>Tap to open now — timer stops on tap.</small>
        </a>
      </div>`;
    // Manual tap cancels the auto-open timer and attaches the return listener
    target.querySelector("a.featured-link")?.addEventListener("click", () => {
        clearPendingAdRedirect();
        attachBonusTabReturnListener("quick-break");
    });
    scheduleQuickBreakRedirect(link, target.querySelector("#feed-quick-break-note"));
}

function mountFeaturedLink(target, link, note = "Opens only when tapped") {
    if (!target || !link) return;
    target.innerHTML = `
      <a class="featured-link" href="${link.url}" target="_blank" rel="noopener noreferrer sponsored">
        <span class="quick-link-meta">${esc(link.network)}</span>
        <strong>${esc(link.label)}</strong>
        <small>${esc(note)}</small>
      </a>`;
}

function getNextFeedAdConfig() {
    const config = AD_CARD_ROTATION[feedAdIndex % AD_CARD_ROTATION.length];
    feedAdIndex++;
    return config;
}

function mountFeedAdExperience(config, target) {
    if (!target || !config) return;
    if (config.type === "banner") { mountAdsterraBanner(target); return; }
    if (config.type === "native") { mountNativeBanner(target); return; }
    if (config.type === "vignette") { mountVignetteBreakPanel(target); return; }
    if (config.type === "quick-break") { mountQuickBreakPanel(target); return; }
    if (config.type === "smart-link") { mountSmartLinkPanel(target); return; }
    mountAdsterraBanner(target); // safe fallback
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

function initializeAds() {
    if (!passiveAdsInitialized) passiveAdsInitialized = true;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SESSION ENGAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function registerSessionEngagement(type, postId) {
    const bucket = sessionEngagementLedger[type];
    if (!bucket || !postId || bucket.has(postId)) return;
    bucket.add(postId);
    sessionEngagementScore += SESSION_ENGAGEMENT_POINTS[type] || 0;
}

function completeBonusFlow() {
    bonusCardPending = false;
    bonusFlowCompleted = true;
    bonusClaimPending = false;
    sessionBonusClaimToken = createBonusClaimToken();
    initializeAds();
    scheduleNextFeedAd();
    scheduleNextBonusCard();
}

async function claimSessionBonusReward(link) {
    try {
        const res = await cfClaimLolSessionBonus({
            sessionEngagementScore,
            claimToken: sessionBonusClaimToken,
            sponsorNetwork: link?.network || "",
            sponsorLabel: link?.label || "",
            sponsorUrl: link?.url || "",
            source: "lol-feed-bonus"
        });

        if (res?.data?.listenUser) listenUserData = res.data.listenUser;
        if (res?.data?.lolUser) { lolUserData = res.data.lolUser; updateHeaderUI(); }

        if (res?.data?.success === false) {
            return { success: false, message: res.data.message || "Bonus service not ready yet." };
        }

        const reward = Number(
            res?.data?.listenCoinAwarded ?? res?.data?.listenCoins ?? res?.data?.coins ?? 0
        );

        return {
            success: true,
            message: reward > 0
                ? `Claim submitted. +${reward} Listen Coin may be added — server processes it shortly.`
                : "Claim submitted. Check your Listen wallet in a few minutes."
        };
    } catch (err) {
        console.warn("[LoL] claimLolSessionBonus:", err.message);
        return { success: false, message: "Bonus server unavailable. Try again later." };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  GATE SCREENS
// ══════════════════════════════════════════════════════════════════════════════
function renderEmptyFeed() {
    $("card-stack").innerHTML = `
      <div class="lol-card">
        <div class="empty-feed">
          <h3>No LoLs yet</h3>
          <p>Fresh posts will show up here soon. Try again in a moment.</p>
        </div>
      </div>`;
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
    const user = auth.currentUser;
    if (user) { showGateLoading("Retrying…"); bootApp(user); } else showGateNoAccount();
});

$("btn-error-retry").addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) { showGateLoading("Retrying…"); bootApp(user); } else showGateNoAccount();
});

// ══════════════════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════════════════
let currentUser = null;
let listenUserData = null;
let lolUserData = null;
let posts = [];
let cardIndex = 0;
let swipeCount = 0;
let viewTimer = null;
let selectedFile = null;
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;
let swipeNavigationLocked = false;
let lastWheelNavigateAt = 0;
let isFeedFullscreen = false;
let passiveAdsInitialized = false;
const passiveAdCleanupTimers = {};
let feedAdIndex = 0;
let bannerIndex = 0;
let sponsorLinkIndex = 0;
let quickBreakRedirectTimer = null;
let quickBreakRedirectInterval = null;
let nextAdSwipeAt = Number.POSITIVE_INFINITY;
let nextBonusSwipeAt = Number.POSITIVE_INFINITY;
let sessionEngagementScore = 0;
let bonusCardPending = false;
let bonusFlowCompleted = false;
let bonusClaimPending = false;
let sessionBonusClaimToken = "";
const sessionEngagementLedger = { view: new Set(), like: new Set(), share: new Set() };

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH STATE
// ══════════════════════════════════════════════════════════════════════════════
showGateLoading("Checking your Viber status…");

onAuthStateChanged(auth, async (user) => {
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
        console.error("init failed:", err);
        showGateError("Something went wrong. Retry.");
        return;
    }

    updateHeaderUI();
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
    $("user-avatar").src =
        lolUserData.userDp ||
        `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${lolUserData.uid}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOAD POSTS
// ══════════════════════════════════════════════════════════════════════════════
async function loadPosts(initial = false) {
    if (initial) { posts = []; cardIndex = 0; lastCreatedAt = null; noMorePosts = false; }
    if (isLoading || noMorePosts) return;

    isLoading = true;
    $("feed-loader").style.display = "flex";

    try {
        const res = await cfLoadFeed({ lastCreatedAt, limitCount: 10 });
        const newPosts = res.data.posts || [];
        posts.push(...newPosts);
        lastCreatedAt = res.data.lastCreatedAt;
        if (newPosts.length === 0) noMorePosts = true;
    } catch (err) {
        console.error("load feed error:", err);
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
    PASSIVE_AD_SCRIPTS.forEach((c) => cleanupPassiveAdScript(c.id));

    if (!posts.length) { renderEmptyFeed(); return; }

    // ── Bonus card gate: swipe threshold reached AND engagement >= 100 ─────────
    if (swipeCount > 0 && swipeCount >= nextBonusSwipeAt) {
        if (sessionEngagementScore >= BONUS_CARD_MIN_ENGAGEMENT) {
            bonusCardPending = true;
            renderBonusCard();
            return;
        }
        // Score too low — silently reschedule, fall through to normal card
        scheduleNextBonusCard();
    }

    if (swipeCount > 0 && swipeCount >= nextAdSwipeAt) {
        scheduleNextFeedAd();
        renderAdCard();
        return;
    }

    const post = posts[cardIndex % posts.length];
    if (!post) return;

    $("card-stack").innerHTML = buildCard(post);
    attachCardEvents(post);
    startViewTimer(post);
}

function buildCard(post) {
    const tags = (post.hashtags || []).map((t) => `<span class="tag">${t}</span>`).join("");
    const liked = localStorage.getItem(`liked_${post.id}`) === "1";
    return `
  <div class="lol-card" data-id="${post.id}">
    <div class="card-creator">
      <img class="c-dp"
        src="${post.creatorPhoto || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${post.uid}`}"
        onerror="this.src='https://api.dicebear.com/7.x/fun-emoji/svg?seed=x'" />
      <div class="c-info">
        <span class="c-name">${esc(post.creatorName || "Anonymous")}</span>
        <span class="c-time">${timeAgo(post.createdAt?.toDate?.() || new Date())}</span>
      </div>
      <div class="card-counter">${(cardIndex % posts.length) + 1} / ${posts.length}</div>
    </div>
    <div class="card-title-wrap">
      <h2 class="card-title">${esc(post.title)}</h2>
      <div class="card-tags">${tags}</div>
    </div>
    <div class="card-media">${buildMedia(post)}</div>
    <div class="card-footer">
      <div class="card-stats">
        <span>👁 <span class="stat-v">${fmt(post.views || 0)}</span></span>
        <span>💖 <span class="stat-l">${fmt(post.likes || 0)}</span></span>
        <span>🔗 <span class="stat-s">${fmt(post.shares || 0)}</span></span>
      </div>
      <div class="card-actions">
        <button class="act-btn like-btn ${liked ? "liked" : ""}" data-id="${post.id}">
          ${liked ? "💖" : "🤍"} Like
        </button>
        <button class="act-btn share-btn" data-id="${post.id}">🔗 Share</button>
      </div>
      <div class="nav-arrows">
        <button class="arrow-btn prev-btn">⬅</button>
        <button class="arrow-btn next-btn">➡</button>
      </div>
    </div>
  </div>`;
}

function buildMedia(post) {
    if (!post.mediaURL) return `<div class="no-media">😂</div>`;
    if (post.mediaType === "video") return `
      <div class="video-stage">
        <video class="card-video" src="${post.mediaURL}" playsinline autoplay loop muted></video>
      </div>`;
    return `<img class="card-img" src="${post.mediaURL}" alt="${esc(post.title)}" loading="lazy" />`;
}

function attachVideoControls(surface, video) {
    if (!surface || !video) return;
    video.muted = false; video.defaultMuted = true;
    video.play().catch(() => { });

    let holdTimer = null, holdTriggered = false, resumeAfterHold = false;
    let pressX = 0, pressY = 0, suppressClick = false;

    const clearHold = () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } };
    const startPress = (x, y) => {
        pressX = x; pressY = y; holdTriggered = false;
        resumeAfterHold = !video.paused; clearHold();
        holdTimer = setTimeout(() => { holdTriggered = true; video.pause(); }, VIDEO_HOLD_DELAY_MS);
    };
    const movePress = (x, y) => {
        if (Math.abs(x - pressX) > VIDEO_HOLD_MOVE_TOLERANCE || Math.abs(y - pressY) > VIDEO_HOLD_MOVE_TOLERANCE) clearHold();
    };
    const endPress = () => {
        clearHold(); if (!holdTriggered) return;
        holdTriggered = false;
        if (resumeAfterHold) video.play().catch(() => { });
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 260);
    };

    surface.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button !== 0) return; startPress(e.clientX, e.clientY); });
    surface.addEventListener("pointermove", (e) => movePress(e.clientX, e.clientY));
    surface.addEventListener("pointerup", endPress);
    surface.addEventListener("pointercancel", endPress);
    surface.addEventListener("pointerleave", endPress);
    surface.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (suppressClick) { suppressClick = false; return; }
        video.muted = !video.muted;
        if (!video.paused) video.play().catch(() => { });
    });
}

function attachCardEvents(post) {
    const s = $("card-stack");
    s.querySelector(".like-btn")?.addEventListener("click", () => handleLike(post));
    s.querySelector(".share-btn")?.addEventListener("click", () => handleShare(post));
    s.querySelector(".next-btn")?.addEventListener("click", () => navigate(1));
    s.querySelector(".prev-btn")?.addEventListener("click", () => navigate(-1));
    const vs = s.querySelector(".video-stage"), vid = s.querySelector(".card-video");
    if (vs && vid) attachVideoControls(vs, vid);
}

async function navigate(dir) {
    if (!posts.length) return;
    cardIndex = (cardIndex + dir + posts.length) % posts.length;
    swipeCount++;
    if (cardIndex >= posts.length - 3) await loadPosts(false);
    renderCard();
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIEW TIMER
// ══════════════════════════════════════════════════════════════════════════════
function startViewTimer(post) {
    viewTimer = setTimeout(async () => {
        registerSessionEngagement("view", post.id);
        try { await cfTrackEngagement({ postId: post.id, type: "view" }); updateHeaderUI(); }
        catch (err) { console.warn("[LoL] trackEngagement view:", err.message); }
    }, 5000);
}
function stopViewTimer() { if (viewTimer) { clearTimeout(viewTimer); viewTimer = null; } }

// ══════════════════════════════════════════════════════════════════════════════
//  LIKE
// ══════════════════════════════════════════════════════════════════════════════
async function handleLike(post) {
    const key = `liked_${post.id}`;
    const card = $("card-stack");
    if (!card) return;
    const likeBtn = card.querySelector(".like-btn");
    const likeEl = card.querySelector(".stat-l");

    if (localStorage.getItem(key) === "1") { showToast("Already liked! 💖"); return; }

    localStorage.setItem(key, "1");
    registerSessionEngagement("like", post.id);
    likeBtn?.classList.add("liked");
    if (likeBtn) likeBtn.textContent = "💖 Liked";
    const oldLikes = post.likes || 0;
    if (likeEl) likeEl.textContent = fmt(oldLikes + 1);

    try {
        await cfTrackEngagement({ postId: post.id, type: "like" });
        updateHeaderUI();
    } catch (err) {
        console.warn("[LoL] like failed:", err.message);
        localStorage.removeItem(key);
        likeBtn?.classList.remove("liked");
        if (likeBtn) likeBtn.textContent = "🤍 Like";
        if (likeEl) likeEl.textContent = fmt(oldLikes);
        showToast("Like failed ❌"); return;
    }
    showToast("Liked! 💖");
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHARE
// ══════════════════════════════════════════════════════════════════════════════
async function handleShare(post) {
    const url = `${location.origin}${location.pathname}?lol=${post.id}`;
    try { await navigator.share({ title: post.title, url }); }
    catch { await navigator.clipboard.writeText(url); showToast("Link copied! 🔗"); }
    registerSessionEngagement("share", post.id);
    try { await cfTrackEngagement({ postId: post.id, type: "share" }); updateHeaderUI(); } catch { }
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
    <div class="inline-ad-slot inline-ad-slot--feed" id="feed-ad-stage">
      <p class="ad-loading">Loading sponsor…</p>
    </div>
    <div class="quick-links quick-links--compact" id="feed-ad-links"></div>
    <div class="nav-arrows">
      <button class="arrow-btn prev-btn-ad">⬅</button>
      <button class="arrow-btn next-btn-ad">➡ Skip</button>
    </div>
  </div>`;

    mountFeedAdExperience(config, $("feed-ad-stage"));
    if (config.type === "smart-link") maybeTriggerPassiveAdPulse(0.3);
    renderQuickLinks("feed-ad-links");
    $("card-stack").querySelector(".next-btn-ad")
        .addEventListener("click", () => { clearPendingAdRedirect(); navigate(1); });
    $("card-stack").querySelector(".prev-btn-ad")
        .addEventListener("click", () => { clearPendingAdRedirect(); navigate(-1); });
}

// ══════════════════════════════════════════════════════════════════════════════
//  BONUS CARD
//  Only shown when sessionEngagementScore >= BONUS_CARD_MIN_ENGAGEMENT (100).
//  Honest copy — no guarantee of coins or score boost.
//  Tab-return listener fires a clear explanation when user comes back.
// ══════════════════════════════════════════════════════════════════════════════
function renderBonusCard() {
    const sponsorLink = getNextSponsorLink();

    $("card-stack").innerHTML = `
  <div class="lol-card bonus-card">
    <div class="bonus-inner">
      <div class="bonus-emoji">🎁</div>
      <h2 class="bonus-title">Bonus Available</h2>
      <p class="bonus-sub">
        You've reached <strong>${sessionEngagementScore}</strong> session engagement points.
        Tapping <em>Claim</em> opens a sponsor offer in a new tab and submits your session
        for a <strong>possible</strong> Listen Coin reward — <em>not guaranteed</em>.
        Rewards are processed server-side and may take a few minutes to appear.
        Skipping has no penalty.
      </p>
      <div class="bonus-cta-row">
        <button class="btn-claim" id="btn-claim">Claim &amp; Open Sponsor 🪙</button>
        <a class="bonus-link-btn" href="${sponsorLink.url}" target="_blank" rel="noopener noreferrer sponsored">
          Open ${esc(sponsorLink.network)} Only
        </a>
      </div>
      <div class="inline-ad-slot inline-ad-slot--bonus" id="bonus-ad-slot">
        <p class="ad-loading">Sponsor banner loads after claim.</p>
      </div>
      <div class="quick-links quick-links--compact" id="bonus-quick-links"></div>
      <button class="arrow-btn" id="skip-bonus">Skip ➡</button>
    </div>
  </div>`;

    renderQuickLinks("bonus-quick-links");

    $("btn-claim").addEventListener("click", async () => {
        if (bonusClaimPending) return;
        bonusClaimPending = true;
        $("btn-claim").disabled = true;
        $("btn-claim").textContent = "Claiming…";

        triggerPassiveAdPulse("vignette");
        openSponsorLink(sponsorLink);
        // Attach listener — explains what happened when user returns from sponsor tab
        attachBonusTabReturnListener("bonus");
        // Show Adsterra banner in the slot
        mountAdsterraBanner($("bonus-ad-slot"));

        const result = await claimSessionBonusReward(sponsorLink);
        completeBonusFlow();
        showToast(result.message, result.success ? 3500 : 4500);
        setTimeout(() => navigate(1), 2000);
    });

    $("skip-bonus").addEventListener("click", () => {
        completeBonusFlow();
        navigate(1);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  DEEP LINK
// ══════════════════════════════════════════════════════════════════════════════
async function checkDeepLink() {
    const id = new URLSearchParams(location.search).get("lol");
    if (!id) return;
    try {
        const snap = await getDoc(doc(db, "SapanaCyberHub", "LoL", "posts", id));
        if (!snap.exists()) return;
        posts = [{ id: snap.id, ...snap.data() }, ...posts.filter((p) => p.id !== id)];
        cardIndex = 0;
        renderCard();
    } catch (err) { console.warn("[LoL] deepLink:", err.message); }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE POST
// ══════════════════════════════════════════════════════════════════════════════
$("btn-create").addEventListener("click", openCreate);
$("close-create").addEventListener("click", () => $("create-overlay").classList.add("hidden"));

function openCreate() { refreshCreateReqs(); $("create-overlay").classList.remove("hidden"); }

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
$("media-input").addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const inner = $("dropzone-inner");
    inner.innerHTML = selectedFile.type.startsWith("video")
        ? `<video src="${URL.createObjectURL(selectedFile)}" class="preview-media" muted loop autoplay></video>`
        : `<img src="${URL.createObjectURL(selectedFile)}" class="preview-media" />`;
});

$("btn-post-submit").addEventListener("click", submitPost);

async function submitPost() {
    const title = $("post-title").value.trim();
    if (!title) return showToast("Add a title! 😅");
    if (!selectedFile) return showToast("Pick a media! 📸");

    const btn = $("btn-post-submit");
    btn.disabled = true; btn.textContent = "Uploading…";

    try {
        const ext = selectedFile.name.split(".").pop();
        const path = `SapanaCyberHub/LoL/posts/${currentUser.uid}/${Date.now()}.${ext}`;

        const uploadSnap = await new Promise((res, rej) => {
            const task = uploadBytesResumable(storRef(stor, path), selectedFile);
            task.on("state_changed", null, rej, () => res(task.snapshot));
        });

        const mediaURL = await getDownloadURL(uploadSnap.ref);
        const tags = ($("post-tags").value || "").match(/#\w+/g) || [];

        await cfCreateLolPost({
            title,
            description: $("post-desc").value.trim(),
            hashtags: tags, mediaURL,
            mediaType: selectedFile.type.startsWith("video") ? "video" : "image"
        });

        showToast("🚀 LoL posted successfully!");
        $("create-overlay").classList.add("hidden");
        resetCreateForm();
        await loadPosts(true); cardIndex = 0; renderCard();
        lolUserData = (await getDoc(lolUserRef(currentUser.uid))).data();
        updateHeaderUI();

    } catch (err) {
        console.error(err);
        showToast(err.code === "failed-precondition" ? err.message : "Upload failed: " + err.message);
    }

    btn.disabled = false; btn.textContent = "🚀 Post LoL";
}

function resetCreateForm() {
    selectedFile = null;
    ["post-title", "post-desc", "post-tags"].forEach((id) => $(id).value = "");
    $("dropzone-inner").innerHTML =
        `<span class="dropzone-icon">🎬</span><p>Tap to select Photo / Video / GIF</p>`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════════════════════════
$("btn-feed-fullscreen").addEventListener("click", () => setFeedFullscreen(!isFeedFullscreen));
$("btn-feed-exit").addEventListener("click", () => setFeedFullscreen(false));
$("nav-profile").addEventListener("click", openProfile);
$("nav-feed").addEventListener("click", openFeed);
$("user-avatar-wrap").addEventListener("click", openProfile);
$("back-from-profile").addEventListener("click", openFeed);
$("nav-leaderboard").addEventListener("click", async () => {
    $("lolLeaderBoard-overlay").classList.remove("hidden");
    await loadLeaderboard();
});

$("back").addEventListener("click", () => {
    $("lolLeaderBoard-overlay").classList.add("hidden");
});

async function loadLeaderboard() {
    const container = document.querySelector(".leaderboard-data");
    container.innerHTML = ``;
    container.innerHTML = `
    
      <div class="row">
        <span>Rank</span>
        <span>Creator</span>
        <span>Score</span>
      </div>
      <div class="loading-state" id="feed-loader" style = "display:flex;">
        <div class="loader-emoji">
          <img src="/assets/logo/lol-ic.png" alt="">
        </div>
       <p>Loading LoLs…</p>
      </div>
    `;
    try {

        const res = await cfGetLeaderboard();
        const list = res.data.data || [];


        if (!list.length) {
            container.innerHTML = `<p style="text-align:center">No leaderboard today 😴</p>`;
            return;
        }

        // 🔥 Header row
        let html = `
      <div class="row">
        <span>Rank</span>
        <span>Creator</span>
        <span>Score</span>
      </div>
    `;

        list.forEach(user => {
            html += `
        <div class="creator-card ${user.rank <= 3 ? "top-rank" : ""}">
          
          <span class="post-rank">#${user.rank}</span>

          <div class="profile">
            <img class="creator-dp"
              src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.creatorId}">
            <span class="creator-name">${user.creatorId}</span>
          </div>

          <span class="engagement-score">
            ${user.engagementScore.toLocaleString()}
          </span>

        </div>
      `;
        });

        container.innerHTML = html;

    } catch (err) {
        showToast("Failed to load leaderboard 😵"); 
        
        container.innerHTML = `
        
      <div class="row">
        <span>Rank</span>
        <span>Creator</span>
        <span>Score</span>
      </div>
        <p style="text-align:center">No leaderboard today 😴</p>`;
    }
}

async function openProfile() {
    setFeedFullscreen(false);
    setNavState("profile");
    showScreen("profile-screen");
    renderProfileSponsor();

    $("p-avatar").src =
        listenUserData?.userDp || lolUserData.userDp ||
        `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${lolUserData.uid}`;
    $("p-name").textContent = listenUserData?.name || lolUserData.name || "LoLer";
    $("p-email").textContent = listenUserData?.email || lolUserData.email || "";

    $("p-listen-balance").textContent = `₹${listenUserData?.cash ?? 0}`;
    $("p-streak").textContent = lolUserData.lolStreak || 0;
    $("p-score").textContent = lolUserData.engagementScore || 0;
    $("p-credits").textContent = lolUserData.lolCreatorCredits || 0;
    $("p-earning").textContent = `₹${((lolUserData.estimatedEarning) || 0).toFixed(2)}`;
    $("transfer-amount").textContent =
        `₹${(((lolUserData.estimatedEarning* 0.7) || 0)).toFixed(2)}`;

    const pct = Math.min(100, ((lolUserData.engagementScore || 0) / 1000) * 100);
    $("progress-fill").style.width = pct + "%";
    $("progress-text").textContent = `${lolUserData.engagementScore || 0} / 1000`;

    await loadProfileHistory(currentUser.uid);
}

function toMillisValue(value) {
    if (!value) return 0;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.seconds === "number") return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1e6);
    if (typeof value._seconds === "number") return (value._seconds * 1000) + Math.floor((value._nanoseconds || 0) / 1e6);
    return Number(value) || 0;
}

function setHistoryLoading(id, label = "Loading...") {
    const list = $(id);
    if (list) list.innerHTML = `<p class="empty-history">${esc(label)}</p>`;
}

function renderPostHistory(items) {
    const list = $("post-history-list");
    if (!list) return;
    if (!items.length) { list.innerHTML = `<p class="empty-history">No posts yet 🚀</p>`; return; }
    list.innerHTML = items.map((d) => {
        const active = d.status === "active";
        const expires = d.expiresAtMs ? new Date(d.expiresAtMs) : null;
        return `
    <div class="history-item">
      <div class="hi-top">
        <span class="hi-title">${esc(d.title)}</span>
        <span class="hi-badge ${active ? "badge-active" : "badge-done"}">${active ? "🟢 Live" : "✅ Done"}</span>
      </div>
      <div class="hi-stats">👁 ${fmt(d.views || 0)} &nbsp; 💖 ${fmt(d.likes || 0)} &nbsp; 🔗 ${fmt(d.shares || 0)}</div>
      <div class="hi-earn"><span>Eng: ${d.engagementScore || 0}</span><span class="hi-earning">₹${(d.earning || 0).toFixed(2)}</span></div>
      ${expires ? `<div class="hi-exp">⏱ ${active ? "Expires" : "Expired"}: ${expires.toLocaleString()}</div>` : ""}
    </div>`;
    }).join("");
}

function renderTransferHistory(items) {
    const list = $("transfer-history-list");
    if (!list) return;
    if (!items.length) { list.innerHTML = `<p class="empty-history">No transfers yet.</p>`; return; }
    list.innerHTML = items.map((item) => {
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

async function loadProfileHistory(uid) {
    setHistoryLoading("post-history-list");
    setHistoryLoading("transfer-history-list");
    try {
        const res = await cfLoadLolProfileHistory({ limitCount: 20 });
        renderPostHistory(res?.data?.posts || []);
        renderTransferHistory(res?.data?.transfers || []);
        return;
    } catch (err) { console.warn("[LoL] loadLolProfileHistory:", err.message); }
    await loadProfileHistoryFallback(uid);
}

async function loadProfileHistoryFallback(uid) {
    try {
        const [postSnaps, transferSnaps] = await Promise.all([
            getDocs(query(lolPostsCol(), where("uid", "==", uid))),
            getDocs(query(lolTransfersCol(), where("uid", "==", uid)))
        ]);

        const posts = postSnaps.docs.map((snap) => {
            const d = snap.data();
            return {
                id: snap.id, title: d.title || "", status: d.status || "finished",
                views: d.views || 0, likes: d.likes || 0, shares: d.shares || 0,
                engagementScore: d.engagementScore || 0, earning: Number(d.earning || 0),
                createdAtMs: toMillisValue(d.createdAt), expiresAtMs: toMillisValue(d.expiresAt)
            };
        }).sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 20);

        const transfers = transferSnaps.docs.map((snap) => {
            const d = snap.data();
            return {
                id: snap.id, amount: Number(d.amount || 0),
                fullAmount: Number(d.fullAmount || 0), timestampMs: toMillisValue(d.timestamp)
            };
        }).sort((a, b) => b.timestampMs - a.timestampMs).slice(0, 20);

        renderPostHistory(posts);
        renderTransferHistory(transfers);
    } catch (err) {
        console.error("[LoL] profile history fallback:", err);
        $("post-history-list").innerHTML = `<p class="empty-history">History unavailable right now.</p>`;
        $("transfer-history-list").innerHTML = `<p class="empty-history">Transfer history unavailable right now.</p>`;
        showToast("Failed to load history");
    }
}

$("btn-transfer").addEventListener("click", async () => {
    try {
        

        const estimated = Number(lolUserData.estimatedEarning || 0);

        // 🚫 Prevent useless server calls
        if (estimated <= 0) {
            showToast("Nothing to transfer yet! 🎯");
            return;
        }

        if (estimated < 2500) {
            const left = 2500 - estimated;
            showToast(`Earn ₹${left.toFixed(0)} more to unlock transfer 🔓`);
            return;
        }

        // 🚫 Monthly check (UI level)
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

        if (d.lastTransferMonth === monthKey) {
            showToast("You already claimed this month 💸");
            return;
        }

        // ✅ Call server only if valid
        const res = await cfLoLtoListen();

        showToast(`₹${res.data.amount} transferred to Listen Wallet 💸`);
        openProfile();

    } catch (e) {
        console.error(e);

        switch (e.code) {
            case "already-exists":
                showToast("You already claimed this month 💸");
                break;

            case "failed-precondition":
                showToast(e.details || "Condition not met ⚠️");
                break;

            case "unauthenticated":
                showToast("Please login first 🔐");
                break;

            default:
                showToast(e.details || "Transfer failed ❌");
        }
    }
});

// ══════════════════════════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════════════════════════
function esc(s) {
    return String(s || "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
}
function timeAgo(date) {
    const d = (Date.now() - date.getTime()) / 1000;
    if (d < 60) return "just now";
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
}

const sapanacyberhubRetun = document.querySelector(".h-logo");

if (sapanacyberhubRetun) {
    let lastTap = 0;

    sapanacyberhubRetun.addEventListener("click", (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        // If the second tap happens within 300ms, it's a double tap
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
        }
        
        lastTap = currentTime;
    });
}