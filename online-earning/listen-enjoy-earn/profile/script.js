// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// Auth
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// Firestore
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

import { getStorage, ref, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1"
};



// element initialize

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();

const functions = getFunctions(app);


const ICONS = {
  withdrawal:
    "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/withdrawal%20symbole.png",
  vibe:
    "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/Listen-coin-og.png",
  hit:
    "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/rupee%20symbol.png",
  convert:
    "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/Listen-coin-og.png"
};

const userNameEl = document.getElementById("userName");
const withdrawal_history = document.getElementById("withdrawalHistory");
const open_withdrawal_page = document.getElementById("openWithdrawal");
const close_withdrawal_page = document.getElementById("close")
const withdrawal_page = document.getElementById("withdrawOverlay");

const container = document.getElementById("transactionList");

const filterActions = document.querySelectorAll(".filters .action");
const updateKycBtn = document.getElementById("update-kyc");
const closeKyc = document.getElementById("closeKYC");
const kycStatusEl = document.getElementById("kyc-status");
const kycRejectedMessage = document.getElementById("rejectMessage");
// kyc elements
const kycHeader = document.getElementById("kycHeader");
const kycPreview = document.getElementById("kycPreview");
const kycBanner = document.getElementById("kycBanner");
const kycGhost = document.getElementById("ghostBtn");
const kycForm = document.getElementById("kyc-form");
const submitKycForm = document.getElementById("submit-kyc")
const kycInstruction = document.getElementById("kyc-instructions");
const userDp = document.getElementById("userDp");
const kycImageHint = document.getElementById("kycImageHint");
const kycImageInput = document.getElementById("kycImageInput");

const fullNameInput = document.getElementById("userNameInp");
const genderInput = document.getElementById("gender");
const ageInput = document.getElementById("age");
const idLastFourInput = document.getElementById("idLastFour");
const phoneInput = document.getElementById("phone");

const idProofInput = document.getElementById("idProofInput");
const idProofPreview = document.getElementById("idProofPreview");

const submitBtn = document.getElementById("submit-kyc");

// =====================
// GLOBAL FILE HOLDERS
// =====================
let profileImageFile = null;
let idProofFile = null;


// Global User State
let currentUser = null;
// boolean to track kyc status
let isKycComplete = false;
let isUserDataLoading = true;

// variable to hold user data globally
let uiData = null;

const getUserA = httpsCallable(functions, "loadUserData");
const submitUserKYC = httpsCallable(functions, "submitUserKYC");
let transactions = []; // empty array to hold transactions

// =======================
// Auth Listener
// =======================


onAuthStateChanged(auth, async (user) => {

  disableUI();
  if (!user) {
    window.location.href =
      "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
    return;
  }

  currentUser = user;

  userNameEl.textContent =
    user.displayName || user.email?.split("@")[0];

  // load user data till it loading disable all click 
  await getUser();

  checkKycStatus(uiData.kyc);

  // load transactions
  await loadTransactions(currentUser.uid);

  enableUI();

  enableUI(); // 🔓 unlock UI
  isUserDataLoading = false;

});

async function getUser() {
  try {
    const result = await getUserA();
    const { success, userData } = result.data;

    if (!success) return null;

    // ✅ assign globally
    uiData = userData;

    console.log("GLOBAL_USER set:", uiData);

    return uiData;
  } catch (err) {
    console.error("Failed to load user data:", err);

    enableUI();
    return null;
  }
}




