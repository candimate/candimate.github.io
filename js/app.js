/* ════════════════════════════════════
   app.js — Album page logic
   Reads id=album-id from URL, loads that album only
   ════════════════════════════════════ */

/* ── STATE ── */
let PHOTOS     = [];   // current album photos
let filtered   = [];
let currentIdx = 0;

/* ── INIT: load album from URL param ── */
(function init() {
  const id = new URLSearchParams(location.search).get('id');
  const albumDef = (typeof ALBUMS !== 'undefined') ? ALBUMS.find(a => a.id === id) : null;

  if (!albumDef) return; // not on album page

  // Set page title + header
  document.title = albumDef.title + ' — Candimate';
  const titleEl = document.getElementById('album-title');
  const dateEl  = document.getElementById('album-date');
  if (titleEl) titleEl.textContent = albumDef.emoji + ' ' + albumDef.title;
  if (dateEl)  dateEl.textContent  = albumDef.date;

  // Fetch photos
  fetch(albumDef.jsonUrl)
    .then(r => r.json())
    .then(data => {
      PHOTOS   = extractPhotos(data);
      filtered = [...PHOTOS];
      const countEl = document.getElementById('total-count');
      if (countEl) countEl.textContent = PHOTOS.length;
      renderGallery(PHOTOS);
      buildSuggestions();
    })
    .catch(() => {
      const empty = document.getElementById('empty');
      if (empty) { empty.style.display = 'block'; empty.textContent = 'Không thể tải ảnh 😔'; }
    });
})();

function extractPhotos(data) {
  if (!data) return [];
  if (Array.isArray(data) && data[0]?.photos) return data[0].photos;
  if (!Array.isArray(data) && data.photos)    return data.photos;
  if (Array.isArray(data))                     return data;
  return [];
}

/* ── GALLERY RENDER ── */
function renderGallery(photos) {
  const gallery = document.getElementById('gallery');
  const empty   = document.getElementById('empty');
  if (!gallery) return;
  gallery.innerHTML = '';
  if (!photos.length) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  photos.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.style.animationDelay = `${Math.min(i * 0.04, 0.6)}s`;
    card.innerHTML = `<img src="${img.url}" alt="${img.name}" loading="lazy"/>
      <div class="overlay"><span class="photo-name">${img.name}</span></div>`;
    card.addEventListener('click', () => { filtered = photos; currentIdx = i; openLb(); });
    gallery.appendChild(card);
  });
}

/* ── LIGHTBOX ── */
function openLb() {
  updateLb();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
function navLb(dir) {
  currentIdx = (currentIdx + dir + filtered.length) % filtered.length;
  updateLb();
}
function updateLb() {
  const img = filtered[currentIdx];
  const el  = document.getElementById('lb-img');
  el.classList.remove('zoomed');
  const zb = document.getElementById('zoom-btn');
  if (zb) {
    zb.querySelector('svg').innerHTML = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>';
    zb.childNodes[zb.childNodes.length-1].textContent = ' Phóng to';
  }
  el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'zoomIn .25s ease';
  el.src = img.full || img.url; el.alt = img.name;
  document.getElementById('lb-name').textContent    = img.name;
  document.getElementById('lb-counter').textContent = `${currentIdx+1} / ${filtered.length}`;
  const dl = document.getElementById('lb-download');
  dl.href = img.full || img.url; dl.download = img.name + '.jpg';
}
function toggleZoom() {
  const img = document.getElementById('lb-img');
  const btn = document.getElementById('zoom-btn');
  const z   = img.classList.toggle('zoomed');
  btn.querySelector('svg').innerHTML = z
    ? '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/>'
    : '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>';
  btn.childNodes[btn.childNodes.length-1].textContent = z ? ' Thu nhỏ' : ' Phóng to';
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lb-img')?.addEventListener('click', e => { e.stopPropagation(); toggleZoom(); });
});
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb?.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowLeft')  navLb(-1);
  if (e.key === 'ArrowRight') navLb(1);
});
document.getElementById('lightbox')?.addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLb();
});

