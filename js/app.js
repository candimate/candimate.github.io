/* ════════════════════════════════════
   CANDIMATE — app.js
   ════════════════════════════════════ */

/* ── ALBUM CONFIG ─────────────────────────────────────────────
   jsonUrl : link raw GitHub đến file JSON
   emoji   : icon hiển thị trước tên
   title   : tên album
   date    : ngày hiển thị
─────────────────────────────────────────────────────────────── */
const ALBUMS = [
  {
    id:      'album-bau-cu',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/tuoi_tre_thpt_loc_hiep_15-3.json',
    emoji:   '🗳️',
    title:   'Tuổi trẻ THPT Lộc Hiệp hỗ trợ bầu cử',
    date:    '15/03/2026',
  },
  {
    id:      'album-net-dep',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/net_dep_hoc_duong.json',
    emoji:   '📸',
    title:   'Nét đẹp học đường',
    date:    '09/03/2026',
  },
  {
    id:      'album-chu-nhat',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/chu_nhat_xanh.json',
    emoji:   '🌿',
    title:   'Chủ nhật xanh',
    date:    '08/03/2026',
  },
];

/* ── RUNTIME STATE ── */
let albumData  = {};   // { albumId: [photos...] }
let filtered   = [];
let currentIdx = 0;

/* ══════════════════════════════════════
   PHOTO EXTRACTION
══════════════════════════════════════ */
function extractPhotos(data) {
  if (!data) return [];
  if (Array.isArray(data) && data[0]?.photos) return data[0].photos;
  if (!Array.isArray(data) && data.photos)    return data.photos;
  if (Array.isArray(data))                     return data;
  return [];
}

/* ══════════════════════════════════════
   BUILD GALLERY SECTIONS (config-driven)
══════════════════════════════════════ */
function buildAllSections() {
  const container = document.getElementById('albums-container');
  container.innerHTML = '';

  ALBUMS.forEach(album => {
    const photos = albumData[album.id] || [];
    const section = document.createElement('div');
    section.className = 'album-section';
    section.id = album.id;
    section.innerHTML = `
      <div class="album-header">
        <div class="album-info">
          <div class="album-title">${album.emoji} ${album.title}</div>
          <div class="album-date">${album.date}</div>
        </div>
        <span class="album-count">${photos.length} ảnh</span>
      </div>
      <hr class="album-divider"/>
      <div class="gallery" id="gallery-${album.id}"></div>
      <div class="empty" id="empty-${album.id}">Không tìm thấy ảnh nào 😔</div>`;
    container.appendChild(section);
    renderGallery(album.id, photos);
  });

  // Update header stat
  const total = ALBUMS.reduce((s, a) => s + (albumData[a.id]?.length || 0), 0);
  const el = document.getElementById('total-count');
  if (el) el.textContent = total;
}

function renderGallery(albumId, photos) {
  const gallery = document.getElementById(`gallery-${albumId}`);
  const empty   = document.getElementById(`empty-${albumId}`);
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
    card.addEventListener('click', () => {
      filtered   = photos;
      currentIdx = i;
      openLb();
    });
    gallery.appendChild(card);
  });
}

/* ══════════════════════════════════════
   LOAD DATA
══════════════════════════════════════ */
function loadData() {
  const promises = ALBUMS.map(album =>
    fetch(album.jsonUrl)
      .then(r => r.json())
      .then(d => { albumData[album.id] = extractPhotos(d); })
      .catch(() => { albumData[album.id] = []; })
  );
  Promise.all(promises).then(() => {
    buildAllSections();
    buildSuggestions();
  });
}
loadData();

/* ══════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════ */
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
    zb.childNodes[zb.childNodes.length - 1].textContent = ' Phóng to';
  }
  el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'zoomIn .25s ease';
  el.src = img.full || img.url; el.alt = img.name;
  document.getElementById('lb-name').textContent    = img.name;
  document.getElementById('lb-counter').textContent = `${currentIdx + 1} / ${filtered.length}`;
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
  btn.childNodes[btn.childNodes.length - 1].textContent = z ? ' Thu nhỏ' : ' Phóng to';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lb-img').addEventListener('click', e => { e.stopPropagation(); toggleZoom(); });
});
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLb();
  if (e.key === 'ArrowLeft')   navLb(-1);
  if (e.key === 'ArrowRight')  navLb(1);
});
document.getElementById('lightbox').addEventListener('click', e => { if (e.target === document.getElementById('lightbox')) closeLb(); });

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function getAllPhotos() {
  return ALBUMS.flatMap(album =>
    (albumData[album.id] || []).map(p => ({ p, label: `${album.emoji} ${album.title}`, albumId: album.id }))
  );
}

