import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
    getFunctions,
    httpsCallable,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-functions.js";

const app = initializeApp({
    apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
    authDomain: "sapanacyberhub-26310.firebaseapp.com",
    databaseURL: "https://sapanacyberhub-26310-default-rtdb.firebaseio.com",
    projectId: "sapanacyberhub-26310",
    storageBucket: "sapanacyberhub-26310.firebasestorage.app",
    messagingSenderId: "448116453690",
    appId: "1:448116453690:web:01a91dd284b715bf0a2003",
    measurementId: "G-HKGQ8D55N1",
});

const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");

// Cloud Functions
const getMemberProfile = httpsCallable(functions, "getViraLoopDashboard");

// ==================== DOM ELEMENTS ====================
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
const getTrafficLinkBtn = document.querySelector(".your-traffic-link");

// ==================== STATE ====================
let memberData = null;
let isMember = false;
let isWithdrawing = false;
const LOGIN_URL = "/online-earning/viraloop/community-member/index.html";
let paymentGateway = "";

// ==================== TOAST SYSTEM ====================
let activeToast = null;

function showToast(message, type = "info", duration = 4000) {
    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    const toast = document.createElement("div");
    toast.className = `viraloop-toast toast-${type}`;
    toast.textContent = message;
    toast.classList.add(type);  // ensures opacity:1
    document.body.appendChild(toast);
    activeToast = toast;

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            if (activeToast === toast) toast.remove();
            if (activeToast === toast) activeToast = null;
        }, 300);
    }, duration);
}

function showError(msg) { showToast(msg, "error", 5000); }
function showWarning(msg) { showToast(msg, "warning"); }
function showSuccess(msg) { showToast(msg, "success"); }

// ==================== PAYMENT GATEWAY CONFIG ====================
const GATEWAY_FIELDS = {
    upi: { upiInp: true, paypalInp: false, bankFields: false, amountInp: true },
    "bank-transfer": { upiInp: false, paypalInp: false, bankFields: true, amountInp: true },
    paypal: { upiInp: false, paypalInp: true, bankFields: false, amountInp: true },
    "": { upiInp: false, paypalInp: false, bankFields: false, amountInp: false },
};

