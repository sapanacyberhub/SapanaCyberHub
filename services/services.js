// /services/services.js

let walletBalance = 0;
let history = [];

// Helper
const $ = (id) => document.getElementById(id);

// Local storage (demo only)
function loadState() {
  try {
    const b = localStorage.getItem("sch_wallet_balance");
    const h = localStorage.getItem("sch_wallet_history");
    if (b) walletBalance = parseInt(b, 10) || 0;
    if (h) history = JSON.parse(h) || [];
  } catch (e) {
    console.warn("Wallet state load error", e);
  }
}

function saveState() {
  try {
    localStorage.setItem("sch_wallet_balance", String(walletBalance));
    localStorage.setItem("sch_wallet_history", JSON.stringify(history));
  } catch (e) {
    console.warn("Wallet state save error", e);
  }
}

function updateWalletUI() {
  const el = $("walletAmount");
  if (el) el.innerText = walletBalance;
}

// Generate unique payment note (custom id / remark)
function generatePaymentNote() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStamp =
    now.getFullYear().toString().slice(-2) +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    "-" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const rand = Math.floor(Math.random() * 900) + 100; // 3 digits
  return `SCHUPI-${timeStamp}-${rand}`;
}

function ensureNote() {
  const noteInput = $("upiNote");
  if (noteInput && !noteInput.value) {
    noteInput.value = generatePaymentNote();
  }
}

