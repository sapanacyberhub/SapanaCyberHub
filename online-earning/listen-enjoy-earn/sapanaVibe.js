import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// ── 🔥 AD SYSTEM ─────────────────────────────────────────

const VIGNETTE_ZONE = "10246448";
const PUSH_ZONE = "10246441";
const VIGNETTE_COOLDOWN = 3 * 60 * 1000;

let lastVignetteTime = 0;
let vignetteLoaded = false;

function loadVignetteScript() {
  if (vignetteLoaded) return;

  const s = document.createElement("script");
  s.dataset.zone = VIGNETTE_ZONE;
  s.src = "https://n6wxm.com/vignette.min.js";
  s.async = true;

  document.body.appendChild(s);
  vignetteLoaded = true;
}

function loadPushScript() {
  const s = document.createElement("script");
  s.dataset.zone = PUSH_ZONE;
  s.src = "https://nap5k.com/tag.min.js";
  s.async = true;

  document.body.appendChild(s);
}

function showVignetteAd() {
  const now = Date.now();

  if (now - lastVignetteTime < VIGNETTE_COOLDOWN) {
    return false;
  }

  try {
    if (typeof window.showVignette === "function") {
      window.showVignette();
    } else if (window.vignette?.show) {
      window.vignette.show();
    }

    lastVignetteTime = now;
    return true;
  } catch (e) {
    console.log("Vignette error:", e);
    return false;
  }
}
export class MusicMarathon {

  constructor({ containerId = "marathon-root", functions } = {}) {
    if (!functions) console.error("[SapanaVibe] `functions` instance is required");
    this._getPlayList = httpsCallable(functions, "getPlayList");
    this._startListeningSession = httpsCallable(functions, "startListeningSession");
    this._completeListeningSession = httpsCallable(functions, "completeListeningSession");
    this._containerId = containerId;
    this._reset();
  }

  mount() {
    const root = document.getElementById(this._containerId);
    if (!root) { console.error(`[SapanaVibe] #${this._containerId} not found`); return; }
    root.innerHTML = this._html();
    this._bindDOM(root);
  }

  async vibeNow(eventId) {
    if (!eventId) { this._toast("Event ID missing", "error"); return; }

    this._eventId = eventId;
    this._ui.shell.classList.add("marathon-active");

    // 🔥 LOAD ADS
    loadVignetteScript();
    loadPushScript();

    // 🎯 SHOW VIGNETTE ON START
    setTimeout(() => {
      showVignetteAd();
    }, 500);

    this._setStatus("Loading playlist…");
    await this._startMarathon();
  }

  // ── state ──────────────────────────────────────────────────────────────────

  _reset() {
    this._eventId = null;
    this._playlist = [];
    this._idx = 0;
    this._sessionId = null;
    this._sessionToken = null;
    this._sessionStarted = false;
    this._seconds = 0;
    this._timerIv = null;
    this._isPlaying = false;
    this._isAdPlaying = false;
    this._isCustomMode = false;
    this._currentVideoId = null;
    this._embedCheckTm = null;
    this._ui = {};

  }

  // ── HTML ───────────────────────────────────────────────────────────────────

