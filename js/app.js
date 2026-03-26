/* ════════════════════════════════════
   CANDIMATE — app.js  (optimized)
   Thêm album: thêm 1 object vào ALBUMS
   ════════════════════════════════════ */

/* ── ALBUM CONFIG ── */
const ALBUMS = [
  {
    id:      'album-ngay-chay-olympic-vi-suc-khoe-toan-dan',
    jsonUrl: 'https://github.com/candimate/candimate.github.io/blob/main/data/rung_chuong_vang.json',
    emoji:   '🔔',
    title:   'SÔI NỔI CUỘC THI “RUNG CHUÔNG VÀNG”',
    date:    '23/03/2026',
  },
  {
    id:      'album-ngay-chay-olympic-vi-suc-khoe-toan-dan',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/ngay_chay_olympic_vi_suc_khoe_toan_dan.json',
    emoji:   '🏃🏻',
    title:   'Chương trình Ngày chạy Olympic vì sức khỏe toàn dân',
    date:    '22/03/2026',
  },
  {
    id:      'album-khai-mac-giai-bong-da-nam',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/khai_mac_giai_bong_da_nam_2026.json',
    emoji:   '⚽',
    title:   'KHAI MẠC GIẢI BÓNG ĐÁ NAM HỌC SINH',
    date:    '21/03/2026',
  },
  {
    id:      'album-soi-noi-lop-cam-tinh-doan',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/soi_noi_lop_cam_tinh_doan.json',
    emoji:   '🇻🇳',
    title:   'Sôi Nổi Lớp Cảm Tình Đoàn',
    date:    '21/03/2026',
  },
  {
    id:      'album-lan-toa-van-hoa-giao-thong',
    jsonUrl: 'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/data/lan%20_toa_van_hoa_giao_thong.json',
    emoji:   '🛵',
    title:   'Lan Tỏa Văn Hóa Giao Thông',
    date:    '17/03/2026',
  },
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

/* ── HELPERS ── */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}


/* ── WALLPAPERS — thêm URL vào đây để có thêm ảnh nền ── */
const WALLPAPERS = [
  'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/cap-1.jpg',
  'https://raw.githubusercontent.com/candimate/candimate.github.io/refs/heads/main/cap2.jpg',
];

(function initWallpaper() {
  const url = WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)];
  document.body.style.backgroundImage = `url('${url}')`;
})();
/* ── STATE ── */
let albumData  = {};
let filtered   = [];
let currentIdx = 0;

/* ══════════════════════════════════════
   DATA LOADING
══════════════════════════════════════ */
function extractPhotos(data) {
  if (!data) return [];
  if (Array.isArray(data) && data[0]?.photos) return data[0].photos;
  if (!Array.isArray(data) && data.photos)    return data.photos;
  if (Array.isArray(data))                     return data;
  return [];
}

function loadData() {
  Promise.all(
    ALBUMS.map(album =>
      fetch(album.jsonUrl)
        .then(r => r.json())
        .then(d => { albumData[album.id] = extractPhotos(d); })
        .catch(() => { albumData[album.id] = []; })
    )
  ).then(() => { buildAllSections(); buildSuggestions(); });
}
loadData();

/* ══════════════════════════════════════
   SETTINGS ALBUM LIST
══════════════════════════════════════ */
function buildSettingsAlbumList() {
  const list = $('settings-album-list');
  if (!list) return;
  list.innerHTML = '';
  ALBUMS.forEach(album => {
    const photos = albumData[album.id] || [];
    const item = document.createElement('div');
    item.className = 'settings-album-item';
    item.innerHTML = `
      <span>${album.emoji} ${album.title}</span>
      <span class="settings-album-count">${photos.length} ảnh</span>`;
    item.addEventListener('click', () => scrollToAlbum(album.id));
    list.appendChild(item);
  });
}

function scrollToAlbum(id) {
  closeSettings();
  setTimeout(() => {
    const target = $(id);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, 220); // wait for settings close animation
}

/* ══════════════════════════════════════
   GALLERY — IntersectionObserver lazy load
══════════════════════════════════════ */
const cardObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target.querySelector('img[data-src]');
    if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    obs.unobserve(entry.target);
  });
}, { rootMargin: '200px' });