/* ── SEARCH ── */
document.getElementById('sb-search-input')?.addEventListener('input', function() {
  const q    = this.value.trim().toLowerCase();
  const res  = document.getElementById('sb-results');
  const sugg = document.getElementById('sb-suggestions');
  if (!q) { res.style.display='none'; res.innerHTML=''; sugg.style.display=''; return; }
  res.style.display=''; sugg.style.display='none';
  const hits = PHOTOS.filter(p => p.name.toLowerCase().includes(q));
  if (!hits.length) { res.innerHTML='<p class="sb-sr-hint">Không tìm thấy 😔</p>'; return; }
  res.innerHTML = '';
  hits.slice(0,50).forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'sb-sr-item';
    el.innerHTML = `<img src="${p.url}" alt="${p.name}" loading="lazy"/>
      <div><div class="sb-sr-name">${p.name}</div></div>`;
    el.addEventListener('click', () => {
      filtered = PHOTOS; currentIdx = PHOTOS.indexOf(p); openLb();
    });
    res.appendChild(el);
  });
});

/* ── SUGGESTION CAROUSEL ── */
let carouselIdx   = 0;
let carouselItems = [];

function buildSuggestions() {
  const track  = document.getElementById('sb-suggest-track');
  const dotsEl = document.getElementById('sb-suggest-dots');
  if (!track || !PHOTOS.length) return;

  carouselItems = [...PHOTOS].sort(() => Math.random()-.5).slice(0,4);
  carouselIdx   = 0;
  track.innerHTML = '';

  carouselItems.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'sb-suggest-slide';
    slide.innerHTML = `<img src="${p.url}" loading="lazy"/>
      <div class="sb-suggest-caption">
        <div class="sb-suggest-name">${p.name}</div>
      </div>`;
    slide.addEventListener('click', () => { filtered=PHOTOS; currentIdx=PHOTOS.indexOf(p); openLb(); });
    track.appendChild(slide);
  });

  // Clone for infinite loop
  const fc = track.firstElementChild?.cloneNode(true);
  const lc = track.lastElementChild?.cloneNode(true);
  if (fc && lc) { track.appendChild(fc); track.insertBefore(lc, track.firstElementChild); }

  dotsEl.innerHTML = '';
  carouselItems.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'sb-dot' + (i===0?' active':'');
    dot.addEventListener('click', () => goCarousel(i));
    dotsEl.appendChild(dot);
  });
  goCarousel(0, true);
}

function goCarousel(idx, skipAnim) {
  const n = carouselItems.length;
  carouselIdx = ((idx%n)+n)%n;
  const track = document.getElementById('sb-suggest-track');
  if (!track) return;
  const pos = carouselIdx+1;
  track.style.transition = skipAnim ? 'none' : 'transform .35s cubic-bezier(.4,0,.2,1)';
  track.style.transform  = `translateX(-${pos*100}%)`;
  document.querySelectorAll('.sb-dot').forEach((d,i) => d.classList.toggle('active', i===carouselIdx));
  if (!skipAnim) {
    track.addEventListener('transitionend', function snap() {
      track.removeEventListener('transitionend', snap);
      if (pos===n+1) { track.style.transition='none'; track.style.transform='translateX(-100%)'; carouselIdx=0; }
      if (pos===0)   { track.style.transition='none'; track.style.transform=`translateX(-${n*100}%)`; carouselIdx=n-1; }
      document.querySelectorAll('.sb-dot').forEach((d,i) => d.classList.toggle('active', i===carouselIdx));
    });
  } else {
    requestAnimationFrame(() => { track.style.transition='transform .35s cubic-bezier(.4,0,.2,1)'; });
  }
}

