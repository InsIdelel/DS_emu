export type FrameBuffers = {
  top: Uint8ClampedArray;
  bottom: Uint8ClampedArray;
  width: number;
  height: number;
};

export type InputState = {
  A: boolean; B: boolean; X: boolean; Y: boolean;
  L: boolean; R: boolean;
  Start: boolean; Select: boolean;
  Up: boolean; Down: boolean; Left: boolean; Right: boolean;
  touchX?: number;
  touchY?: number;
  touching?: boolean;
};

export interface DSEmuAdapter {
  init(): Promise<void>;
  loadRom(romBytes: Uint8Array): void;
  setInput(state: InputState): void;
  runFrame(): void;
  getFrameBuffers(): FrameBuffers;

  getSaveRam(): Uint8Array;
  setSaveRam(save: Uint8Array): void;

  saveState(): Uint8Array;
  loadState(state: Uint8Array): void;

  destroy(): void;
}
