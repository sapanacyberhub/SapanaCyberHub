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
const getTopMembers = httpsCallable(functions, "getViraLoopTrafficLeaderboard");

const shareOverlay = document.querySelector(".share-overlay");
const backFromShare = document.querySelector(".back-from-share");

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
        renderTransactions(memberTransactions);
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
let todayVL = [];

async function fetchMemberDetails() {
    if (!isMember) return;

    loader?.classList.add("active");
    notAvailable?.classList.remove("active");

    try {
        const result = await getMemberProfile({});
        if (result?.data?.success) {
            memberData = result.data.memberDetails;
            memberTransactions = result.data.transactions || [];
            todayVL = result.data.currentEvent || [];
            
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
        initializeDash();
    }
}


function initializeDash() {

    const nameEl = document.querySelector(".m-n");
    const Dp = document.querySelector(".profile-dp");
    const earningEl = document.querySelector(".earning");
    if (!member) {
        if (nameEl) nameEl.textContent = isMember ? "Error" : "Login";
        if (earningEl) earningEl.textContent = "";
        return;
    }
    if (nameEl) nameEl.textContent = nameValue;
    if (Dp) Dp.textContent = `₹${member.memberDp || "/assets/logo/no-dp.png"}`;
    if (earningEl) earningEl.textContent = `₹${earningValue.toFixed(2)}`;


    
}

function renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        notAvailable?.classList.add("active");
        return;
    }
    notAvailable?.classList.remove("active");

    const listEl = document.querySelector(".transaction-list");

    if (listEl) {
        listEl.innerHTML = transactions
            .map(
                (tx) =>
                    `<div class="tx-item">
            <span>${tx.type || "Reward"}</span>
            <span style="color:${tx.type == "withdrawal" ? "red" : "black"};">₹${tx.amount || 0}</span>
            <span>${new Date(tx.transactionDate).toLocaleDateString()}</span>
          </div>`   // FIXED: use transactionDate instead of timestamp
            )
            .join("");
    }
}

function setProfile(member) {
    const profileEarningEl = document.querySelector(".t-e");
    const profilePNEl = document.querySelector(".p-u-n");
    const preDay = document.querySelector(".prevEarning");

    if (!member) {
        if (preDay) preDay.textContent = "";
        if (profileEarningEl) profileEarningEl.textContent = "";
        if (profilePNEl) profilePNEl.textContent = "";
        return;
    }

    // FIXED: use globalEarnings (the correct field name)
    const earningValue = member.globalEarnings || 0;
    const yesterdayEarning = member.yesterdayEarnings || 0;
    const nameValue = member.name || "Member";


    if (preDay) preDay.textContent = `₹${yesterdayEarning.toFixed(2)}`;
    if (profilePNEl) profilePNEl.textContent = nameValue;
    if (profileEarningEl) profileEarningEl.textContent = `Earning :₹${earningValue.toFixed(2) || 0}`;
}

// ==================== WITHDRAWAL SUBMIT ====================
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




/* ================================
   TRAFFIC LINK GENERATOR
================================ */

// FIXED: make the callback async (it uses await inside)
getTrafficLinkBtn?.addEventListener("click", async () => {
    if (!isMember || !memberData?.uid) {
        showWarning("Please sign in to get your traffic link");
        return;
    }

    getTrafficLinkBtn.classList.add("disable");
    getTrafficLinkBtn.textContent = "Preparing...";
    showToast("Generating your link...", "info", 3000);

    try {
        const memberId = memberData?.uid || "love";
        const trafficLink = `https://sapanacyberhub.in/online-earning/viraloop/validate-traffic/?ref=${memberId}`;

        await navigator.clipboard.writeText(trafficLink);
        showSuccess("Your traffic link is ready!");

        shareOverlay?.classList.add("active");
        setUpTrafficLink(trafficLink);
    } catch (err) {
        console.error(err);
        showError("Failed to generate traffic link.");
    } finally {
        getTrafficLinkBtn.classList.remove("disable");
        getTrafficLinkBtn.textContent = "Traffic Link";
    }
});

/* ================================
   SETUP SHARE UI
================================ */
function setUpTrafficLink(link) {
    const linkTv = document.querySelector(".traffic-link");
    const copyBtns = document.querySelectorAll(".copy-btn");
    const shareIcons = document.querySelectorAll(".share-icon");
    const moreBtn = document.querySelector(".more");

    if (linkTv) {
        linkTv.textContent = link;
    }

    copyBtns.forEach((btn) => {
        btn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(link);
                showSuccess("Traffic link copied!");
                if (btn.tagName === "SPAN") {
                    btn.textContent = "COPIED";
                    setTimeout(() => {
                        btn.textContent = "COPY";
                    }, 2000);
                }
            } catch (err) {
                console.error(err);
                showError("Failed to copy link.");
            }
        };
    });

    const shareText = `🚀 Join Viraloop and start earning with traffic sharing!

🔥 Top member before 15 June gets a chance to win REDMAGIC 11 AIR.

👇 Join now:
${link}`;

    const shareApps = [
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        null, // Instagram
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
        `https://wa.me/?text=${encodeURIComponent(shareText)}`
    ];

    shareIcons.forEach((icon, index) => {
        icon.onclick = async () => {
            if (index === 2) {
                try {
                    await navigator.clipboard.writeText(shareText);
                    showSuccess("Caption copied! Paste it on Instagram story or bio.");
                    window.location.href = "instagram://app";
                    setTimeout(() => {
                        window.open("https://instagram.com", "_blank");
                    }, 1500);
                } catch (err) {
                    console.error(err);
                    showError("Failed to open Instagram.");
                }
                return;
            }

            const appUrl = shareApps[index];
            if (appUrl) {
                window.open(appUrl, "_blank");
            }
        };
    });

    moreBtn?.addEventListener("click", async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Viraloop Traffic Link",
                    text: shareText,
                    url: link
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            try {
                await navigator.clipboard.writeText(link);
                showSuccess("Link copied successfully!");
            } catch (err) {
                showError("Unable to share.");
            }
        }
    });
}

