import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ── Firebase ───────────────────────────────────────────────
const app = initializeApp({
    apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
    authDomain: "sapanacyberhub-26310.firebaseapp.com",
    projectId: "sapanacyberhub-26310",
    storageBucket: "sapanacyberhub-26310.firebasestorage.app",
    messagingSenderId: "448116453690",
    appId: "1:448116453690:web:01a91dd284b715bf0a2003",
    measurementId: "G-HKGQ8D55N1",
});
const db = getFirestore(app);
const auth = getAuth(app);

// ── State ──────────────────────────────────────────────────
let allTickets = [];
let activeFilter = "all";
let currentUser = null;
let ticketsLoaded = false;
let priority = "low";

// ── Helpers ───────────────────────────────────────────────
const genId = () => "SCH-" + Math.floor(10000 + Math.random() * 90000);
const fmt = ts => { if (!ts) return "—"; const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };
const fmtFull = ts => { if (!ts) return "—"; const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };

const CAT = { account: "Account Issue", withdrawal: "Withdrawal", ads: "Ads / Earnings", bug: "Bug Report", partnership: "Partnership" };
const PRI_CLS = { low: "pri-low", normal: "pri-normal", urgent: "pri-urgent" };
const PRI_ICO = { low: "🟢", normal: "🟡", urgent: "🔴" };

const sHTML = s => ({
    open: `<span class="status-badge status-open"><span class="sdot"></span>Open</span>`,
    replied: `<span class="status-badge status-replied"><span class="sdot"></span>Replied</span>`,
    closed: `<span class="status-badge status-closed"><span class="sdot"></span>Closed</span>`,
}[s] || `<span class="status-badge status-open"><span class="sdot"></span>Open</span>`);

// ── User-scoped collection path ────────────────────────────
const userTicketCol = uid =>
    collection(db, "SapanaCyberHub", "Listen", "user", uid, "SupportTickets");

// Global collection path (admin reads this)
// SupportTickets
const globalTicketCol = () => collection(db, "SupportTickets");

// ── Tab switching ──────────────────────────────────────────
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab,.panel").forEach(el => el.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
        if (btn.dataset.tab === "history" && currentUser && !ticketsLoaded)
            loadTickets(currentUser.uid);
    });
});

// back to listen 
const back = document.querySelector(".back");

if (back) {
    back.addEventListener("click", () => {
        window.location.href = "/online-earning/listen-enjoy-earn/index.html";
    });
}

// ── Priority pills ─────────────────────────────────────────
document.querySelectorAll(".pill").forEach(p => {
    p.addEventListener("click", () => {
        document.querySelectorAll(".pill").forEach(x => x.classList.remove("active"));
        p.classList.add("active");
        priority = p.dataset.priority;
    });
});

// ── Filter pills ───────────────────────────────────────────
document.querySelectorAll(".filter-pill").forEach(p => {
    p.addEventListener("click", () => renderList(p.dataset.filter));
});

// ── Auth ───────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
    currentUser = user;
    if (user) {
        const ini = (user.displayName || user.email || "U")
            .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        document.getElementById("user-avatar").textContent = ini;
        document.getElementById("user-label").textContent = user.displayName || user.email.split("@")[0];
        document.getElementById("email").value = user.email;
        document.getElementById("auth-gate").style.display = "none";
        document.getElementById("history-content").style.display = "block";
    } else {
        document.getElementById("user-avatar").textContent = "?";
        document.getElementById("user-label").textContent = "Not signed in";
        document.getElementById("auth-gate").style.display = "block";
        document.getElementById("history-content").style.display = "none";
    }
});

