/**
 * SapanaCyberHub — Complete Admin Script
 * All panels: KYC · Withdrawals · Support · Events · Users
 */

import { initializeApp }                                   from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, getIdTokenResult }   from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFunctions, httpsCallable }                     from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// ── Firebase init ──────────────────────────────────────────────────────────
const app  = initializeApp({
  apiKey:            "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain:        "sapanacyberhub-26310.firebaseapp.com",
  projectId:         "sapanacyberhub-26310",
  storageBucket:     "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId:             "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId:     "G-HKGQ8D55N1",
});
const auth      = getAuth(app);
const functions = getFunctions(app);

// ── Callables — all server-side, no direct Firestore ──────────────────────
// existing in your index.js
const postEvent                = httpsCallable(functions, "postNewEvents");
const postSponsorTask          = httpsCallable(functions, "sponsorAppTask");
const approveUserKYC           = httpsCallable(functions, "approveUserKYC");
const rejectUserKYC            = httpsCallable(functions, "rejectUserKYC");
const approveWithdrawal        = httpsCallable(functions, "approveWithdrawal");
const getAllSupportTickets      = httpsCallable(functions, "getAllSupportTickets");
const replyToSupportTicket     = httpsCallable(functions, "replyToSupportTicket");
const finishEvents             = httpsCallable(functions, "finishEvents");
const announceSponsorLeaderBoard = httpsCallable(functions, "announceSponsorLeaderBoard");
const setAdminClaim            = httpsCallable(functions, "setAdminClaim");
const revokeAdminClaim         = httpsCallable(functions, "revokeAdminClaim");
// new — add these 5 to your index.js (see admin-new-functions.js)
const getAdminStats            = httpsCallable(functions, "getAdminStats");
const getPendingKYCList        = httpsCallable(functions, "getPendingKYCList");
const getPendingWithdrawalList = httpsCallable(functions, "getPendingWithdrawalList");
const getActiveEventsAdmin     = httpsCallable(functions, "getActiveEventsAdmin");
const getAllUsersAdmin          = httpsCallable(functions, "getAllUsersAdmin");

const REDIRECT_URL = "https://sapanacyberhub.in/online-earning/listen-enjoy-earn/";

// ── Helpers ────────────────────────────────────────────────────────────────
const CAT     = { account:"Account Issue", withdrawal:"Withdrawal", ads:"Ads / Earnings", bug:"Bug Report", partnership:"Partnership" };
const PRI_CLS = { low:"sp-pri-low", normal:"sp-pri-normal", urgent:"sp-pri-urgent" };
const PRI_ICO = { low:"🟢", normal:"🟡", urgent:"🔴" };
const EV_CLS  = { listenEvent:"ev-listen", hitEvent:"ev-hit", lakhpatiLoop:"ev-lakhpati", cashHaandi:"ev-cash" };
const EV_NAME = { listenEvent:"Listen", hitEvent:"Hit", lakhpatiLoop:"Lakhpati", cashHaandi:"Cash Haandi" };
const fmt     = ts => { if(!ts) return "—"; const d = ts._seconds?new Date(ts._seconds*1000):new Date(ts); return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); };
const fmtF    = ts => { if(!ts) return "—"; const d = ts._seconds?new Date(ts._seconds*1000):new Date(ts); return d.toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); };
const ini     = s  => (s||"U").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const sHTML   = s  => ({ open:`<span class="sp-badge spb-open"><span class="sp-dot"></span>Open</span>`, replied:`<span class="sp-badge spb-replied"><span class="sp-dot"></span>Replied</span>`, closed:`<span class="sp-badge spb-closed"><span class="sp-dot"></span>Closed</span>` }[s]||`<span class="sp-badge spb-open"><span class="sp-dot"></span>Open</span>`);

// ── Global state ───────────────────────────────────────────────────────────
let selectedType = null;
let allTickets   = [], spFilter = "all", spSearch = "";
let allEvents    = [], allSponsors = [], evTab = "active";
let allUsers     = [], usersSearch = "";

// ══════════════════════════════════════════════════════════════════════════
//  AUTH + REDIRECT
// ══════════════════════════════════════════════════════════════════════════
showProgress("System Check", "Verifying Admin Authorization…");

onAuthStateChanged(auth, async user => {
  if (!user) return authFail("No session found. Redirecting…");
  try {
    const token = await getIdTokenResult(user, true);
    if (token.claims.admin !== true) return authFail("Access Denied: Admin privileges required.");
    document.getElementById("admin-tag").textContent = (user.displayName || user.email?.split("@")[0] || "ADMIN").toUpperCase();
    finishProgress(true, "Authorization Successful.");
    initDashboard();
    loadStats();
  } catch (err) {
    console.error(err);
    authFail("Security check failed: " + (err.message || ""));
  }
});

function authFail(msg) {
  finishProgress(false, msg);
  setTimeout(() => { window.location.href = REDIRECT_URL; }, 2500);
}

// ══════════════════════════════════════════════════════════════════════════
//  DASHBOARD INIT
// ══════════════════════════════════════════════════════════════════════════
function initDashboard() {
  startClock();
  setupPanels();
  setupEventCreation();
  setupLightbox();
}

