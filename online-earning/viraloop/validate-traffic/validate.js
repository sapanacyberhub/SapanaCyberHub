// validate.js - ViraLoop onboarding (all ads working, max earnings)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const firebaseConfig = {
    apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
    authDomain: "sapanacyberhub-26310.firebaseapp.com",
    projectId: "sapanacyberhub-26310",
    storageBucket: "sapanacyberhub-26310.firebasestorage.app",
    messagingSenderId: "448116453690",
    appId: "1:448116453690:web:01a91dd284b715bf0a2003",
    measurementId: "G-HKGQ8D55N1",
};

let validateTrafficFn = null;
try {
    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app);
    validateTrafficFn = httpsCallable(functions, "validateViraLoopTraffic");
} catch (e) {}

async function callValidateTraffic(memberId) {
    if (!validateTrafficFn || !memberId) {
        return { success: true, mock: true };
    }
    const todayId = `VL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    try {
        const result = await validateTrafficFn({ eventId: todayId, member: memberId });
        return result.data;
    } catch (err) {
        console.error("Validation error", err);
        throw err;
    }
}

// ---------- ADS (optimised) ----------
let multiformatLoaded = false;
function loadMultiformatOnce() {
    if (multiformatLoaded) return;
    multiformatLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://quge5.com/88/tag.min.js';
    script.setAttribute('data-zone', '186855');
    script.async = true;
    document.body.appendChild(script);
}

// Monetag Vignette – fixed injection
function loadMonetagVignette() {
    const old = document.getElementById('dynamic-vignette');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'dynamic-vignette';
    script.textContent = `(function(s){s.dataset.zone='10246448',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.body.appendChild(script);
}

// Social bar – loads once
function loadSocialBarOnce() {
      const container = document.getElementById('socialBarContainer');
    if (!container) return;
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = "https://pl28160948.effectivecpmnetwork.com/a3/f8/7d/a3f87d980e8ae573f535875f32f4c021.js";
    script.async = true;
    container.appendChild(script);
}

// Adsterra banner rotation
const bannerConfigs = [
    { key: 'be84f4cdee8a397c6208c778695c8973', width: 300, height: 250 },
    { key: 'b5d3a37bebdb18ab0d508dc21053382b', width: 728, height: 90 },
    { key: '522259f00affdbfdaf791b01f86b1a64', width: 320, height: 50 },
    { key: '1ec158b6632bf6a6bac690778268b1f7', width: 468, height: 60 },
    { key: '71197c8b1966802bbfa05225ac458a7b', width: 300, height: 250 },
    { key: '73d8d5f56e427b77a8f4c36d202a1097', width: 160, height: 600 }
];
let bannerIndex = 0;

function pickBannerConfig() {
    const banner = bannerConfigs[bannerIndex];
    bannerIndex = (bannerIndex + 1) % bannerConfigs.length;
    return banner;
}

function injectBanner(targetElement) {
    if (!targetElement) return;
    const banner = pickBannerConfig();
    targetElement.innerHTML = "";
    const optScript = document.createElement("script");
    optScript.text = `window.atOptions = { key: "${banner.key}", format: "iframe", height: ${banner.height}, width: ${banner.width}, params: {} };`;
    const invScript = document.createElement("script");
    invScript.src = `https://www.highperformanceformat.com/${banner.key}/invoke.js`;
    invScript.async = true;
    targetElement.appendChild(optScript);
    targetElement.appendChild(invScript);
}

function rotateBanner() {
    const container = document.getElementById('dynamicBanner');
    if (container) injectBanner(container);
}

// Sponsor links – round-robin
const sponsorLinks = [
    "https://omg10.com/4/10216281",
    "https://www.effectivecpmnetwork.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861",
    "https://omg10.com/4/10260660",
    "https://omg10.com/4/10749382",
    "https://www.effectivecpmnetwork.com/w7taatypw?key=9d400c5aa174b33787aecef1ac2c8203",
    "https://omg10.com/4/10619467",
    "https://omg10.com/4/10619475"
];
let sponsorIndex = 0;
function getRandomSponsorLink() {
    const link = sponsorLinks[sponsorIndex];
    sponsorIndex = (sponsorIndex + 1) % sponsorLinks.length;
    return link;
}

// ---------- UI Helpers ----------
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toastMessage');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

function lockButtonWithTimer(btn, onUnlock) {
    if (!btn) return;
    let seconds = 5;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = `Wait ${seconds}s...`;
    const interval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            btn.textContent = `Wait ${seconds}s...`;
        } else {
            clearInterval(interval);
            btn.disabled = false;
            btn.textContent = originalText;
            if (onUnlock) onUnlock();
        }
    }, 1000);
}

