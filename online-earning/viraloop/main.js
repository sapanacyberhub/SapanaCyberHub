// ==================== FIREBASE IMPORTS (use correct paths in production) ====================
// 🔧 Replace these with your own CDN / bundled paths
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    deleteUser          // if you later need to delete user from auth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ Your custom functions – adjust paths as needed
// (They could be callable functions or direct Firestore helpers)
import {
    createViraLoopMember,
    getMemberProfile,
    updateLastActive
} from "./community-member/community-legal/error.js";   // ⚠️ fix this path

// Firebase config – use your own
const firebaseConfig = {
    apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
    authDomain: "sapanacyberhub-26310.firebaseapp.com",
    projectId: "sapanacyberhub-26310",
    storageBucket: "sapanacyberhub-26310.firebasestorage.app",
    messagingSenderId: "448116453690",
    appId: "1:448116453690:web:01a91dd284b715bf0a2003",
    measurementId: "G-HKGQ8D55N1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);   // but you can keep your own if needed

// ==================== DOM REFERENCES ====================
const earning = document.querySelector(".earning");
const userDp = document.querySelector(".user-dp");
const userName = document.querySelector(".m-n");
const closeP = document.querySelector(".back-dashboard");
const profileOverlay = document.querySelector(".viraloop-profile-overlay");

const withdrawalBtn = document.querySelector(".w-e");
const withdrawalPage = document.querySelector(".w-f");
const paymentMethodsContainer = document.querySelector(".payment-getway");
const submitWithdrawalBtn = document.querySelector(".submit-withdrawal");

const upiInp = document.querySelector(".upiId");
const paypalInp = document.querySelector(".paypalId");
const bankFields = {
    name: document.querySelector(".bank_name"),
    acNo: document.querySelector(".bank_ac_no"),
    cA: document.querySelector(".c_a"),
    ifsc: document.querySelector(".ifsc_code"),
};
const amountInp = document.querySelector(".amount");

const loader = document.querySelector(".loader-container");
const notAvailable = document.querySelector(".t-na");

// ==================== STATE ====================
let memberData = null;
let isMember = false;
let isWithdrawing = false;
const LOGIN_URL = "/online-earning/viraloop/community-member/index.html";  // Sign‑in page
let paymentGateway = "";   // 'upi', 'bank-transfer', 'paypal'

// ==================== DYNAMIC TOAST SYSTEM (no external HTML needed) ====================
let activeToast = null;  // ensures only one toast at a time
function showToast(message, type = "info", duration = 4000) {
    // Remove any existing toast to prevent stacking
    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    const toast = document.createElement("div");
    toast.className = `viraloop-toast toast-${type}`;
    toast.textContent = message;
    toast.classList.add(type);

    activeToast = toast;

    // Trigger fade‑in
    requestAnimationFrame(() => toast.style.opacity = "1");

    // Auto‑remove after duration
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            if (activeToast === toast) toast.remove();
            if (activeToast === toast) activeToast = null;
            toast.classList.remove(type);
        }, 300);
    }, duration);
}

// Convenience functions
function showError(msg) { showToast(msg, "error"); }
function showWarning(msg) { showToast(msg, "warning"); }
function showSuccess(msg) { showToast(msg, "success"); }

// ==================== PAYMENT GATEWAY FIELD CONFIG ====================
const GATEWAY_FIELDS = {
    "upi": { upiInp: true, paypalInp: false, bankFields: false, amountInp: true },
    "bank-transfer": { upiInp: false, paypalInp: false, bankFields: true, amountInp: true },
    "paypal": { upiInp: false, paypalInp: true, bankFields: false, amountInp: true },
    "": { upiInp: false, paypalInp: false, bankFields: false, amountInp: false }
};

// ==================== PROFILE TOGGLE ====================
function toggleProfile() {
    if (!isMember) {
        showWarning("Please sign in to view your profile");
        setTimeout(() => window.location.href = LOGIN_URL, 600);
        return;
    }
    const isOpen = profileOverlay.classList.toggle("active");
    if (isOpen) {
        setProfile(memberData);
    } else {
        if (isWithdrawing) closeWithdrawal();
    }
}

[userDp, earning, userName, closeP].forEach(el => el?.addEventListener("click", toggleProfile));

// ==================== WITHDRAWAL TOGGLE ====================
function toggleWithdrawal() {
    if (!isMember) {
        showWarning("Login required for withdrawal");
        return;
    }
    if (!isWithdrawing) {
        openWithdrawal();
    } else {
        closeWithdrawal();
    }
}

function openWithdrawal() {
    withdrawalPage?.classList.add("active");
    setActiveGateway("upi");
    isWithdrawing = true;
    withdrawalBtn.textContent = "Cancel";
}