(function initCarouselEvents() {
  let sx=0, sy=0, dragging=false;
  document.addEventListener('touchstart', e => {
    const c=document.getElementById('sb-suggest-carousel');
    if (!c?.contains(e.target)) return;
    sx=e.touches[0].clientX; sy=e.touches[0].clientY; dragging=true;
  }, {passive:true});
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx=Math.abs(e.touches[0].clientX-sx), dy=Math.abs(e.touches[0].clientY-sy);
    if (dx>dy && dx>8) e.preventDefault();
  }, {passive:false});
  document.addEventListener('touchend', e => {
    if (!dragging) return; dragging=false;
    const diff=sx-e.changedTouches[0].clientX, dy=Math.abs(e.changedTouches[0].clientY-sy);
    if (Math.abs(diff)>30 && dy<60) goCarousel(carouselIdx+(diff>0?1:-1));
  }, {passive:true});
  let msx=0;
  document.addEventListener('mousedown', e => { msx=document.getElementById('sb-suggest-carousel')?.contains(e.target)?e.clientX:0; });
  document.addEventListener('mouseup', e => { if(!msx)return; const d=msx-e.clientX; msx=0; if(Math.abs(d)>30) goCarousel(carouselIdx+(d>0?1:-1)); });
  let wc=false;
  document.addEventListener('wheel', e => {
    const c=document.getElementById('sb-suggest-carousel');
    if (!c?.contains(e.target)) return;
    e.preventDefault(); if(wc)return; wc=true;
    goCarousel(carouselIdx+(e.deltaY>0||e.deltaX>0?1:-1));
    setTimeout(()=>{wc=false;},400);
  }, {passive:false});
})();

/* ── SIDEBAR ── */
let panelOpen=false, settingsOpen=false;

function toggleSbPanel() {
  panelOpen=!panelOpen;
  document.getElementById('sb-panel').classList.toggle('open',panelOpen);
  document.getElementById('sb-search').classList.toggle('active',panelOpen);
  if (panelOpen) {
    if (window.innerWidth>768) setTimeout(()=>document.getElementById('sb-search-input').focus(),320);
    buildSuggestions();
  }
  closeSettings();
}
function toggleSettings() {
  settingsOpen=!settingsOpen;
  document.getElementById('settings-popup').classList.toggle('open',settingsOpen);
  document.getElementById('sb-settings').classList.toggle('active',settingsOpen);
  if (settingsOpen && panelOpen) toggleSbPanel();
}
function closeSettings() {
  settingsOpen=false;
  document.getElementById('settings-popup')?.classList.remove('open');
  document.getElementById('sb-settings')?.classList.remove('active');
}
function scrollToTop() { window.scrollTo({top:0,behavior:'smooth'}); }

document.addEventListener('click', e => {
  const popup=document.getElementById('settings-popup'), sb=document.getElementById('sb-settings');
  if (settingsOpen && !popup?.contains(e.target) && !sb?.contains(e.target)) closeSettings();
  const panel=document.getElementById('sb-panel'), sr=document.getElementById('sb-search');
  if (panelOpen && window.innerWidth<=768 && !panel?.contains(e.target) && !sr?.contains(e.target)) {
    panelOpen=false; panel.classList.remove('open'); sr.classList.remove('active');
  }
});

/* ── THEME ── */
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  const tog=document.getElementById('dark-toggle'); if(tog) tog.checked=dark;
  localStorage.setItem('theme', dark?'dark':'light');
}
(function(){ applyTheme(localStorage.getItem('theme')!=='light'); })();

/* ── SETTINGS ── */
function setAutoplay(e) { localStorage.setItem('autoplay', e?'on':'off'); }
function setSidebarRight(e) { document.body.classList.toggle('sidebar-right',e); localStorage.setItem('sidebarRight',e?'on':'off'); }
(function(){
  const tog=document.getElementById('autoplay-toggle'); if(tog) tog.checked=localStorage.getItem('autoplay')!=='off';
  const sr=localStorage.getItem('sidebarRight')==='on';
  if(sr) document.body.classList.add('sidebar-right');
  const rt=document.getElementById('rightsb-toggle'); if(rt) rt.checked=sr;
})();

/* ── MUSIC PLAYER ── */
const TRACKS = [
  { src:'https://res.cloudinary.com/dlrax6e5x/video/upload/v1773074679/y0n5lbfghi8mj5iioahd.mp3' },
  { src:'https://res.cloudinary.com/dlrax6e5x/video/upload/v1773375040/ue27qwgc4hq46saugdfa.mp3' },
];
let trackIdx=parseInt(localStorage.getItem('trackIdx')||'0');
let repeatMode=localStorage.getItem('repeatMode')||'all';
let audioStarted=false;
let autoplayEnabled=localStorage.getItem('autoplay')!=='off';
const audio=document.getElementById('bg-audio');
const musicBtn=document.getElementById('music-btn');

