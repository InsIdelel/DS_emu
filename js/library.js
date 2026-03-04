/**
 * DS VAULT — LIBRARY.JS
 */

let allGames = [];

window.addEventListener('DOMContentLoaded', async () => {
  await openDB();
  await loadLibrary();
  setupDragDrop();
  setupFileInput();
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeConfirm(); closeSaveManager(); closeUpload(); }
  });
});

async function loadLibrary() {
  allGames = await getAllROMs();
  filterGames();
  await updateStats();
}

async function updateStats() {
  const roms = await getAllROMs();
  const saves = await getSaveCount();
  document.getElementById('rom-count').textContent = roms.length;
  document.getElementById('save-count').textContent = saves;
}

function filterGames() {
  const q = document.getElementById('search').value.toLowerCase();
  const sort = document.getElementById('sort').value;
  let games = allGames.filter(g => g.name.toLowerCase().includes(q));
  if (sort === 'name') games.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'recent') games.sort((a,b) => (b.lastPlayed||0) - (a.lastPlayed||0));
  else if (sort === 'added') games.sort((a,b) => b.addedAt - a.addedAt);
  renderGames(games);
}

async function renderGames(games) {
  const grid = document.getElementById('game-grid');
  const empty = document.getElementById('empty-state');
  if (games.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(empty);
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = '';
  for (const game of games) {
    const saves = await getSavesForROM(game.id);
    grid.appendChild(createCard(game, saves.length));
  }
}

function createCard(game, saveCount) {
  const card = document.createElement('div');
  card.className = 'game-card';
  const colors = ['#1a2a3a','#2a1a2a','#1a2a1a','#2a2a1a','#1a1a2a'];
  const color = colors[Math.abs(hashStr(game.name)) % colors.length];
  card.innerHTML = `
    <div class="game-card-cover" style="background: linear-gradient(135deg, ${color} 0%, #1a1e2e 100%)">
      <span class="cover-icon">◈</span>
      ${saveCount > 0 ? `<span class="save-badge">💾 ${saveCount} save${saveCount>1?'s':''}</span>` : ''}
    </div>
    <div class="game-card-info">
      <div class="game-card-title" title="${escHtml(game.name)}">${escHtml(game.name)}</div>
      <div class="game-card-meta"><span>NDS</span><span>${formatSize(game.size)}</span></div>
      <div class="game-card-meta" style="margin-bottom: 0.6rem;"><span style="color:var(--text3)">Joué: ${formatDate(game.lastPlayed)}</span></div>
      <div class="game-card-actions">
        <button class="card-btn primary" onclick="playGame('${game.id}')">▶ JOUER</button>
        <button class="card-btn" onclick="manageGameSaves('${game.id}','${escHtml(game.name)}')" title="Sauvegardes">💾</button>
        <button class="card-btn" onclick="confirmDelete('${game.id}','${escHtml(game.name)}')" title="Supprimer">✕</button>
      </div>
    </div>`;
  return card;
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function playGame(id) {
  window.location.href = `player.html?rom=${encodeURIComponent(id)}`;
}

function openUpload() {
  const zone = document.getElementById('upload-zone');
  zone.style.display = zone.style.display === 'none' ? '' : 'none';
}

function closeUpload() {
  document.getElementById('upload-zone').style.display = 'none';
}

function setupFileInput() {
  const input = document.getElementById('rom-input');
  input.addEventListener('change', async (e) => {
    await processFiles(Array.from(e.target.files));
    input.value = '';
  });
}

function setupDragDrop() {
  const zone = document.getElementById('upload-zone');
  document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.display = '';
    zone.classList.add('drag-over');
  });
  document.body.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget || !zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
  });
  document.body.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    await processFiles(Array.from(e.dataTransfer.files));
  });
}

async function processFiles(files) {
  const valid = files.filter(f => f.name.endsWith('.nds') || f.name.endsWith('.zip'));
  if (valid.length === 0) { showToast('Aucun fichier .nds valide trouvé', true); return; }
  let added = 0;
  for (const file of valid) {
    try {
      const buffer = await file.arrayBuffer();
      const name = file.name.replace(/\.(nds|zip)$/i, '');
      await addROM(name, bufferToBase64(buffer), file.size);
      added++;
    } catch(err) { showToast(`Erreur: ${file.name}`, true); }
  }
  if (added > 0) {
    showToast(`${added} jeu${added>1?'x':''} ajouté${added>1?'s':''}!`);
    await loadLibrary();
    closeUpload();
  }
}

