/* ════════════════════════════════════
   albums.js — Album config + index page renderer
   Thêm album mới: chỉ thêm 1 object vào ALBUMS
   ════════════════════════════════════ */

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

// Expose for album.js to import
if (typeof module !== 'undefined') module.exports = { ALBUMS };

/* ── Render index page album grid ── */
(function renderIndex() {
  const grid = document.getElementById('albums-grid');
  if (!grid) return; // not on index page

  document.getElementById('album-count').textContent = ALBUMS.length;

  // Render skeleton cards first
  ALBUMS.forEach(album => {
    const card = document.createElement('a');
    card.href = `album.html?id=${album.id}`;
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-card-grid">
        <div class="acg-main skeleton"></div>
        <div class="acg-sub  skeleton"></div>
        <div class="acg-sub  skeleton"></div>
      </div>
      <div class="album-card-info">
        <div>
          <div class="album-card-name">${album.emoji} ${album.title}</div>
          <div class="album-card-date">${album.date}</div>
        </div>
        <span class="album-card-badge" id="badge-${album.id}">...</span>
      </div>`;
    grid.appendChild(card);
  });

  // Fetch each album to get count + preview photos
  let totalPhotos = 0;

  ALBUMS.forEach(album => {
    fetch(album.jsonUrl)
      .then(r => r.json())
      .then(data => {
        const photos = extractPhotos(data);
        totalPhotos += photos.length;
        document.getElementById('total-count').textContent = totalPhotos;

        const badge = document.getElementById(`badge-${album.id}`);
        if (badge) badge.textContent = photos.length + ' ảnh';

        // Fill preview images (pick 3 random)
        const card = grid.querySelector(`[href="album.html?id=${album.id}"]`);
        if (!card) return;
        const pool = [...photos].sort(() => Math.random() - .5);
        const slots = card.querySelectorAll('.acg-main, .acg-sub');
        slots.forEach((slot, i) => {
          if (!pool[i]) return;
          slot.classList.remove('skeleton');
          const img = document.createElement('img');
          img.src = pool[i].url;
          img.alt = pool[i].name;
          img.loading = 'lazy';
          slot.appendChild(img);
        });
      })
      .catch(() => {
        const badge = document.getElementById(`badge-${album.id}`);
        if (badge) badge.textContent = '—';
      });
  });
})();

function extractPhotos(data) {
  if (!data) return [];
  if (Array.isArray(data) && data[0]?.photos) return data[0].photos;
  if (!Array.isArray(data) && data.photos)    return data.photos;
  if (Array.isArray(data))                     return data;
  return [];
}
