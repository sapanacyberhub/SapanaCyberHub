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
    getFirestore, collection, doc, getDoc
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
const cfLoadLolProfileHistory = httpsCallable(functions, "loadLolProfileHistory");
const cfDeleteLolPost = httpsCallable(functions, "deleteLolPost");


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

const SESSION_ENGAGEMENT_POINTS = { view: 10, like: 20, share: 30 };
const likeLocks = new Set();
const LOL_CREATOR_CREDIT_ICON = "/assets/logo/LOLCreatorCredit.png";

// Bonus card only shown when session engagement reaches this floor
const BONUS_CARD_MIN_ENGAGEMENT = 50;

const AD_COOLDOWN_MIN_SWIPES = 5;
const AD_COOLDOWN_MAX_SWIPES = 7;
const BONUS_CARD_MIN_SWIPES = 7;
const BONUS_CARD_MAX_SWIPES = 8;
const BONUS_SPONSOR_MIN_VISIT_MS = 2500;
const PASSIVE_AD_AUTO_REMOVE_MS = 5000;


const VIDEO_HOLD_DELAY_MS = 180;
const VIDEO_HOLD_MOVE_TOLERANCE = 18;
const FEED_LOAD_LIMIT = 10;
const FEED_SEEN_STORAGE_KEY = "lol_seen_post_ids";
const FEED_SEEN_LIMIT = 100;

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
    _clearQbTick();
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

