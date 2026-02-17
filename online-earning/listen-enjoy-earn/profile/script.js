// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// Auth
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// Firestore

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
const storage = getStorage();

const functions = getFunctions(app);


const userNameEl = document.getElementById("userName");
const userCashEarning = document.getElementById("cashBalance");
const userCoinEarning = document.getElementById("coinBalance");
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
const kycUpdateOverlay = document.getElementById("kycUpdateOverlay");
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

// withdrawal el
const withdrawalAmount = document.getElementById("reqAmount");
const paymentMethod = document.getElementById("paymentMethod");
const bankName = document.getElementById("bankName");
const upiAccountNo = document.getElementById("upiAccountNo");
const bankIfscCode = document.getElementById("bankIfscCode");
const riseReq = document.getElementById("submitWithdrawalReq");

// convert el
const openConvertOverlay = document.getElementById("openConvertOverlay");
const closeConvertOverlay = document.getElementById("close-convert");
const convertOverlay = document.getElementById("convert-overlay");
const availLC = document.getElementById("coinDisplay");
const enterCoinToConvert = document.getElementById("coinToConvert");
const convertedCash = document.getElementById("convertedCash");
const convertCoinBtn = document.getElementById("convert");
const noteOrError = document.getElementById("note");
const howToUseLc = document.getElementById("how-to-use-coin");
const lcHelpOverlay = document.getElementById("lcHelpOverlay");
const closeLcHelp = document.getElementById("closeLcHelp");
const gotItBtn = document.getElementById("gotItBtn");

const progressDialogOverlay = document.getElementById("progress-dialog");
const progressCard = document.getElementById("progress-card");
const progressTitle = document.getElementById("progressTitle");
const progressDesc = document.getElementById("progressText");

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
const createWithdrawalTxn = httpsCallable(functions, "createTransactionRecord");
const getKycSts = httpsCallable(functions, "checkMyKycStatus");
// Add this with your other httpsCallable definitions
const getUserTxns = httpsCallable(functions, "getUserTransactions");
const lcToCash = httpsCallable(functions, "convertListenCoinToCash");
let transactions = []; // empty array to hold transactions

// =======================
// Auth Listener
// =======================

onAuthStateChanged(auth, async (user) => {
  disableUI();
  if (!user) {
    window.location.href = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";
    return;
  }

  currentUser = user;
  userNameEl.textContent = user.displayName || user.email?.split("@")[0];

  await getUser();

  isUserDataLoading = false;
  enableUI();
});

async function getUser() {
  try {
    const result = await getUserA();
    const { success, userData } = result.data;

    if (!success) return null;

    // ✅ assign globally
    uiData = userData;
    init();
    // load transactions 
    await loadTransactions(currentUser.uid);

    return uiData;
  } catch (err) {
    console.error("Failed to load user data:", err);

    enableUI();

    return null;
  }
}

// transaction list
async function loadTransactions() {
  try {
    // Calling the Cloud Function instead of direct Firestore query
    const result = await getUserTxns();
    
    if (result.data?.success) {
      // The server already sorted them, so we just assign
      transactions = result.data.transactions;
      renderList(transactions);
    } else {
      console.warn("Failed to fetch transactions from server.");
      renderList([]); // Show empty state
    }
  } catch (error) {
    console.error("Cloud Function Error:", error);
    renderList([]); 
  }
}

const ICONS = {
  withdrawal: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/withdrawal%20symbole.png",

  hitCash: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/rupee%20symbol.png",
  hitLC: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/Listen-coin-og.png",

  vibeCash: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cash-ic.png",
  vibeLC: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/Listen-coin-og.png",

  convertCash: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/cash-ic.png",
  convertLC: "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/convert-ic.png"
};

const formatIc = (isCash, desc = "") => {
  desc = desc.toLowerCase();

  return desc === "withdrawal"
    ? ICONS.withdrawal
    : ICONS[`${desc}${isCash ? "Cash" : "LC"}`] || (isCash ? ICONS.vibeCash : ICONS.vibeLC);
};


