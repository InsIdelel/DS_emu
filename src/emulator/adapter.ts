import type { DSEmuAdapter, FrameBuffers, InputState } from "./types";

export class StubAdapter implements DSEmuAdapter {
  private width = 256;
  private height = 192;
  private top = new Uint8ClampedArray(this.width * this.height * 4);
  private bottom = new Uint8ClampedArray(this.width * this.height * 4);
  private input: InputState = emptyInput();
  private tick = 0;
  private saveRam = new Uint8Array(64 * 1024);

  async init() {}

  loadRom(_romBytes: Uint8Array) {
    for (let i = 0; i < this.saveRam.length; i += 4096) this.saveRam[i] = (i / 4096) & 0xff;
  }

  setInput(state: InputState) { this.input = state; }

  runFrame() {
    this.tick++;
    this.saveRam[0] = (this.tick >>> 0) & 0xff;
    this.saveRam[1] = (this.tick >>> 8) & 0xff;
    this.saveRam[2] = (this.tick >>> 16) & 0xff;
    this.saveRam[3] = (this.tick >>> 24) & 0xff;
    this.paint(this.top, true);
    this.paint(this.bottom, false);
  }

  getFrameBuffers(): FrameBuffers {
    return { width: this.width, height: this.height, top: this.top, bottom: this.bottom };
  }

  getSaveRam(): Uint8Array { return this.saveRam.slice(); }
  setSaveRam(save: Uint8Array) { this.saveRam = new Uint8Array(save); }

  saveState(): Uint8Array {
    const header = new Uint8Array(8);
    new DataView(header.buffer).setUint32(0, this.tick, true);
    new DataView(header.buffer).setUint32(4, 0x44535354, true);
    const out = new Uint8Array(header.length + this.saveRam.length);
    out.set(header, 0); out.set(this.saveRam, header.length);
    return out;
  }
  loadState(state: Uint8Array): void {
    if (state.length < 8) return;
    const view = new DataView(state.buffer, state.byteOffset, state.byteLength);
    const sig = view.getUint32(4, true);
    if (sig !== 0x44535354) return;
    this.tick = view.getUint32(0, true);
    this.saveRam = new Uint8Array(state.slice(8));
  }

  destroy(): void {}

  private paint(buf: Uint8ClampedArray, isTop: boolean) {
    const w = this.width, h = this.height, t = this.tick, a = this.input;
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
      const i = (y*w+x)*4;
      let r = (x+t)&255, g = (y+(isTop?40:120)+(t>>1))&255, b = ((x^y)+(t>>2))&255;
      if (a.A) r=255; if (a.B) g=255; if (a.X) b=255; if (a.Y) {r=255;g=255;}
      if (!isTop && a.touching && a.touchX!=null && a.touchY!=null) {
        const dx=x-a.touchX, dy=y-a.touchY; if (dx*dx+dy*dy<400) {r=255;g=120;b=0;}
      }
      buf[i]=r; buf[i+1]=g; buf[i+2]=b; buf[i+3]=255;
    }
  }
}

function emptyInput(): InputState {
  return { A:false,B:false,X:false,Y:false,L:false,R:false,Start:false,Select:false,Up:false,Down:false,Left:false,Right:false };
}