function getStoredSeenPostIds() {
    try {
        const ids = JSON.parse(localStorage.getItem(FEED_SEEN_STORAGE_KEY) || "[]");
        return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
}

function saveSeenPostIds(ids) {
    localStorage.setItem(FEED_SEEN_STORAGE_KEY, JSON.stringify(ids.slice(-FEED_SEEN_LIMIT)));
}

function rememberSeenPost(postId) {
    if (!postId) return;
    const ids = getStoredSeenPostIds().filter((id) => id !== postId);
    ids.push(postId);
    saveSeenPostIds(ids);
}

function getFeedExcludeIds() {
    const ids = new Set(getStoredSeenPostIds());
    posts.forEach((post) => {
        if (post?.id) ids.add(post.id);
    });
    return [...ids].slice(-FEED_SEEN_LIMIT);
}

function normalizeFeedPosts(items) {
    const existingIds = new Set(posts.map((post) => post.id));
    const now = Date.now();

    return (items || [])
        .filter((post) => {
            if (!post?.id) return false;

            // ❌ already loaded in current feed
            if (existingIds.has(post.id)) return false;

            const lastView = Number(localStorage.getItem(`viewed_${post.id}`) || 0);

            if (!lastView) return true; // never seen → allow

            const diff = now - lastView;

            // ❌ block under 30 min
            if (diff < 30 * 60 * 1000) return false;

            // ⚠️ 30–120 min → low chance (20%)
            if (diff < 2 * 60 * 60 * 1000) {
                return Math.random() < 0.2;
            }

            // ⚠️ 2–6 hours → medium chance (50%)
            if (diff < 6 * 60 * 60 * 1000) {
                return Math.random() < 0.5;
            }

            // ✅ older → always allow
            return true;
        })
        .map((post) => ({
            ...post,
            createdAtMs: postDateToMillis(post.createdAt)
        }));
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
                "⚡ Engagement updated based on your interaction. Keep engaging to increase your earning potential!",
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



// ─────────────────────────────────────────────────────────────────────────────
function mountQuickBreakPanel(target) {
    if (!target) return;

    const mode = Math.random() < 0.6 ? "A" : "B";
    const sponsorLink = getNextSponsorLink();   // always get one (used in both modes)

    // Build inner HTML for both modes
    if (mode === "A") {
        _renderQuickBreakModeA(target, sponsorLink);
    } else {
        _renderQuickBreakModeB(target);
    }
}

// ── Mode A: Support Our Creators ──────────────────────────────────────────────
function _renderQuickBreakModeA(target, sponsorLink) {
    target.innerHTML = `
      <div class="qb-panel" id="qb-panel-a">
        <div class="qb-support-badge">
          <span class="qb-support-dot"></span>
          SPONSOR SUPPORT
        </div>
        <p class="qb-msg">
          <strong>This sponsor supports our creators.</strong><br/>
          Tap below to visit — it helps us keep LoL free &amp; rewarding.
        </p>
        <a
          class="qb-support-btn"
          href="${esc(sponsorLink.url)}"
          target="_blank"
          rel="noopener noreferrer sponsored"
          id="qb-support-link">
          ❤️ Support Our Creators
        </a>
        <div class="qb-ad-slot" id="qb-ad-slot-a"></div>
        <button class="qb-skip-btn" id="qb-skip-a">Skip ➡</button>
      </div>`;

    // Fire vignette immediately
    triggerPassiveAdPulse("vignette");


    // Attach return listener when user actually clicks the sponsor link
    target.querySelector("#qb-support-link")?.addEventListener("click", () => {
        attachBonusTabReturnListener("quick-break");
    });

    // Skip navigates forward (no timer — user already sees ads)
    target.querySelector("#qb-skip-a")?.addEventListener("click", () => {
        clearPendingAdRedirect();
        navigate(1);
    });
}

// ── Mode B: Passive Only (no redirect) ───────────────────────────────────────
function _renderQuickBreakModeB(target) {
    target.innerHTML = `
      <div class="qb-panel" id="qb-panel-b">
        <div class="qb-support-badge">
          <span class="qb-support-dot"></span>
          SPONSOR BREAK
        </div>
        <p class="qb-msg">
          <strong>A quick message from our sponsors.</strong><br/>
          Helps us keep the creator economy running 🙏
        </p>
        <div class="qb-ad-slot" id="qb-ad-slot-b"></div>
        <p class="qb-passive-note">Vignette ad may appear — close it to continue.</p>
        <button class="qb-skip-btn" id="qb-skip-b" disabled>
          Skip in <span class="qb-skip-countdown" id="qb-countdown">3</span>s
        </button>
      </div>`;

    // Fire vignette immediately
    triggerPassiveAdPulse("vignette");

    // Mount banner in slot
    mountAdsterraBanner(target.querySelector("#qb-ad-slot-b"));

    // 3-second countdown on skip button
    const skipBtn = target.querySelector("#qb-skip-b");
    const countdownEl = target.querySelector("#qb-countdown");
    let remaining = 3;

    const tick = setInterval(() => {
        remaining--;
        if (countdownEl) countdownEl.textContent = remaining;
        if (remaining <= 0) {
            clearInterval(tick);
            if (skipBtn) {
                skipBtn.disabled = false;
                skipBtn.innerHTML = "Skip ➡";
            }
        }
    }, 1000);

    skipBtn?.addEventListener("click", () => {
        if (skipBtn.disabled) return;
        clearInterval(tick);
        clearPendingAdRedirect();
        navigate(1);
    });

    // Also store the tick so renderCard cleanup can clear it
    target._qbTick = tick;
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
            source: "lol-feed-bonus",
            sponsorVisited: true,                    // ← missing
            visitDurationMs: BONUS_SPONSOR_MIN_VISIT_MS + 100  // ← missing
        });

        if (res?.data?.listenUser) listenUserData = res.data.listenUser;
        if (res?.data?.lolUser) {
            lolUserData = res.data.lolUser;
            updateHeaderUI();
        }

        if (res?.data?.success === false) {
            return {
                success: false,
                message: res.data.message || "Bonus service not ready yet."
            };
        }

        // ✅ FIX: use correct field from server
        const reward = Number(res?.data?.engagementScoreAwarded || 0);

        return {
            success: true,
            message: reward > 0
                ? `🔥 +${reward} Engagement Score added! This boosts your LoL earning power.`
                : "Claim submitted. Engagement boost will reflect shortly."
        };

    } catch (err) {
        console.warn("[LoL] claimLolSessionBonus:", err.message);
        return {
            success: false,
            message: "Bonus server unavailable. Try again later."
        };
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
let activePostId = null;
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
let _qbSkipTick = null;

let feedOffset = 0;


function _clearQbTick() { if (_qbSkipTick) { clearInterval(_qbSkipTick); _qbSkipTick = null; } }
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
    $("user-avatar").src =
        lolUserData.userDp ||
        `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${lolUserData.uid}`;
}


// ══════════════════════════════════════════════════════════════════════════════
//  LOAD POSTS
// ══════════════════════════════════════════════════════════════════════════════