// ══════════════════════════════════════════════════════════
//  CREATE TICKET
//  Writes to TWO paths simultaneously:
//  1. SupportTickets/            ← global (admin reads)
//  2. SapanaCyberHub/Listen/user/{uid}/Support/tickets  ← user reads own
// ══════════════════════════════════════════════════════════
document.getElementById("ticketForm").addEventListener("submit", async e => {
    e.preventDefault();

    if (!currentUser) {
        document.getElementById("create-status").innerHTML =
            `<div class="s-err">❌ Please sign in first to create a ticket.</div>`;
        return;
    }

    const btn = document.getElementById("submitBtn");
    const statusEl = document.getElementById("create-status");
    btn.classList.add("loading");
    statusEl.innerHTML = "";

    const ticketId = genId();
    const payload = {
        ticketId,
        uid: currentUser.uid,
        email: document.getElementById("email").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        message: document.getElementById("message").value.trim(),
        category: document.getElementById("category").value,
        priority,
        status: "open",
        createdAt: serverTimestamp(),
    };

    try {
        // Write to both paths at the same time
        await Promise.all([
            addDoc(globalTicketCol(), payload),   // 1️⃣ global — admin sees all
            addDoc(userTicketCol(currentUser.uid), payload),  // 2️⃣ user-scoped — user reads own
        ]);

        statusEl.innerHTML = `
      <div class="s-ok">
        <span>✅ Ticket created successfully!</span>
        <span class="tid">ID: ${ticketId}</span>
        <span style="font-size:.74rem;opacity:.7">Save this ID to track your request</span>
      </div>`;

        e.target.reset();
        document.getElementById("email").value = currentUser.email;
        document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
        document.querySelector('[data-priority="low"]').classList.add("active");
        priority = "low";

        // invalidate history cache
        ticketsLoaded = false;
        document.getElementById("tab-count").textContent = "↺";

    } catch (err) {
        console.error("createTicket:", err);
        statusEl.innerHTML = `<div class="s-err">❌ Failed to create ticket. Please try again.</div>`;
    } finally {
        btn.classList.remove("loading");
    }
});