function loadTrack(idx,play) {
  trackIdx=idx; localStorage.setItem('trackIdx',idx);
  audio.src=TRACKS[idx].src; audio.load(); audio.loop=(repeatMode==='one');
  if(play) audio.play().then(syncMusicUI).catch(()=>{});
  syncPickerUI();
}
function syncMusicUI() {
  const p=audio.paused;
  musicBtn?.classList.toggle('playing',!p);
  const ip=document.getElementById('icon-play'), ipa=document.getElementById('icon-pause');
  if(ip) ip.style.display=p?'':'none';
  if(ipa) ipa.style.display=p?'none':'';
  syncPickerUI();
}
function syncPickerUI() {
  TRACKS.forEach((_,i)=>{
    const el=document.getElementById(`track-${i}`);
    if(!el) return;
    el.classList.toggle('active',i===trackIdx);
    el.classList.toggle('paused',audio.paused);
  });
  document.getElementById('repeat-all-btn')?.classList.toggle('active',repeatMode==='all');
  document.getElementById('repeat-one-btn')?.classList.toggle('active',repeatMode==='one');
}
audio?.addEventListener('ended',()=>{ if(repeatMode==='all') loadTrack((trackIdx+1)%TRACKS.length,true); });
function selectTrack(idx) { const p=!audio.paused; loadTrack(idx,p||audioStarted); }
function toggleMusic() {
  if(!audio.src||audio.src===location.href) loadTrack(trackIdx,false);
  if(audio.paused){audio.play().then(syncMusicUI).catch(()=>{}); audioStarted=true;}
  else{audio.pause(); syncMusicUI();}
}
function setRepeatMode(m) {
  repeatMode=(repeatMode===m)?'none':m;
  localStorage.setItem('repeatMode',repeatMode);
  audio.loop=(repeatMode==='one'); syncPickerUI();
}
function startOnFirst() {
  if(audioStarted||!autoplayEnabled) return; audioStarted=true;
  if(!audio.src||audio.src===location.href) loadTrack(trackIdx,true);
  else audio.play().then(syncMusicUI).catch(()=>{});
  document.removeEventListener('click',startOnFirst);
  document.removeEventListener('touchstart',startOnFirst);
}
document.addEventListener('click',startOnFirst);
document.addEventListener('touchstart',startOnFirst);
(function(){ audio.src=TRACKS[trackIdx].src; audio.loop=(repeatMode==='one'); syncPickerUI(); })();

// Music picker hover/longpress
let pickerOpen=false, lpTimer=null;
function togglePicker(f) {
  pickerOpen=(f!==undefined)?f:!pickerOpen;
  document.getElementById('music-picker')?.classList.toggle('open',pickerOpen);
  if(pickerOpen) syncPickerUI();
}
musicBtn?.addEventListener('mouseenter',()=>{ if(window.innerWidth>768) togglePicker(true); });
musicBtn?.addEventListener('mouseleave',()=>{ if(window.innerWidth>768) setTimeout(()=>{ if(!document.getElementById('music-picker')?.matches(':hover')) togglePicker(false); },150); });
document.getElementById('music-picker')?.addEventListener('mouseleave',()=>{ if(window.innerWidth>768) togglePicker(false); });
musicBtn?.addEventListener('touchstart',e=>{ if(window.innerWidth>768)return; lpTimer=setTimeout(()=>togglePicker(true),600); },{passive:true});
musicBtn?.addEventListener('touchend',()=>clearTimeout(lpTimer));
musicBtn?.addEventListener('touchmove',()=>clearTimeout(lpTimer));
document.addEventListener('click',e=>{
  if(pickerOpen&&!document.getElementById('music-picker')?.contains(e.target)&&!musicBtn?.contains(e.target)) togglePicker(false);
});