async function loadPosts(initial = false) {
    if (initial) {
        posts = [];
        cardIndex = 0;
        noMorePosts = false;
        feedOffset = 0;
    }

    if (isLoading || noMorePosts) return;

    isLoading = true;
    $("feed-loader").style.display = "flex";

    try {
        const res = await cfLoadFeed({
            limitCount: FEED_LOAD_LIMIT,
            offset: feedOffset
        });

        const incomingPosts = res.data.posts || [];
        const freshPosts = normalizeFeedPosts(incomingPosts);

        if (freshPosts.length) {
            posts.push(...freshPosts);
        }

        feedOffset = res.data.nextOffset ?? (feedOffset + FEED_LOAD_LIMIT);

        if (!incomingPosts.length && res.data.noMorePosts === true) {
            noMorePosts = true;
        }

        if (!freshPosts.length && !initial) {
            showToast("No fresh LoLs right now. Try again soon.");
        }
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

    cardIndex = Math.min(Math.max(cardIndex, 0), posts.length - 1);
    const post = posts[cardIndex];
    if (!post) return;

    rememberSeenPost(post.id);
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
        <span class="c-time">${timeAgo(postDateToDate(post.createdAtMs || post.createdAt))}</span>
      </div>
      <div class="card-counter">${cardIndex + 1} / ${posts.length}</div>
    </div>
    <div class="card-title-wrap">
      <h2 class="card-title">${esc(post.title)}</h2>
      <div class="tag-scroll-area">
        ${tags}
      </div>
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
        <button class="act-btn share-btn" data-id="${post.id}">ᯓ➤ Share</button>
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
    swipeCount++;

    if (dir > 0) {
        if (cardIndex >= posts.length - 3) await loadPosts(false);

        if (cardIndex < posts.length - 1) {
            cardIndex++;
        } else {
            await loadPosts(false);
            if (cardIndex < posts.length - 1) {
                cardIndex++;
            } else {
                showToast("You are caught up. Fresh LoLs will appear soon.");
            }
        }
    } else {
        cardIndex = Math.max(0, cardIndex - 1);
    }

    renderCard();
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIEW TIMER
// ══════════════════════════════════════════════════════════════════════════════


function startViewTimer(post) {
    stopViewTimer();

    activePostId = post.id;

    const key = `viewed_${post.id}`;
    const lastView = Number(localStorage.getItem(key) || 0);
    const now = Date.now();

    // ⛔ prevent repeat within 30 mins
    if (now - lastView < 30 * 60 * 1000) return;

    let visibleTime = 0;

    viewTimer = setInterval(async () => {
        // ✅ only count when tab is active
        if (document.hidden) return;

        visibleTime += 1000;

        // ✅ require real watch time (5 sec)
        if (visibleTime >= 5000) {
            clearInterval(viewTimer);
            viewTimer = null;

            // save locally
            localStorage.setItem(key, now);

            registerSessionEngagement("view", post.id);

            try {
                await cfTrackEngagement({
                    postId: post.id,
                    type: "view",
                    watchTime: visibleTime
                });

                updateHeaderUI();
            } catch (err) { }

        }
    }, 1000);
}

function stopViewTimer() {
    if (viewTimer) {
        clearInterval(viewTimer);
        viewTimer = null;
    }
}
// ══════════════════════════════════════════════════════════════════════════════
//  LIKE
// ══════════════════════════════════════════════════════════════════════════════


async function handleLike(post) {
    const key = `liked_${post.id}`;

    // ❌ prevent double click race
    if (likeLocks.has(post.id)) return;
    likeLocks.add(post.id);

    const card = $("card-stack");
    if (!card) return;

    const likeBtn = card.querySelector(".like-btn");
    const likeEl = card.querySelector(".stat-l");

    // ❌ already liked
    if (localStorage.getItem(key) === "1") {
        showToast("Already liked! 💖");
        likeLocks.delete(post.id);
        return;
    }

    // ✅ optimistic UI
    localStorage.setItem(key, "1");
    registerSessionEngagement("like", post.id);

    likeBtn?.classList.add("liked");
    if (likeBtn) likeBtn.textContent = "💖 Liked";

    const oldLikes = post.likes || 0;
    if (likeEl) likeEl.textContent = fmt(oldLikes + 1);

    try {
        await cfTrackEngagement({
            postId: post.id,
            type: "like"
        });

        // ✅ sync local model
        post.likes = oldLikes + 1;

        updateHeaderUI();
        showToast("Liked! 💖");

    } catch (err) {
        console.warn("Like failed:", err.message);

        // 🔁 rollback
        localStorage.removeItem(key);

        likeBtn?.classList.remove("liked");
        if (likeBtn) likeBtn.textContent = "🤍 Like";
        if (likeEl) likeEl.textContent = fmt(oldLikes);

        showToast("Like failed ❌");
    }

    likeLocks.delete(post.id);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHARE
// ══════════════════════════════════════════════════════════════════════════════
async function handleShare(post) {
    const url = `${location.origin}${location.pathname}?lol=${post.id}`;

    let shared = false;
    let startTime = Date.now();

    try {
        await navigator.share({
            title: post.title,
            url
        });

        const duration = Date.now() - startTime;

        // ❌ Too fast → likely fake
        if (duration < 1200) {
            showToast("⚠️ Share too fast — try properly.");
            return;
        }

        shared = true;

    } catch (err) {
        // fallback → copy only (no reward)
        try {
            await navigator.clipboard.writeText(url);
            showToast("Link copied! 🔗 (no reward)");
        } catch { }
        return;
    }

    if (!shared) return;

    // ✅ prevent duplicate locally
    const key = `shared_${post.id}`;
    if (localStorage.getItem(key) === "1") {
        showToast("Already shared 👍");
        return;
    }

    localStorage.setItem(key, "1");

    // ✅ session engagement (your system)
    registerSessionEngagement("share", post.id);

    try {
        await cfTrackEngagement({
            postId: post.id,
            type: "share",

            // 🔐 required for server validation
            shareConfirmed: true,
            visitDurationMs: Date.now() - startTime
        });

        showToast("🚀 Share counted!");

    } catch (err) {
        console.warn("Share tracking failed:", err.message);
        showToast("Share not counted ❌");
    }
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
    if (config.type === "smart-link") maybeTriggerPassiveAdPulse(0.5);
    renderQuickLinks("feed-ad-links");
    $("card-stack").querySelector(".next-btn-ad")
        .addEventListener("click", () => { clearPendingAdRedirect(); navigate(1); });
    $("card-stack").querySelector(".prev-btn-ad")
        .addEventListener("click", () => { clearPendingAdRedirect(); navigate(-1); });
}

// ══════════════════════════════════════════════════════════════════════════════
//  BONUS CARD
//  Only shown when sessionEngagementScore >= BONUS_CARD_MIN_ENGAGEMENT (50).
//  Honest copy — no guarantee of coins or score boost.
//  Tab-return listener fires a clear explanation when user comes back.
// ══════════════════════════════════════════════════════════════════════════════
function renderBonusCard() {
    const sponsorLink = getNextSponsorLink();

    $("card-stack").innerHTML = `
  <div class="lol-card bonus-card">
    <div class="bonus-inner">
      <div class="bonus-emoji">🎁</div>
      <h2 class="bonus-title">Bonus Available </h2>
      <p class="bonus-sub">
         You've reached <strong>${sessionEngagementScore}</strong> session engagement points.
         Tapping <em>Claim</em> opens a sponsor offer in a new tab and submits your session
         for a <strong>possible engagement score boost</strong>.
         Rewards are calculated server-side based on activity quality.
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
        const deepPost = { id: snap.id, ...snap.data() };
        deepPost.createdAtMs = postDateToMillis(deepPost.createdAt);
        posts = [deepPost, ...posts.filter((p) => p.id !== id)];
        cardIndex = 0;
        renderCard();
    } catch (err) { console.warn("[LoL] deepLink:", err.message); }
}



// ══════════════════════════════════════════════════════════════════════════════
//  CREATE POST
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
//  BACK / ROUTE STATE
// ══════════════════════════════════════════════════════════════════════════════
let appView = "feed"; // feed | profile | create
let backTrapReady = false;

function ensureBackTrap() {
    if (backTrapReady) return;
    backTrapReady = true;

    // Create a safe "feed root" entry so back can be intercepted
    history.replaceState({ view: "root" }, "", location.href);
    history.pushState({ view: "feed" }, "", location.href);

    window.addEventListener("popstate", handleAppBack);
}

function handleAppBack() {
    // Create overlay -> go back to feed instead of exiting
    if (!$("create-overlay").classList.contains("hidden") || appView === "create") {
        appView = "feed";
        closeCreateOverlay(true);
        openFeed();
        return;
    }

    // Profile -> go back to feed
    if ($("profile-screen").classList.contains("active") || appView === "profile") {
        appView = "feed";
        openFeed();
        return;
    }

    // Feed -> ask before leaving
    if (isFeedFullscreen) {
        setFeedFullscreen(false);
        return;
    }

    showLeaveFeedPopup();
    history.pushState({ view: "feed" }, "", location.href);
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
              <button class="leave-btn leave-btn-primary" id="leave-listen">Go to x Listen</button>
            </div>

            <button class="leave-text-link" id="leave-exit">Exit anyway</button>
          </div>
        `;
        document.body.appendChild(popup);

        popup.querySelector("#leave-stay").addEventListener("click", () => {
            popup.classList.add("hidden");
        });

        popup.querySelector("#leave-listen").addEventListener("click", () => {
            window.location.href = LISTEN_URL;
        });

        popup.querySelector("#leave-exit").addEventListener("click", () => {
            popup.classList.add("hidden");
            // best-effort exit
            history.back();
        });
    }

    popup.classList.remove("hidden");
    requestAnimationFrame(() => popup.classList.add("show"));
}

function ensureLeavePopupStyles() {
    if (document.getElementById("leave-popup-styles")) return;
    const style = document.createElement("style");
    style.id = "leave-popup-styles";
    style.textContent = `
      .leave-popup{
        position:fixed; inset:0; z-index:99999;
        display:grid; place-items:center;
        background:rgba(5,8,18,.58);
        backdrop-filter:blur(10px);
        opacity:0; pointer-events:none;
        transition:.22s ease;
        padding:20px;
      }
      .leave-popup.show{ opacity:1; pointer-events:auto; }
      .leave-popup-card{
        width:min(100%, 420px);
        border-radius:28px;
        background:linear-gradient(180deg, rgba(18,24,42,.98), rgba(10,14,26,.98));
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 20px 60px rgba(0,0,0,.45);
        padding:22px;
        color:#fff;
        text-align:center;
      }
      .leave-popup-badge{
        display:inline-flex; align-items:center; gap:8px;
        padding:8px 12px; border-radius:999px;
        background:rgba(255,255,255,.06);
        color:#dbe4ff; font-size:.82rem; margin-bottom:12px;
      }
      .leave-popup-card h3{ margin:0 0 8px; font-size:1.35rem; }
      .leave-popup-card p{ margin:0 0 18px; color:#aab2cf; line-height:1.5; }
      .leave-popup-actions{ display:grid; gap:10px; }
      .leave-btn{
        border:none; border-radius:16px; padding:14px 16px;
        font-weight:700; cursor:pointer;
      }
      .leave-btn-primary{
        background:linear-gradient(135deg, #7c5cff, #00d4ff);
        color:#09111f;
      }
      .leave-btn-secondary{
        background:rgba(255,255,255,.06);
        color:#fff;
      }
      .leave-text-link{
        margin-top:12px; background:none; border:none;
        color:#9fb1ff; cursor:pointer; font-size:.95rem;
      }
    `;
    document.head.appendChild(style);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE UPLOAD POPUP
// ══════════════════════════════════════════════════════════════════════════════
let createUploadModal = null;
let createUploadThumbURL = null;

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

        <div class="upload-bar">
          <div class="upload-bar-fill" id="upload-bar-fill"></div>
        </div>

        <div class="upload-status" id="upload-status-text">Preparing...</div>
      </div>
    </div>
  </div>
`;
    document.body.appendChild(wrap);

    wrap.querySelector("#upload-cancel-btn").addEventListener("click", () => {
        // light cancel: just hide popup; upload task is not aborted here
        hideCreateUploadModal();
        btnEnableCreate();
        showToast("Upload cancelled.");
    });

    createUploadModal = wrap;
    return wrap;
}

function ensureCreateUploadStyles() {
    if (document.getElementById("create-upload-styles")) return;

    const style = document.createElement("style");
    style.id = "create-upload-styles";
    style.textContent = `
      .upload-modal{
        position:fixed; inset:0; z-index:99998;
        display:grid; place-items:center;
        background:rgba(4,7,16,.62);
        backdrop-filter:blur(12px);
        opacity:0; pointer-events:none;
        transition:.22s ease;
        padding:18px;
      }
      .upload-modal.show{ opacity:1; pointer-events:auto; }
      .upload-card{
        width:min(100%, 460px);
        border-radius:30px;
        background:linear-gradient(180deg, rgba(18,24,42,.98), rgba(10,14,26,.98));
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 24px 80px rgba(0,0,0,.5);
        padding:18px;
        color:#fff;
      }
      .upload-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:14px; }
      .upload-badge{
        display:inline-flex; align-items:center; gap:8px;
        padding:7px 12px; border-radius:999px;
        background:rgba(0,212,255,.12); color:#8be7ff;
        font-size:.78rem; font-weight:700;
      }
      .upload-title-wrap h3{ margin:10px 0 4px; font-size:1.35rem; }
      .upload-sub{ margin:0; color:#aab2cf; font-size:.92rem; line-height:1.45; }
      .upload-close{
        width:40px; height:40px; border:none; border-radius:14px;
        background:rgba(255,255,255,.06); color:#fff; cursor:pointer;
      }

      .upload-body{
  display:flex;
  flex-direction:column;
  gap:14px;
}

.upload-thumb-box{
  width:100%;
  aspect-ratio:4/3;
  border-radius:18px;
  overflow:hidden;
  background:#0c1224;
  border:1px solid rgba(255,255,255,.08);
}

.upload-thumb img,
.upload-thumb video{
  width:100%;
  height:100%;
  object-fit:cover;
  transform:translateZ(0);
}

.upload-percent{
  font-size:1.6rem;
  font-weight:700;
}

.upload-bar{
  width:100%;
  height:12px;
  border-radius:999px;
  background:rgba(255,255,255,.08);
  overflow:hidden;
}

.upload-bar-fill{
  height:100%;
  width:0%;
  border-radius:999px;
  background:linear-gradient(90deg,#7c5cff,#00d4ff);
  transition:width .25s ease;
}

.upload-status{
  font-size:.9rem;
  color:#aab2cf;
}
    `;

    document.head.appendChild(style);

    // SVG gradient for the ring stroke
    const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgDefs.setAttribute("width", "0");
    svgDefs.setAttribute("height", "0");
    svgDefs.style.position = "absolute";
    svgDefs.innerHTML = `
      <defs>
        <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#7c5cff"/>
          <stop offset="100%" stop-color="#00d4ff"/>
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(svgDefs);
}

function showCreateUploadModal(file, percent = 0, label = "Uploading") {
    ensureCreateUploadStyles();
    const modal = ensureCreateUploadModal();

    const thumb = modal.querySelector("#upload-thumb");

    if (thumb && file) {
        const url = URL.createObjectURL(file);
        createUploadThumbURL = url;

        if (file.type.startsWith("video/")) {
            thumb.innerHTML = `<video src="${url}" muted playsinline></video>`;

            const vid = thumb.querySelector("video");
            vid.addEventListener("loadeddata", () => {
                vid.currentTime = 0.2;
                vid.pause(); // 🚫 no autoplay
            });

        } else {
            thumb.innerHTML = `<img src="${url}" />`;
        }
    }

    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("show"));
    updateCreateUploadModal(percent, label);
}

function updateCreateUploadModal(percent, text = "Uploading...") {
    const p = Math.min(99, Math.round(percent));

    $("upload-bar-fill").style.width = p + "%";
    $("upload-percent-text").textContent = p + "%";
    $("upload-status-text").textContent = text;
}

function hideCreateUploadModal() {
    const modal = document.getElementById("create-upload-modal");
    if (!modal) return;
    modal.classList.remove("show");
    setTimeout(() => {
        modal.classList.add("hidden");
        if (createUploadThumbURL) {
            URL.revokeObjectURL(createUploadThumbURL);
            createUploadThumbURL = null;
        }
        const thumb = modal.querySelector("#upload-thumb");
        if (thumb) thumb.innerHTML = "";
    }, 220);
}

function btnDisableCreate() {
    const btn = $("btn-post-submit");
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Uploading…";
}

function btnEnableCreate() {
    const btn = $("btn-post-submit");
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = "🚀 Post LoL";
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE BUTTONS
// ══════════════════════════════════════════════════════════════════════════════
$("btn-create").addEventListener("click", () => {
    ensureBackTrap();
    appView = "create";
    refreshCreateReqs();
    $("create-overlay").classList.remove("hidden");
});

$("close-create").addEventListener("click", () => {
    // use browser back so route state stays correct
    if (history.length > 1) history.back();
    else closeCreateOverlay(true);
});

function closeCreateOverlay(silent = false) {
    clearCreateMedia();
    resetCreateForm();
    $("create-overlay").classList.add("hidden");
    hideCreateUploadModal();
    if (!silent) appView = "feed";
}

// ══════════════════════════════════════════════════════════════════════════════
//  UPDATED OPEN PROFILE / BACK
// ══════════════════════════════════════════════════════════════════════════════
async function openProfile() {
    ensureBackTrap();
    appView = "profile";
    setFeedFullscreen(false);
    setNavState("profile");
    showScreen("profile-screen");

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
        `₹${(((lolUserData.estimatedEarning * 0.7) || 0)).toFixed(2)}`;

    const pct = Math.min(100, ((lolUserData.engagementScore || 0) / 1000) * 100);
    $("progress-fill").style.width = pct + "%";
    $("progress-text").textContent = `${lolUserData.engagementScore || 0} / 1000`;

    await loadProfileHistory(currentUser.uid);
}

$("back-from-profile").addEventListener("click", () => {
    if (history.length > 1) history.back();
    else openFeed();
});



// ══════════════════════════════════════════════════════════════════════════════
//  UPDATED SUBMIT POST
// ══════════════════════════════════════════════════════════════════════════════
$("btn-post-submit").addEventListener("click", submitPost);

async function submitPost() {
    const title = $("post-title").value.trim();
    if (!title) return showToast("Add a title! 😅");
    if (!selectedFile) return showToast("Pick a media! 📸");

    const btn = $("btn-post-submit");
    btnDisableCreate();

    // close create form, show upload popup
    $("create-overlay").classList.add("hidden");
    showCreateUploadModal(selectedFile, 0, "Preparing", "Reading file…");

    let uploadTask = null;

    try {
        const ext = selectedFile.name.split(".").pop();
        const path = `SapanaCyberHub/LoL/posts/${currentUser.uid}/${Date.now()}.${ext}`;

        const storageRef = storRef(stor, path);
        uploadTask = uploadBytesResumable(storageRef, selectedFile);

        const uploadSnap = await new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snap) => {
                    const raw = (snap.bytesTransferred / snap.totalBytes) * 100;
                    const pct = Math.min(99, Math.floor(raw)); // keep the user at 99% until final server commit
                    updateCreateUploadModal(
                        pct,
                        pct >= 95 ? "Almost done" : "Uploading",
                        pct >= 95 ? "Finalizing your post…" : "Uploading media…"
                    );
                },
                reject,
                () => resolve(uploadTask.snapshot)
            );
        });

        updateCreateUploadModal(99, "Almost done", "Saving your post…");

        const mediaURL = await getDownloadURL(uploadSnap.ref);
        const tags = ($("post-tags").value || "").match(/#\w+/g) || [];

        await cfCreateLolPost({
            title,
            description: $("post-desc").value.trim(),
            hashtags: tags,
            mediaURL,
            mediaType: selectedFile.type.startsWith("video") ? "video" : "image"
        });

        updateCreateUploadModal(100, "Done", "Your LoL is live!");
        await new Promise((r) => setTimeout(r, 350));

        showToast("🚀 LoL posted successfully!");
        hideCreateUploadModal();

        resetCreateForm();
        await loadPosts(true);
        cardIndex = 0;
        renderCard();
        updateHeaderUI();

    } catch (err) {
        console.error(err);
        hideCreateUploadModal();
        showToast(err.code === "failed-precondition" ? err.message : "Upload failed: " + err.message);
        $("create-overlay").classList.remove("hidden");
    }

    btnEnableCreate();
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
$("media-input").addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const inner = $("dropzone-inner");
    inner.innerHTML = selectedFile.type.startsWith("video")
        ? `<video src="${URL.createObjectURL(selectedFile)}" class="preview-media" loop autoplay></video>`
        : `<img src="${URL.createObjectURL(selectedFile)}" class="preview-media" />`;
});