function confirmDelete(id, name) {
  document.getElementById('confirm-title').textContent = 'SUPPRIMER LE JEU';
  document.getElementById('confirm-msg').textContent = `Supprimer "${name}" et toutes ses sauvegardes ? Action irréversible.`;
  document.getElementById('confirm-ok').onclick = async () => {
    await deleteROM(id);
    closeConfirm();
    await loadLibrary();
    showToast('Jeu supprimé');
  };
  document.getElementById('confirm-modal').style.display = 'flex';
}

function closeConfirm() {
  document.getElementById('confirm-modal').style.display = 'none';
}

async function clearAll() {
  const games = await getAllROMs();
  if (games.length === 0) { showToast('Aucun jeu à supprimer', true); return; }
  document.getElementById('confirm-title').textContent = 'TOUT SUPPRIMER';
  document.getElementById('confirm-msg').textContent = `Supprimer tous les ${games.length} jeux et toutes leurs sauvegardes ? Action irréversible.`;
  document.getElementById('confirm-ok').onclick = async () => {
    for (const g of games) await deleteROM(g.id);
    closeConfirm();
    await loadLibrary();
    showToast('Bibliothèque effacée');
  };
  document.getElementById('confirm-modal').style.display = 'flex';
}

async function openSaveManager() {
  await renderSaveManager();
  document.getElementById('save-modal').style.display = 'flex';
}

function closeSaveManager() {
  document.getElementById('save-modal').style.display = 'none';
}

async function renderSaveManager() {
  const container = document.getElementById('save-list');
  const saves = await getAllSaves();
  if (saves.length === 0) {
    container.innerHTML = '<p class="empty-modal">Aucune sauvegarde trouvée.</p>';
    return;
  }
  const roms = await getAllROMs();
  const romMap = {};
  roms.forEach(r => romMap[r.id] = r);
  container.innerHTML = '';
  for (const save of saves.sort((a,b) => b.savedAt - a.savedAt)) {
    const romName = romMap[save.romId]?.name || 'Jeu inconnu';
    const item = document.createElement('div');
    item.className = 'save-item';
    item.innerHTML = `
      <div class="save-item-icon">💾</div>
      <div class="save-item-info">
        <div class="save-item-name">${escHtml(romName)} — Slot ${save.slot + 1}</div>
        <div class="save-item-meta">${formatDate(save.savedAt)}</div>
      </div>
      <div class="save-item-actions">
        <button class="save-action-btn" onclick="exportSaveById('${save.id}','${escHtml(romName)}',${save.slot})">⬇ EXPORT</button>
        <button class="save-action-btn danger" onclick="confirmDeleteSave('${save.id}')">✕</button>
      </div>`;
    container.appendChild(item);
  }
}

async function exportSaveById(saveId, romName, slot) {
  const saves = await getAllSaves();
  const save = saves.find(s => s.id === saveId);
  if (!save || !save.data) { showToast('Sauvegarde introuvable', true); return; }
  const buffer = base64ToBuffer(save.data);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${romName}_slot${slot+1}.sav`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Sauvegarde exportée!');
}

async function exportAllSaves() {
  const saves = await getAllSaves();
  if (saves.length === 0) { showToast('Aucune sauvegarde à exporter', true); return; }
  const roms = await getAllROMs();
  const romMap = {};
  roms.forEach(r => romMap[r.id] = r);
  for (const save of saves) {
    if (!save.data) continue;
    const romName = romMap[save.romId]?.name || 'jeu';
    const buffer = base64ToBuffer(save.data);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${romName}_slot${save.slot+1}.sav`;
    a.click();
    URL.revokeObjectURL(url);
    await new Promise(r => setTimeout(r, 300));
  }
  showToast(`${saves.length} sauvegarde${saves.length>1?'s':''} exportée${saves.length>1?'s':''}!`);
}

function importSave() {
  document.getElementById('save-import-input').click();
}

async function handleSaveImport(e) {
  showToast('Utilisez "LOAD" dans le joueur pour importer un .sav', true);
}

async function manageGameSaves(romId, romName) {
  await renderSaveManager();
  document.getElementById('save-modal').style.display = 'flex';
}

function confirmDeleteSave(saveId) {
  document.getElementById('confirm-title').textContent = 'SUPPRIMER LA SAUVEGARDE';
  document.getElementById('confirm-msg').textContent = 'Supprimer cette sauvegarde ? Action irréversible.';
  document.getElementById('confirm-ok').onclick = async () => {
    await deleteSave(saveId);
    closeConfirm();
    await renderSaveManager();
    await updateStats();
    showToast('Sauvegarde supprimée');
  };
  document.getElementById('confirm-modal').style.display = 'flex';
}

let toastTimer;
function showToast(msg, error = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (error ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
}
