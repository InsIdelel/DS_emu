/**
 * DS VAULT — DB.JS
 * IndexedDB wrapper for ROMs and saves
 */

const DB_NAME = 'DSVault';
const DB_VERSION = 1;

let db = null;

async function openDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('roms')) {
        const roms = d.createObjectStore('roms', { keyPath: 'id' });
        roms.createIndex('name', 'name', { unique: false });
        roms.createIndex('addedAt', 'addedAt', { unique: false });
      }
      if (!d.objectStoreNames.contains('saves')) {
        const saves = d.createObjectStore('saves', { keyPath: 'id' });
        saves.createIndex('romId', 'romId', { unique: false });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

function txn(store, mode = 'readonly') {
  return db.transaction([store], mode).objectStore(store);
}

// ── ROMs ────────────────────────────────────────

async function addROM(name, data, size) {
  await openDB();
  const id = 'rom_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const entry = { id, name, data, size, addedAt: Date.now(), lastPlayed: null };
  return new Promise((resolve, reject) => {
    const req = txn('roms', 'readwrite').put(entry);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

async function getAllROMs() {
  await openDB();
  return new Promise((resolve, reject) => {
    const req = txn('roms').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getROM(id) {
  await openDB();
  return new Promise((resolve, reject) => {
    const req = txn('roms').get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function updateROMPlaytime(id) {
  await openDB();
  const rom = await getROM(id);
  if (!rom) return;
  rom.lastPlayed = Date.now();
  return new Promise((resolve, reject) => {
    const req = txn('roms', 'readwrite').put(rom);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteROM(id) {
  await openDB();
  // Also delete saves for this ROM
  const saves = await getSavesForROM(id);
  for (const s of saves) await deleteSave(s.id);
  return new Promise((resolve, reject) => {
    const req = txn('roms', 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── SAVES ───────────────────────────────────────

async function saveSaveData(romId, slot, data, label = '') {
  await openDB();
  const id = `save_${romId}_slot${slot}`;
  const entry = { id, romId, slot, data, label, savedAt: Date.now() };
  return new Promise((resolve, reject) => {
    const req = txn('saves', 'readwrite').put(entry);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

async function getSave(romId, slot) {
  await openDB();
  const id = `save_${romId}_slot${slot}`;
  return new Promise((resolve, reject) => {
    const req = txn('saves').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function getSavesForROM(romId) {
  await openDB();
  return new Promise((resolve, reject) => {
    const index = txn('saves').index('romId');
    const req = index.getAll(romId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllSaves() {
  await openDB();
  return new Promise((resolve, reject) => {
    const req = txn('saves').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteSave(id) {
  await openDB();
  return new Promise((resolve, reject) => {
    const req = txn('saves', 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getSaveCount() {
  await openDB();
  return new Promise((resolve, reject) => {
    const req = txn('saves').count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── UTILS ───────────────────────────────────────

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(ts) {
  if (!ts) return 'jamais';
  const d = new Date(ts);
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatDateShort(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

// ArrayBuffer <-> Base64
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuffer(b64) {
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}
