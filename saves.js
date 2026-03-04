/**
 * DS Vault — Main page JS
 * Gestion de la bibliothèque et des sauvegardes sur la page d'accueil
 */

// ─── Emoji aléatoire pour les jeux sans cover ───
const GAME_EMOJIS = ['🎮', '🕹️', '⚔️', '🐉', '🏆', '🌟', '💎', '🔮', '🎯', '🚀', '🧩', '🦄'];
function randomEmoji(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return GAME_EMOJIS[Math.abs(h) % GAME_EMOJIS.length];
}

// ─── Rendre la grille de bibliothèque ───
async function renderLibrary() {
  const grid   = document.getElementById('library-grid');
  const empty  = document.getElementById('empty-state');
  if (!grid) return;

  const roms = await window.library.listROMs();

  // Vider (sauf l'empty state)
  [...grid.children].forEach(c => { if (c !== empty) c.remove(); });

  if (!roms.length) {
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  for (const rom of roms) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="game-card-cover">
        <span>${randomEmoji(rom.name)}</span>
      </div>
      <div class="game-card-body">
        <div class="game-card-title" title="${escHtml(rom.name)}">${escHtml(rom.name)}</div>
        <div class="game-card-meta">${formatSize(rom.size)} · Ajouté le ${formatDate(rom.addedAt)}</div>
      </div>
      <div class="game-card-actions">
        <a class="card-btn primary-btn play-btn" href="player.html?rom=${encodeURIComponent(rom.id)}">▶ Jouer</a>
        <button class="card-btn danger delete-btn" data-id="${escHtml(rom.id)}">🗑 Supprimer</button>
      </div>
    `;

    card.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`Supprimer "${rom.name}" de la bibliothèque ? Les sauvegardes ne seront pas supprimées.`)) return;
      await window.library.deleteROM(rom.id);
      renderLibrary();
    });

    grid.appendChild(card);
  }
}

// ─── Rendre le gestionnaire de sauvegardes ───
async function renderSaves() {
  const grid  = document.getElementById('saves-grid');
  const empty = document.getElementById('saves-empty');
  if (!grid) return;

  const saves = await window.saveManager.listAllStates();
  [...grid.children].forEach(c => { if (c !== empty) c.remove(); });

  if (!saves.length) { empty.style.display = ''; return; }
  empty.style.display = 'none';

  for (const save of saves) {
    const card = document.createElement('div');
    card.className = 'save-card';
    card.innerHTML = `
      <div class="save-icon">💾</div>
      <div class="save-info">
        <div class="save-game" title="${escHtml(save.romName)}">${escHtml(save.romName)}</div>
        <div class="save-meta">${escHtml(save.label)} · ${formatDate(save.savedAt)}</div>
      </div>
      <div class="save-actions">
        <button class="save-btn export-btn" data-id="${save.id}" title="Exporter">⬇</button>
        <button class="save-btn danger delete-btn" data-id="${save.id}" title="Supprimer">✕</button>
      </div>
    `;

    card.querySelector('.export-btn').addEventListener('click', async () => {
      const full = await window.saveManager.getState(save.id);
      window.saveManager.exportState(full);
    });

    card.querySelector('.delete-btn').addEventListener('click', async () => {
      if (!confirm(`Supprimer la sauvegarde "${save.label}" ?`)) return;
      await window.saveManager.deleteState(save.id);
      renderSaves();
    });

    grid.appendChild(card);
  }
}

// ─── Gérer l'upload d'une ROM ───
async function handleROMUpload(file) {
  if (!file) return;
  if (!file.name.match(/\.(nds|zip)$/i)) {
    showNotification('❌ Format invalide. Utilisez un fichier .nds ou .zip', 'error');
    return;
  }

  showNotification('⏳ Chargement de la ROM en cours…', 'info');

  try {
    const record = await window.library.addROM(file);
    showNotification(`✅ "${record.name}" ajoutée à la bibliothèque !`, 'success');
    renderLibrary();
  } catch (err) {
    console.error(err);
    showNotification('❌ Erreur lors du chargement de la ROM.', 'error');
  }
}

// ─── Notification toast ───
function showNotification(msg, type = 'info') {
  const old = document.getElementById('ds-notification');
  if (old) old.remove();

  const colors = { info: '#4fc3f7', success: '#30c060', error: '#e84040' };
  const el = document.createElement('div');
  el.id = 'ds-notification';
  el.style.cssText = `
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: #141828; border: 1px solid ${colors[type] || colors.info};
    color: #dce8ff; font-family: 'Rajdhani', sans-serif; font-weight: 600;
    font-size: 15px; padding: 12px 24px; border-radius: 8px; z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5); animation: toast-in 0.25s ease;
    white-space: nowrap; max-width: 90vw;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Échappement HTML
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.showNotification = showNotification;
window.escHtml = escHtml;

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  // Uploads (depuis hero et depuis section)
  ['rom-upload-hero', 'rom-upload-lib'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', (e) => {
      [...e.target.files].forEach(handleROMUpload);
      e.target.value = '';
    });
  });

  // Export toutes sauvegardes
  const exportBtn = document.getElementById('export-all-saves');
  if (exportBtn) exportBtn.addEventListener('click', () => window.saveManager.exportAll());

  // Drag & drop sur la page entière
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    [...e.dataTransfer.files].forEach(handleROMUpload);
  });

  renderLibrary();
  renderSaves();
});