backFromShare?.addEventListener("click", () => {
    shareOverlay?.classList.remove("active");
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




// ==================== LEADERBOARD ====================
const leaderBoardOverlay = document.querySelector(".leaderboard-overlay");
const openLeaderBoard = document.querySelector(".see-leaderboard");
const backFromLeaderBoard = document.querySelector(".back-from-leaderboard");

// FIXED: not used as a DOM element; just keep as a place for the sorted array
let trafficBoard = [];
const trafficboardLoader = document.querySelector(".trafficboard-loader-container");

openLeaderBoard?.addEventListener("click", () => {
    if (!isMember || !memberData) {
        // show toast 
        showError("Network error. Could not load leaderboard.");
        return;
    }

    // Show loader before starting the fetch
    trafficboardLoader?.classList.add("active");
    readyLeaderBoard();
    leaderBoardOverlay?.classList.add("active");
});

backFromLeaderBoard?.addEventListener("click", () => {
    leaderBoardOverlay?.classList.remove("active");
});

// FIXED: made async, removed unused parameter, fixed loader logic, variable names, and field names
async function readyLeaderBoard() {
    try {
        const result = await getTopMembers({});
        if (result?.data?.success) {
            trafficBoard = result.data.leaderboard;
        } else {
            trafficBoard = [];
            showError("Traffic Board not available. Please try again later.");
        }
    } catch (error) {
        trafficBoard = [];
        showError("Network error. Could not load leaderboard.");
    } finally {
        // Hide loader
        trafficboardLoader?.classList.remove("active");

        const trafficBoardNotAvailable = document.querySelector(".trafficboard-t-na");
        const memberHolder = document.querySelector(".all-p-list");
        // If there’s no data, stop here (the UI will show whatever it had before)
        if (!trafficBoard || trafficBoard.length === 0) {
            trafficBoardNotAvailable?.classList.add("active");
            memberHolder?.classList.add("notAvalaible");
            return;
        }

        // Sort descending by globalTraffic (already sorted server-side, but just in case)
        const sortedMembers = [...trafficBoard].sort((a, b) => (b.globalTraffic || 0) - (a.globalTraffic || 0));

        const topThree = sortedMembers.slice(0, 3);
        const otherMembers = sortedMembers.slice(3);

        setTopMember(topThree);
        setOtherTop(otherMembers);

        showToast("Leaderboard loaded", "success", 3000);
    }
}

function setTopMember(data) {
    // data is an array of up to 3 members
    const parent = document.querySelector(".first-p");
    const parent2 = document.querySelector(".second-p");
    const parent3 = document.querySelector(".third-p");

    const nameOne = parent.querySelector(".name");
    const dpOne = parent.querySelector(".dp");
    const trafficOne = parent.querySelector(".traffic");

    const nameTwo = parent2.querySelector(".name");
    const dpTwo = parent2.querySelector(".dp");
    const trafficTwo = parent2.querySelector(".traffic");

    const nameThree = parent3.querySelector(".name");
    const dpThree = parent3.querySelector(".dp");
    const trafficThree = parent3.querySelector(".traffic");

    // Clear previous if less than 3
    [nameOne, nameTwo, nameThree].forEach(el => el && (el.textContent = ""));
    [trafficOne, trafficTwo, trafficThree].forEach(el => el && (el.textContent = ""));
    [dpOne, dpTwo, dpThree].forEach(el => el && (el.src = "/assets/logo/no-dp.png"));

    data.forEach((member, index) => {
        if (index === 0) {
            nameOne.textContent = member.name || "";
            trafficOne.textContent = "Traffic: " + (member.globalTraffic || 0);
            dpOne.src = member.memberDp || "/assets/logo/no-dp.png";
        } else if (index === 1) {
            nameTwo.textContent = member.name || "";
            trafficTwo.textContent = "Traffic: " + (member.globalTraffic || 0);
            dpTwo.src = member.memberDp || "/assets/logo/no-dp.png";
        } else if (index === 2) {
            nameThree.textContent = member.name || "";
            trafficThree.textContent = "Traffic: " + (member.globalTraffic || 0);
            dpThree.src = member.memberDp || "/assets/logo/no-dp.png";
        }
    });
}

function setOtherTop(otherData) {
    const memberHolder = document.querySelector(".all-p-list");
    if (!memberHolder) return;

    memberHolder.innerHTML = otherData.map((u, index) => `
        <div class="perfomer">
            <div class="per-d">
                <strong class="rank">#${index + 4}</strong>
                <img class="li-dp" src="${u.memberDp || "/assets/logo/no-dp.png"}" alt="memberDp">
                <strong class="li-name">${u.name}</strong>
            </div>
            <strong class="li-traffic"> Traffic: ${u.globalTraffic || 0}</strong>
        </div>
    `).join("");
}