// Success modal – vignette + banner
function showSuccessModal(onContinue) {
    loadMonetagVignette();
    let modal = document.getElementById('successModal');
    if (!modal) {
        const newModal = document.createElement('div');
        newModal.id = 'successModal';
        newModal.className = 'modal-overlay';
        newModal.innerHTML = `
            <div class="modal-card">
                <p>🎉 We have a special offer for you! Click below to claim it!</p>
                <div id="successModalBanner" class="modal-banner"></div>
                <button id="successContinueBtn" class="close-modal-btn">Continue →</button>
            </div>
        `;
        document.body.appendChild(newModal);
        modal = newModal;
    }
    const bannerDiv = document.getElementById('successModalBanner');
    if (bannerDiv && !bannerDiv.hasChildNodes()) injectBanner(bannerDiv);
    modal.style.display = 'flex';

    const continueBtn = document.getElementById('successContinueBtn');
    if (continueBtn) {
        const newBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode.replaceChild(newBtn, continueBtn);
        let unlocked = false;
        lockButtonWithTimer(newBtn, () => { unlocked = true; });
        newBtn.addEventListener('click', () => {
            if (!unlocked) return;
            modal.style.display = 'none';
            if (onContinue) onContinue();
        });
    }
}


// Monetag In‑page Push – loads once on page load, can be refreshed
let inpageLoaded = false;
function loadMonetagInpage(refresh = false) {
    const old = document.getElementById('dynamic-inpage');
    if (old) old.remove();
    if (!refresh && inpageLoaded) return; // only load once unless forced refresh
    const script = document.createElement('script');
    script.id = 'dynamic-inpage';
    script.textContent = `(function(s){s.dataset.zone='10246441',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.body.appendChild(script);
    if (!refresh) inpageLoaded = true;
}

// Early exit modal – vignette + banner + in‑page push (no duplicates)
function showEarlyExitModal() {
    loadMonetagVignette();
    const modalBannerDiv = document.getElementById('modalBanner');
    if (modalBannerDiv) {
        modalBannerDiv.innerHTML = '';
        injectBanner(modalBannerDiv);
        // Force a fresh in‑page push (refresh)
        loadMonetagInpage(true);
        // Optionally also put a copy inside the modal? Not needed; it's global.
    }
    const modal = document.getElementById('exitModal');
    if (!modal) return;
    modal.style.display = 'flex';

    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        let unlocked = false;
        lockButtonWithTimer(newBtn, () => { unlocked = true; });
        newBtn.addEventListener('click', () => {
            if (!unlocked) return;
            modal.style.display = 'none';
            waitingForReturn = false;
            if (resolveStep) {
                resolveStep(false);
                resolveStep = null;
            }
            if (visibilityHandler) {
                document.removeEventListener('visibilitychange', visibilityHandler);
                visibilityHandler = null;
            }
        });
    }
}

let resolveStep = null;
let waitingForReturn = false;
let visibilityHandler = null;

// ---------- Step Logic ----------
const steps = document.querySelectorAll('.card');
let currentStep = 0;
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get('ref');

if (!memberId) {
    showToast("⚠️ No referral ID – traffic will NOT be validated", 5000);
}

let stepStart = 0;
const stepMessages = [
    "🚀 Step 1: Explore the offer (stay 5s)",
    "⚡ Step 2: Stay on sponsor page for 5 seconds",
    "📈 Step 3: Great! 5 seconds to continue",
    "💸 Step 4: View offer and return after 5s",
    "🤝 Step 5: Almost there – 5 seconds on sponsor",
    "🎓 Step 6: Final learning – stay 5 seconds",
    "🏁 Step 7: Stay 5 seconds to claim reward"
];

async function handleStepClick(stepIndex) {
    if (waitingForReturn) {
        showToast("Complete the current step first", 1500);
        return false;
    }
    showToast(stepMessages[stepIndex], 4000);
    rotateBanner();

    const sponsorUrl = getRandomSponsorLink();
    setTimeout(() => {
        window.open(sponsorUrl, '_blank');
    }, 1500);
    stepStart = Date.now();
    waitingForReturn = true;

    return new Promise((resolve) => {
        resolveStep = resolve;
        if (visibilityHandler) {
            document.removeEventListener('visibilitychange', visibilityHandler);
        }
        visibilityHandler = () => {
            if (!waitingForReturn) return;
            if (document.visibilityState === 'visible') {
                const elapsed = Date.now() - stepStart;
                document.removeEventListener('visibilitychange', visibilityHandler);
                visibilityHandler = null;
                if (elapsed >= 5000) {
                    waitingForReturn = false;
                    showSuccessModal(() => resolve(true));
                } else {
                    waitingForReturn = false;
                    showEarlyExitModal();
                    resolve(false);
                }
            }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
    });
}

function goToNextStep() {
    if (currentStep < steps.length - 1) {
        steps[currentStep].classList.remove('active');
        currentStep++;
        steps[currentStep].classList.add('active');
        rotateBanner();
        steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function handleFinalStep() {
    const ok = await handleStepClick(5);
    if (!ok) return;
    loadMultiformatOnce();
    showToast("🎉 Congratulations! Redirecting...", 3000);
    setTimeout(() => {
        window.location.href = "/online-earning/viraloop/community-member/";
    }, 2000);
}

// ---------- Event Listener ----------
document.querySelector('.main').addEventListener('click', async (e) => {
    const btn = e.target.closest('.getStart');
    if (!btn) return;
    const card = btn.closest('.card');
    if (!card || !card.classList.contains('active')) return;
    const idx = Array.from(steps).indexOf(card);
    if (idx === -1) return;

    if (idx === 6) {
        await handleFinalStep();
        return;
    }

    const success = await handleStepClick(idx);
    if (!success) return;

    if (idx === 1 && memberId) {
        try {
            showToast("Validating you...", 2000);
            const result = await callValidateTraffic(memberId);
            if (result.success) showToast("✅ You are validated.", 3000);
            else showToast("⚠️ Validation issue, but you can continue.", 2500);
        } catch (err) {
            console.error(err);
            showToast("Validation failed, but journey continues.", 2500);
        }
    }
    goToNextStep();
});

// ---------- Setup Containers & Initial Load ----------
function setupAdContainers() {
    const mainDiv = document.querySelector('.main');
    if (!document.getElementById('adContainer')) {
        const adDiv = document.createElement('div');
        adDiv.id = 'adContainer';
        adDiv.innerHTML = `
            <div class="ad-section">
                <div style="color:#aac8ff;">⚡ Sponsor offers refresh each step</div>
                <div id="dynamicBanner" class="banner-area"></div>
            </div>
            <div id="socialBarContainer" class="social-bar-area"></div>
        `;
        mainDiv.appendChild(adDiv);
    }
}

setupAdContainers();
loadSocialBarOnce();
loadMonetagInpage(); 
rotateBanner();

if (steps[0]) steps[0].classList.add('active');
currentStep = 0;

if (memberId) showToast(` Welcome!`, 4000);
else showToast("✨ Welcome! No validation call will be made", 3500);