function closeWithdrawal() {
    withdrawalPage?.classList.remove("active");
    clearForm();
    clearActiveGateway();
    isWithdrawing = false;
    withdrawalBtn.textContent = "Withdraw";
}

withdrawalBtn?.addEventListener("click", toggleWithdrawal);

// ==================== PAYMENT GATEWAY SELECTION (Event Delegation) ====================
paymentMethodsContainer?.addEventListener("click", (e) => {
    const methodBtn = e.target.closest("[data-gateway]");
    if (!methodBtn) return;
    const gateway = methodBtn.dataset.gateway;
    setActiveGateway(gateway);
});

function setActiveGateway(gateway) {
    paymentMethodsContainer.querySelectorAll("[data-gateway]").forEach(btn => btn.classList.remove("active"));
    const activeBtn = paymentMethodsContainer.querySelector(`[data-gateway="${gateway}"]`);
    if (activeBtn) activeBtn.classList.add("active");
    paymentGateway = gateway;
    showFormFields(gateway);
}

function clearActiveGateway() {
    paymentMethodsContainer.querySelectorAll("[data-gateway]").forEach(btn => btn.classList.remove("active"));
    paymentGateway = "";
    showFormFields("");
}

// ==================== SHOW/HIDE FIELDS ====================
function showFormFields(gateway) {
    const config = GATEWAY_FIELDS[gateway] || GATEWAY_FIELDS[""];
    upiInp.style.display = config.upiInp ? "block" : "none";
    paypalInp.style.display = config.paypalInp ? "block" : "none";
    amountInp.style.display = config.amountInp ? "block" : "none";
    const displayBank = config.bankFields ? "block" : "none";
    Object.values(bankFields).forEach(field => field.style.display = displayBank);
}

function clearForm() {
    [upiInp, paypalInp, amountInp, ...Object.values(bankFields)].forEach(field => { if (field) field.value = ""; });
}

// ==================== PROFILE LOADING & UI UPDATE ====================
let memberTransactions = [];

async function fetchMemberDetails() {
    if (!isMember) return;

    loader?.classList.add("active");
    notAvailable?.classList.remove("active");

    try {
        const result = await getMemberProfile();   // the merged callable
        if (result?.data?.success) {
            memberData = result.data.memberDetails;
            memberTransactions = result.data.transactions || [];
        } else {
            memberData = null;
            memberTransactions = [];
            showError("Failed to load profile");
        }
    } catch (error) {
        console.error("Fetch failed:", error);
        memberData = null;
        memberTransactions = [];
        showError("Network error. Profile not loaded.");
    } finally {
        loader?.classList.remove("active");
        setProfile(memberData);
        // optionally call a function to render transactions
        renderTransactions(memberTransactions);
    }
}


function renderTransactions(Transactions){

}

function setProfile(member) {
    const nameEl = document.querySelector(".m-n");
    const earningEl = document.querySelector(".earning");

    if (!member) {
        if (nameEl) nameEl.textContent = isMember? "Error": "Login";
        if (earningEl) earningEl.textContent = "";
        notAvailable?.classList.add("active");
        return;
    }

    if (nameEl) nameEl.textContent = member.name;
    if (earningEl) earningEl.textContent = `₹${member.global_earning || 0}`;   // adjust property name
    notAvailable?.classList.remove("active");
}

// ==================== WITHDRAWAL SUBMISSION ====================
submitWithdrawalBtn?.addEventListener("click", async () => {
    if (!isMember) {
        showWarning("Please log in first");
        return;
    }
    if (!amountInp.value || !paymentGateway) {
        showError("Select a method and enter amount");
        return;
    }

    const payload = {
        amount: Number(amountInp.value),
        gateway: paymentGateway,
    };
    if (paymentGateway === "upi") payload.upiId = upiInp.value;
    else if (paymentGateway === "paypal") payload.paypalId = paypalInp.value;
    else if (paymentGateway === "bank-transfer") {
        payload.bankDetails = {
            name: bankFields.name.value,
            acNo: bankFields.acNo.value,
            confirmAc: bankFields.cA.value,
            ifsc: bankFields.ifsc.value,
        };
    }

    try {
        // await processWithdrawal(payload);   // your API call
        showSuccess("Withdrawal request submitted!");
        closeWithdrawal();
    } catch (error) {
        showError("Error: " + error.message);
    }
});

// ==================== AUTH STATE LISTENER – DEEP INTEGRATION ====================
// This runs on page load and whenever the user signs in/out.
onAuthStateChanged(auth, async (user) => {
  isMember = !!user;
  memberData = null;

  if (!user) {
    showToast("Please sign in to access all features", "warning", 5000);
    setProfile(null);
    if (isWithdrawing) closeWithdrawal();
    profileOverlay?.classList.remove("active");
    return;
  }

  if (activeToast) { activeToast.remove(); activeToast = null; }

  await fetchMemberDetails(); 

});