function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function formatAmount(isCash, amount) {
  return isCash ? amount : `${amount} LC`;
}
function renderTransaction(tx) {
  const sign = tx.isCredit ? "+" : "-";
  const showStatus = tx.txnDescription === "withdrawal";
  const statusText =
    tx.status === "pending" ? "• Pending" : "• Success";
  const statusClass =
    tx.status === "pending" ? "pending" : "success";

  return `
    <div class="transaction">
      <div class="left">
        <img src="${formatIc(tx.isCash, tx.txnDescription)}" alt="${tx.txnDescription}">
        <div class="left-content">
          <span class="transaction-desc">${capitalize(tx.txnDescription)}</span>
          <small class="transaction-date">${timeAgo(tx.transactionDate)}</small>
        </div>
      </div>

      <div class="right">
        <strong class="transaction-type">${sign}</strong>
        <span class="transaction-amount">${formatAmount(tx.isCash, tx.txnAmount)}</span>

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
  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="empty-transaction">
        <img class="empty-transaction-img" src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/no-transaction.png" alt="No transactions">
        <p>No transactions yet</p>
        <small>Your earnings & withdrawals will appear here</small>
      </div>`;
    return;
  }

  // Optimized rendering: Build string once, then update DOM
  const listHtml = list
    .sort((a, b) => (b.transactionDate?.seconds || 0) - (a.transactionDate?.seconds || 0))
    .map(tx => renderTransaction(tx))
    .join('');

  container.innerHTML = listHtml;
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
      case "All":
        filteredList = transactions;
        break;

      case "Withdrawal":
        filteredList = transactions.filter(
          tx => tx.txnDescription === "withdrawal"
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

async function showKycOverlay() {
  kycUpdateOverlay.classList.add("show");
  resetKycUI(); 

  try {
    const kyc = await checkUserKycStatus(); // This returns the object { status: '...', ... }

    // 1. NOT SUBMITTED (Server returns kyc: null)
    if (!kyc) {
      kycHeader.textContent = "Complete Your KYC";
      kycPreview.style.display = "flex";
      kycBanner.src = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc-recuire.png";
      kycGhost.textContent = "Continue";
      kycGhost.onclick = () => showKycForm();
      return;
    }

    // 2. SUCCESS / VERIFIED
    if (kyc.status === "verified" || kyc.status === "approved") {
      kycHeader.textContent = "KYC Verified";
      kycPreview.style.display = "flex";
      submitKycForm.style.display = "none";
      kycBanner.src = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc-verified.png";
      kycGhost.textContent = "Start Vibe 🎧";
      kycGhost.onclick = () => kycUpdateOverlay.classList.remove("show");
      return;
    }

    // 3. PENDING
    if (kyc.status === "pending") {
      kycHeader.textContent = "KYC Pending";
      kycPreview.style.display = "flex";
      kycBanner.src = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc%20verification%20in%20progress.png";
      kycGhost.textContent = "Waiting for verification…";
      kycGhost.style.pointerEvents = "none";
      kycGhost.style.opacity = "0.6";
      return;
    }

    // 4. REJECTED
    if (kyc.status === "rejected") {
      kycHeader.textContent = "KYC Rejected";
      kycPreview.style.display = "flex";
      // ✅ Now kyc.reason will work because kyc is the data object!
      kycRejectedMessage.textContent = kyc.reason || "Verification failed";
      kycBanner.src = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/kyc-rejected.png";
      kycGhost.textContent = "Re-verify";
      kycGhost.onclick = () => showKycForm();
    }
  } catch (err) {
    console.error("KYC Overlay Error:", err);
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

    // submiting kyc details to approval
    showProgress("KYC Details Submiting", "Make sure All Details are Correct to avoid KYC Rejection.");
    // ⚡ parallel uploads
    const [profileRes, idProofRes] = await Promise.all([
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

      profilePath: profileRes.path,
      profileURL: profileRes.url,

      idProofPath: idProofRes.path,
      idProofURL: idProofRes.url
    };

    const res = await submitUserKYC(kycData);

    // show creating message
    kycHeader.textContent = "Submitting KYC Details...";

    if (res.data?.success) {
      showKycOverlay();
      await finishProgress(true, "KYC submitted successfully.");
      enableUI();
      return;
    }
    await finishProgress(false, "KYC submission failed.");
    enableUI();

  } catch (err) {
    console.error(err);
    await finishProgress(false, err.message);
    kycHeader.textContent = "Submitting KYC Details..." + err.message;
    enableUI();
  }
});

// function to show or hide input field like upi/bank details if method value is gift-card if upi so show only upi/account no input if bank show bank name field and ifsc field 
function togglePaymentFields() {
  const m = paymentMethod.value;
  // reset btn 
  riseReq.textContent = "REQUEST WITHDRAW";
  riseReq.style.pointerEvents = "auto";

  bankName.style.display = m === "bank" && "block" || "none";
  bankIfscCode.style.display = m === "bank" && "block" || "none";
  upiAccountNo.style.display = (m === "upi" || m === "bank") && "block" || "none";
  if (m === "giftCard") {
    riseReq.textContent = "Gift Card Withdrawal Coming Soon";
    // block click
    riseReq.style.pointerEvents = "none";
  }

}


paymentMethod.addEventListener("change", togglePaymentFields);

// withdrawal req intenet
riseReq.addEventListener("click", async (e) => {
  e.preventDefault();
  disableUI();

  try {
    const amount = withdrawalAmount.value;
    const method = paymentMethod.value;
    const bank = bankName.value;
    const upi = upiAccountNo.value;
    const ifsc = bankIfscCode.value;

    if (!amount || !method) {
      shakeField(withdrawalAmount);
      shakeField(paymentMethod);
      return enableUI();
    }

    if (amount < 200 || amount > uiData.cash) {
      shakeField(withdrawalAmount);
      return enableUI();
    }

    if (method === "bank" && (!bank || !ifsc)) {
      shakeField(bankName);
      shakeField(bankIfscCode);
      return enableUI();
    }

    if (method === "upi" && !upi) {
      shakeField(upiAccountNo);
      return enableUI();
    }


    const withdrawalDetails = {
      paymentMethod: method,
      bankName: bank,
      upiAccountNo: upi,
      bankIfscCode: ifsc
    };

    const intent = {
      txnAmount: Number(amount),
      txnDescription: "withdrawal",
      isCredit: false,
      isCash: true,
      withdrawalData: withdrawalDetails
    };


    showProgress("Processing Withdrawal Request", "Please wait while we process your request. It's may take a few minutes or 48 hours in Processed.");
    const res = await createWithdrawalTxn({
      intent
    });

    if (res.data?.success) {
      await finishProgress(true, "Withdrawal request submitted successfully.");
      await getUser();
      enableUI();
      return;
    }
  } catch (err) {
    console.error(err);
    await finishProgress(false, err.message);
    alert("Failed to submit withdrawal request.");
    enableUI();
  }
});


// convert coin into cash 
openConvertOverlay.addEventListener("click", () => {
  // Show conversion overlay
  convertOverlay.classList.add("show");
});

// close conversion overlay
closeConvertOverlay.addEventListener("click", () => {
  convertOverlay.classList.remove("show");
});


// handle live converting add using input change listen in enterCoinToConvert
enterCoinToConvert.addEventListener("input", () => {
  const coinAmount = Number(enterCoinToConvert.value);
  const availLC = Number(uiData.listenCoin);

  // reset state
  convertedCash.style.color = "inherit";
  enterCoinToConvert.classList.remove("field-error");

  if (availLC === 0 && coinAmount > 0) {
    shakeField(enterCoinToConvert);
    convertedCash.style.color = "red";
    convertedCash.textContent = "₹0";
    // show no coin have to convert

    noteOrError.textContent = `NOTE : Not enough LC: You have ${availLC} LC`;
    return;
  }

  if (coinAmount > availLC) {
    shakeField(enterCoinToConvert);
    convertedCash.style.color = "red";
    noteOrError.textContent = `NOTE : Not enough LC: You have ${availLC} LC`;
    return;
  }
  // if amount not divided by 10 return 
  if (coinAmount % 10 !== 0) {
    shakeField(enterCoinToConvert);
    convertedCash.style.color = "red";
    noteOrError.textContent = "NOTE : Amount must be divisible by 10";
    return;
  }

  // ✅ Valid input
  if (coinAmount > 0) {
    const cashAmount = coinAmount / 10;
    convertedCash.style.color = "#2cff68";
    convertedCash.textContent = `₹${cashAmount}`;

    noteOrError.textContent = "NOTE : Conversion rate is 10 LC = ₹1";
  } else {
    convertedCash.textContent = "₹0";

  }
});


// handle coin conversion 10LC = 1 rupee take input from 
convertCoinBtn.addEventListener("click", async () => {
  const coinAmount = Number(enterCoinToConvert.value);

  if (coinAmount <= 0) {
    shakeField(enterCoinToConvert);
    return;
  }

  if (coinAmount % 10 !== 0) {
    shakeField(enterCoinToConvert);
    return;
  }

  if (coinAmount < 3000) {
    shakeField(enterCoinToConvert);
    return;
  }

  showProgress("Converting LC To Cash", "we hope You're in Joy");

  try {
    const res = await lcToCash({
      listenCoinAmount: coinAmount
    });

    if (res.data?.success) {
      await finishProgress(true, "Conversion completed successfully.");
      convertOverlay.classList.remove("show");
      enterCoinToConvert.value = "";
      convertedCash.textContent = "₹0";
      noteOrError.textContent = "";
    }
  } catch (err) {
    console.error(err);
    alert("Failed to convert Listen Coin to Cash.");
    await finishProgress(false, err.message);
  }
});

// helpers

howToUseLc.addEventListener("click", openLcHelp);
// open dialog
function openLcHelp() {
  lcHelpOverlay.style.display = "flex";
}

// close dialog
function closeLcHelpDialog() {
  lcHelpOverlay.style.display = "none";
}

closeLcHelp.addEventListener("click", closeLcHelpDialog);
gotItBtn.addEventListener("click", closeLcHelpDialog);

// show progress overlay 
function showProgress(title, desc) {
  progressDialogOverlay.classList.add("show-progress");
  progressTitle.textContent = title;
  progressDesc.textContent = desc;
}
// finish progress
async function finishProgress(isSuccess, errMessage = "") {
  if (isSuccess) {
    await getUser();
    progressDialogOverlay.classList.remove("show-progress");
    return;
  }

  progressCard.classList.add("failed");
  progressTitle.textContent = "Failed";
  progressDesc.textContent = errMessage || "An error occurred during processing.";

  setTimeout(() => {
    progressCard.classList.remove("failed");
    progressDialogOverlay.classList.remove("show-progress");
  }, 2000);
}


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

  // upload file
  await uploadBytes(fileRef, file);

  // get download URL
  const downloadURL = await getDownloadURL(fileRef);

  // return both (best practice)
  return {
    path,
    url: downloadURL
  };
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
    const result = await getKycSts();
    
    // 1. Check if the network call actually succeeded
    if (result.data && result.data.success) {
      // 2. Return ONLY the kyc data object { status, reason, etc. }
      // This matches your server's return: { success: true, kyc: kycSnap.data() }
      return result.data.kyc; 
    }

    return null;
  } catch (error) {
    console.error("Error calling checkMyKycStatus:", error);
    return null;
  }
}


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


