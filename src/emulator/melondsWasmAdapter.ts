import type { DSEmuAdapter, FrameBuffers, InputState } from "./types";

type ModuleLike = any;

type SystemFiles = {
  bios7: Uint8Array;
  bios9: Uint8Array;
  firmware: Uint8Array;
};

export class MelonDSWasmAdapter implements DSEmuAdapter {
  private module: ModuleLike | null = null;
  private heapU8: Uint8Array | null = null;

  private fbBasePtr = 0;
  private frontBufferPtr = 0;

  private width = 256;
  private height = 192;
  private rgbaSize = this.width * this.height * 4;

  private system: SystemFiles | null = null;
  private input: InputState = emptyInput();

  async init(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      (window as any).wasmReady = () => resolve();

      const script = document.createElement("script");
      script.src = "/cores/melonds/a.out.js";
      script.async = true;
      script.onerror = () => reject(new Error("Impossible de charger /cores/melonds/a.out.js"));
      document.head.appendChild(script);
    });

    const mod = (window as any).Module as ModuleLike | undefined;
    if (!mod) throw new Error("Module introuvable après chargement de a.out.js");

    this.module = mod;
    this.heapU8 = mod.HEAPU8 as Uint8Array;

    this.frontBufferPtr = mod._getSymbol(5) as number;
    this.fbBasePtr = mod._getSymbol(4) as number;
  }

  setSystemFiles(files: Record<string, Uint8Array>): void {
    const bios7 = files["bios7"];
    const bios9 = files["bios9"];
    const firmware = files["firmware"];
    if (!bios7 || !bios9 || !firmware) throw new Error("Fichiers système manquants: bios7 + bios9 + firmware");
    this.system = { bios7, bios9, firmware };
  }

  loadRom(romBytes: Uint8Array): void {
    if (!this.module || !this.heapU8) throw new Error("Adapter non initialisé");
    if (!this.system) throw new Error("Fichiers système non fournis (bios7/bios9/firmware)");

    const mod = this.module;
    const heap = this.heapU8;

    mod._reset();

    const ptrBios7 = mod._getSymbol(0) as number;
    const ptrBios9 = mod._getSymbol(1) as number;
    const ptrFw = mod._getSymbol(2) as number;
    const ptrRom = mod._getSymbol(3) as number;

    heap.set(this.system.bios7, ptrBios7);
    heap.set(this.system.bios9, ptrBios9);
    heap.set(this.system.firmware, ptrFw);
    heap.set(romBytes, ptrRom);

    mod._loadROM(romBytes.length);
  }

  setInput(state: InputState): void {
    this.input = state;
    // pas d’API input exposée par wasm-port tel quel (patch requis)
  }

  runFrame(): void {
    if (!this.module) throw new Error("Adapter non initialisé");
    this.module._runFrame();
  }

  getFrameBuffers(): FrameBuffers {
    if (!this.module || !this.heapU8) throw new Error("Adapter non initialisé");

    const heap = this.heapU8;
    const front = heap[this.frontBufferPtr] & 0xff;
    const fbIndex = front & 1;

    const topOff = this.fbBasePtr + this.rgbaSize * (fbIndex * 2 + 0);
    const botOff = this.fbBasePtr + this.rgbaSize * (fbIndex * 2 + 1);

    const top = new Uint8ClampedArray(heap.buffer, topOff, this.rgbaSize);
    const bottom = new Uint8ClampedArray(heap.buffer, botOff, this.rgbaSize);

    return { width: this.width, height: this.height, top, bottom };
  }

  getSaveRam(): Uint8Array { return new Uint8Array(); }
  setSaveRam(_save: Uint8Array): void {}

  saveState(): Uint8Array { return new Uint8Array(); }
  loadState(_state: Uint8Array): void {}

  destroy(): void {}
}

function emptyInput(): InputState {
  return { A:false,B:false,X:false,Y:false,L:false,R:false,Start:false,Select:false,Up:false,Down:false,Left:false,Right:false };
}