  _html() {
    return `
<div class="sv-shell" id="sv-shell">

  <div class="sv-status-bar">
    <span class="sv-dot"></span>
    <span class="sv-status" id="sv-status">Hit Vibe Now to start 🎧</span>
  </div>

  <div class="sv-player-wrap">
    <iframe id="sv-player" src="about:blank" allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
      </iframe>
    <div class="sv-overlay" id="sv-overlay">
      <div class="sv-overlay-icon">🎧</div>
      <div class="sv-overlay-hint">Hit Vibe Now to start listening</div>
    </div>
  </div>

  <div class="sv-tab-banner" id="sv-tab-banner">⏸ Paused — you left the tab</div>

  <div class="sv-info-row">
    <div class="sv-song-meta">
      <div class="sv-song-title" id="sv-song-title">—</div>
      <div class="sv-song-sub"   id="sv-song-sub">No song loaded</div>
    </div>
  </div>

  <div class="sv-controls">
    <!-- custom YT input -->
    <div class="custom-yt-playlist" id="sv-custom-input">
      <input class="c-s" id="c-s" type="text" placeholder="Your Fav YT Vibe Link 🎧" autocomplete="off">
      <img class="c-s-btn" id="c-s-btn"
        src="https://kzrbqsvvauqugmuwxwse.supabase.co/storage/v1/object/public/bucket0001/next-btn.png"
        alt="Play">
    </div>
    <button class="sv-btn sv-btn-save" id="sv-save" title="Save progress">💾 Save</button>
    <button class="sv-btn" id="sv-prev">⏮ Prev</button>
    <button class="sv-btn" id="sv-next">Next ⏭</button>
  </div>

  <div class="sv-playlist" id="sv-playlist">
    <div class="sv-pl-empty">Playlist loads when you Vibe Now 🎵</div>
  </div>

</div>

<style>
.sv-shell{
  --a:#ff6b35;--a2:#ffb347;--bg:#0d0d14;--card:#14141e;
  --bdr:rgba(255,255,255,.08);--txt:#e8e8f0;--mut:rgba(232,232,240,.4);
  --grn:#39d98a;--red:#ff4d6d;--ylw:#ffb347;
  font-family:'Syne',sans-serif;
  background:var(--bg);color:var(--txt);
  border-radius:20px;overflow:hidden;
  width:100%;max-width:560px;margin:0 auto;
  border:1px solid var(--bdr);
  box-shadow:0 24px 64px rgba(0,0,0,.6);
}
.sv-status-bar{
  display:flex;align-items:center;gap:8px;
  padding:9px 16px;background:rgba(255,255,255,.03);
  border-bottom:1px solid var(--bdr);
  font-size:11px;font-family:'DM Mono',monospace;color:var(--mut);
}
.sv-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--mut);flex-shrink:0;transition:background .3s,box-shadow .3s;
}
.marathon-active .sv-dot{background:var(--grn);box-shadow:0 0 8px var(--grn);animation:sv-pulse 2s ease-in-out infinite;}
@keyframes sv-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
.marathon-active .sv-status{color:var(--grn);}
.sv-player-wrap{position:relative;width:100%;padding-top:56.25%;background:#000;}
.sv-player-wrap iframe{position:absolute;inset:0;width:100%;height:100%;border:none;}
.sv-overlay{
  position:absolute;inset:0;z-index:2;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  background:var(--card);transition:opacity .4s;pointer-events:none;
}
.marathon-active .sv-overlay{opacity:0;}
.sv-overlay-icon{font-size:42px;opacity:.35;}
.sv-overlay-hint{font-size:12px;color:var(--mut);font-family:'DM Mono',monospace;}
.sv-tab-banner{
  display:none;align-items:center;justify-content:center;
  padding:7px 16px;background:rgba(255,77,109,.08);
  border-bottom:1px solid rgba(255,77,109,.2);
  font-size:11px;color:var(--red);font-family:'DM Mono',monospace;
}
.sv-shell.tab-hidden .sv-tab-banner{display:flex;}
.sv-info-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--bdr);}
.sv-song-title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sv-song-sub{font-size:11px;color:var(--mut);font-family:'DM Mono',monospace;margin-top:3px;}
.sv-controls{
  display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;
  padding:4px 4px;border-bottom:1px solid var(--bdr);
}
.sv-btn{
  padding:4px 10px;border-radius:50px;border:1px solid var(--bdr);
  background:transparent;color:var(--txt);font-size:12px;
  font-family:'DM Mono',monospace;cursor:pointer;
  display:flex;align-items:center;gap:5px;
  transition:background .2s,transform .1s;white-space:nowrap;
}
.sv-btn:hover:not(:disabled){background:rgba(255,255,255,.06);transform:scale(1.04);}
.sv-btn:disabled{opacity:.3;cursor:not-allowed;}

/* save button — amber accent */
.sv-btn-save{
  border-color:rgba(255,179,71,.3);
  color:var(--ylw);
}
.sv-btn-save:hover:not(:disabled){background:rgba(255,179,71,.08);}
.sv-btn-save.saving{opacity:.5;pointer-events:none;}
.sv-btn-save.saved{border-color:rgba(57,217,138,.3);color:var(--grn);}

/* custom input */
.custom-yt-playlist{
  display:flex;align-items:center;gap:8px;
  width:100%;
  padding:0 0 10px 0;
  border-bottom:1px solid var(--bdr);
  margin-bottom:2px;
}
.c-s{
  flex:1;background:rgba(255,255,255,.05);
  border:1px solid var(--bdr);border-radius:50px;
  padding:9px 16px;color:var(--txt);font-size:12px;
  font-family:'DM Mono',monospace;outline:none;
  transition:border-color .2s;
}
.c-s:focus{border-color:var(--a);}
.c-s::placeholder{color:var(--mut);}


.sv-playlist{max-height:50px;overflow-y:auto;padding:6px 0;}
.sv-playlist::-webkit-scrollbar{width:4px;}
.sv-playlist::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}
.sv-pl-item{display:flex;align-items:center;gap:10px;padding:7px 16px;cursor:pointer;font-size:13px;transition:background .15s;}
.sv-pl-item:hover{background:rgba(255,255,255,.04);}
.sv-pl-item.active{background:rgba(255,107,53,.08);border-left:2px solid var(--a);}
.sv-pl-num{font-family:'DM Mono',monospace;font-size:11px;color:var(--mut);width:20px;text-align:right;flex-shrink:0;}
.sv-pl-thumb{width:48px;height:32px;border-radius:6px;object-fit:cover;background:#1a1a24;flex-shrink:0;}
.sv-pl-title{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sv-pl-now{font-family:'DM Mono',monospace;font-size:10px;color:var(--a);flex-shrink:0;}
.sv-pl-empty{padding:24px 16px;font-size:12px;color:var(--mut);font-family:'DM Mono',monospace;}

.sv-toast-rack{position:fixed;top:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:99999;max-width:300px;}
.sv-toast{
  background:#14141e;border:1px solid rgba(255,255,255,.08);border-radius:12px;
  padding:12px 16px;font-size:13px;
  display:flex;flex-direction:column;gap:10px;
  box-shadow:0 8px 24px rgba(0,0,0,.4);
  animation:sv-tin .25s cubic-bezier(.34,1.56,.64,1);
}
.sv-toast-top{display:flex;align-items:flex-start;gap:8px;}
.sv-toast.success{border-color:rgba(57,217,138,.3);}
.sv-toast.error{border-color:rgba(255,77,109,.3);}
.sv-toast.warn{border-color:rgba(255,179,71,.3);}
.sv-toast-actions{display:flex;gap:8px;flex-wrap:wrap;}
.sv-toast-actions button{
  flex:1;padding:7px 12px;border-radius:50px;font-size:11px;cursor:pointer;
  font-family:'DM Mono',monospace;border:1px solid var(--bdr);
  background:transparent;color:var(--txt);transition:background .2s;
}
.sv-toast-actions button:hover{background:rgba(255,255,255,.08);}
.sv-toast-actions button.primary{background:linear-gradient(135deg,var(--a),var(--a2));border:none;color:#fff;}
@keyframes sv-tin{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
</style>`;
  }