function clearCreateMedia() {
    // ❌ remove selected file
    selectedFile = null;

    // ❌ reset file input
    const input = $("media-input");
    if (input) input.value = "";

    // ❌ stop preview media (VERY IMPORTANT)
    const preview = $("dropzone-inner")?.querySelector("video, img");

    if (preview) {
        if (preview.tagName === "VIDEO") {
            preview.pause();
            preview.src = "";
            preview.load();
        }
        preview.remove();
    }

    // ✅ restore default UI
    $("dropzone-inner").innerHTML = `
        <span class="dropzone-icon">🎬</span>
        <p>Tap to select Photo / Video / GIF</p>
    `;
}

function resetCreateForm() {
    clearCreateMedia();
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
        console.log("hi creators", err);
        container.innerHTML = `
        
      <div class="row">
        <span>Rank</span>
        <span>Creator</span>
        <span>Score</span>
      </div>
        <p style="text-align:center">No leaderboard today 😴</p>`;
    }
}





function setHistoryLoading(id, label = "Loading...") {
    const list = $(id);
    if (list) list.innerHTML = `<p class="empty-history">${esc(label)}</p>`;
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

    // bind taps
    list.querySelectorAll(".post-thumb").forEach((el) => {
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
      <div class="post-thumb-overlay">
        <span class="post-thumb-earn">₹${earning}</span>
      </div>
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
      <div class="analytics-panel" id="am-panel"></div>
    `;
    document.body.appendChild(el);
    document.getElementById("am-close").addEventListener("click", closeAnalyticsModal);
    el.addEventListener("click", (e) => { if (e.target === el) closeAnalyticsModal(); });
}

function openAnalyticsModal(post) {
    ensureAnalyticsOverlay();
    const overlay = document.getElementById("post-analytics-overlay");
    const mediaWrap = document.getElementById("am-media");
    const panel = document.getElementById("am-panel");
    const muteBtn = document.getElementById("am-mute");

    // ── media ─────────────────────────────────────────────────────────────────
    // Remove previous media (keep close/mute buttons)
    mediaWrap.querySelectorAll("video, img, .analytics-status-badge").forEach(n => n.remove());

    const isVideo = post.postType === "video";
    const isLive = post.status === "active";

    // status badge
    const badge = document.createElement("span");
    badge.className = `analytics-status-badge ${isLive ? "live" : "done"}`;
    badge.textContent = isLive ? "🟢 LIVE" : "✅ DONE";
    mediaWrap.insertBefore(badge, mediaWrap.querySelector(".analytics-close"));

    if (post.postURL) {
        if (isVideo) {
            const vid = document.createElement("video");
            vid.src = post.postURL;
            vid.autoplay = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.muted = false;         // unmuted by default
            vid.controls = false;
            mediaWrap.insertBefore(vid, muteBtn);
            muteBtn.style.display = "";
            muteBtn.textContent = "🔇 Mute";
            muteBtn.onclick = () => {
                vid.muted = !vid.muted;
                muteBtn.textContent = vid.muted ? "🔊 Unmute" : "🔇 Mute";
            };
            vid.play().catch(() => { vid.muted = true; vid.play().catch(() => { }); });
        } else {
            const img = document.createElement("img");
            img.src = post.postURL;
            img.alt = post.title || "";
            mediaWrap.insertBefore(img, muteBtn);
            muteBtn.style.display = "none";
        }
    } else {
        const placeholder = document.createElement("div");
        placeholder.style.cssText = "width:100%;height:200px;display:grid;place-items:center;font-size:3rem";
        placeholder.textContent = "😂";
        mediaWrap.insertBefore(placeholder, muteBtn);
        muteBtn.style.display = "none";
    }

    // ── analytics panel ───────────────────────────────────────────────────────
    const createdDate = post.createdAtMs
        ? new Date(post.createdAtMs).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "";
    const expiresDate = post.expiresAtMs
        ? new Date(post.expiresAtMs).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
        : null;

    const earning = (post.earning || 0).toFixed(2);
    const shareUrl = `${location.origin}${location.pathname}?lol=${post.id}`;

    panel.innerHTML = `
      <h2 class="analytics-title">${esc(post.title || "Untitled")}</h2>
      <p class="analytics-date">${createdDate ? "Posted " + createdDate : ""}</p>

      <div class="analytics-stats">
        <div class="a-stat">
          <div class="a-stat-val">${fmt(post.views || 0)}</div>
          <div class="a-stat-lbl">👁 Views</div>
        </div>
        <div class="a-stat">
          <div class="a-stat-val">${fmt(post.likes || 0)}</div>
          <div class="a-stat-lbl">💖 Likes</div>
        </div>
        <div class="a-stat">
          <div class="a-stat-val">${fmt(post.shares || 0)}</div>
          <div class="a-stat-lbl">🔗 Shares</div>
        </div>
        <div class="a-stat">
          <div class="a-stat-val">${post.engagementScore || 0}</div>
          <div class="a-stat-lbl">⚡ Score</div>
        </div>
      </div>

      <div class="analytics-earning-banner">
        <div>
          <div class="aeb-label">Estimated Earning</div>
          <div class="aeb-value">₹${earning}</div>
          <div class="aeb-status">${isLive ? "🟢 Post still earning" : "✅ Final earning"}</div>
        </div>
        <div style="font-size:2.2rem">💰</div>
      </div>

      ${expiresDate ? `
        <div class="analytics-expiry">
          ⏱ ${isLive ? "Expires" : "Expired"}: <strong style="color:#e8eaf0">${expiresDate}</strong>
        </div>` : ""}

      <div class="analytics-actions">
        <button class="aa-btn aa-share" id="am-share-btn">🔗 Share Post</button>
        <button class="aa-btn aa-delete" id="am-delete-btn">🗑 Delete</button>
      </div>
      <p id="am-action-msg" style="text-align:center;font-size:.8rem;color:#7a8099;margin-top:.8rem"></p>
    `;

    // Share
    panel.querySelector("#am-share-btn").addEventListener("click", async () => {
        try { await navigator.share({ title: post.title, url: shareUrl }); }
        catch { await navigator.clipboard.writeText(shareUrl); showToast("Link copied! 🔗"); }
    });

    // Delete
    const deleteBtn = panel.querySelector("#am-delete-btn");
    const actionMsg = panel.querySelector("#am-action-msg");
    deleteBtn.addEventListener("click", () => handleDeletePost(post, deleteBtn, actionMsg));

    // open
    requestAnimationFrame(() => overlay.classList.add("open"));
}

function closeAnalyticsModal() {
    const overlay = document.getElementById("post-analytics-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    setTimeout(() => {
        overlay.querySelectorAll("video").forEach(v => { v.pause(); v.src = ""; });
    }, 350);
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

        if (res?.data?.success === false) {
            throw new Error(res.data.message || "Delete failed");
        }

        showToast("Post deleted ✅");
        closeAnalyticsModal();

        // Remove from local cache and re-render grid
        _postHistoryCache = _postHistoryCache.filter(p => p.id !== post.id);
        renderPostHistory(_postHistoryCache);

    } catch (err) {
        console.error("[LoL] delete:", err);
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
    } catch (err) {
        console.log("history", err);
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

        if (lolUserData.lastTransferMonth === monthKey) {
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
function postDateToMillis(value) {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    if (typeof value.seconds === "number") {
        return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1e6);
    }
    if (typeof value._seconds === "number") {
        return (value._seconds * 1000) + Math.floor((value._nanoseconds || 0) / 1e6);
    }
    return Number(value) || 0;
}
function postDateToDate(value) {
    const millis = postDateToMillis(value);
    return millis ? new Date(millis) : new Date();
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
            window.location.href = LISTEN_URL;
        }

        lastTap = currentTime;
    });
}
