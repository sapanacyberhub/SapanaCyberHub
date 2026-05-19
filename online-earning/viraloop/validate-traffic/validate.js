// validate.js - ViraLoop onboarding with ads & 5-second rule
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
    const todayId = `VL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
    try {
        const result = await validateTrafficFn({ eventId: todayId, member: memberId });
        return result.data;
    } catch (err) {
        console.error("Validation error", err);
        throw err;
    }
}

// ---------- AD SCRIPTS (Monetag + Adsterra) ----------
function loadMultiformat() {
    const old = document.getElementById('multiformat-tag');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'multiformat-tag';
    script.src = 'https://quge5.com/88/tag.min.js';
    script.setAttribute('data-zone', '186855');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);
}

function loadMonetagVignette() {
    const old = document.getElementById('dynamic-vignette');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'dynamic-vignette';
    script.textContent = `(function(s){s.dataset.zone='10246448',s.src='https://n6wxm.com/vignette.min.js'})(document.currentScript.parentElement.appendChild(document.createElement('script')))`;
    document.body.appendChild(script);
}

function loadMonetagInpage() {
    const old = document.getElementById('dynamic-inpage');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'dynamic-inpage';
    script.textContent = `(function(s){s.dataset.zone='10246441',s.src='https://nap5k.com/tag.min.js'})(document.currentScript.parentElement.appendChild(document.createElement('script')))`;
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

// Banner rotation (Adsterra iframes)
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

// Sponsor links array
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

function showEarlyExitModal() {
    loadMonetagVignette(); // extra vignette
    const modalBannerDiv = document.getElementById('modalBanner');
    if (modalBannerDiv) {
        modalBannerDiv.innerHTML = '';
        const inpageScript = document.createElement('script');
        inpageScript.textContent = `(function(s){s.dataset.zone='10246441',s.src='https://nap5k.com/tag.min.js'})(document.currentScript.parentElement.appendChild(document.createElement('script')))`;
        modalBannerDiv.appendChild(inpageScript);
        const extraBanner = document.createElement('div');
        extraBanner.innerHTML = bannerCodes[bannerIndex % bannerCodes.length];
        bannerIndex++;
        modalBannerDiv.appendChild(extraBanner);
    }
    const modal = document.getElementById('exitModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('exitModal');
    if (modal) modal.style.display = 'none';
}

// ---------- Step Logic ----------
const steps = document.querySelectorAll('.card');
let currentStep = 0;
const memberId = new URLSearchParams(window.location.search).get('ref') || new URLSearchParams(window.location.search).get('ref');
let waitingForReturn = false;
let stepStart = 0;
let resolveStep = null;

const stepMessages = [
    "🚀 Step 1: Explore the offer (stay 5s)",
    "⚡ Step 2: Please stay on the sponsor page for at least 5 seconds",
    "📈 Step 3: Great! Stay 5 seconds to continue",
    "💸 Step 4: View the offer and return after 5 seconds",
    "🤝 Step 5: Almost there – 5 seconds on sponsor",
    "🎓 Step 6: Final learning step – stay 5 seconds",
    "🏁 Step 7: Last step – stay 5 seconds to claim your reward"
];

async function handleStepClick(stepIndex) {
    if (waitingForReturn) {
        showToast("Please finish the current step first", 1500);
        return false;
    }
    showToast(stepMessages[stepIndex], 4000);
    refreshAllAds();

    const sponsorUrl = getRandomSponsorLink();
    window.open(sponsorUrl, '_blank');
    stepStart = Date.now();
    waitingForReturn = true;

    return new Promise((resolve) => {
        resolveStep = resolve;
        const onVisibility = () => {
            if (!waitingForReturn) return;
            if (document.visibilityState === 'visible') {
                const elapsed = Date.now() - stepStart;
                document.removeEventListener('visibilitychange', onVisibility);
                if (elapsed >= 5000) {
                    waitingForReturn = false;
                    resolve(true);
                } else {
                    waitingForReturn = false;
                    showEarlyExitModal();
                    resolve(false);
                }
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
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

// Special handler for final step (index 6)
async function handleFinalStep() {
    const ok = await handleStepClick(6);
    if (!ok) return;
    // After successful return: fire vignette + multiformat again
    loadMonetagVignette();
    loadMultiformat();  // second time
    showToast("🎉 Congratulations! Redirecting to join page...", 3000);
    setTimeout(() => {
        window.location.href = "/join"; // change to your actual join URL
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

    // Step 2 (idx === 1) and memberId exists -> call validation
    if (idx === 1 && memberId) {
        try {
            showToast("Validating your traffic...", 2000);
            const result = await callValidateTraffic(memberId);
            if (result.success) showToast("✅ Traffic validated! Reward added.", 3000);
            else showToast("⚠️ Validation issue, but you can continue.", 2500);
        } catch (err) {
            console.error(err);
            showToast("Validation failed, but journey continues.", 2500);
        }
    }
    goToNextStep();
});

// Close modal button
const closeBtn = document.getElementById('closeModalBtn');
if (closeBtn) closeBtn.addEventListener('click', closeModal);

// ---------- Setup Ad Containers & Initial Load ----------
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
loadMultiformat();      // first call (on page load)
refreshAllAds();
// Activate first step
if (steps[0]) steps[0].classList.add('active');
currentStep = 0;

if (memberId) showToast(`🔑 Member ${memberId} detected – step 2 will auto-validate`, 4000);
else showToast("✨ Welcome! No member ID – step 2 will work but no validation call", 3500);