// ==================== PROFILE TOGGLE ====================
function toggleProfile() {
    if (!isMember || !memberData) {
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

[userDp, earning, userName, closeP].forEach(el =>
    el?.addEventListener("click", toggleProfile)
);

// ==================== WITHDRAWAL ====================
function toggleWithdrawal() {
    if (!isMember || !memberData) {
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
    if (!isMember || !memberData) { showError("Pls LogIn to Use this feature!"); return; }
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

paymentMethodsContainer?.addEventListener("click", (e) => {
    const methodBtn = e.target.closest("[data-gateway]");
    if (!methodBtn) return;
    setActiveGateway(methodBtn.dataset.gateway);
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

// ==================== PROFILE LOADING ====================
let memberTransactions = [];

async function fetchMemberDetails() {
    if (!isMember) return;

    loader?.classList.add("active");
    notAvailable?.classList.remove("active");

    try {
        const result = await getMemberProfile({});
        if (result?.data?.success) {
            memberData = result.data.memberDetails;
            memberTransactions = result.data.transactions || [];
        } else {
            memberData = null;
            memberTransactions = [];
            showError("Profile not found. Please try again.");
        }
    } catch (error) {
        console.error("Fetch failed:", error);
        memberData = null;
        memberTransactions = [];
        showError("Network error. Could not load profile.");
    } finally {
        loader?.classList.remove("active");
        setProfile(memberData);
        renderTransactions(memberTransactions);
    }
}

function renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        notAvailable?.classList.add("active");
        // If there's a specific transaction list UI, clear it here
        return;
    }
    notAvailable?.classList.remove("active");

    // Example: Populate transaction list (adjust selector as needed)
    const listEl = document.querySelector(".transaction-list");
    if (listEl) {
        listEl.innerHTML = transactions
            .map(
                (tx) =>
                    `<div class="tx-item">
            <span>${tx.type || "Reward"}</span>
            <span>₹${tx.amount || 0}</span>
            <span>${new Date(tx.timestamp).toLocaleDateString()}</span>
          </div>`
            )
            .join("");
    }
}

function setProfile(member) {
    const nameEl = document.querySelector(".m-n");
    const earningEl = document.querySelector(".earning");
    const profileEarningEl = document.querySelector(".t-e");
    const profilePNEl = document.querySelector(".p-u-n");

    if (!member) {
        if (nameEl) nameEl.textContent = isMember ? "Error" : "Login";
        if (earningEl) earningEl.textContent = "";
        if (profileEarningEl) profileEarningEl.textContent = "";
        if (profilePNEl) profilePNEl.textContent = "";
        return;
    }

    // Support both field names just in case
    const earningValue = member.glob_earning || member.global_earning || 0;
    const nameValue = member.name || "Member";

    if (nameEl) nameEl.textContent = nameValue;
    if (earningEl) earningEl.textContent = `₹${earningValue}`;
    if (profilePNEl) profilePNEl.textContent = nameValue;
    if (profileEarningEl) profileEarningEl.textContent = `₹${earningValue}`;
}

// ==================== WITHDRAWAL SUBMIT (placeholder) ====================
submitWithdrawalBtn?.addEventListener("click", async () => {
    if (!isMember || !memberData) {
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
        // await actual withdrawal function here
        showSuccess("Withdrawal request submitted!");
        closeWithdrawal();
    } catch (error) {
        showError("Error: " + error.message);
    }
});

// ==================== TRAFFIC LINK BUTTON ====================
getTrafficLinkBtn?.addEventListener("click", async () => {
    if (!isMember) {
        showWarning("Please sign in to get your traffic link");
        return;
    }

    getTrafficLinkBtn.classList.add("disable");
    getTrafficLinkBtn.textContent = "Preparing…";
    showToast("Generating your link…", "info", 3000);
    const memberId = memberData?.uid; // adjust based on actual field

    // generate traffic link with  https://sapanacyberhub.in/online-earning/viraloop/validate-traffic/ + memberId as query param
    const trafficLink = `https://sapanacyberhub.in/online-earning/viraloop/validate-traffic/?ref=${memberId}`;
    // copy it to clipboard
    try {
        await navigator.clipboard.writeText(trafficLink); showSuccess("Your Link Generated Share it to Your Audience And Start Earning.");
        showSuccess("Your Link Generated Share it to Your Audience And Start Earning.");
        getTrafficLinkBtn.classList.remove("disable");
        getTrafficLinkBtn.textContent = "Traffic Link";
    } catch (err) {
        showError("Failed to copy link. Please try copying manually: " + trafficLink);
    }
});

// ==================== AUTH STATE ====================
onAuthStateChanged(auth, async (user) => {
    isMember = !!user;
    memberData = null;
    console.log("iam", user);

    if (!user) {
        showToast("Please sign in to access all features", "warning", 5000);
        setProfile(null);
        if (isWithdrawing) closeWithdrawal();
        profileOverlay?.classList.remove("active");
        return;
    }

    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    await fetchMemberDetails();
});




// leaderboard toggle

const leaderBoardOverlay = document.querySelector(".leaderboard-overlay");
const openLeaderBoard = document.querySelector(".see-leaderboard");
const backFromLeaderBoard = document.querySelector(".back-from-leaderboard");

openLeaderBoard?.addEventListener("click", () => {

    readyLeaderBoard();
    leaderBoardOverlay?.classList.add("active");
});
backFromLeaderBoard?.addEventListener("click", () => {
    leaderBoardOverlay?.classList.remove("active");
});

function readyLeaderBoard(topMember) {

    // demo topMember 
    const topMembers = [
        {
            name: "Ram",
            dp: "/assets/na.png",
            traffic: 15000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 14000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 13000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 12000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 11000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 10000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 9000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 8000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 7000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 6000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 5000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 4000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 3000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 2000
        },
        {
            name: "radha",
            dp: "/assets/na.png",
            traffic: 1000
        }];

    // once makse sore its short in desending order high to low
    // render leader board into traffic board 

    const parent = document.querySelector(".first-p");
    const parent2 = document.querySelector(".second-p");
    const parent3 = document.querySelector(".third-p");
    // top three members 
    const nameOne = parent.querySelector(".name");
    const dpOne = parent.querySelector(".dp");
    const trafficOne = parent.querySelector(".traffic");
    const nameTwo = parent2.querySelector(".name");
    const dpTwo = parent2.querySelector(".dp");
    const trafficTwo = parent2.querySelector(".traffic");
    const nameThree = parent3.querySelector(".name");
    const dpThree = parent3.querySelector(".dp");
    const trafficThree = parent3.querySelector(".traffic");

    const memberHolder = document.querySelector(".all-p-list"); //rest all of member after 3rd

    const finalMember = topMembers.sort((a, b) => b.traffic - a.traffic);
    const top = finalMember.slice(0, 3);
    const otherMember = finalMember.slice(3);
    setTopMember(top);
    function setTopMember(data) {
        console.log("lenght", data);
        data.forEach((e, index) => {
            if (index == 0) {
                nameOne.textContent = top[index].name;
                trafficOne.textContent = "Traffic:" + top[index].traffic;
                dpOne.src = top[index].dp;
            } else if (index == 1) {
                nameTwo.textContent = top[index].name;
                trafficTwo.textContent = "Traffic:" + top[index].traffic;
                dpTwo.src = top[index].dp;
            } else if (index == 2) {
                nameThree.textContent = top[index].name;
                trafficThree.textContent = "Traffic : " + top[index].traffic;
                dpThree.src = top[index].dp;
            }
        });
    }
    setOtherTop(otherMember);
    function setOtherTop(otherData) {
        memberHolder.innerHTML = `
        ${otherMember.map((u, index) => `
            <div class="perfomer">
            <div class="per-d">
                <strong class="rank">#${index + 4}</strong>
                <img class="li-dp" src="${u.dp}" alt="">
                <strong class="li-name">${u.name}</strong>
            </div>
            <strong class="li-traffic"> Traffic: ${u.traffic}</strong>
            </div>
            `).join("")}`;
    }



    showToast("LeaderBoard Found", "info", 5000);

}