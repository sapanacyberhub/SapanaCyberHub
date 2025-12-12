/* ======================== FILE: listen.js ======================== */
// SAME LOGIC FROM CANVAS — CLEAN SPLIT VERSION

const SAMPLE_VIDEO = '';
let player=null, timerInterval=null, totalSeconds=0, manualPause=false;

const demoEvents={
  daily:[{id:'D1',title:'Morning Chill',thumb:'https://picsum.photos/seed/a/300/200',from:'2025-12-09',to:'2025-12-10',prize:200}],
  twoDays:[{id:'2D1',title:'Weekend Groove',thumb:'https://picsum.photos/seed/c/300/200',from:'2025-12-07',to:'2025-12-09',prize:1200}],
  threeDays:[{id:'3D1',title:'Deep Focus',thumb:'https://picsum.photos/seed/d/300/200',from:'2025-12-01',to:'2025-12-04',prize:3000}]
};

function renderEventCards(){
  const m= e=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML=`<div class="thumb" style="background-image:url('${e.thumb}')"></div>
      <div class="meta"><div style="display:flex;justify-content:space-between">
        <div style="font-weight:700">${e.title}</div><div class="tag-neon">₹${e.prize}</div></div>
        <div style="font-size:13px;color:var(--muted);margin-top:6px">${e.from} → ${e.to}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="cta" onclick="joinEvent('${e.id}')">Join</div>
        <div class="cta" onclick="viewDetails('${e.id}')">Details</div></div>`;
    return d;
  }
  demoEvents.daily.forEach(e=>dailyCards.appendChild(m(e)));
  demoEvents.twoDays.forEach(e=>twoDaysCards.appendChild(m(e)));
  demoEvents.threeDays.forEach(e=>threeDaysCards.appendChild(m(e)));
}

function joinEvent(id){ console.log('JOIN',id); alert('Joined '+id); }
function viewDetails(id){ alert('Details '+id); }

function onYouTubeIframeAPIReady(){
  player=new YT.Player('ytplayer',{height:'240',width:'100%',videoId:extractId(SAMPLE_VIDEO),
    events:{onStateChange:onPlayerStateChange,onReady:onPlayerReady}});
}
function onPlayerReady(){ quickLoad.onclick=()=>loadAndPlay(SAMPLE_VIDEO); }
function extractId(u){const r=/v=([a-zA-Z0-9_-]{11})|youtu.be\/([a-zA-Z0-9_-]{11})/;const m=u.match(r);return m?m[1]||m[2]:null}
function loadAndPlay(url){const id=extractId(url); if(!id)return alert('Bad URL'); player.loadVideoById(id); totalSeconds=0; update(); mood('playing');}

function onPlayerStateChange(e){
  const s=e.data;
  if(s===YT.PlayerState.PLAYING){start(); manualPause=false; mood('playing');}
  else if(s===YT.PlayerState.PAUSED){manualPause=true; stop(); mood('paused'); setTimeout(()=>{if(player.getPlayerState()===2){ if(confirm('Save progress?')) save();}},600);} 
  else if(s===YT.PlayerState.BUFFERING){stop(); mood('buffering');}
  else if(s===YT.PlayerState.ENDED){stop(); mood('ended');}
}

function start(){if(timerInterval)return; timerInterval=setInterval(()=>{totalSeconds++; update();},1000); saveBtn.style.display='inline-flex';}
function stop(){clearInterval(timerInterval); timerInterval=null}
function update(){timer.textContent=`${String(Math.floor(totalSeconds/60)).padStart(2,'0')}:${String(totalSeconds%60).padStart(2,'0')}`}

function mood(s){const d=moodDot,t=moodText;
  if(s==='playing'){d.style.background='lime'; t.textContent='vibing'; avatarImg.style.filter='none'}
  else if(s==='paused'){d.style.background='crimson'; t.textContent='paused'}
  else if(s==='buffering'){d.style.background='orange'; t.textContent='buffering'}
  else if(s==='ended'){d.style.background='deepskyblue'; t.textContent='ended'}
  else{d.style.background='crimson'; t.textContent='idle'}
}

function save(){console.log('Saving',totalSeconds); alert('Saved (console).')}

window.addEventListener('offline',()=>{stop(); mood('buffering'); alert('Offline — timer paused')});
window.addEventListener('visibilitychange',()=>{if(document.hidden && player.getPlayerState()===1) player.pauseVideo()});

renderEventCards(); mood('idle'); saveBtn.onclick=save;

/* END listen.js */