// transaction list
async function loadTransactions(transactionid) {
  try {
    const transactionsRef = collection(
      db,
      "SapanaCyberHub",
      "Listen",
      "user",
      userId,
      "transactions"
    );
    const transactionsSnap = await getDocs(transactionsRef);

    transactions = transactionsSnap.docs.map(doc => doc.data());;

    // render all transactions
    renderList(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    enableUI();
  }
}
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function formatAmount(isCash, amount) {
  return isCash ? amount : `${amount} LC`;
}
function renderTransaction(tx) {
  const sign = tx.isCredit ? "+" : "-";
  const showStatus = tx.txReason === "withdrawal";
  const statusText =
    tx.status === "pending" ? "• Pending" : "• Success";
  const statusClass =
    tx.status === "pending" ? "pending" : "success";

  return `
    <div class="transaction">
      <div class="left">
        <img src="${ICONS[tx.txReason]}" alt="${tx.txReason}">
        <div class="left-content">
          <span class="transaction-desc">${capitalize(tx.txReason)}</span>
          <small class="transaction-date">${tx.transactionDate}</small>
        </div>
      </div>

      <div class="right">
        <strong class="transaction-type">${sign}</strong>
        <span class="transaction-amount">${formatAmount(tx.isCash, tx.amount)}</span>

        ${showStatus
      ? `<small class="transaction-status ${statusClass}">
                ${statusText}
               </small>`
      : ""
    }
      </div>
    </div>
  `;
}

function renderList(list) {
  // default inner HTML (empty state)
  container.innerHTML = `
  
    <div class="empty-transaction">
      <img class="empty-transaction-img" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/no-transaction.png" alt="No transactions">
      <p>No transactions yet</p>
      <small>Your earnings & withdrawals will appear here</small>
    </div>
  `;

  if (!list || list.length === 0) return;
  // clear container
  container.innerHTML = "";

  list.forEach(tx => {
    container.innerHTML += renderTransaction(tx);
  });
}


// filter transactions
filterActions.forEach(btn => {
  btn.addEventListener("click", () => {
    // active UI
    filterActions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    let filteredList = [];

    switch (filter) {
      case "ALL":
        filteredList = transactions;
        break;

      case "Withdrawal":
        filteredList = transactions.filter(
          tx => tx.txReason === "withdrawal"
        );
        break;

      case "Cash":
        filteredList = transactions.filter(
          tx => tx.isCash === true
        );
        break;

      case "LC":
        filteredList = transactions.filter(
          tx => tx.isCash === false
        );
        break;

      default:
        filteredList = transactions;
    }

    renderList(filteredList);
  });
});

// open withdrawal page
open_withdrawal_page.addEventListener("click", () => {
  if (isUserDataLoading) return;

  if (!isKycComplete) {
    showKycOverlay();
    return;
  }

  withdrawal_page.classList.add("show");
});

// close withdrawal page
close_withdrawal_page.addEventListener("click", () => {
  withdrawal_page.classList.remove("show");
});

// update kyc
updateKycBtn.addEventListener("click", () => {
  showKycOverlay();
});



// kyc overlay
async function showKycOverlay() {

  kycUpdateOverlay.classList.add("show");

  resetKycUI();

  // VERIFIED (local flag)
  if (isKycComplete) {
    kycHeader.textContent = "KYC Verified";
    kycPreview.style.display = "flex";
    submitKycForm.style.display = "none";

    kycBanner.src =
      "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc%20veryfied.png";

    kycGhost.textContent = "Start Vibe 🎧";
    kycGhost.onclick = () => {
      kycUpdateOverlay.classList.remove("show");
    };
    return;
  }

  const kyc = await checkUserKycStatus();

  // ⚪ NOT SUBMITTED
  if (!kyc) {
    kycHeader.textContent = "Complete Your KYC";
    kycPreview.style.display = "flex";
    submitKycForm.style.display = "none";

    kycBanner.src =
      "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc-recuire.png";

    kycGhost.textContent = "Continue";
    kycGhost.onclick = () => showKycForm();
    return;
  }

  // 🟡 PENDING
  if (kyc.status === "pending") {
    kycHeader.textContent = "KYC Pending";
    kycPreview.style.display = "flex";
    submitKycForm.style.display = "none";

    kycBanner.src =
      "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc%20verification%20in%20progress.png";

    kycGhost.textContent = "Waiting for verification…";
    kycGhost.style.pointerEvents = "none";
    return;
  }

  // 🔴 REJECTED
  if (kyc.status === "rejected") {
    kycHeader.textContent = "KYC Rejected";
    kycPreview.style.display = "flex";

    kycRejectedMessage.textContent = kyc.reason || "Verification failed";

    kycBanner.src =
      "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc-rejected.png";

    kycGhost.textContent = "Re-verify";
    kycGhost.onclick = () => showKycForm();
  }
}


userDp.addEventListener("click", () => {
  kycImageInput.click();
});

kycImageInput.addEventListener("change", () => {
  const file = kycImageInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image must be under 2MB");
    return;
  }

  profileImageFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    userDp.src = reader.result;
    kycImageHint.style.display = "none";
  };
  reader.readAsDataURL(file);
});

// =====================
// ID PROOF PICK → PREVIEW
// =====================
idProofInput.addEventListener("change", () => {
  const file = idProofInput.files[0];
  if (!file) return;

  if (
    !file.type.startsWith("image/") &&
    file.type !== "application/pdf"
  ) {

    return;
  }

  idProofFile = file;

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      idProofPreview.src = reader.result;
      idProofPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    idProofPreview.style.display = "none";
  }
});

