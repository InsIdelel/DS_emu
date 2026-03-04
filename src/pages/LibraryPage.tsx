import React, { useEffect, useState } from "react";
import { listRoms, putRom, deleteRom, RomRow } from "../db/db";
import { sha1OfArrayBuffer } from "../utils/hash";

export function LibraryPage(props: { onPlay: (sha1: string) => void }) {
  const [roms, setRoms] = useState<RomRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const all = await listRoms();
    all.sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0) || b.addedAt - a.addedAt);
    setRoms(all);
  }

  useEffect(() => { refresh(); }, []);

  async function onImportFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const sha1 = await sha1OfArrayBuffer(buf);
      await putRom({ sha1, name: file.name, size: file.size, addedAt: Date.now(), romBlob: new Blob([buf]) });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erreur import");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(sha1: string) {
    if (!confirm("Supprimer cette ROM et ses sauvegardes ?")) return;
    await deleteRom(sha1);
    await refresh();
  }

  return (
    <div style={styles.wrap}>
      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Bibliothèque</h2>
        <p style={{ marginTop: 6, color: "#444" }}>
          Importez une ROM depuis votre ordinateur. Elle sera stockée en local (IndexedDB).
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={styles.fileBtn}>
            Importer une ROM
            <input type="file" style={{ display: "none" }} onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.currentTarget.value = "";
            }} />
          </label>

          <div style={{ fontSize: 12, color: "#666" }}>
            Astuce : vous pouvez aussi glisser-déposer ci-dessous.
          </div>
        </div>

        {error && <div style={styles.err}>{error}</div>}
        {busy && <div style={styles.note}>Import en cours…</div>}

        <DropZone onFile={onImportFile} />

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {roms.map((r) => (
            <div key={r.sha1} style={styles.romCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{formatBytes(r.size)} • {shortSha(r.sha1)}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Dernière session : {r.lastPlayedAt ? new Date(r.lastPlayedAt).toLocaleString("fr-FR") : "—"}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={styles.btn} onClick={() => props.onPlay(r.sha1)}>Jouer</button>
                  <button style={styles.btnDanger} onClick={() => onDelete(r.sha1)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
          {roms.length === 0 && <div style={{ padding: 14, border: "1px dashed #ddd", borderRadius: 12, color: "#666" }}>Aucune ROM importée.</div>}
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Core melonDS-wasm (44670)</h3>
        <ol style={{ marginTop: 8, color: "#333" }}>
          <li>Copiez <code>a.out.js</code> et <code>a.out.wasm</code> dans <code>public/cores/melonds/</code></li>
          <li>Dans le Player, sélectionnez le core <code>melonDS-wasm</code> et importez <code>bios7/bios9/firmware</code></li>
        </ol>
        <p style={{ color: "#555" }}>
          Limite : le port wasm-port n’expose pas encore l’input + SaveRAM + savestates au JS.
        </p>
      </section>
    </div>
  );
}

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      style={{ marginTop: 12, padding: 18, borderRadius: 12, border: "2px dashed " + (over ? "#999" : "#ddd"), background: over ? "#fafafa" : "#fff", color: "#666", textAlign: "center" }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
    >
      Glissez-déposez une ROM ici
    </div>
  );
}

function formatBytes(bytes: number) {
  const units = ["o", "Ko", "Mo", "Go"];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
function shortSha(sha1: string) { return sha1.slice(0, 8) + "…" + sha1.slice(-6); }

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "grid", gridTemplateColumns: "1fr", gap: 14 },
  card: { border: "1px solid #e5e5e5", borderRadius: 12, padding: 14, background: "#fff" },
  romCard: { border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa" },
  btn: { padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
  btnDanger: { padding: "8px 10px", borderRadius: 10, border: "1px solid #f0c", background: "#fff", cursor: "pointer" },
  fileBtn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", display: "inline-block" },
  err: { marginTop: 10, color: "#b00020" },
  note: { marginTop: 10, color: "#444" }
};