// ── Stats ──────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const { data } = await getAdminStats();
    const s = data.stats;
    document.getElementById("active-users").textContent    = s.dailyActiveUsers         ?? "—";
    document.getElementById("active-events").textContent   = s.activeEvents        ?? "—";
    document.getElementById("kyc-pending").textContent     = s.pendingKYC          ?? "—";
    document.getElementById("pending-withdrwal").textContent = s.pendingWithdrawals ?? "—";
    document.getElementById("support-tickets").textContent = s.openTickets         ?? "—";
    document.getElementById("total-payout").textContent    = `₹${(s.totalPayout||0).toLocaleString("en-IN")}`;
  } catch (e) { console.error("loadStats:", e); }
}

// ══════════════════════════════════════════════════════════════════════════
//  PANEL SYSTEM
// ══════════════════════════════════════════════════════════════════════════
function setupPanels() {
  // action buttons → open panel + load
  const map = {
    "review-KYC":        { panel:"kyc-panel",   fn: loadKYC     },
    "review-withdrawal": { panel:"wd-panel",     fn: loadWD      },
    "support-requests":  { panel:"sp-panel",     fn: loadSupport },
    "Manage-events":     { panel:"ev-panel",     fn: loadEvents  },
    "Manage-users":      { panel:"users-panel",  fn: loadUsers   },
  };
  Object.entries(map).forEach(([id, { panel, fn }]) => {
    document.getElementById(id)?.addEventListener("click", () => { openPanel(panel); fn(); });
  });

  // back buttons
  document.querySelectorAll(".panel-back").forEach(b => {
    b.addEventListener("click", () => closePanel(b.dataset.close));
  });

  // refresh buttons
  const rfMap = { kyc: loadKYC, wd: loadWD, sp: loadSupport, ev: loadEvents, users: loadUsers };
  document.querySelectorAll(".panel-refresh").forEach(b => {
    b.addEventListener("click", () => rfMap[b.dataset.fn]?.());
  });

  // support filters
  document.querySelectorAll(".sp-fp").forEach(p => {
    p.addEventListener("click", () => {
      document.querySelectorAll(".sp-fp").forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      spFilter = p.dataset.f;
      renderTickets();
    });
  });
  document.getElementById("sp-search")?.addEventListener("input", e => { spSearch = e.target.value.trim(); renderTickets(); });

  // support reply back
  document.getElementById("sp-reply-back")?.addEventListener("click", () => {
    document.getElementById("sp-reply-sheet")?.classList.add("hidden");
  });

  // event tabs
  document.querySelectorAll(".ev-tab").forEach(t => {
    t.addEventListener("click", () => {
      document.querySelectorAll(".ev-tab").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      evTab = t.dataset.et;
      renderEvents();
    });
  });

  // users search
  document.getElementById("users-search")?.addEventListener("input", e => {
    usersSearch = e.target.value.trim().toLowerCase();
    renderUsers();
  });
}