  // ── bind DOM ───────────────────────────────────────────────────────────────

  _bindDOM(root) {
    this._ui = {
      shell: root.querySelector("#sv-shell"),
      status: root.querySelector("#sv-status"),
      overlay: root.querySelector("#sv-overlay"),
      songTitle: root.querySelector("#sv-song-title"),
      songSub: root.querySelector("#sv-song-sub"),
      playlist: root.querySelector("#sv-playlist"),
      btnSave: root.querySelector("#sv-save"),
      btnPrev: root.querySelector("#sv-prev"),
      btnNext: root.querySelector("#sv-next"),
      customInput: root.querySelector("#c-s"),
      customBtn: root.querySelector("#c-s-btn"),
    };

    this._ui.btnPrev.addEventListener("click", () => this._skipSong(-1));
    this._ui.btnNext.addEventListener("click", () => this._skipSong(1));

    // ── 💾 SAVE button ───────────────────────────────────────────────────────
    this._ui.btnSave.addEventListener("click", () => this._manualSave());

    // ── custom URL input ─────────────────────────────────────────────────────
    const playCustom = () => {
      if (!this._eventId) {
        this._toast("Please open your join list and select an active event to vibe first 🎧", "warn");
        return;
      }
      const val = this._ui.customInput?.value?.trim();
      if (!val) return;
      const videoId = this._parseYouTubeId(val);
      if (!videoId) { this._toast("Not a valid YouTube link", "error"); return; }
      this._playCustomVideo(videoId);
    };

    this._ui.customBtn?.addEventListener("click", playCustom);
    this._ui.customInput?.addEventListener("keydown", e => { if (e.key === "Enter") playCustom(); });

    // ── tab hidden → pause ───────────────────────────────────────────────────
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this._sendCmd("pauseVideo");
        this._stopTimer();
        this._isPlaying = false;
        this._ui.shell?.classList.add("tab-hidden");
        this._setStatus("⏸ Paused — tab hidden");
        this._heroState(false);
      } else {
        this._ui.shell?.classList.remove("tab-hidden");
        this._setStatus("Tab back — click video to continue");
      }
    });

    // ── postMessage from YT embed ────────────────────────────────────────────
    window.addEventListener("message", e => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.event === "initialDelivery" || msg.event === "onReady") {
          this._sendCmd("addEventListener", "onStateChange");
          return;
        }

        if (msg.event === "onError") {
          clearTimeout(this._embedCheckTm);
          if (msg.info === 101 || msg.info === 150) this._handleEmbedBlocked();
          return;
        }

        // ── AD STATE ─────────────────────────────────────────────────────────────
        if (msg.event === "onAdStateChange") {
          const adState = msg.info?.playerAdState ?? msg.info;
          console.log("[SapanaVibe] ad state:", adState);

          const adPlaying = (
            adState === "AD_STATE_PLAYING" ||   // string form
            adState === 1                         // numeric form
          );
          const adEnded = (
            adState === "AD_STATE_COMPLETE" ||
            adState === "AD_STATE_STOPPED" ||
            adState === 0 ||
            adState === 5
          );

          if (adPlaying) {
            this._stopTimer();
            this._heroState(false);
            this._setStatus("⏸ Ad playing — timer paused");
            this._isAdPlaying = true;
          }

          if (adEnded && this._isAdPlaying) {
            this._isAdPlaying = false;
            this._setStatus("▶ Ad done — resuming…");
            // YT will fire state 1 (PLAYING) again — timer restarts there naturally
          }
          return;
        }

        if (msg.event !== "onStateChange") return;

        const state = msg.info;

        if (state === 1) {
          // if ad just ended and video resumes, this fires — safe to start timer
          clearTimeout(this._embedCheckTm);
          this._isAdPlaying = false;          // ← clear ad flag on any PLAYING
          this._startTimer();
          this._isPlaying = true;
          this._setStatus(`▶ ${this._ui.songTitle?.textContent || "—"}`);
          this._heroState(true);
          if (!this._sessionStarted && this._eventId && this._currentVideoId) {
            this._sessionStarted = true;
            this._beginSession(this._currentVideoId);
          }
        }
        if (state === 2) { this._stopTimer(); this._isPlaying = false; this._setStatus("⏸ Paused"); this._heroState(false); }
        if (state === 3) { this._stopTimer(); this._setStatus("Buffering…"); this._heroState(false); }
        if (state === -1) { this._stopTimer(); this._setStatus("Loading…"); this._heroState(false); }
        if (state === 0) {
          this._stopTimer(); this._isPlaying = false; this._heroState(false);
          if (this._isCustomMode) this._exitCustomMode(); else this._onSongEnd();
        }

      } catch { }
    });
  }

  // ── 💾 manual save ─────────────────────────────────────────────────────────

  async _manualSave() {
    const MIN_SEC = 60;

    if (!this._sessionId || !this._sessionToken) {
      this._toast("Nothing to save yet — start listening first", "info");
      return;
    }

    if (this._seconds < MIN_SEC) {
      this._toast(`Listen at least ${MIN_SEC}s to save. You've got ${this._seconds}s so far ⏱`, "warn");
      return;
    }

    const btn = this._ui.btnSave;
    btn?.classList.add("saving");
    btn && (btn.textContent = "💾 Saving…");

    try {
      await this._completeListeningSession({
        sessionId: this._sessionId,
        sessionToken: this._sessionToken,
      });

      this._toast(`✅ ${this._seconds}s saved!`, "success");

      // reset session so a new one starts on next PLAYING event
      this._sessionId = null;
      this._sessionToken = null;
      this._sessionStarted = false;

      btn?.classList.remove("saving");
      btn?.classList.add("saved");
      btn && (btn.textContent = "✅ Saved");
      setTimeout(() => {
        btn?.classList.remove("saved");
        btn && (btn.textContent = "💾 Save");
      }, 2500);

    } catch (err) {
      const code = err?.code?.replace("functions/", "");
      const msg = code === "failed-precondition"
        ? `Need at least 60s — you have ${this._seconds}s`
        : "Save failed — try again";
      this._toast(msg, "error");
      btn?.classList.remove("saving");
      btn && (btn.textContent = "💾 Save");
    }
  }

  // ── custom video ───────────────────────────────────────────────────────────

  _parseYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  async _playCustomVideo(videoId) {
    this._isCustomMode = true;
    this._ui.shell.classList.add("marathon-active");

    if (this._ui.customInput) this._ui.customInput.value = "";
    if (this._ui.customBtn) this._ui.customBtn.classList.add("loading");

    // complete old session before starting new video
    await this._completeSession();

    // ← reset session state so new session can begin on PLAYING
    this._sessionStarted = false;
    this._sessionId = null;
    this._sessionToken = null;
    this._currentVideoId = videoId;    // ← set so _beginSession knows what to pass
    this._seconds = 0;
    this._updateTimerUI();

    if (this._ui.songTitle) this._ui.songTitle.textContent = "Custom Vibe 🎧";
    if (this._ui.songSub) this._ui.songSub.textContent = `youtube.com/watch?v=${videoId}`;
    this._setStatus("Loading your vibe…");

    this._loadIframe(videoId);

    if (this._ui.customBtn) this._ui.customBtn.classList.remove("loading");
  }

  _handleEmbedBlocked() {
    this._stopTimer();
    this._isPlaying = false;
    this._heroState(false);
    this._setStatus("⚠️ Video not embeddable");

    const iframe = document.getElementById("sv-player");
    if (iframe) iframe.src = "about:blank";

    this._toastWithActions(
      "😔 Sorry, this video doesn't support embed mode.",
      [
        { label: "Close", action: () => { this._isCustomMode = false; } },
        ...(this._playlist.length ? [{
          label: "▶ Continue Playlist",
          primary: true,
          action: () => { this._isCustomMode = false; this._loadSong(this._idx + 1); }
        }] : [])
      ],
      "warn"
    );
  }

  _exitCustomMode() {
    this._isCustomMode = false;
    if (this._playlist.length) this._loadSong(this._idx);
  }

  // ── iframe loader ──────────────────────────────────────────────────────────

  _loadIframe(videoId) {
    const iframe = document.getElementById("sv-player");
    if (!iframe) return;

    iframe.addEventListener("load", () => {
      // handshake — starts postMessage events from YT
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), "*");

      // subscribe to ad state changes
      iframe.contentWindow?.postMessage(JSON.stringify({
        event: "command",
        func: "addEventListener",
        args: ["onAdStateChange"]
      }), "*");

      clearTimeout(this._embedCheckTm);
      this._embedCheckTm = setTimeout(() => {
        if (!this._isPlaying) this._handleEmbedBlocked();
      }, 5000);
    }, { once: true });

    // no restrictive params — lets YT run ads freely
    iframe.src = `https://www.youtube.com/embed/${videoId}`
      + `?autoplay=1`
      + `&rel=0`
      + `&enablejsapi=1`
      + `&origin=${location.origin}`;
  }

  // ── hero girl + ring ───────────────────────────────────────────────────────

  _heroState(active) {
    document.getElementById("floatingGirl")?.classList.toggle("girlActive", active);
    document.getElementById("audio-ring")?.classList.toggle("active-audio", active);
  }

  // ── marathon ───────────────────────────────────────────────────────────────

  async _startMarathon() {
    this._setStatus("Fetching playlist…");
    this._disableControls(true);
    try {
      const res = await this._getPlayList();
      const songs = Array.isArray(res?.data?.data) ? res.data.data : [];
      if (!songs.length) {
        this._setStatus("Playlist is empty");
        this._toast("No songs in playlist 🎧", "info");
        this._disableControls(false);
        return;
      }
      this._playlist = songs.map(s => ({
        youtubeId: s.youtubeId || s.videoId || s.ytId || s.id,
        title: s.title || s.songTitle || s.name || s.youtubeId || s.id,
      }));
      this._idx = 0;
      this._renderPlaylist();
    } catch (err) {
      console.error("[SapanaVibe] getPlayList:", err);
      this._toast("Could not load playlist", "error");
      this._setStatus("Playlist load failed");
      this._disableControls(false);
      return;
    }
    await this._loadSong(this._idx);
    this._disableControls(false);
  }

  // ── load playlist song ─────────────────────────────────────────────────────

  async _loadSong(idx) {
    const song = this._playlist[idx];
    if (!song?.youtubeId) return;

    this._isCustomMode = false;
    this._idx = idx;
    this._sessionStarted = false;
    this._sessionId = null;
    this._sessionToken = null;
    this._currentVideoId = song.youtubeId;    // ← track active video
    this._seconds = 0;
    this._updateTimerUI();

    if (this._ui.songTitle) this._ui.songTitle.textContent = song.title || song.youtubeId;
    if (this._ui.songSub) this._ui.songSub.textContent = `Track ${idx + 1} of ${this._playlist.length}`;
    this._highlightPlaylistItem(idx);
    this._setStatus(`Loading: ${song.title || song.youtubeId}`);

    this._loadIframe(song.youtubeId);
  }

  // ── session ────────────────────────────────────────────────────────────────

  async _beginSession(videoId) {
    if (!videoId || !this._eventId) return;
    try {
      const res = await this._startListeningSession({ videoId, eventId: this._eventId });
      this._sessionId = res?.data?.sessionId || null;
      this._sessionToken = res?.data?.sessionToken || null;
      console.log("[SapanaVibe] session started:", this._sessionId, "video:", videoId);
    } catch (err) {
      console.error("[SapanaVibe] startListeningSession:", err);
      this._toast("Session start failed", "error");
      this._sessionStarted = false;   // allow retry on next play
    }
  }

  async _onSongEnd() {
    this._setStatus("Song ended — saving progress…");

    await this._completeSession();

    // 🚫 don't run ads in background
    if (!document.hidden) {

      // 🔄 refresh push every song
      loadPushScript();

      // 🎯 try vignette (3 min cooldown applied)
      const adShown = showVignetteAd();

      // ⏳ wait 2 sec if ad triggered
      if (adShown) {
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    await this._playNext();
  }

  async _completeSession() {
    if (!this._sessionId || !this._sessionToken) return;
    try {
      await this._completeListeningSession({
        sessionId: this._sessionId,
        sessionToken: this._sessionToken,
      });
      console.log("[SapanaVibe] session completed:", this._sessionId);
    } catch (err) {
      const code = err?.code?.replace("functions/", "");
      if (code === "failed-precondition") this._toast("Not enough listen time", "info");
      else console.error("[SapanaVibe] completeListeningSession:", err);
    } finally {
      this._sessionId = null;
      this._sessionToken = null;
    }
  }

  // ── navigation ─────────────────────────────────────────────────────────────

  async _playNext() {
    if (!this._playlist.length) return;
    await this._loadSong((this._idx + 1) % this._playlist.length);
  }

  async _skipSong(dir) {
    if (!this._playlist.length) return;
    await this._completeSession();
    await this._loadSong((this._idx + dir + this._playlist.length) % this._playlist.length);
  }

  // ── postMessage to iframe ──────────────────────────────────────────────────

  _sendCmd(fn, arg) {
    const iframe = document.getElementById("sv-player");
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: fn, args: arg ? [arg] : [] }),
      "*"
    );
  }

  // ── timer ──────────────────────────────────────────────────────────────────

  _startTimer() {
    if (this._timerIv) return;
    this._timerIv = setInterval(() => { this._seconds++; this._updateTimerUI(); }, 1000);
  }

  _stopTimer() {
    clearInterval(this._timerIv);
    this._timerIv = null;
  }

  _updateTimerUI() {
    const h = String(Math.floor(this._seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((this._seconds % 3600) / 60)).padStart(2, "0");
    const s = String(this._seconds % 60).padStart(2, "0");
    const heroTimer = document.getElementById("accumulated-timmer");
    if (heroTimer) {
      heroTimer.innerHTML = `${h}:${m}:${s} <strong>• SapanaCyberHub X Listen</strong>`;
    }
  }

  // ── playlist UI ────────────────────────────────────────────────────────────

  _renderPlaylist() {
    const el = this._ui.playlist;
    if (!el) return;
    el.innerHTML = "";
    this._playlist.forEach((song, i) => {
      const item = document.createElement("div");
      item.className = "sv-pl-item";
      item.innerHTML = `
        <span class="sv-pl-num">${i + 1}</span>
        <img class="sv-pl-thumb" src="https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg"
          loading="lazy" onerror="this.style.opacity='.2'">
        <span class="sv-pl-title">${song.title || song.youtubeId}</span>
        <span class="sv-pl-now" style="display:none">▶</span>`;
      item.addEventListener("click", async () => {
        await this._completeSession();
        await this._loadSong(i);
      });
      el.appendChild(item);
    });
    this._highlightPlaylistItem(this._idx);
  }

  _highlightPlaylistItem(idx) {
    this._ui.playlist?.querySelectorAll(".sv-pl-item").forEach((el, i) => {
      el.classList.toggle("active", i === idx);
      const nowEl = el.querySelector(".sv-pl-now");
      if (nowEl) nowEl.style.display = i === idx ? "inline" : "none";
    });
  }

  _setStatus(msg) { if (this._ui.status) this._ui.status.textContent = msg; }

  _disableControls(on) {
    [this._ui.btnPrev, this._ui.btnNext, this._ui.btnSave]
      .forEach(b => { if (b) b.disabled = on; });
  }

  _toast(msg, type = "info") { this._toastWithActions(msg, [], type); }

  _toastWithActions(msg, actions = [], type = "info") {
    let rack = document.querySelector(".sv-toast-rack");
    if (!rack) {
      rack = document.createElement("div");
      rack.className = "sv-toast-rack";
      document.body.appendChild(rack);
    }
    const icons = { success: "✅", error: "❌", info: "ℹ️", warn: "⚠️" };
    const t = document.createElement("div");
    t.className = `sv-toast ${type}`;
    const top = document.createElement("div");
    top.className = "sv-toast-top";
    top.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
    t.appendChild(top);
    if (actions.length) {
      const btnRow = document.createElement("div");
      btnRow.className = "sv-toast-actions";
      actions.forEach(a => {
        const btn = document.createElement("button");
        btn.textContent = a.label;
        if (a.primary) btn.classList.add("primary");
        btn.addEventListener("click", () => { a.action(); t.remove(); });
        btnRow.appendChild(btn);
      });
      t.appendChild(btnRow);
    }
    rack.appendChild(t);
    if (!actions.length) {
      setTimeout(() => {
        t.style.cssText += ";opacity:0;transition:opacity .3s";
        setTimeout(() => t.remove(), 320);
      }, 4000);
    }
  }
}