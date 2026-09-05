// ============================================================
// DOM Elements Setup
// ============================================================
const loveVaultBtn = document.querySelector('.eol-m-v-btn');
const v_eol_mc = document.querySelector('.c-v');
const target_c = document.querySelector('.con-par');
const loveCard = document.querySelector('.eol-m-c-w');
const verqc = document.getElementById("vqc");

// ============================================================
// Global Data Configuration
// ============================================================
// EOL MEMBER ID Format: EOLS-SSSXXXXXXXXXX (State, District, Constituency initials)
let dummyLMId = "EOLS-BMB5478412452";

const dashboardURL = "http://sapabacyberhub.in/official/empireoflovestudios/verify-love/";
const dummyQRData = `${dashboardURL}?lmid=${encodeURIComponent(dummyLMId)}`;

// ============================================================
// Event Listeners Initialization
// ============================================================
if (v_eol_mc) {
    v_eol_mc.addEventListener('click', () => {
        if (target_c) {
            target_c.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        enabelCard();
    });
}

if (loveVaultBtn) {
    loveVaultBtn.addEventListener('click', openLoveVault);
}

// ============================================================
// UI Handlers
// ============================================================
function openLoveVault() {
    const loveVault = document.querySelector('.eol-m-w-p-c');
    const c_d = document.querySelector('.love-area');
    
    if (!loveVault) return;

    if (loveVault.style.display === 'none' || loveVault.style.display === '') {
        loveVault.style.display = 'flex';
        if (c_d) c_d.style.display = 'none';
        loveVaultBtn.textContent = "💕Close💕";
    } else {
        loveVault.style.display = 'none';
        if (c_d) c_d.style.display = 'flex';
        loveVaultBtn.textContent = "❤️Heart Vault🎁";
    }
}

function enabelCard() {
    loveCard?.classList.toggle("see-card");
    laodEolMC();
}

function laodEolMC() {
    generateEolQR();
}

// ============================================================
// QR Code Generator (SVG High-Res Output)
// ============================================================
function generateEolQR() {
    if (!verqc) {
        console.warn("QR container #vqc not found.");
        return;
    }

    if (typeof QRCodeStyling === "undefined") {
        console.error("QRCodeStyling library is not loaded.");
        return;
    }

    // Prevent re-rendering if QR code SVG already exists
    if (verqc.children.length > 0) return;

    verqc.innerHTML = "";

    const qr = new QRCodeStyling({
        type: "svg",             // Vector rendering fixes pixelation instantly
        width: 600,
        height: 600,
        data: dummyQRData,
        margin: 2,              // Added small quiet zone margin for camera detection
        qrOptions: {
            errorCorrectionLevel: "M" // Optimal contrast balance
        },
        dotsOptions: {
            color: "#000000",
            type: "square"
        },
        backgroundOptions: {
            color: "#FFFFFF"
        },
        cornersSquareOptions: {
            color: "#8B0000",   // Darker red maintains contrast
            type: "square"
        },
        cornersDotOptions: {
            color: "#8B0000",
            type: "square"
        }
    });

    qr.append(verqc);
}

// ============================================================
// 3D Tilt & Flip Controller
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const cardWrapper = document.querySelector(".eol-m-c-w");
    const frontCard = document.querySelector(".eol-m-c-front-card");
    const backCard = document.querySelector(".eol-m-c-back-card");

    if (!cardWrapper || !frontCard || !backCard) return;

    let isFlipped = false;
    let flipInterval = null;

    // Helper function to auto-flip
    const startAutoRotate = () => {
        flipInterval = setInterval(() => {
            isFlipped = !isFlipped;
            cardWrapper.classList.toggle("flipped", isFlipped);
        }, 2000); // Rotates every 2 seconds
    };

    // Start rotation on load
    startAutoRotate();

    // 1. Mouse Tracking 3D Tilt Logic
    cardWrapper.addEventListener("mousemove", (e) => {
        const rect = cardWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation angles (Max tilt: 20 degrees)
        const rotateX = ((y - centerY) / centerY) * -50;
        const rotateY = ((x - centerX) / centerX) * 180;

        if (!isFlipped) {
            frontCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            backCard.style.transform = `rotateX(${rotateX}deg) rotateY(${180 + rotateY}deg)`;
        } else {
            frontCard.style.transform = `rotateX(${rotateX}deg) rotateY(${-180 + rotateY}deg)`;
            backCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });

    // 2. Pause rotation and clear transition overrides on hover
    cardWrapper.addEventListener("mouseenter", () => {
        clearInterval(flipInterval);
        frontCard.style.transition = "none";
        backCard.style.transition = "none";
    });

    // 3. Reset transform smoothly on mouse leave & resume timer
    cardWrapper.addEventListener("mouseleave", () => {
        frontCard.style.transition = "transform 0.5s ease";
        backCard.style.transition = "transform 0.5s ease";

        if (!isFlipped) {
            frontCard.style.transform = "rotateX(0deg) rotateY(0deg)";
            backCard.style.transform = "rotateX(0deg) rotateY(180deg)";
        } else {
            frontCard.style.transform = "rotateX(0deg) rotateY(-180deg)";
            backCard.style.transform = "rotateX(0deg) rotateY(0deg)";
        }

        startAutoRotate();
    });

    // 4. Click listener attached to enable card view
    if (target_c) {
        cardWrapper.addEventListener("click", () => {
            enabelCard();
        });
    }
});