function openPanel(id)  { document.getElementById(id)?.classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closePanel(id) { document.getElementById(id)?.classList.add("hidden"); document.body.style.overflow = ""; }

function skelShow(id) { document.getElementById(id + "-skels").style.display = "flex"; document.getElementById(id + "-list").innerHTML = ""; }
function skelHide(id) { document.getElementById(id + "-skels").style.display = "none"; }
const empty = (icon, title, sub) =>
  `<div class="p-empty"><div class="p-empty-icon">${icon}</div><h3>${title}</h3><p style="font-size:.8rem;margin-top:3px;opacity:.7">${sub}</p></div>`;

// ══════════════════════════════════════════════════════════════════════════
//  KYC PANEL
// ══════════════════════════════════════════════════════════════════════════
async function loadKYC() {
  skelShow("kyc");
  try {
    const { data } = await getPendingKYCList();
    skelHide("kyc");
    const el = document.getElementById("kyc-list");

    if (!data.kyc?.length) { el.innerHTML = empty("📋","No Pending KYC","All clear — nothing to review."); return; }

    el.innerHTML = "";
    data.kyc.forEach((kyc, i) => {
      const card = document.createElement("div");
      card.className = "kyc-card";
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="kyc-top">
          <img class="kyc-av" src="${kyc.profileURL||''}" onerror="this.style.display='none'" alt="">
          <div class="kyc-info">
            <h3>${kyc.name || "—"}</h3>
            <p>${kyc.email || "—"}</p>
            <p class="kyc-date">📅 ${fmtF(kyc.submittedAt)}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:7px;margin-bottom:11px">
          <div class="wd-item"><div class="wd-item-l">Phone</div><div class="wd-item-v">${kyc.phone||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">Gender</div><div class="wd-item-v">${kyc.gender||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">Age</div><div class="wd-item-v">${kyc.age||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">ID Last 4</div><div class="wd-item-v" style="font-family:monospace">••••${kyc.idLastFour||"—"}</div></div>
        </div>
        <div class="kyc-imgs">
          <div>
            <div class="kyc-img-box"><img src="${kyc.profileURL||''}" data-src="${kyc.profileURL||''}" onerror="this.parentElement.innerHTML='<p style=padding:8px;font-size:.75rem;opacity:.4>No image</p>'" alt="Profile"></div>
            <p class="kyc-img-lbl">Profile Photo</p>
          </div>
          <div>
            <div class="kyc-img-box"><img src="${kyc.idProofURL||''}" data-src="${kyc.idProofURL||''}" onerror="this.parentElement.innerHTML='<p style=padding:8px;font-size:.75rem;opacity:.4>No image</p>'" alt="ID Proof"></div>
            <p class="kyc-img-lbl">ID Proof</p>
          </div>
        </div>
        <div class="kyc-acts">
          <button class="kyc-approve-btn" data-uid="${kyc.uid}" data-dp="${kyc.profileURL||''}">✅ Approve</button>
          <button class="kyc-reject-btn"  data-uid="${kyc.uid}">❌ Reject</button>
        </div>
        <div class="kyc-reject-form" id="rf-${kyc.uid}">
          <textarea class="reject-ta" rows="2" placeholder="Reason for rejection…"></textarea>
          <button class="reject-confirm" data-uid="${kyc.uid}">Confirm Reject</button>
        </div>`;
      el.appendChild(card);

      card.querySelector(".kyc-approve-btn").addEventListener("click", async e => {
        const b = e.currentTarget;
        b.disabled = true; b.textContent = "Approving…";
        try {
          await approveUserKYC({ uid: b.dataset.uid, userDp: b.dataset.dp });
          card.querySelector(".kyc-acts").innerHTML = `<span style="color:#4ade80;font-size:.83rem">✅ Approved!</span>`;
          card.style.opacity = ".45";
          showToast("KYC Approved! ✅", "success");
          loadStats();
        } catch (err) { b.disabled = false; b.textContent = "✅ Approve"; showToast(err.message||"Failed","error"); }
      });

      card.querySelector(".kyc-reject-btn").addEventListener("click", () => {
        document.getElementById(`rf-${kyc.uid}`).classList.toggle("show");
      });

      card.querySelector(".reject-confirm").addEventListener("click", async e => {
        const b      = e.currentTarget;
        const reason = card.querySelector(".reject-ta").value.trim();
        if (!reason) { showToast("Please enter a rejection reason","error"); return; }
        b.disabled = true; b.textContent = "Rejecting…";
        try {
          await rejectUserKYC({ uid: b.dataset.uid, reason });
          card.querySelector(".kyc-acts").innerHTML = `<span style="color:#f87171;font-size:.83rem">❌ Rejected</span>`;
          card.style.opacity = ".45";
          showToast("KYC Rejected", "info");
          loadStats();
        } catch (err) { b.disabled = false; b.textContent = "Confirm Reject"; showToast(err.message||"Failed","error"); }
      });
    });
  } catch (err) {
    skelHide("kyc");
    document.getElementById("kyc-list").innerHTML = empty("⚠️","Error","Could not load KYC list.");
    console.error(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  WITHDRAWAL PANEL
// ══════════════════════════════════════════════════════════════════════════
async function loadWD() {
  skelShow("wd");
  try {
    const { data } = await getPendingWithdrawalList();
    skelHide("wd");
    const el = document.getElementById("wd-list");

    if (!data.withdrawals?.length) { el.innerHTML = empty("💰","No Pending Withdrawals","All processed!"); return; }

    el.innerHTML = "";
    data.withdrawals.forEach((w, i) => {
      const card = document.createElement("div");
      card.className = "wd-card";
      card.style.animationDelay = `${i * 0.05}s`;
      const initials = ini(w.userName);
      card.innerHTML = `
        <div class="wd-amount">₹${Number(w.withdrawalAmount||0).toLocaleString("en-IN")}</div>
        <div class="wd-grid">
          <div class="wd-item"><div class="wd-item-l">Method</div><div class="wd-item-v">${w.paymentMethod||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">Bank</div><div class="wd-item-v">${w.bankName||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">Account / UPI</div><div class="wd-item-v">${w.accountNO||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">IFSC</div><div class="wd-item-v">${w.ifcsCode||"—"}</div></div>
          <div class="wd-item"><div class="wd-item-l">Transaction ID</div><div class="wd-item-v" style="font-family:monospace;font-size:.72rem">${w.transactionId||w.docId}</div></div>
          <div class="wd-item"><div class="wd-item-l">Requested</div><div class="wd-item-v">${fmtF(w.createdAt)}</div></div>
        </div>
        <div class="wd-user">
          <div class="wd-user-av">${initials}</div>
          <div class="wd-user-info"><p>${w.userName}</p><span>${w.userEmail}</span></div>
        </div>
        <button class="wd-approve-btn" data-txn="${w.transactionId||w.docId}" data-uid="${w.uid}">
          ✅ Approve ₹${Number(w.withdrawalAmount||0).toLocaleString("en-IN")}
        </button>`;

      card.querySelector(".wd-approve-btn").addEventListener("click", async e => {
        const b = e.currentTarget;
        const ok = await showConfirm({ title:"Approve Withdrawal?", msg:`Pay ₹${Number(w.withdrawalAmount||0).toLocaleString("en-IN")} to ${w.userName}.\n${w.paymentMethod||""} • ${w.accountNO||""}`, icon:"💸", okLabel:"Yes, Approve", okColor:"green" });
        if (!ok) return;
        b.disabled = true; b.textContent = "Processing…";
        try {
          await approveWithdrawal({ transactionId: b.dataset.txn, uid: b.dataset.uid });
          b.textContent = "✅ Approved!";
          card.style.opacity = ".45";
          showToast(`₹${Number(w.withdrawalAmount||0).toLocaleString("en-IN")} approved! 💸`, "success");
          loadStats();
        } catch (err) { b.disabled = false; b.textContent = `✅ Approve ₹${Number(w.withdrawalAmount||0).toLocaleString("en-IN")}`; showToast(err.message||"Failed","error"); }
      });

      el.appendChild(card);
    });
  } catch (err) {
    skelHide("wd");
    document.getElementById("wd-list").innerHTML = empty("⚠️","Error","Could not load withdrawals.");
    console.error(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  SUPPORT PANEL
// ══════════════════════════════════════════════════════════════════════════
async function loadSupport() {
  skelShow("sp");
  try {
    const { data } = await getAllSupportTickets();
    allTickets = data.tickets || [];
    skelHide("sp");
    renderTickets();
    loadStats();
  } catch (err) {
    skelHide("sp");
    document.getElementById("sp-list").innerHTML = empty("⚠️","Error","Could not load tickets.");
    console.error(err);
  }
}

function renderTickets() {
  const el = document.getElementById("sp-list");
  el.innerHTML = "";

  let rows = [...allTickets];
  if (spFilter === "urgent") rows = rows.filter(t => t.priority === "urgent");
  else if (spFilter !== "all") rows = rows.filter(t => t.status === spFilter);
  if (spSearch) {
    const q = spSearch.toLowerCase();
    rows = rows.filter(t => (t.email||"").toLowerCase().includes(q) || (t.subject||"").toLowerCase().includes(q) || (t.ticketId||"").toLowerCase().includes(q));
  }

  if (!rows.length) { el.innerHTML = empty("🎫","No Tickets","No tickets match your filter."); return; }

  rows.forEach((t, i) => {
    const card = document.createElement("div");
    card.className = "sp-card";
    card.style.animationDelay = `${i * 0.04}s`;
    card.style.setProperty("--acc", t.status==="replied"?"#34d399":t.priority==="urgent"?"#f87171":"#a855f7");
    const hasNew = t.status === "replied" && !t.seenByUser;
    card.innerHTML = `
      <div class="sp-card-top">
        <span class="sp-card-id">${t.ticketId||t._docId}</span>
        ${sHTML(t.status||"open")}
        ${hasNew ? `<span class="new-rep-dot" title="Has reply"></span>` : ""}
      </div>
      <div class="sp-card-subj">${t.subject||"No subject"}</div>
      <div class="sp-card-email">${t.email||"—"}</div>
      <div class="sp-card-bot">
        <span class="${PRI_CLS[t.priority]||"sp-pri-normal"}">${PRI_ICO[t.priority]||"🟡"} ${t.priority||"normal"}</span>
        <span style="font-size:.7rem;opacity:.38">${fmt(t.createdAt)}</span>
      </div>`;
    card.addEventListener("click", () => openReplySheet(t));
    el.appendChild(card);
  });
}

function openReplySheet(t) {
  document.getElementById("sp-reply-tid").textContent = t.ticketId || t._docId;
  const body = document.getElementById("sp-reply-body");
  body.innerHTML = "";

  // info
  const info = document.createElement("div");
  info.innerHTML = `
    <div class="r-sec">Ticket Info</div>
    <div class="r-igrid">
      <div class="r-item"><div class="r-item-l">Status</div>   <div class="r-item-v">${sHTML(t.status||"open")}</div></div>
      <div class="r-item"><div class="r-item-l">Priority</div>  <div class="r-item-v ${PRI_CLS[t.priority]||""}">${PRI_ICO[t.priority]||""} ${(t.priority||"normal")[0].toUpperCase()+(t.priority||"normal").slice(1)}</div></div>
      <div class="r-item"><div class="r-item-l">Category</div>  <div class="r-item-v">${CAT[t.category]||t.category||"—"}</div></div>
      <div class="r-item"><div class="r-item-l">Email</div>     <div class="r-item-v" style="font-size:.76rem">${t.email||"—"}</div></div>
      <div class="r-item"><div class="r-item-l">Submitted</div> <div class="r-item-v" style="font-size:.74rem">${fmtF(t.createdAt)}</div></div>
      <div class="r-item"><div class="r-item-l">UID</div>       <div class="r-item-v" style="font-family:monospace;font-size:.68rem;word-break:break-all">${t.uid||"—"}</div></div>
    </div>`;
  body.appendChild(info);

  // user message
  const msg = document.createElement("div");
  msg.innerHTML = `
    <div class="r-sec">User Message</div>
    <div class="bub-meta"><span>👤 ${t.email||"—"}</span><span>${fmtF(t.createdAt)}</span></div>
    <div class="msg-bub">${t.message||"(empty)"}</div>`;
  body.appendChild(msg);

  // existing reply
  if (t.reply) {
    const prev = document.createElement("div");
    prev.innerHTML = `
      <div class="r-sec">Previous Reply</div>
      <div class="bub-meta"><span>🛡️ Support Team</span><span>${fmtF(t.repliedAt)}</span></div>
      <div class="rep-bub">${t.reply}</div>`;
    body.appendChild(prev);
  }

  // reply form
  const form = document.createElement("div");
  form.innerHTML = `
    <div class="r-sec">${t.reply ? "Update Reply" : "Write Reply"}</div>
    <textarea class="rta" id="rta-txt" placeholder="Write your response…">${t.reply||""}</textarea>
    <div class="reply-acts">
      <select class="status-sel" id="rta-status">
        <option value="open"    ${(t.status||"open")==="open"   ?"selected":""}>🟡 Keep Open</option>
        <option value="replied" ${t.status==="replied"          ?"selected":""}>🟢 Mark Replied</option>
        <option value="closed"  ${t.status==="closed"           ?"selected":""}>⚫ Close Ticket</option>
      </select>
      <button class="send-btn" id="send-reply-btn">
        <div class="sbc">📨 Send Reply</div>
        <div class="sbs"></div>
      </button>
    </div>
    <div class="r-toast" id="r-toast"></div>`;
  body.appendChild(form);

  document.getElementById("send-reply-btn").addEventListener("click", async () => {
    const replyText = document.getElementById("rta-txt").value.trim();
    const newStatus = document.getElementById("rta-status").value;
    const btn   = document.getElementById("send-reply-btn");
    const toast = document.getElementById("r-toast");
    if (!replyText) { rToast(toast,"Please write a reply first.","err"); return; }
    btn.classList.add("loading");
    try {
      const { data } = await replyToSupportTicket({ docId: t._docId, ticketId: t.ticketId||t._docId, uid: t.uid||null, reply: replyText, status: newStatus });
      if (!data?.success) throw new Error(data?.message || "Failed");
      const idx = allTickets.findIndex(x => x._docId === t._docId);
      if (idx !== -1) allTickets[idx] = { ...allTickets[idx], reply: replyText, status: newStatus };
      renderTickets();
      rToast(toast, "✅ Reply sent!", "ok");
      loadStats();
    } catch (err) { rToast(toast, `❌ ${err.message||"Failed"}`, "err"); console.error(err); }
    finally { btn.classList.remove("loading"); }
  });

  document.getElementById("sp-reply-sheet")?.classList.remove("hidden");
}

// ══════════════════════════════════════════════════════════════════════════
//  EVENTS PANEL
// ══════════════════════════════════════════════════════════════════════════
async function loadEvents() {
  skelShow("ev");
  try {
    const { data } = await getActiveEventsAdmin();
    allEvents   = data.events   || [];
    allSponsors = data.sponsorTasks || [];
    skelHide("ev");
    renderEvents();
  } catch (err) {
    skelHide("ev");
    document.getElementById("ev-list").innerHTML = empty("⚠️","Error","Could not load events.");
    console.error(err);
  }
}

function renderEvents() {
  const el = document.getElementById("ev-list");
  el.innerHTML = "";

  if (evTab === "sponsors") {
    if (!allSponsors.length) { el.innerHTML = empty("🎯","No Sponsor Tasks","No sponsor tasks found."); return; }
    allSponsors.forEach((s, i) => {
      const card = document.createElement("div");
      card.className = "ev-card";
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="ev-card-top">
          <span class="ev-type-badge ev-sponsor">Sponsor</span>
          ${s.isActive ? `<span class="ev-live">🟢 Active</span>` : `<span class="ev-ended">🔴 Closed</span>`}
        </div>
        <div class="ev-title">${s.sponsorAppName||"—"}</div>
        <div class="ev-meta">
          <span>🎯 Target: ${s.sponsorTarget||"—"}</span>
          <span>✅ Done: ${s.TargetCompleted||0}</span>
          <span>💰 Pool: ₹${s.taskPool||0}</span>
        </div>
        <div class="ev-acts">
          ${s.isActive
            ? `<button class="ev-announce-btn" data-sid="${s.sponsorId}">🏆 Announce Leaderboard</button>`
            : `<button class="ev-announce-btn" disabled style="opacity:.35;pointer-events:none">Already Closed</button>`}
        </div>`;
      card.querySelector(".ev-announce-btn:not([disabled])")?.addEventListener("click", async e => {
        const b = e.currentTarget;
        const ok = await showConfirm({ title:"Announce Leaderboard?", msg:`This will close "${s.sponsorAppName}" and distribute rewards. Cannot be undone.`, icon:"🏆", okLabel:"Announce", okColor:"purple" });
        if (!ok) return;
        b.classList.add("loading"); b.textContent = "Announcing…";
        try {
          await announceSponsorLeaderBoard({ sponsorId: b.dataset.sid });
          showToast("Leaderboard announced! 🏆","success");
          loadEvents(); loadStats();
        } catch (err) { b.classList.remove("loading"); b.textContent = "🏆 Announce Leaderboard"; showToast(err.message||"Failed","error"); }
      });
      el.appendChild(card);
    });
    return;
  }

  const rows = evTab === "active" ? allEvents.filter(e => !e.hasEnded) : allEvents.filter(e => e.hasEnded);
  if (!rows.length) { el.innerHTML = empty("⚡", evTab==="active"?"No Active Events":"No Ended Events", evTab==="active"?"Create one using the + button.":"All events are still running."); return; }

  rows.forEach((ev, i) => {
    const card = document.createElement("div");
    card.className = "ev-card";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="ev-card-top">
        <span class="ev-type-badge ${EV_CLS[ev.eventType]||""}">${EV_NAME[ev.eventType]||ev.eventType}</span>
        ${ev.hasEnded ? `<span class="ev-ended">Ended</span>` : `<span class="ev-live">🟢 Live</span>`}
      </div>
      <div class="ev-id">${ev.eventId}</div>
      <div class="ev-title">${ev.eventTitle||"Untitled Event"}</div>
      <div class="ev-meta">
        <span>👥 ${ev.totalViber||0} vibers</span>
        <span>💰 ₹${ev.eventPrizePool||0}</span>
        <span>${ev.hasEnded ? `🏁 Ended ${fmt(ev.closedAt)}` : `⏰ Ends ${fmtF(ev.endTime)}`}</span>
      </div>
      <div class="ev-acts">
        ${!ev.hasEnded
          ? `<button class="ev-finish-btn" data-eid="${ev.eventId}" data-eidx="${ev.eventTypeIndex}">🏁 Finish & Distribute</button>`
          : `<span style="font-size:.78rem;opacity:.35">Rewards distributed</span>`}
      </div>`;
    card.querySelector(".ev-finish-btn")?.addEventListener("click", async e => {
      const b = e.currentTarget;
      const ok = await showConfirm({ title:"Finish Event?", msg:`"${ev.eventTitle||ev.eventId}" will end now and rewards will be distributed to all winners immediately.`, icon:"🏁", okLabel:"Finish & Distribute", okColor:"cyan" });
      if (!ok) return;
      b.classList.add("loading"); b.textContent = "Finishing…";
      try {
        const { data } = await finishEvents({ eventId: b.dataset.eid, eventType: Number(b.dataset.eidx) });
        showToast(`Done! ${data.winnersCount} winners! 🏆`, "success");
        loadEvents(); loadStats();
      } catch (err) { b.classList.remove("loading"); b.textContent = "🏁 Finish & Distribute"; showToast(err.message||"Failed","error"); }
    });
    el.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════════════════════════
//  USERS PANEL
// ══════════════════════════════════════════════════════════════════════════
async function loadUsers() {
  skelShow("users");
  try {
    const { data } = await getAllUsersAdmin();
    allUsers = data.users || [];
    skelHide("users");
    renderUsers();
  } catch (err) {
    skelHide("users");
    document.getElementById("users-list").innerHTML = empty("⚠️","Error","Could not load users.");
    console.error(err);
  }
}

function renderUsers() {
  const el = document.getElementById("users-list");
  el.innerHTML = "";
  const rows = usersSearch
    ? allUsers.filter(u => (u.name||"").toLowerCase().includes(usersSearch) || (u.email||"").toLowerCase().includes(usersSearch))
    : allUsers;

  if (!rows.length) { el.innerHTML = empty("👤","No Users Found","Try a different search."); return; }

  rows.forEach((u, i) => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.style.animationDelay = `${i * 0.04}s`;
    const initials = ini(u.name || u.email);
    const avHTML = u.userDp
      ? `<img class="user-av" src="${u.userDp}" onerror="this.outerHTML='<div class=user-av>${initials}</div>'" alt="">`
      : `<div class="user-av">${initials}</div>`;
    card.innerHTML = `
      <div class="user-top">
        ${avHTML}
        <div class="user-info">
          <h3>${u.name||"—"}</h3>
          <p>${u.email||"—"}</p>
        </div>
        ${u.isAdmin ? `<span class="user-admin-badge">⭐ ADMIN</span>` : ""}
      </div>
      <div class="user-bals">
        <div class="user-bal"><div class="user-bal-v" style="color:var(--green)">₹${(u.cash||0).toLocaleString("en-IN")}</div><div class="user-bal-l">Cash</div></div>
        <div class="user-bal"><div class="user-bal-v" style="color:var(--cyan)">${u.listenCoin||0}</div><div class="user-bal-l">LC</div></div>
        <div class="user-bal"><div class="user-bal-v" style="color:var(--purple)">${u.luckCredit||0}</div><div class="user-bal-l">Luck</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="${u.kyc ? 'user-kyc-yes' : 'user-kyc-no'}">${u.kyc ? "✅ KYC" : "❌ KYC"}</span>
        <span style="font-size:.68rem;opacity:.32">Last active: ${fmt(u.lastActiveAt)}</span>
      </div>
      <div class="user-acts">
        ${!u.isAdmin
          ? `<button class="set-admin-btn" data-uid="${u.uid}">⭐ Set Admin</button>`
          : `<button class="revoke-admin-btn" data-uid="${u.uid}">✕ Revoke Admin</button>`}
      </div>`;

    card.querySelector(".set-admin-btn")?.addEventListener("click", async e => {
      const b = e.currentTarget;
      const ok = await showConfirm({ title:"Grant Admin Access?", msg:`${u.name||u.email} will get full admin privileges. Make sure you trust this person.`, icon:"⭐", okLabel:"Grant Admin", okColor:"purple" });
      if (!ok) return;
      b.classList.add("loading"); b.textContent = "Setting…";
      try {
        await setAdminClaim({ targetUid: b.dataset.uid });
        u.isAdmin = true;
        showToast(`${u.name||u.email} is now Admin ⭐`,"success");
        renderUsers();
      } catch (err) { b.classList.remove("loading"); b.textContent = "⭐ Set Admin"; showToast(err.message||"Failed","error"); }
    });

    card.querySelector(".revoke-admin-btn")?.addEventListener("click", async e => {
      const b = e.currentTarget;
      const ok = await showConfirm({ title:"Revoke Admin?", msg:`${u.name||u.email} will lose all admin privileges immediately.`, icon:"🚫", okLabel:"Revoke", okColor:"red" });
      if (!ok) return;
      b.classList.add("loading"); b.textContent = "Revoking…";
      try {
        await revokeAdminClaim({ targetUid: b.dataset.uid });
        u.isAdmin = false;
        showToast(`Admin revoked from ${u.name||u.email}`,"info");
        renderUsers();
      } catch (err) { b.classList.remove("loading"); b.textContent = "✕ Revoke Admin"; showToast(err.message||"Failed","error"); }
    });

    el.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════════════════════════
//  EVENT CREATION  (existing logic — preserved exactly)
// ══════════════════════════════════════════════════════════════════════════
function setupEventCreation() {
  const ui = {
    dialog:    document.getElementById("host-dialog"),
    openBtn:   document.getElementById("create"),
    closeBtn:  document.getElementById("close-dialog"),
    submitBtn: document.getElementById("hostBtn"),
    dropdown:  document.querySelector(".dropdown"),
    dropBtn:   document.querySelector(".dropdown-btn"),
    dropMenu:  document.querySelector(".dropdown-menu"),
    evCont:    document.getElementById("event-container"),
    satCont:   document.getElementById("sponsorAppTask"),
    title:     document.getElementById("eventTitle"),
    fee:       document.getElementById("eventEntryFee"),
    prize:     document.getElementById("eventPrizePool"),
    img:       document.getElementById("eventImgUrl"),
    duration:  document.getElementById("eventDuration"),
    loopCount: document.getElementById("eventLoopCount"),
    sponsorName:       document.getElementById("sponsorName"),
    sponsorImgUrl:     document.getElementById("sponsorImgUrl"),
    sponsorAppUrl:     document.getElementById("sponsorAppUrl"),
    sponsorTargetType: document.getElementById("sponsorTargetType"),
    taskTarget:        document.getElementById("taskTarget"),
    sponsorReward:     document.getElementById("taskReward"),
  };

  ui.openBtn?.addEventListener("click", () => ui.dialog.classList.remove("hidden"));
  ui.closeBtn?.addEventListener("click", () => { ui.dialog.classList.add("hidden"); resetForm(ui); });

  ui.dropBtn?.addEventListener("click", e => { e.stopPropagation(); ui.dropdown.classList.toggle("active"); });
  ui.dropMenu?.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;
    selectedType = e.target.dataset.value;
    ui.dropBtn.textContent = e.target.textContent;
    ui.dropdown.classList.remove("active");
    ui.evCont.style.display  = selectedType === "sponsorAppTask" ? "none" : "flex";
    ui.satCont.style.display = selectedType === "sponsorAppTask" ? "flex" : "none";
    const isListen = selectedType === "listenEvent";
    ui.title.style.display    = isListen ? "block" : "none";
    ui.loopCount.style.display= isListen ? "none"  : "block";
  });
  document.addEventListener("click", e => { if (!ui.dropdown?.contains(e.target)) ui.dropdown?.classList.remove("active"); });

  ui.satCont?.querySelector(".newinputBox")?.addEventListener("click", () => {
    const inp = document.createElement("input");
    inp.type = "text"; inp.className = "taskCompletStep"; inp.placeholder = "Task Completion Step";
    ui.satCont.insertBefore(inp, ui.satCont.querySelector(".newinputBox"));
  });

  ui.submitBtn?.addEventListener("click", () => handleHostEvent(ui));
}

async function handleHostEvent(ui) {
  if (!selectedType) return showToast("Please select an event type","error");

  if (selectedType === "sponsorAppTask") {
    const d = {
      sponsorAppName:    ui.sponsorName.value.trim(),
      sponsorAppLogoUrl: ui.sponsorImgUrl.value.trim(),
      sponsorLink:       ui.sponsorAppUrl.value.trim(),
      taskReward:        ui.sponsorReward.value.trim(),
      taskTarget:        ui.taskTarget.value.trim(),
      sponsorTargetType: ui.sponsorTargetType.value.trim(),
      taskSteps: Array.from(ui.satCont.querySelectorAll(".taskCompletStep")).map(i=>i.value.trim()).filter(Boolean),
    };
    if (!d.sponsorAppName||!d.sponsorAppLogoUrl||!d.sponsorLink||!d.taskReward||!d.taskTarget||!d.sponsorTargetType)
      return showToast("Please fill all required sponsor fields","error");
    try {
      showProgress("Hosting Sponsor Task","Communicating with Cloud Functions…");
      const r = await postSponsorTask(d);
      if (r.data.success) { finishProgress(true,"Sponsor Task is LIVE! 🚀"); showToast("Sponsor Task created!","success"); ui.dialog.classList.add("hidden"); resetForm(ui); loadStats(); loadEvents(); }
    } catch (e) { finishProgress(false, e.message||"Failed"); showToast("Error: "+e.message,"error"); }
    return;
  }

  const p = {
    eventType: selectedType,
    title:     ui.title.value.trim(),
    entryFee:  ui.fee.value.trim()||"0",
    lakhpatiLoopAmountIndex: ui.loopCount.value.trim()||"0",
    prizePool: ui.prize.value.trim(),
    dpUrl:     ui.img.value.trim(),
    eventDuration: parseInt(ui.duration.value),
  };
  if (!p.dpUrl||!p.prizePool||isNaN(p.eventDuration)) return showToast("Please fill all required fields correctly","error");
  try {
    showProgress("Hosting Event","Communicating with Cloud Functions…");
    const r = await postEvent(p);
    if (r.data.success) { finishProgress(true,"Event is LIVE! 🚀"); showToast("Event created!","success"); ui.dialog.classList.add("hidden"); resetForm(ui); loadStats(); loadEvents(); }
  } catch (e) { finishProgress(false, e.message||"Failed"); showToast("Error: "+e.message,"error"); }
}

function resetForm(ui) {
  selectedType = null;
  if (ui.dropBtn) ui.dropBtn.textContent = "Choose Event to be Host";
  if (ui.evCont)  ui.evCont.style.display  = "flex";
  if (ui.satCont) ui.satCont.style.display = "none";
  ["title","fee","prize","img","duration","loopCount","sponsorName","sponsorImgUrl","sponsorAppUrl","taskTarget","sponsorTargetType","sponsorReward"].forEach(k => { if(ui[k]) ui[k].value = ""; });
}

// ══════════════════════════════════════════════════════════════════════════
//  IMAGE LIGHTBOX
// ══════════════════════════════════════════════════════════════════════════
function setupLightbox() {
  const lb = document.getElementById("lightbox");
  lb?.addEventListener("click", () => lb.classList.add("hidden"));
  document.addEventListener("click", e => {
    const img = e.target.closest("[data-src]");
    if (img?.tagName === "IMG" && img.dataset.src) {
      document.getElementById("lb-img").src = img.dataset.src;
      lb?.classList.remove("hidden");
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════════════════
function startClock() {
  const h = document.getElementById("hour");
  const m = document.getElementById("minute");
  const s = document.getElementById("second");
  const tick = () => {
    const n = new Date();
    h.style.transform = `rotate(${(n.getHours()%12)*30 + n.getMinutes()/2}deg)`;
    m.style.transform = `rotate(${n.getMinutes()*6}deg)`;
    s.style.transform = `rotate(${n.getSeconds()*6}deg)`;
  };
  tick(); setInterval(tick, 1000);
}

function showProgress(title, desc) {
  document.getElementById("progressTitle").textContent = title;
  document.getElementById("progressText").textContent  = desc;
  document.getElementById("progress-dialog").classList.add("show-progress");
}
function finishProgress(ok, msg) {
  document.getElementById("progressTitle").textContent = ok ? "Success ✅" : "Error ❌";
  document.getElementById("progressText").textContent  = msg;
  document.getElementById("progress-card").className   = `progress-card ${ok ? "" : "failed"}`;
  if (ok) setTimeout(() => document.getElementById("progress-dialog").classList.remove("show-progress"), 2000);
}

function showToast(message, type = "info") {
  let c = document.querySelector(".toast-container");
  if (!c) { c = document.createElement("div"); c.className = "toast-container"; document.body.appendChild(c); }
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close">&times;</button>`;
  c.appendChild(t);
  setTimeout(() => { t.classList.add("fade-out"); setTimeout(() => t.remove(), 300); }, 5000);
  t.querySelector(".toast-close").addEventListener("click", () => { t.classList.add("fade-out"); setTimeout(() => t.remove(), 300); });
}

function rToast(el, msg, type) {
  if (!el) return;
  el.textContent = msg; el.className = `r-toast ${type}`; el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 4200);
}

// ══════════════════════════════════════════════════════════════════════════
//  CUSTOM CONFIRM DIALOG
//  Usage: await showConfirm({ title, msg, icon, okLabel, okColor })
//  okColor: "red" (default) | "cyan" | "purple" | "green"
// ══════════════════════════════════════════════════════════════════════════
function showConfirm({ title = "Are you sure?", msg = "This action cannot be undone.", icon = "⚠️", okLabel = "Confirm", okColor = "red" } = {}) {
  return new Promise(resolve => {
    const overlay   = document.getElementById("confirm-overlay");
    const box       = document.getElementById("confirm-box");
    const iconEl    = document.getElementById("confirm-icon");
    const titleEl   = document.getElementById("confirm-title");
    const msgEl     = document.getElementById("confirm-msg");
    const okBtn     = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");

    iconEl.textContent  = icon;
    titleEl.textContent = title;
    msgEl.textContent   = msg;
    okBtn.textContent   = okLabel;

    // reset colour classes then apply chosen
    okBtn.className = "confirm-ok";
    const colorMap = { cyan:"ok-cyan", purple:"ok-purple", green:"ok-green" };
    if (colorMap[okColor]) okBtn.classList.add(colorMap[okColor]);

    // re-trigger animation
    box.style.animation = "none";
    requestAnimationFrame(() => { box.style.animation = ""; });

    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const cleanup = result => {
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onBackdrop);
      resolve(result);
    };

    const onOk      = () => cleanup(true);
    const onCancel  = () => cleanup(false);
    const onBackdrop = e => { if (e.target === overlay) cleanup(false); };

    okBtn.addEventListener("click",     onOk);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click",   onBackdrop);
  });
}