// ══════════════════════════════════════════════════════════
//  LOAD TICKETS
//  Reads ONLY from SapanaCyberHub/Listen/user/{uid}/Support/tickets
//  No where() — no index needed — only this user's own docs
// ══════════════════════════════════════════════════════════
async function loadTickets(uid) {
    document.getElementById("skeletons").style.display = "block";
    document.getElementById("ticket-list").innerHTML = "";
    try {

        const snap = await getDocs(userTicketCol(uid));

        allTickets = snap.docs
            .map(d => ({ _id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        ticketsLoaded = true;
        document.getElementById("skeletons").style.display = "none";
        renderStats();
        renderList(activeFilter);
        document.getElementById("tab-count").textContent = allTickets.length;

    } catch (err) {
        console.error("loadTickets:", err);
        document.getElementById("skeletons").style.display = "none";
        document.getElementById("ticket-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load tickets</h3>
        <p>Please refresh and try again.</p>
      </div>`;
    }
}

// ── Stats ──────────────────────────────────────────────────
function renderStats() {
    const total = allTickets.length;
    const open = allTickets.filter(t => t.status === "open").length;
    const replied = allTickets.filter(t => t.status === "replied").length;
    const closed = allTickets.filter(t => t.status === "closed").length;
    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-open").textContent = open;
    document.getElementById("stat-replied").textContent = replied;
    document.getElementById("cnt-all").textContent = total;
    document.getElementById("cnt-open").textContent = open;
    document.getElementById("cnt-replied").textContent = replied;
    document.getElementById("cnt-closed").textContent = closed;
}

// ── Render list ────────────────────────────────────────────
function renderList(filter) {
    activeFilter = filter;
    document.querySelectorAll(".filter-pill").forEach(p =>
        p.classList.toggle("active", p.dataset.filter === filter));

    const list = document.getElementById("ticket-list");
    list.innerHTML = "";
    const rows = filter === "all" ? allTickets : allTickets.filter(t => t.status === filter);

    if (!rows.length) {
        const ico = { all: "📭", open: "🟡", replied: "✅", closed: "⚫" }[filter] || "📭";
        list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ico}</div>
        <h3>${filter === "all" ? "No tickets yet" : `No ${filter} tickets`}</h3>
        <p>${filter === "all"
                ? "Create your first ticket from the New Ticket tab."
                : `You have no ${filter} tickets right now.`}</p>
      </div>`;
        return;
    }

    rows.forEach((ticket, i) => {
        const card = document.createElement("div");
        card.className = "ticket-card";
        card.style.animationDelay = `${i * 0.055}s`;
        card.style.setProperty("--accent-color",
            ticket.status === "replied" ? "#34d399" :
                ticket.status === "closed" ? "#94a3b8" :
                    ticket.priority === "urgent" ? "#f87171" : "var(--pink)"
        );
        const hasNew = ticket.status === "replied" && !ticket.seenByUser;
        card.innerHTML = `
      ${hasNew ? `<div class="new-dot" title="New reply from support"></div>` : ""}
      <div class="t-header">
        <span class="ticket-id-badge">${ticket.ticketId || ticket._id}</span>
        ${sHTML(ticket.status || "open")}
      </div>
      <div class="t-subject">${ticket.subject || "No subject"}</div>
      <div class="t-meta">
        <span>🗂️ ${CAT[ticket.category] || ticket.category || "—"}</span>
        <span>📅 ${fmt(ticket.createdAt)}</span>
      </div>
      <div class="t-preview">${ticket.message || ""}</div>
      <div class="t-footer">
        <span class="pri-tag ${PRI_CLS[ticket.priority] || ""}">
          ${PRI_ICO[ticket.priority] || ""} ${ticket.priority || "normal"}
        </span>
        <span class="view-btn">View details →</span>
      </div>`;
        card.addEventListener("click", () => openDlg(ticket));
        list.appendChild(card);
    });
}

// ══════════════════════════════════════════════════════════
//  DIALOG
// ══════════════════════════════════════════════════════════
const dlgEl = document.getElementById("dlg");
const dlgBody = document.getElementById("dlg-body");

function openDlg(t) {
    document.getElementById("dlg-id").textContent = t.ticketId || t._id;
    document.getElementById("dlg-title").textContent = t.subject || "No subject";
    document.getElementById("dlg-status").innerHTML = sHTML(t.status || "open");
    document.getElementById("dlg-cat").textContent = CAT[t.category] || t.category || "—";
    document.getElementById("dlg-date").textContent = fmt(t.createdAt);
    dlgBody.innerHTML = "";

    // ── Info grid ──────────────────────────────────────────
    const info = document.createElement("div");
    info.innerHTML = `
    <div class="sec-label">Ticket Info</div>
    <div class="d-grid">
      <div class="d-item">
        <div class="d-label">Status</div>
        <div class="d-val">${sHTML(t.status || "open")}</div>
      </div>
      <div class="d-item">
        <div class="d-label">Priority</div>
        <div class="d-val">${PRI_ICO[t.priority] || "🟡"} ${(t.priority || "normal")[0].toUpperCase() + (t.priority || "normal").slice(1)}</div>
      </div>
      <div class="d-item">
        <div class="d-label">Category</div>
        <div class="d-val">${CAT[t.category] || t.category || "—"}</div>
      </div>
      <div class="d-item">
        <div class="d-label">Submitted</div>
        <div class="d-val">${fmtFull(t.createdAt)}</div>
      </div>
    </div>`;
    dlgBody.appendChild(info);

    // ── Conversation ───────────────────────────────────────
    const ini = (currentUser?.displayName || currentUser?.email || "U")
        .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const conv = document.createElement("div");

    let html = `
    <div class="sec-label">Conversation</div>
    <div class="thread">
      <div class="msg u">
        <div class="m-av">${ini}</div>
        <div class="m-bub">
          <div class="m-who">You</div>
          ${t.message || ""}
          <div class="m-time">${fmtFull(t.createdAt)}</div>
        </div>
      </div>`;

    if (t.reply) {
        // staff replied
        html += `
      <div class="msg s">
        <div class="m-av">S</div>
        <div class="m-bub">
          <div class="m-who">Support Team</div>
          ${t.reply}
          <div class="m-time">${fmtFull(t.repliedAt)}</div>
        </div>
      </div>`;
    } else if (t.status !== "closed") {
        // no reply yet
        html += `
      <div class="no-reply">
        <div class="ico">⏳</div>
        <p>No response yet.<br>We typically reply within <strong>24 hours</strong>.</p>
      </div>`;
    }

    html += `</div>`;
    conv.innerHTML = html;
    dlgBody.appendChild(conv);

    dlgEl.classList.add("open");
    document.body.style.overflow = "hidden";
}

const closeDlg = () => {
    dlgEl.classList.remove("open");
    document.body.style.overflow = "";
};

document.getElementById("dlg-bg").addEventListener("click", closeDlg);
document.getElementById("dlg-x").addEventListener("click", closeDlg);
document.getElementById("dlg-close-foot").addEventListener("click", closeDlg);
document.getElementById("dlg-new-ticket").addEventListener("click", () => {
    closeDlg();
    document.querySelector('[data-tab="create"]').click();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDlg(); });


//   < !--Particles -->
const pc = document.getElementById("particles");
for (let i = 0; i < 45; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const s = Math.random() * 2.5 + 1;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;--dur:${(Math.random() * 5 + 3).toFixed(1)}s;--delay:-${(Math.random() * 8).toFixed(1)}s;--op:${(Math.random() * .28 + .08).toFixed(2)};`;
    pc.appendChild(p);
}