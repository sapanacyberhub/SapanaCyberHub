// validate.js - ViraLoop onboarding with robust ad loading
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// ---------- FIREBASE CONFIG (replace with your own) ----------
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let validateTrafficFn = null;
try {
    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app);
    validateTrafficFn = httpsCallable(functions, "validateViraLoopTraffic");
    console.log("Firebase ready");
} catch (e) {
    console.warn("Firebase init failed, validation will be mocked", e);
}

async function callValidateTraffic(memberId) {
    if (!validateTrafficFn) {
        console.log("Mock validation success");
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

// ---------- AD SCRIPTS (Safe injection) ----------
function loadScript(src, id, attrs = {}) {
    const old = document.getElementById(id);
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = id;
    if (src) script.src = src;
    Object.keys(attrs).forEach(k => script.setAttribute(k, attrs[k]));
    document.body.appendChild(script);
    return script;
}

function loadMultiformat() {
    loadScript('https://quge5.com/88/tag.min.js', 'multiformat-tag', { 'data-zone': '186855', async: 'true', 'data-cfasync': 'false' });
}

function loadMonetagVignette() {
    const old = document.getElementById('dynamic-vignette');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'dynamic-vignette';
    script.textContent = `(function(s){s.dataset.zone='10246448';s.src='https://n6wxm.com/vignette.min.js';})(document.currentScript.parentElement.appendChild(document.createElement('script')));`;
    document.body.appendChild(script);
}

function loadMonetagInpage() {
    const old = document.getElementById('dynamic-inpage');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'dynamic-inpage';
    script.textContent = `(function(s){s.dataset.zone='10246441';s.src='https://nap5k.com/tag.min.js';})(document.currentScript.parentElement.appendChild(document.createElement('script')));`;
    document.body.appendChild(script);
}

function loadSocialBar() {
    const container = document.getElementById('socialBarContainer');
    if (!container) return;
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = "https://pl28160948.effectivecpmnetwork.com/a3/f8/7d/a3f87d980e8ae573f535875f32f4c021.js";
    script.async = true;
    container.appendChild(script);
}

// Banner rotation (simple iframes)
const bannerCodes = [
    `<iframe src="https://www.highperformanceformat.com/be84f4cdee8a397c6208c778695c8973/invoke.js" width="300" height="250" frameborder="0" scrolling="no"></iframe>`,
    `<iframe src="https://www.highperformanceformat.com/b5d3a37bebdb18ab0d508dc21053382b/invoke.js" width="728" height="90" frameborder="0" scrolling="no"></iframe>`,
    `<iframe src="https://www.highperformanceformat.com/522259f00affdbfdaf791b01f86b1a64/invoke.js" width="320" height="50" frameborder="0" scrolling="no"></iframe>`,
    `<iframe src="https://www.highperformanceformat.com/1ec158b6632bf6a6bac690778268b1f7/invoke.js" width="468" height="60" frameborder="0" scrolling="no"></iframe>`,
    `<iframe src="https://www.highperformanceformat.com/71197c8b1966802bbfa05225ac458a7b/invoke.js" width="300" height="250" frameborder="0" scrolling="no"></iframe>`,
    `<iframe src="https://www.highperformanceformat.com/73d8d5f56e427b77a8f4c36d202a1097/invoke.js" width="160" height="600" frameborder="0" scrolling="no"></iframe>`
];
let bannerIndex = 0;
function rotateBanner() {
    const container = document.getElementById('dynamicBanner');
    if (container) {
        container.innerHTML = bannerCodes[bannerIndex % bannerCodes.length];
        bannerIndex++;
    }
}

function refreshAllAds() {
    rotateBanner();
    loadMonetagVignette();
    loadMonetagInpage();
    loadSocialBar();
}

// Sponsor links
const sponsorLinks = [
    "https://www.effectivecpmnetwork.com/teatfjw7?key=c2a5c5ec6117abcadec09d5de655d861",
    "https://www.effectivecpmnetwork.com/w7taatypw?key=9d400c5aa174b33787aecef1ac2c8203",
    "https://omg10.com/4/10216281",
    "https://omg10.com/4/10260660",
    "https://omg10.com/4/10749382",
    "https://omg10.com/4/10619467",
    "https://omg10.com/4/10619475"
];
function getRandomSponsorLink() {
    return sponsorLinks[Math.floor(Math.random() * sponsorLinks.length)];
}

// ---------- UI Helpers ----------
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toastMessage');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// Early exit modal (when user returns too soon)
function showEarlyExitModal() {
    loadMonetagVignette();
    const modalBannerDiv = document.getElementById('modalBanner');
    if (modalBannerDiv) {
        modalBannerDiv.innerHTML = bannerCodes[bannerIndex % bannerCodes.length];
        bannerIndex++;
    }
    const modal = document.getElementById('exitModal');
    if (modal) modal.style.display = 'flex';
}

// ✅ NEW: Success modal (when user stays 5+ seconds) – shows a banner too
function showSuccessModal(onContinue) {
    const modal = document.getElementById('successModal');
    if (!modal) {
        // Create success modal dynamically if it doesn't exist
        const newModal = document.createElement('div');
        newModal.id = 'successModal';
        newModal.className = 'modal-overlay';
        newModal.innerHTML = `
            <div class="modal-card">
                <p>🎉 Great! You stayed the required 5 seconds.</p>
                <div id="successModalBanner" class="modal-banner"></div>
                <button id="successContinueBtn" class="close-modal-btn">Continue →</button>
            </div>
        `;
        document.body.appendChild(newModal);
        document.getElementById('successContinueBtn').addEventListener('click', () => {
            newModal.style.display = 'none';
            if (onContinue) onContinue();
        });
        modal = newModal;
    }
    // Insert a banner
    const bannerDiv = document.getElementById('successModalBanner');
    if (bannerDiv) {
        bannerDiv.innerHTML = bannerCodes[bannerIndex % bannerCodes.length];
        bannerIndex++;
    }
    modal.style.display = 'flex';
    // Store the callback so it fires only once
    const continueBtn = document.getElementById('successContinueBtn');
    const oldClick = continueBtn.onclick;
    continueBtn.onclick = () => {
        modal.style.display = 'none';
        if (onContinue) onContinue();
    };
}

let resolveStep = null;
let waitingForReturn = false;
let visibilityHandler = null;

function closeModal() {
    const modal = document.getElementById('exitModal');
    if (modal) modal.style.display = 'none';
    waitingForReturn = false;
    if (resolveStep) {
        resolveStep(false);
        resolveStep = null;
    }
    if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
    }
}

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
    refreshAllAds();

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
                    // ✅ Show success modal with banner before resolving
                    showSuccessModal(() => {
                        resolve(true);
                    });
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
        refreshAllAds();
        steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function handleFinalStep() {
    const ok = await handleStepClick(6);
    if (!ok) return;
    loadMonetagVignette();
    loadMultiformat();
    showToast("🎉 Congratulations! Redirecting...", 3000);
    setTimeout(() => {
        window.location.href = "/join";
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

const closeBtn = document.getElementById('closeModalBtn');
if (closeBtn) closeBtn.addEventListener('click', closeModal);

// ---------- Setup Ad Containers ----------
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
loadMultiformat();
refreshAllAds();
if (steps[0]) steps[0].classList.add('active');
currentStep = 0;

if (memberId) showToast(` Welcome! Member`, 4000);
else showToast("✨ Welcome! No validation call will be made", 3500);