document.getElementById('sb-search-input').addEventListener('input', function () {
  const q    = this.value.trim().toLowerCase();
  const res  = document.getElementById('sb-results');
  const sugg = document.getElementById('sb-suggestions');
  if (!q) {
    res.style.display = 'none'; res.innerHTML = '';
    sugg.style.display = '';
    return;
  }
  res.style.display = ''; sugg.style.display = 'none';
  const hits = getAllPhotos().filter(({ p }) => p.name.toLowerCase().includes(q));
  if (!hits.length) { res.innerHTML = '<p class="sb-sr-hint">Không tìm thấy 😔</p>'; return; }
  res.innerHTML = '';
  hits.slice(0, 50).forEach(({ p, label, albumId }) => {
    const el = document.createElement('div');
    el.className = 'sb-sr-item';
    el.innerHTML = `<img src="${p.url}" alt="${p.name}" loading="lazy"/>
      <div><div class="sb-sr-name">${p.name}</div><div class="sb-sr-album">${label}</div></div>`;
    el.addEventListener('click', () => {
      filtered   = albumData[albumId];
      currentIdx = filtered.indexOf(p);
      openLb();
    });
    res.appendChild(el);
  });
});

/* ══════════════════════════════════════
   SUGGESTION CAROUSEL
══════════════════════════════════════ */
let carouselIdx   = 0;
let carouselItems = [];

function buildSuggestions() {
  const track    = document.getElementById('sb-suggest-track');
  const dotsEl   = document.getElementById('sb-suggest-dots');
  if (!track) return;

  const all = getAllPhotos();
  carouselItems = all.sort(() => Math.random() - .5).slice(0, 4);
  carouselIdx   = 0;

  // Slides
  track.innerHTML = '';
  carouselItems.forEach(({ p, label, albumId }) => {
    const slide = document.createElement('div');
    slide.className = 'sb-suggest-slide';
    slide.innerHTML = `<img src="${p.url}" loading="lazy"/>
      <div class="sb-suggest-caption">
        <div class="sb-suggest-album">${label}</div>
        <div class="sb-suggest-name">${p.name}</div>
      </div>`;
    slide.addEventListener('click', () => {
      filtered   = albumData[albumId];
      currentIdx = filtered.indexOf(p);
      openLb();
    });
    track.appendChild(slide);
  });

  // Clone for infinite scroll
  const firstClone = track.firstElementChild?.cloneNode(true);
  const lastClone  = track.lastElementChild?.cloneNode(true);
  if (firstClone && lastClone) {
    firstClone.setAttribute('data-clone', '1');
    lastClone.setAttribute('data-clone', '1');
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstElementChild);
  }

  // Dots
  dotsEl.innerHTML = '';
  carouselItems.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'sb-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goCarousel(i));
    dotsEl.appendChild(dot);
  });

  goCarousel(0, true);
}