// handle user dp
function handleUserDp() {
  const userImg = document.getElementById("profileUrl");

  if (!uiData.userDp || "") {
    userImg.src = "https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/SapanaCyberHub-Logo-X-Listen-og.png";
    return
  }
  userImg.src = uiData.userDp;

}

// init ui
function init() {
  handleUserDp();
  checkKycStatus(uiData.kyc);
  updateWalletDisplay();
}

// update wallet display
function updateWalletDisplay() {
  userCashEarning.textContent = uiData.cash;
  userCoinEarning.textContent = uiData.listenCoin;

  const withdrawalPageBalance = document.getElementById("accountBalance");
  withdrawalPageBalance.textContent = uiData.cash;
  availLC.textContent = `${uiData.listenCoin} LC`;

}

function timeAgo(ts) {
  if (!ts) return "";

  let date;
  
  // 1. Handle Firestore Timestamp object (if any still exist)
  if (ts && typeof ts.toDate === "function") {
    date = ts.toDate();
  } 
  // 2. Handle ISO strings from the Cloud Function
  else {
    date = new Date(ts);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // If date is invalid, return empty
  if (isNaN(date.getTime())) return "";

  // The Logic Chain
  if (diffInSeconds < 60) return "Just now";
  
  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  // Fallback for very old transactions
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