// Open UPI external app (demo)
function openUpiApp() {
  const amount = parseFloat($("customAmount").value || "0");
  const app = $("upiApp").value;
  const note = $("upiNote").value;

  if (!amount || amount <= 0) {
    alert("Enter a valid amount first.");
    return;
  }
  if (!app) {
    alert("Select UPI app.");
    return;
  }

  // ❗ Replace with your real UPI VPA
  const upiId = "your-vpa@upi";
  const name = "SapanaCyberHub";

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(name)}` +
    `&am=${encodeURIComponent(amount.toString())}` +
    `&tn=${encodeURIComponent(note)}`;

  // Works better on mobile devices with UPI apps installed
  window.location.href = upiUrl;
}

/**
 * Basic "ML-style" smart check:
 *  - checks for success keywords
 *  - checks that note/custom id appears in message
 *  - checks txn id looks like a ref/UTR
 */
function smartVerifyPayment({ txnId, msg, note }) {
  const txt = (msg || "").toLowerCase();
  const successKeywords = [
    "success",
    "successful",
    "completed",
    "credited",
    "payment of",
  ];

  const looksSuccess = successKeywords.some((k) => txt.includes(k));
  const containsNote = note && txt.includes(note.toLowerCase());
  const looksLikeTxnId = txnId && txnId.length >= 8;

  if (looksSuccess && containsNote && looksLikeTxnId) {
    return "verified"; // auto-verified
  }
  if (looksLikeTxnId) {
    return "pending"; // needs manual check
  }
  return "invalid";
}

/* --------- PUBLIC FUNCTIONS (used by HTML onclick) --------- */

window.openAddBalance = function () {
  const el = $("addBalanceScreen");
  if (el) {
    el.style.display = "flex";
    ensureNote();
  }
};

window.closeAddBalance = function () {
  const el = $("addBalanceScreen");
  if (el) el.style.display = "none";
};

window.openHistory = function () {
  const el = $("historyScreen");
  if (el) {
    renderHistory();
    el.style.display = "flex";
  }
};

window.closeHistory = function () {
  const el = $("historyScreen");
  if (el) el.style.display = "none";
};

window.confirmAddBalance = function () {
  const amountEl = $("customAmount");
  const upiAppEl = $("upiApp");
  const noteEl = $("upiNote");
  const txnEl = $("txnId");
  const msgEl = $("upiMessage");
  const fileEl = $("upiScreenshot");

  const amt = parseFloat(amountEl.value || "0");
  if (!amt || amt <= 0) {
    alert("Enter valid amount.");
    return;
  }

  const app = upiAppEl.value;
  if (!app) {
    alert("Select UPI app.");
    return;
  }

  const note = noteEl.value || generatePaymentNote();
  noteEl.value = note;

  const txnId = (txnEl.value || "").trim();
  const msg = (msgEl.value || "").trim();

  const verification = smartVerifyPayment({ txnId, msg, note });

  if (verification === "invalid") {
    alert("Enter a valid transaction ID or paste payment message.");
    return;
  }

  // We treat all as credited to wallet, but mark status
  walletBalance += amt;
  updateWalletUI();

  const file = fileEl.files && fileEl.files[0];
  const screenshotName = file ? file.name : null;

  const entry = {
    type: "Credit",
    text: "Wallet Top-up",
    amount: amt,
    app: app,
    txnId,
    note,
    status: verification === "verified" ? "Verified" : "Pending Manual Check",
    time: new Date().toLocaleString(),
    screenshotName,
  };

  history.unshift(entry);
  saveState();
  renderHistory();

  window.closeAddBalance();

  if (verification === "verified") {
    alert(`₹${amt} added & auto-verified ✅`);
  } else {
    alert(`₹${amt} added. Status: Pending manual check.`);
  }

  // reset fields
  amountEl.value = "";
  upiAppEl.value = "";
  txnEl.value = "";
  msgEl.value = "";
  if (fileEl) fileEl.value = "";
};

/* --------- RENDER HISTORY --------- */

function renderHistory() {
  const box = $("historyList");
  if (!box) return;
  box.innerHTML = "";

  if (!history.length) {
    box.innerHTML =
      '<p style="font-size:12px;color:#9ca3af;margin:0;">No transactions yet.</p>';
    return;
  }

  history.forEach((h) => {
    const div = document.createElement("div");
    div.className = "history-item";

    const statusClass =
      h.status === "Verified" ? "status-pill success" : "status-pill pending";

    div.innerHTML = `
      <div class="history-item-main">
        <strong>${h.text}</strong>
        <span>₹${h.amount}</span>
      </div>
      <div class="history-meta">
        <span>${h.type}</span>
        <span>${h.app ? h.app.toUpperCase() : ""}</span>
        ${
          h.txnId
            ? `<span>Txn: ${h.txnId}</span>`
            : `<span style="color:#f97316;">No Txn ID</span>`
        }
        ${h.note ? `<span>Note: ${h.note}</span>` : ""}
        ${
          h.screenshotName
            ? `<span>Shot: ${h.screenshotName}</span>`
            : "<span>No screenshot</span>"
        }
        <span>${h.time}</span>
        <span class="${statusClass}">${h.status}</span>
      </div>
    `;
    box.appendChild(div);
  });
}

/* --------- SERVICE FORM & BUTTON HOOKS --------- */

function setupServiceButtons() {
  const buttons = document.querySelectorAll("[data-service]");
  const serviceSelect = $("selectedService");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const service = btn.getAttribute("data-service");
      if (serviceSelect) {
        serviceSelect.value = service;
      }
      const formSection = $("serviceForm");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function setupRequestForm() {
  const form = $("requestForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("fullName").value.trim();
    const mobile = $("mobile").value.trim();
    const service = $("selectedService").value;

    if (!name || !mobile || !service) {
      alert("Fill all required fields.");
      return;
    }

    // You can replace this with actual backend / form submit later
    alert(
      "Request submitted ✅\n\nName: " +
        name +
        "\nMobile: " +
        mobile +
        "\nService: " +
        service +
        "\n\nWe will contact you soon on WhatsApp / call."
    );

    form.reset();
  });
}

/* --------- INIT --------- */

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateWalletUI();
  renderHistory();
  ensureNote();

  // quick amount buttons
  document.querySelectorAll(".chip[data-amount]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const amt = btn.getAttribute("data-amount");
      $("customAmount").value = amt;
      document
        .querySelectorAll(".chip[data-amount]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // new note button
  const newNoteBtn = $("btnNewNote");
  if (newNoteBtn) {
    newNoteBtn.addEventListener("click", () => {
      $("upiNote").value = generatePaymentNote();
    });
  }

  // open UPI button
  const upiBtn = $("btnOpenUpi");
  if (upiBtn) {
    upiBtn.addEventListener("click", openUpiApp);
  }

  setupServiceButtons();
  setupRequestForm();
});
