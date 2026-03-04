import React, { useEffect, useRef, useState } from "react";
import { getRom, getSaveRam, putSaveRam, putState, getState, touchLastPlayed } from "../db/db";
import { StubAdapter } from "../emulator/adapter";
import { MelonDSWasmAdapter } from "../emulator/melondsWasmAdapter";
import { createInputController } from "../emulator/input";
import { blitToCanvas, ensureCanvasSize } from "../emulator/render";
import { EmuHUD } from "../components/EmuHUD";
import type { DSEmuAdapter } from "../emulator/types";

type CoreChoice = "stub" | "melonds-wasm";

export function PlayerPage(props: { sha1: string; onExit: () => void }) {
  const [romName, setRomName] = useState<string>("(chargement…)");
  const [core, setCore] = useState<CoreChoice>("melonds-wasm");
  const [sysFiles, setSysFiles] = useState<{ bios7?: Uint8Array; bios9?: Uint8Array; firmware?: Uint8Array; }>({});

  const topRef = useRef<HTMLCanvasElement | null>(null);
  const bottomRef = useRef<HTMLCanvasElement | null>(null);

  const adapterRef = useRef<DSEmuAdapter | null>(null);
  const inputRef = useRef<ReturnType<typeof createInputController> | null>(null);
  const rafRef = useRef<number | null>(null);

  const [status, setStatus] = useState<string>("Initialisation…");
  const [lastSaveAt, setLastSaveAt] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setStatus("Chargement ROM…");
      const rom = await getRom(props.sha1);
      if (!rom) { setStatus("ROM introuvable."); return; }
      if (!alive) return;

      setRomName(rom.name);
      await touchLastPlayed(props.sha1);

      const romBytes = new Uint8Array(await rom.romBlob.arrayBuffer());

      let adapter: DSEmuAdapter = core === "melonds-wasm" ? new MelonDSWasmAdapter() : new StubAdapter();
      adapterRef.current = adapter;

      try {
        await adapter.init();
      } catch (e: any) {
        setStatus((e?.message ?? "Erreur init core") + " — fallback Stub.");
        adapterRef.current = new StubAdapter();
        await adapterRef.current.init();
        adapterRef.current.loadRom(romBytes);
        setCore("stub");
        startLoopAndAutosave(props.sha1);
        return;
      }

      if (core === "melonds-wasm") {
        const m = adapter as unknown as MelonDSWasmAdapter;
        if (!sysFiles.bios7 || !sysFiles.bios9 || !sysFiles.firmware) {
          setStatus("Fichiers système requis (bios7/bios9/firmware). Importez-les ci-dessus.");
          return;
        }
        m.setSystemFiles({ bios7: sysFiles.bios7, bios9: sysFiles.bios9, firmware: sysFiles.firmware });
        m.loadRom(romBytes);
        setStatus("Core melonDS chargé. (Input/SaveRAM non exposés dans wasm-port tel quel)");
      } else {
        adapter.loadRom(romBytes);
        setStatus("Stub chargé (démo).");
      }

      const save = await getSaveRam(props.sha1);
      if (save?.saveRamBlob) {
        const bytes = new Uint8Array(await save.saveRamBlob.arrayBuffer());
        adapter.setSaveRam(bytes);
      }

      startLoopAndAutosave(props.sha1);
    })();

    function startLoopAndAutosave(romSha1: string) {
      const input = createInputController();
      input.attach();
      inputRef.current = input;

      const bottom = bottomRef.current;
      if (bottom) {
        const onPointerDown = (e: PointerEvent) => {
          const pt = toCanvasCoords(bottom, e);
          input.setTouch(pt.x, pt.y, true);
          bottom.setPointerCapture(e.pointerId);
        };
        const onPointerMove = (e: PointerEvent) => {
          if (e.pressure === 0) return;
          const pt = toCanvasCoords(bottom, e);
          input.setTouch(pt.x, pt.y, true);
        };
        const onPointerUp = () => input.setTouch(undefined, undefined, false);

        bottom.addEventListener("pointerdown", onPointerDown);
        bottom.addEventListener("pointermove", onPointerMove);
        bottom.addEventListener("pointerup", onPointerUp);
        bottom.addEventListener("pointercancel", onPointerUp);

        (bottom as any).__cleanup = () => {
          bottom.removeEventListener("pointerdown", onPointerDown);
          bottom.removeEventListener("pointermove", onPointerMove);
          bottom.removeEventListener("pointerup", onPointerUp);
          bottom.removeEventListener("pointercancel", onPointerUp);
        };
      }

      const loop = () => {
        const a = adapterRef.current;
        const i = inputRef.current;
        if (!a || !i) return;

        a.setInput(i.getState());
        a.runFrame();

        const fb = a.getFrameBuffers();
        const top = topRef.current;
        const bottomC = bottomRef.current;

        if (top) { ensureCanvasSize(top, fb.width, fb.height); blitToCanvas(top, fb.top, fb.width, fb.height); }
        if (bottomC) { ensureCanvasSize(bottomC, fb.width, fb.height); blitToCanvas(bottomC, fb.bottom, fb.width, fb.height); }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      const interval = window.setInterval(async () => {
        const a = adapterRef.current;
        if (!a) return;
        const saveBytes = a.getSaveRam();
        if (!saveBytes.byteLength) return;
        await putSaveRam(romSha1, new Blob([new Uint8Array(saveBytes)]));
        setLastSaveAt(Date.now());
      }, 20000);

      const onVis = async () => { if (document.visibilityState !== "hidden") return; await flushSave(); };
      const onPageHide = async () => { await flushSave(); };
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("pagehide", onPageHide);

      async function flushSave() {
        const a = adapterRef.current;
        if (!a) return;
        const saveBytes = a.getSaveRam();
        if (!saveBytes.byteLength) return;
        await putSaveRam(romSha1, new Blob([new Uint8Array(saveBytes)]));
        setLastSaveAt(Date.now());
      }

      return () => {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pagehide", onPageHide);
      };
    }

    return () => {
      alive = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      inputRef.current?.detach();
      inputRef.current = null;

      const bottom = bottomRef.current as any;
      if (bottom?.__cleanup) bottom.__cleanup();

      adapterRef.current?.destroy();
      adapterRef.current = null;
    };
  }, [props.sha1, core, sysFiles.bios7, sysFiles.bios9, sysFiles.firmware]);

  async function quickSave() {
    const a = adapterRef.current;
    if (!a) return;
    const state = a.saveState();
    if (!state.byteLength) { setStatus("Quick Save indisponible (core non patché)."); return; }
    await putState(props.sha1, 0, new Blob([new Uint8Array(state)]));
    setStatus("Quick Save : OK");
  }

  async function quickLoad() {
    const row = await getState(props.sha1, 0);
    if (!row) { setStatus("Quick Load : aucun état."); return; }
    const a = adapterRef.current;
    if (!a) return;
    const bytes = new Uint8Array(await row.stateBlob.arrayBuffer());
    a.loadState(bytes);
    setStatus("Quick Load : OK");
  }

  async function saveSlot(slot: number) {
    const a = adapterRef.current;
    if (!a) return;
    const state = a.saveState();
    if (!state.byteLength) { setStatus("Savestates indisponibles (core non patché)."); return; }
    await putState(props.sha1, slot, new Blob([new Uint8Array(state)]));
    setStatus(`State slot ${slot} : sauvegardé`);
  }

  async function loadSlot(slot: number) {
    const row = await getState(props.sha1, slot);
    if (!row) { setStatus(`State slot ${slot} : vide`); return; }
    const a = adapterRef.current;
    if (!a) return;
    const bytes = new Uint8Array(await row.stateBlob.arrayBuffer());
    a.loadState(bytes);
    setStatus(`State slot ${slot} : chargé`);
  }

  async function onExit() {
    const a = adapterRef.current;
    if (a) {
      const saveBytes = a.getSaveRam();
      if (saveBytes.byteLength) {
        await putSaveRam(props.sha1, new Blob([new Uint8Array(saveBytes)]));
        setLastSaveAt(Date.now());
      }
    }
    props.onExit();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={styles.sysCard}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 650 }}>Core :</span>
          <select value={core} onChange={(e) => setCore(e.target.value as CoreChoice)} style={styles.select}>
            <option value="melonds-wasm">melonDS-wasm (44670) — nécessite a.out.js/.wasm + BIOS/firmware</option>
            <option value="stub">Stub (démo)</option>
          </select>

          {core === "melonds-wasm" && (
            <>
              <FilePick label="bios7.bin (16KB)" onBytes={(b) => setSysFiles((s) => ({ ...s, bios7: b }))} />
              <FilePick label="bios9.bin (4KB)" onBytes={(b) => setSysFiles((s) => ({ ...s, bios9: b }))} />
              <FilePick label="firmware.bin (128/256/512KB)" onBytes={(b) => setSysFiles((s) => ({ ...s, firmware: b }))} />
              <span style={{ fontSize: 12, color: "#666" }}>
                (Les fichiers restent en mémoire pour cette session.)
              </span>
            </>
          )}
        </div>
      </div>

      <EmuHUD
        romName={romName}
        sha1={props.sha1}
        status={status + (lastSaveAt ? ` • Autosave: ${new Date(lastSaveAt).toLocaleTimeString("fr-FR")}` : "")}
        onExit={onExit}
        onSaveState={saveSlot}
        onLoadState={loadSlot}
        onQuickSave={quickSave}
        onQuickLoad={quickLoad}
      />

      <div style={styles.stage}>
        <div style={styles.screenCol}>
          <div style={styles.label}>Écran haut</div>
          <canvas ref={topRef} style={styles.canvas} />
        </div>
        <div style={styles.screenCol}>
          <div style={styles.label}>Écran bas (pointer = tactile)</div>
          <canvas ref={bottomRef} style={styles.canvas} />
          <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Clavier (défaut) : Flèches = D-Pad • X= A • Z= B • S= X • A= Y • Q= L • W= R • Enter = Start • Shift = Select
          </div>
        </div>
      </div>

      {core === "melonds-wasm" && (
        <div style={styles.note}>
          <b>Note :</b> le port wasm-port expose le rendu via <code>_getSymbol(4/5)</code> et l’exécution via <code>_runFrame</code>,
          mais pas l’input + SaveRAM + savestates. Il faut patcher/rebuilder le core si vous voulez une expérience complète.
        </div>
      )}
    </div>
  );
}

function FilePick(props: { label: string; onBytes: (b: Uint8Array) => void }) {
  return (
    <label style={styles.fileBtn}>
      {props.label}
      <input type="file" style={{ display: "none" }} onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const buf = new Uint8Array(await f.arrayBuffer());
        props.onBytes(buf);
        e.currentTarget.value = "";
      }} />
    </label>
  );
}

function toCanvasCoords(canvas: HTMLCanvasElement, e: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)));
  return { x, y };
}

const styles: Record<string, React.CSSProperties> = {
  sysCard: { border: "1px solid #e5e5e5", borderRadius: 12, padding: 12, background: "#fff" },
  select: { padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" },
  fileBtn: { padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", display: "inline-block", fontSize: 12 },
  stage: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 },
  screenCol: { border: "1px solid #e5e5e5", borderRadius: 12, padding: 12, background: "#fff" },
  label: { fontSize: 12, color: "#666", marginBottom: 8 },
  canvas: { width: "100%", imageRendering: "pixelated", borderRadius: 10, border: "1px solid #eee", background: "#000" },
  note: { border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa", color: "#333" }
};
