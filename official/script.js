/**
 * Sapana Cyber Hub - Final Admin Dashboard Script
 * Synchronized with Cloud Functions v1.2
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1"
};

const REDIRECT_URL = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const postEvent = httpsCallable(functions, "postNewEvents");
const postSponsorTask = httpsCallable(functions, "sponsorAppTask");

// --- UI Elements Map ---
const ui = {
  progress: {
    overlay: document.getElementById("progress-dialog"),
    card: document.getElementById("progress-card"),
    title: document.getElementById("progressTitle"),
    text: document.getElementById("progressText")
  },
  clock: {
    h: document.getElementById("hour"),
    m: document.getElementById("minute"),
    s: document.getElementById("second")
  },
  form: {
    dialog: document.getElementById("host-dialog"),
    openBtn: document.getElementById("create"),
    closeBtn: document.getElementById("close-dialog"),
    submitBtn: document.getElementById("hostBtn"),
    container: document.getElementById("event-container"),
    // Inputs
    eventContainer: document.getElementById("event-container"),
    title: document.getElementById("eventTitle"),
    fee: document.getElementById("eventEntryFee"),
    prize: document.getElementById("eventPrizePool"),
    img: document.getElementById("eventImgUrl"),
    duration: document.getElementById("eventDuration"),
    loopCount: document.getElementById("eventLoopCount"),

    sponsorAppTask: document.getElementById("sponsorAppTask"),
    sponsorName: document.getElementById("sponsorName"),
    sponsorImgUrl: document.getElementById("sponsorImgUrl"),
    sponsorTaskDesc: document.getElementById("sponsorTaskDesc"),
    sponsorAppUrl: document.getElementById("sponsorAppUrl"),
    taskTarget: document.getElementById("taskTarget"),
    sponsorTargetType: document.getElementById("sponsorTargetType"),
    sponsorReward: document.getElementById("taskReward"),
    // Dropdown
    dropdown: document.querySelector(".dropdown"),
    dropBtn: document.querySelector(".dropdown-btn"),
    dropMenu: document.querySelector(".dropdown-menu")
  }
};

let selectedType = null;

// --- 1. Authentication & Authorization ---
showProgress("System Check", "Verifying Admin Authorization...");

onAuthStateChanged(auth, async (user) => {
  if (!user) return handleAuthFailure("No session found. Redirecting...");

  try {
    const token = await getIdTokenResult(user);
    if (token.claims.admin !== true) {
      return handleAuthFailure("Access Denied: Admin privileges required.");
    }

    finishProgress(true, "Authentication Successful.");
    startAdminDashboard();
  } catch (err) {
    console.error("Auth Error:", err);
    handleAuthFailure("Security verification failed. " + (err.message || ""));
  }
});

function handleAuthFailure(msg) {
  finishProgress(false, msg);
  setTimeout(() => { window.location.href = REDIRECT_URL; }, 2500);
}

// --- 2. Dashboard Initialization ---
function startAdminDashboard() {
  // Start Analog Clock
  setInterval(updateClock, 1000);
  updateClock();

  // Modal Controls
  ui.form.openBtn.onclick = () => ui.form.dialog.classList.remove("hidden");
  ui.form.closeBtn.onclick = () => {
    ui.form.dialog.classList.add("hidden");
    resetForm();
  };

  // Custom Dropdown Logic
  ui.form.dropBtn.onclick = (e) => {
    e.stopPropagation();
    ui.form.dropdown.classList.toggle("active");
  };

  ui.form.dropMenu.onclick = (e) => {
    if (e.target.tagName === "LI") {
      selectedType = e.target.dataset.value;
      ui.form.dropBtn.textContent = e.target.textContent;
      ui.form.dropdown.classList.remove("active");
      toggleFormInputs(selectedType);
    }
  };

  // Close dropdown on click-away
  document.onclick = (e) => {
    if (!ui.form.dropdown.contains(e.target)) ui.form.dropdown.classList.remove("active");
  };

  // Submit Handler
  ui.form.submitBtn.onclick = handleHostEvent;
}

// --- 3. Form Logic ---
function toggleFormInputs(type) {
  ui.form.container.style.display = "flex";

  // Specific Logic for ListenEvents
  const isListenEvent = (type === "listenEvent");
  ui.form.title.style.display = isListenEvent ? "block" : "none";
  ui.form.title.required = isListenEvent;

  if (type === "sponsorAppTask") {
    ui.form.sponsorAppTask.style.display = "flex";
    ui.form.eventContainer.style.display = "none";
  }

}
// handle newinputBox click for adding new task completion steps
ui.form.sponsorAppTask.querySelector(".newinputBox").onclick = () => {
  const newStepInput = document.createElement("input");
  newStepInput.type = "text";
  newStepInput.className = "taskCompletStep";
  newStepInput.placeholder = "Task Completion Step";
  ui.form.sponsorAppTask.insertBefore(newStepInput, ui.form.sponsorAppTask.querySelector(".newinputBox"));
}

async function handleHostEvent() {
  // Basic Validation
  if (!selectedType) return showToast("Please select an event type", "error");

  if (selectedType === "sponsorAppTask") {
    
    const sponsorData = {
      sponsorAppName: ui.form.sponsorName.value.trim(),
      sponsorAppLogoUrl: ui.form.sponsorImgUrl.value.trim(),
      sponsorLink: ui.form.sponsorAppUrl.value.trim(),
      taskReward: ui.form.sponsorReward.value.trim(),
      taskTarget: ui.form.taskTarget.value.trim(),
      sponsorTargetType: ui.form.sponsorTargetType.value.trim(),
      taskSteps: Array.from(ui.form.sponsorAppTask.querySelectorAll(".taskCompletStep")).map(input => input.value.trim()).filter(val => val)
    };

    if (!sponsorData.sponsorAppName || !sponsorData.sponsorAppLogoUrl || !sponsorData.sponsorLink || !sponsorData.taskReward || !sponsorData.taskTarget||!sponsorData.sponsorTargetType) {
      return showToast("Please fill all required sponsor fields", "error");
    }

    try {
      showProgress("Hosting Sponsor Task", "Communicating with Cloud Functions...");
      const result = await postSponsorTask(sponsorData);

      if (result.data.success) {
        finishProgress(true, "Sponsor Task is now LIVE! 🚀");
        showToast("Sponsor Task created successfully!", "success");
        ui.form.dialog.classList.add("hidden");
        resetForm();
      }
    } catch (error) {
      console.error("Submission Error:", error);
      finishProgress(false, error.message || "Failed to host sponsor task.");
      showToast("Server Error: Check Console", "error");
    }
    return;
  }


  const payload = {
    eventType: selectedType,
    title: ui.form.title.value.trim(),
    entryFee: ui.form.fee.value.trim() || "0",
    lakhpatiLoopAmountIndex: ui.form.loopCount.value.trim() || "0",
    prizePool: ui.form.prize.value.trim(),
    dpUrl: ui.form.img.value.trim(),
    eventDuration: parseInt(ui.form.duration.value)
  };

  // Field Validation
  if (!payload.dpUrl || !payload.prizePool || isNaN(payload.eventDuration)) {
    return showToast("Please fill all required fields correctly", "error");
  }

  try {
    showProgress("Hosting Event", "Communicating with Cloud Functions...");

    const result = await postEvent(payload);

    if (result.data.success) {
      finishProgress(true, "Event is now LIVE! 🚀");
      showToast("Event created successfully!", "success");
      ui.form.dialog.classList.add("hidden");
      resetForm();
    }
  } catch (error) {
    console.error("Submission Error:", error);
    finishProgress(false, error.message || "Failed to host event.");
    showToast("Server Error: Check Console", "error");
  }
}

// --- 4. Utility Functions ---
function updateClock() {
  const now = new Date();
  const h = (now.getHours() % 12) * 30 + now.getMinutes() / 2;
  const m = now.getMinutes() * 6;
  const s = now.getSeconds() * 6;

  ui.clock.h.style.transform = `rotate(${h}deg)`;
  ui.clock.m.style.transform = `rotate(${m}deg)`;
  ui.clock.s.style.transform = `rotate(${s}deg)`;
}

function resetForm() {
  selectedType = null;
  ui.form.dropBtn.textContent = "Select Event Type";
  ui.form.container.style.display = "none";
  ["title", "fee", "prize", "img", "duration"].forEach(key => ui.form[key].value = "");
}

function showProgress(title, desc) {
  ui.progress.overlay.classList.add("show-progress");
  ui.progress.title.textContent = title;
  ui.progress.text.textContent = desc;
}

function finishProgress(isSuccess, message) {
  ui.progress.title.textContent = isSuccess ? "Success" : "Error";
  ui.progress.text.textContent = message;
  ui.progress.card.className = `progress-card ${isSuccess ? 'success' : 'failed'}`;

  if (isSuccess) {
    setTimeout(() => {
      ui.progress.overlay.classList.remove("show-progress");
      ui.progress.card.classList.remove("success");
    }, 2000);
  }
}

// Lightweight Toast Implementation
function showToast(message, type = "info") {
  // Create toast element if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  // Close button
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  });

  return toast;
}