function buildAllSections() {
  const container = $('albums-container');
  if (!container) return;
  container.innerHTML = '';
  ALBUMS.forEach(album => {
    const photos  = albumData[album.id] || [];
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
      <div class="empty"   id="empty-${album.id}">Không tìm thấy ảnh nào 😔</div>`;
    container.appendChild(section);
    renderGallery(album.id, photos);
  });
  buildSettingsAlbumList();
}

function renderGallery(albumId, photos) {
  const gallery = $(`gallery-${albumId}`);
  const empty   = $(`empty-${albumId}`);
  if (!gallery) return;
  gallery.innerHTML = '';
  if (!photos.length) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  const frag = document.createDocumentFragment();
  photos.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.style.animationDelay = `${Math.min(i * 0.04, 0.6)}s`;
    // First 12 load immediately, rest via observer
    const eager = i < 12;
    card.innerHTML = `<img ${eager ? `src="${img.url}"` : `data-src="${img.url}"`} alt="${img.name}" loading="lazy"/>
      <div class="overlay"><span class="photo-name">${img.name}</span></div>`;
    card.addEventListener('click', () => { filtered = photos; currentIdx = i; openLb(); });
    if (!eager) cardObserver.observe(card);
    frag.appendChild(card);
  });
  gallery.appendChild(frag);
}

/* ══════════════════════════════════════
   LIGHTBOX + PRELOAD
══════════════════════════════════════ */
const _preloadCache = new Set();
function preloadAround(idx) {
  [-1, 1, 2].forEach(offset => {
    const n = filtered.length;
    const i = ((idx + offset) % n + n) % n;
    const src = filtered[i]?.full || filtered[i]?.url;
    if (!src || _preloadCache.has(src)) return;
    _preloadCache.add(src);
    new Image().src = src;
  });
}

function openLb()  { updateLb(); $('lightbox').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeLb() { $('lightbox').classList.remove('active'); document.body.style.overflow = ''; }
function navLb(dir) {
  currentIdx = (currentIdx + dir + filtered.length) % filtered.length;
  updateLb();
}
function updateLb() {
  const img = filtered[currentIdx];
  const el  = $('lb-img');
  el.classList.remove('zoomed');
  const zb = $('zoom-btn');
  if (zb) {
    zb.querySelector('svg').innerHTML = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>';
    zb.childNodes[zb.childNodes.length - 1].textContent = ' Phóng to';
  }
  el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'zoomIn .25s ease';
  el.src = img.full || img.url; el.alt = img.name;
  $('lb-name').textContent    = img.name;
  $('lb-counter').textContent = `${currentIdx + 1} / ${filtered.length}`;
  const dl = $('lb-download');
  dl.href = img.full || img.url; dl.download = img.name + '.jpg';
  preloadAround(currentIdx);
}
function toggleZoom() {
  const img = $('lb-img'), btn = $('zoom-btn');
  const z = img.classList.toggle('zoomed');
  btn.querySelector('svg').innerHTML = z
    ? '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/>'
    : '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>';
  btn.childNodes[btn.childNodes.length - 1].textContent = z ? ' Thu nhỏ' : ' Phóng to';
}

document.addEventListener('DOMContentLoaded', () => {
  $('lb-img')?.addEventListener('click', e => { e.stopPropagation(); toggleZoom(); });
});
document.addEventListener('keydown', e => {
  if (!$('lightbox')?.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowLeft')  navLb(-1);
  if (e.key === 'ArrowRight') navLb(1);
});
$('lightbox')?.addEventListener('click', e => { if (e.target === $('lightbox')) closeLb(); });

// Swipe to navigate lightbox on mobile
;(function() {
  const lb = $('lightbox'); if (!lb) return;
  let sx = 0, sy = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    const dy = Math.abs(e.changedTouches[0].clientY - sy);
    if (Math.abs(dx) > 40 && dy < 80) navLb(dx > 0 ? 1 : -1);
  }, { passive: true });
})();

/* ══════════════════════════════════════
   SEARCH  (debounced 200ms)
══════════════════════════════════════ */
function getAllPhotos() {
  return ALBUMS.flatMap(album =>
    (albumData[album.id] || []).map(p => ({ p, label: `${album.emoji} ${album.title}`, albumId: album.id }))
  );
}

$('sb-search-input')?.addEventListener('input', debounce(function() {
  const q = $('sb-search-input').value.trim().toLowerCase();
  const res = $('sb-results'), sugg = $('sb-suggestions');
  if (!q) { res.style.display = 'none'; res.innerHTML = ''; sugg.style.display = 'flex'; return; }
  res.style.display = 'flex'; sugg.style.display = 'none';

  // Normalize query: extract pure number if user types e.g. "49" or "049"
  const qNum = q.replace(/[^0-9]/g, ''); // digits only from query

  const hits = getAllPhotos().filter(({ p }) => {
    const name = p.name.toLowerCase();
    if (name.includes(q)) return true;
    // If query contains digits, also match against the number in the name
    if (qNum) {
      const nameNum = name.replace(/[^0-9]/g, ''); // digits from name e.g. "049"
      // Match: "49" matches "049" (parseInt strips leading zeros)
      if (nameNum && parseInt(nameNum, 10) === parseInt(qNum, 10)) return true;
      // Also match substring: "4" matches "049", "146", etc.
      if (nameNum.includes(qNum)) return true;
    }
    return false;
  });

  if (!hits.length) { res.innerHTML = '<p class="sb-sr-hint">Không tìm thấy 😔</p>'; return; }
  const frag = document.createDocumentFragment();
  hits.slice(0, 50).forEach(({ p, label, albumId }) => {
    const el = document.createElement('div');
    el.className = 'sb-sr-item';
    el.innerHTML = `<img src="${p.url}" alt="${p.name}" loading="lazy"/>
      <div><div class="sb-sr-name">${p.name}</div><div class="sb-sr-album">${label}</div></div>`;
    el.addEventListener('click', () => { filtered = albumData[albumId]; currentIdx = filtered.indexOf(p); openLb(); });
    frag.appendChild(el);
  });
  res.innerHTML = ''; res.appendChild(frag);
}, 100));

/* ══════════════════════════════════════
   SUGGESTION CAROUSEL
══════════════════════════════════════ */
let carouselIdx = 0, carouselItems = [];

function buildSuggestions() {
  const track = $('sb-suggest-track'), dotsEl = $('sb-suggest-dots');
  if (!track) return;
  carouselItems = getAllPhotos().sort(() => Math.random() - .5).slice(0, 4);
  carouselIdx   = 0;
  track.innerHTML = '';
  carouselItems.forEach(({ p, label, albumId }) => {
    const slide = document.createElement('div');
    slide.className = 'sb-suggest-slide';
    slide.innerHTML = `<img src="${p.url}" loading="lazy"/>
      <div class="sb-suggest-caption">
        <div class="sb-suggest-album">${label}</div>
        <div class="sb-suggest-name">${p.name}</div>
      </div>`;
    slide.addEventListener('click', () => { filtered = albumData[albumId]; currentIdx = filtered.indexOf(p); openLb(); });
    track.appendChild(slide);
  });
  const fc = track.firstElementChild?.cloneNode(true);
  const lc = track.lastElementChild?.cloneNode(true);
  if (fc && lc) {
    fc.setAttribute('data-clone','1'); lc.setAttribute('data-clone','1');
    track.appendChild(fc); track.insertBefore(lc, track.firstElementChild);
  }
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
  const n = carouselItems.length; if (!n) return;
  carouselIdx = ((idx % n) + n) % n;
  const track = $('sb-suggest-track'); if (!track) return;
  const pos = carouselIdx + 1;
  track.style.transition = skipAnim ? 'none' : 'transform .35s cubic-bezier(.4,0,.2,1)';
  track.style.transform  = `translateX(-${pos * 100}%)`;
  $$('.sb-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIdx));
  if (!skipAnim) {
    track.addEventListener('transitionend', function snap() {
      track.removeEventListener('transitionend', snap);
      if (pos === n + 1) { track.style.transition = 'none'; track.style.transform = 'translateX(-100%)'; carouselIdx = 0; }
      if (pos === 0)     { track.style.transition = 'none'; track.style.transform = `translateX(-${n * 100}%)`; carouselIdx = n - 1; }
      $$('.sb-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIdx));
    });
  } else {
    requestAnimationFrame(() => { track.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1)'; });
  }
}

;(function initCarouselEvents() {
  let sx = 0, sy = 0, dragging = false;
  const car = () => $('sb-suggest-carousel');
  document.addEventListener('touchstart', e => { if (!car()?.contains(e.target)) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; dragging = true; }, { passive: true });
  document.addEventListener('touchmove',  e => { if (!dragging) return; const dx = Math.abs(e.touches[0].clientX-sx), dy = Math.abs(e.touches[0].clientY-sy); if (dx > dy && dx > 8) e.preventDefault(); }, { passive: false });
  document.addEventListener('touchend',   e => { if (!dragging) return; dragging = false; const d = sx - e.changedTouches[0].clientX, dy = Math.abs(e.changedTouches[0].clientY-sy); if (Math.abs(d) > 30 && dy < 60) goCarousel(carouselIdx + (d > 0 ? 1 : -1)); }, { passive: true });
  let msx = 0;
  document.addEventListener('mousedown', e => { msx = car()?.contains(e.target) ? e.clientX : 0; });
  document.addEventListener('mouseup',   e => { if (!msx) return; const d = msx - e.clientX; msx = 0; if (Math.abs(d) > 30) goCarousel(carouselIdx + (d > 0 ? 1 : -1)); });
  let wc = false;
  document.addEventListener('wheel', e => { if (!car()?.contains(e.target)) return; e.preventDefault(); if (wc) return; wc = true; goCarousel(carouselIdx + (e.deltaY > 0 || e.deltaX > 0 ? 1 : -1)); setTimeout(() => { wc = false; }, 400); }, { passive: false });
})();

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
let panelOpen = false, settingsOpen = false;

function toggleSbPanel() {
  panelOpen = !panelOpen;
  $('sb-panel').classList.toggle('open', panelOpen);
  $('sb-search').classList.toggle('active', panelOpen);
  if (panelOpen) { if (window.innerWidth > 768) setTimeout(() => $('sb-search-input').focus(), 320); buildSuggestions(); }
  closeSettings();
}
function toggleSettings() {
  settingsOpen = !settingsOpen;
  $('settings-popup').classList.toggle('open', settingsOpen);
  $('sb-settings').classList.toggle('active', settingsOpen);
  if (settingsOpen && panelOpen) toggleSbPanel();
}
function closeSettings() {
  settingsOpen = false;
  $('settings-popup').classList.remove('open');
  $('sb-settings').classList.remove('active');
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

document.addEventListener('click', e => {
  const popup = $('settings-popup'), settBtn = $('sb-settings');
  if (settingsOpen && !popup.contains(e.target) && !settBtn.contains(e.target)) closeSettings();
  const panel = $('sb-panel'), srchBtn = $('sb-search');
  if (panelOpen && window.innerWidth <= 768 && !panel.contains(e.target) && !srchBtn.contains(e.target)) {
    panelOpen = false; panel.classList.remove('open'); srchBtn.classList.remove('active');
  }
});

/* ══════════════════════════════════════
   THEME & SETTINGS
══════════════════════════════════════ */
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  const t = $('dark-toggle'); if (t) t.checked = isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
(function() { applyTheme(localStorage.getItem('theme') === 'dark'); })();

function setAutoplay(e) { localStorage.setItem('autoplay', e ? 'on' : 'off'); }
function setSidebarRight(e) { document.body.classList.toggle('sidebar-right', e); localStorage.setItem('sidebarRight', e ? 'on' : 'off'); }
(function() {
  const t = $('autoplay-toggle'); if (t) t.checked = localStorage.getItem('autoplay') !== 'off';
  const sr = localStorage.getItem('sidebarRight') === 'on';
  if (sr) document.body.classList.add('sidebar-right');
  const rt = $('rightsb-toggle'); if (rt) rt.checked = sr;
})();

/* ══════════════════════════════════════
   MUSIC PLAYER
══════════════════════════════════════ */
const TRACKS = [
  { src: 'https://res.cloudinary.com/dlrax6e5x/video/upload/v1774274445/ypnxtx3d0yio7tgkbuai.mp3' },
  { src: 'https://res.cloudinary.com/dlrax6e5x/video/upload/v1774274730/kmwdpqkvfncgwqeuusps.mp3' },
];
let trackIdx = parseInt(localStorage.getItem('trackIdx') || '0');
let repeatMode = localStorage.getItem('repeatMode') || 'all';
let audioStarted = false, autoplayEnabled = localStorage.getItem('autoplay') !== 'off';
const audio = $('bg-audio'), musicBtn = $('music-btn');

function loadTrack(idx, play) {
  trackIdx = idx; localStorage.setItem('trackIdx', idx);
  audio.src = TRACKS[idx].src; audio.load(); audio.loop = repeatMode === 'one';
  if (play) audio.play().then(syncMusicUI).catch(() => {});
  syncPickerUI();
}
function syncMusicUI() {
  const p = audio.paused; musicBtn.classList.toggle('playing', !p);
  $('icon-play').style.display = p ? '' : 'none'; $('icon-pause').style.display = p ? 'none' : '';
  syncPickerUI();
}
function syncPickerUI() {
  TRACKS.forEach((_, i) => { const el = $(`track-${i}`); if (!el) return; el.classList.toggle('active', i === trackIdx); el.classList.toggle('paused', audio.paused); });
  $('repeat-all-btn')?.classList.toggle('active', repeatMode === 'all');
  $('repeat-one-btn')?.classList.toggle('active', repeatMode === 'one');
}
audio.addEventListener('ended', () => { if (repeatMode === 'all') loadTrack((trackIdx + 1) % TRACKS.length, true); });

function selectTrack(idx) { loadTrack(idx, !audio.paused || audioStarted); }
function toggleMusic() {
  if (!audio.src || audio.src === location.href) loadTrack(trackIdx, false);
  if (audio.paused) { audio.play().then(syncMusicUI).catch(() => {}); audioStarted = true; }
  else { audio.pause(); syncMusicUI(); }
}
function setRepeatMode(m) { repeatMode = repeatMode === m ? 'none' : m; localStorage.setItem('repeatMode', repeatMode); audio.loop = repeatMode === 'one'; syncPickerUI(); }

function startOnFirst() {
  if (audioStarted || !autoplayEnabled) return; audioStarted = true;
  if (!audio.src || audio.src === location.href) loadTrack(trackIdx, true);
  else audio.play().then(syncMusicUI).catch(() => {});
  document.removeEventListener('click', startOnFirst); document.removeEventListener('touchstart', startOnFirst);
}
document.addEventListener('click', startOnFirst); document.addEventListener('touchstart', startOnFirst);
audio.src = TRACKS[trackIdx].src; audio.loop = repeatMode === 'one'; syncPickerUI();

let pickerOpen = false, lpTimer = null;
function togglePicker(f) { pickerOpen = f !== undefined ? f : !pickerOpen; $('music-picker').classList.toggle('open', pickerOpen); if (pickerOpen) syncPickerUI(); }
musicBtn.addEventListener('mouseenter', () => { if (window.innerWidth > 768) togglePicker(true); });
musicBtn.addEventListener('mouseleave', () => { if (window.innerWidth > 768) setTimeout(() => { if (!$('music-picker').matches(':hover')) togglePicker(false); }, 150); });
$('music-picker').addEventListener('mouseleave', () => { if (window.innerWidth > 768) togglePicker(false); });
musicBtn.addEventListener('touchstart', () => { if (window.innerWidth <= 768) lpTimer = setTimeout(() => togglePicker(true), 600); }, { passive: true });
musicBtn.addEventListener('touchend',  () => clearTimeout(lpTimer));
musicBtn.addEventListener('touchmove', () => clearTimeout(lpTimer));
document.addEventListener('click', e => { if (pickerOpen && !$('music-picker').contains(e.target) && !musicBtn.contains(e.target)) togglePicker(false); });