function goCarousel(idx, skipAnim) {
  const n     = carouselItems.length;
  carouselIdx = ((idx % n) + n) % n;
  const track = document.getElementById('sb-suggest-track');
  if (!track) return;
  const pos = carouselIdx + 1;
  track.style.transition = skipAnim ? 'none' : 'transform .35s cubic-bezier(.4,0,.2,1)';
  track.style.transform  = `translateX(-${pos * 100}%)`;
  document.querySelectorAll('.sb-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIdx));
  if (!skipAnim) {
    track.addEventListener('transitionend', function snap() {
      track.removeEventListener('transitionend', snap);
      if (pos === n + 1) { track.style.transition = 'none'; track.style.transform = 'translateX(-100%)'; carouselIdx = 0; }
      if (pos === 0)     { track.style.transition = 'none'; track.style.transform = `translateX(-${n * 100}%)`; carouselIdx = n - 1; }
      document.querySelectorAll('.sb-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIdx));
    });
  } else {
    requestAnimationFrame(() => { track.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1)'; });
  }
}

// Touch / mouse / wheel events (init once)
(function initCarouselEvents() {
  let startX = 0, startY = 0, dragging = false;
  document.addEventListener('touchstart', e => {
    const c = document.getElementById('sb-suggest-carousel');
    if (!c?.contains(e.target)) return;
    startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = true;
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > dy && dx > 8) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', e => {
    if (!dragging) return; dragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    const dy   = Math.abs(e.changedTouches[0].clientY - startY);
    if (Math.abs(diff) > 30 && dy < 60) goCarousel(carouselIdx + (diff > 0 ? 1 : -1));
  }, { passive: true });

  let msx = 0;
  document.addEventListener('mousedown', e => {
    const c = document.getElementById('sb-suggest-carousel');
    msx = c?.contains(e.target) ? e.clientX : 0;
  });
  document.addEventListener('mouseup', e => {
    if (!msx) return;
    const diff = msx - e.clientX; msx = 0;
    if (Math.abs(diff) > 30) goCarousel(carouselIdx + (diff > 0 ? 1 : -1));
  });

  let wCool = false;
  document.addEventListener('wheel', e => {
    const c = document.getElementById('sb-suggest-carousel');
    if (!c?.contains(e.target)) return;
    e.preventDefault();
    if (wCool) return; wCool = true;
    goCarousel(carouselIdx + (e.deltaY > 0 || e.deltaX > 0 ? 1 : -1));
    setTimeout(() => { wCool = false; }, 400);
  }, { passive: false });
})();

/* ══════════════════════════════════════
   SIDEBAR PANELS
══════════════════════════════════════ */
let panelOpen    = false;
let settingsOpen = false;

function toggleSbPanel() {
  panelOpen = !panelOpen;
  document.getElementById('sb-panel').classList.toggle('open', panelOpen);
  document.getElementById('sb-search').classList.toggle('active', panelOpen);
  if (panelOpen) {
    if (window.innerWidth > 768) setTimeout(() => document.getElementById('sb-search-input').focus(), 320);
    buildSuggestions();
  }
  closeSettings();
}

function toggleSettings() {
  settingsOpen = !settingsOpen;
  document.getElementById('settings-popup').classList.toggle('open', settingsOpen);
  document.getElementById('sb-settings').classList.toggle('active', settingsOpen);
  if (settingsOpen && panelOpen) toggleSbPanel();
}
function closeSettings() {
  settingsOpen = false;
  document.getElementById('settings-popup').classList.remove('open');
  document.getElementById('sb-settings').classList.remove('active');
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

document.addEventListener('click', e => {
  // Close settings
  const popup    = document.getElementById('settings-popup');
  const settBtn  = document.getElementById('sb-settings');
  if (settingsOpen && !popup.contains(e.target) && !settBtn.contains(e.target)) closeSettings();
  // Close search on mobile tap outside
  const panel    = document.getElementById('sb-panel');
  const srchBtn  = document.getElementById('sb-search');
  if (panelOpen && window.innerWidth <= 768 && !panel.contains(e.target) && !srchBtn.contains(e.target)) {
    panelOpen = false;
    panel.classList.remove('open');
    srchBtn.classList.remove('active');
  }
});

/* ══════════════════════════════════════
   THEME
══════════════════════════════════════ */
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  document.getElementById('dark-toggle').checked = isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
(function initTheme() {
  const saved = localStorage.getItem('theme');
  applyTheme(saved ? saved === 'dark' : true);
})();

/* ══════════════════════════════════════
   SETTINGS TOGGLES
══════════════════════════════════════ */
function setAutoplay(enabled) {
  localStorage.setItem('autoplay', enabled ? 'on' : 'off');
}
function setSidebarRight(enabled) {
  document.body.classList.toggle('sidebar-right', enabled);
  localStorage.setItem('sidebarRight', enabled ? 'on' : 'off');
}
(function initSettings() {
  const tog = document.getElementById('autoplay-toggle');
  if (tog) tog.checked = localStorage.getItem('autoplay') !== 'off';
  const sRight = localStorage.getItem('sidebarRight') === 'on';
  if (sRight) document.body.classList.add('sidebar-right');
  const rt = document.getElementById('rightsb-toggle');
  if (rt) rt.checked = sRight;
})();

/* ══════════════════════════════════════
   MUSIC PLAYER
══════════════════════════════════════ */
const TRACKS = [
  { src: 'https://res.cloudinary.com/dlrax6e5x/video/upload/v1773745082/ujbdge0viiuektd7rztu.m4a', title: 'một đời (Solo Violin)', artist: '14 Casper', icon: '💙' },
  { src: 'https://res.cloudinary.com/dlrax6e5x/video/upload/v1773074679/y0n5lbfghi8mj5iioahd.mp3', title: 'Trời hửng nắng', artist: 'Uông Tô Lang', icon: '🌤️' },
  { src: 'https://res.cloudinary.com/dlrax6e5x/video/upload/v1773375040/ue27qwgc4hq46saugdfa.mp3', title: 'In Love',           artist: 'Low G',         icon: '💙' },
];

let currentTrackIdx  = parseInt(localStorage.getItem('trackIdx') || '0');
let repeatMode       = localStorage.getItem('repeatMode') || 'all';
let audioStarted     = false;
let autoplayEnabled  = localStorage.getItem('autoplay') !== 'off';
const audio          = document.getElementById('bg-audio');
const musicBtn       = document.getElementById('music-btn');

function loadTrack(idx, andPlay) {
  currentTrackIdx = idx;
  localStorage.setItem('trackIdx', idx);
  audio.src = TRACKS[idx].src; audio.load();
  audio.loop = (repeatMode === 'one');
  if (andPlay) audio.play().then(syncMusicUI).catch(() => {});
  syncPickerUI();
}
function syncMusicUI() {
  const paused = audio.paused;
  musicBtn.classList.toggle('playing', !paused);
  document.getElementById('icon-play').style.display  = paused ? '' : 'none';
  document.getElementById('icon-pause').style.display = paused ? 'none' : '';
  syncPickerUI();
}
function syncPickerUI() {
  TRACKS.forEach((_, i) => {
    const el = document.getElementById(`track-${i}`);
    if (!el) return;
    el.classList.toggle('active', i === currentTrackIdx);
    el.classList.toggle('paused', audio.paused);
  });
  syncRepeatUI();
}
audio.addEventListener('ended', () => {
  if (repeatMode === 'all') loadTrack((currentTrackIdx + 1) % TRACKS.length, true);
});

function selectTrack(idx) {
  const wasPlaying = !audio.paused;
  loadTrack(idx, wasPlaying || audioStarted);
  if (!audioStarted && wasPlaying) audioStarted = true;
}
function toggleMusic() {
  if (!audio.src || audio.src === window.location.href) loadTrack(currentTrackIdx, false);
  if (audio.paused) { audio.play().then(syncMusicUI).catch(() => {}); audioStarted = true; }
  else              { audio.pause(); syncMusicUI(); }
}
function startOnFirstInteraction() {
  if (audioStarted || !autoplayEnabled) return;
  audioStarted = true;
  if (!audio.src || audio.src === window.location.href) loadTrack(currentTrackIdx, true);
  else audio.play().then(syncMusicUI).catch(() => {});
  document.removeEventListener('click',      startOnFirstInteraction);
  document.removeEventListener('touchstart', startOnFirstInteraction);
}
document.addEventListener('click',      startOnFirstInteraction);
document.addEventListener('touchstart', startOnFirstInteraction);
(function initAudio() {
  audio.src = TRACKS[currentTrackIdx].src;
  audio.loop = (repeatMode === 'one');
  syncPickerUI();
})();

// Repeat mode
function setRepeatMode(mode) {
  repeatMode = (repeatMode === mode) ? 'none' : mode;
  localStorage.setItem('repeatMode', repeatMode);
  audio.loop = (repeatMode === 'one');
  syncRepeatUI();
}
function syncRepeatUI() {
  document.getElementById('repeat-all-btn')?.classList.toggle('active', repeatMode === 'all');
  document.getElementById('repeat-one-btn')?.classList.toggle('active', repeatMode === 'one');
}

// Music picker show/hide
let pickerOpen = false;
let longPressTimer = null;
function togglePicker(force) {
  pickerOpen = (force !== undefined) ? force : !pickerOpen;
  document.getElementById('music-picker').classList.toggle('open', pickerOpen);
  if (pickerOpen) syncPickerUI();
}
musicBtn.addEventListener('mouseenter', () => { if (window.innerWidth > 768) togglePicker(true); });
musicBtn.addEventListener('mouseleave', () => {
  if (window.innerWidth > 768)
    setTimeout(() => { if (!document.getElementById('music-picker').matches(':hover')) togglePicker(false); }, 150);
});
document.getElementById('music-picker').addEventListener('mouseleave', () => { if (window.innerWidth > 768) togglePicker(false); });
musicBtn.addEventListener('touchstart', e => {
  if (window.innerWidth > 768) return;
  longPressTimer = setTimeout(() => { togglePicker(true); }, 600);
}, { passive: true });
musicBtn.addEventListener('touchend',  () => clearTimeout(longPressTimer));
musicBtn.addEventListener('touchmove', () => clearTimeout(longPressTimer));
document.addEventListener('click', e => {
  if (pickerOpen && !document.getElementById('music-picker').contains(e.target) && !musicBtn.contains(e.target))
    togglePicker(false);
});