// =====================
// SUBMIT KYC
// =====================
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  disableUI(); // 🔒 lock immediately

  try {
    if (!profileImageFile) {
      shakeField(userDp);
      return enableUI();
    }

    if (!idProofFile) {
      shakeField(idProofInput);
      return enableUI();
    }

    if (!fullNameInput.value.trim()) {
      shakeField(fullNameInput);
      return enableUI();
    }

    if (genderInput.value === "select") {
      shakeField(genderInput);
      return enableUI();
    }

    if (!ageInput.value || ageInput.value < 15) {
      shakeField(ageInput);
      return enableUI();
    }

    if (idLastFourInput.value.length !== 4) {
      shakeField(idLastFourInput);
      return enableUI();
    }

    if (!phoneInput.value || phoneInput.value.length < 10) {
      shakeField(phoneInput);
      return enableUI();
    }

    const fullName = fullNameInput.value.trim();
    const gender = genderInput.value;
    const age = Number(ageInput.value);
    const phone = phoneInput.value.trim();
    const idLastFour = idLastFourInput.value.trim();
    const uid = auth.currentUser.uid;

    // ⚡ parallel uploads
    const [profilePath, idProofPath] = await Promise.all([
      uploadKycFile(
        profileImageFile,
        `kyc/${uid}/profile.jpg`
      ),
      uploadKycFile(
        idProofFile,
        `kyc/${uid}/id-proof.jpg`
      )
    ]);

    // 🧾 metadata only
    const kycData = {
      name: fullNameInput.value.trim(),
      gender: genderInput.value,
      age: Number(ageInput.value),
      phone: phoneInput.value.trim(),
      idLastFour: idLastFourInput.value.trim(),
      profilePath,
      idProofPath
    };

    const res = await submitUserKYC(kycData);

    if (res.data?.success) {
      showKycOverlay();
      enableUI();
      return;
    }

    enableUI();

  } catch (err) {
    console.error(err);
    alert("KYC failed");
    enableUI();
  }
});



// helpers
// close kyc update overlay
closeKyc.addEventListener("click", () => {
  kycUpdateOverlay.classList.remove("show");
});

// disable clicks while loading 
function disableUI() {
  document.body.classList.add("ui-disabled");
}

function enableUI() {
  document.body.classList.remove("ui-disabled");
}

// kyc form
function showKycForm() {
  kycHeader.textContent = "Complete Your KYC";
  kycForm.style.display = "flex";
  kycPreview.style.display = "none";
  kycInstruction.style.display = "block"
  kycGhost.style.display = "none"
  submitKycForm.style.display = "flex"

}

// shale animation for which field messed in kyc form to be filled
function shakeField(inputEl) {
  if (!inputEl) return;

  inputEl.classList.remove("field-error");
  void inputEl.offsetWidth; // restart animation
  inputEl.classList.add("field-error");

  // auto remove glow
  setTimeout(() => {
    inputEl.classList.remove("field-error");
  }, 600);

  // optional: focus field
  inputEl.focus({ preventScroll: false });
}


async function uploadKycFile(file, path) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return path; // store path, not URL
}
// reset kyc form
function resetKycUI() {
  // Reset sections
  kycForm.style.display = "none";
  kycPreview.style.display = "none";
  kycInstruction.style.display = "none";
  submitKycForm.style.display = "block";

  // 🔥 RESET GHOST BUTTON FULLY
  kycGhost.style.display = "flex";     // ✅ THIS WAS MISSING
  kycGhost.style.pointerEvents = "auto";
  kycGhost.textContent = "Continue";
  kycGhost.onclick = null;

  // Reset banner & messages
  kycBanner.src = "";
  if (kycRejectedMessage) {
    kycRejectedMessage.textContent = "";
  }
}

// check kyc status
async function checkUserKycStatus() {
  try {
    const kycRef = doc(
      db,
      "SapanaCyberHub",
      "Listen",
      "KYC",
      currentUser.uid
    );
    const kycSnap = await getDoc(kycRef);
    return kycSnap.exists() ? kycSnap.data() : null;
  } catch (error) {
    console.error("Error checking KYC status:", error);
  }
}

// withdrawal history btn 

// withdrawal history click scroll page to wher transaction & filter transaction  withdrawal only and
withdrawal_history.addEventListener("click", () => {
  // scroll to transaction section
  document.getElementById("transactionList").scrollIntoView({
    behavior: "smooth"
  });

  // filter withdrawal transactions
  const filterBtn = document.querySelector("[data-filter='Withdrawal']");
  if (filterBtn) {
    filterBtn.click();
  }
});

// kyc status
// check kyc status function
function checkKycStatus(kyc) {

  isKycComplete = kyc;
  if (isKycComplete) {
  } else {
    kycStatusEl.classList.add("na");
    kycStatusEl.textContent = "NA";
  }
}

