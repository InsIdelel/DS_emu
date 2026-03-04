import { openDB } from "idb";

export type RomRow = {
  sha1: string;
  name: string;
  size: number;
  addedAt: number;
  lastPlayedAt?: number;
  romBlob: Blob;
};

export type SaveRow = {
  romSha1: string;
  saveRamBlob: Blob;
  updatedAt: number;
};

export type StateRow = {
  romSha1: string;
  slot: number;
  stateBlob: Blob;
  updatedAt: number;
};

export const dbPromise = openDB("ds-emu", 1, {
  upgrade(db) {
    db.createObjectStore("roms", { keyPath: "sha1" });
    db.createObjectStore("saves", { keyPath: "romSha1" });
    db.createObjectStore("states", { keyPath: ["romSha1", "slot"] });
  },
});

export async function putRom(row: RomRow) {
  const db = await dbPromise;
  await db.put("roms", row);
}

export async function listRoms(): Promise<RomRow[]> {
  const db = await dbPromise;
  return db.getAll("roms");
}

export async function getRom(sha1: string): Promise<RomRow | undefined> {
  const db = await dbPromise;
  return db.get("roms", sha1);
}

export async function deleteRom(sha1: string) {
  const db = await dbPromise;
  await db.delete("roms", sha1);
  await db.delete("saves", sha1);

  const tx = db.transaction("states", "readwrite");
  const store = tx.objectStore("states");
  let cursor = await store.openCursor();
  while (cursor) {
    const [romSha1] = cursor.key as [string, number];
    if (romSha1 === sha1) await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function touchLastPlayed(sha1: string) {
  const db = await dbPromise;
  const rom = await db.get("roms", sha1);
  if (!rom) return;
  rom.lastPlayedAt = Date.now();
  await db.put("roms", rom);
}

export async function putSaveRam(romSha1: string, saveRamBlob: Blob) {
  const db = await dbPromise;
  const row: SaveRow = { romSha1, saveRamBlob, updatedAt: Date.now() };
  await db.put("saves", row);
}

export async function getSaveRam(romSha1: string): Promise<SaveRow | undefined> {
  const db = await dbPromise;
  return db.get("saves", romSha1);
}

export async function putState(romSha1: string, slot: number, stateBlob: Blob) {
  const db = await dbPromise;
  const row: StateRow = { romSha1, slot, stateBlob, updatedAt: Date.now() };
  await db.put("states", row);
}

export async function getState(romSha1: string, slot: number): Promise<StateRow | undefined> {
  const db = await dbPromise;
  return db.get("states", [romSha1, slot]);
}
