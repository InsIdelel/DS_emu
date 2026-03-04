import type { InputState } from "./types";

const KEYMAP: Record<string, keyof InputState> = {
  ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
  KeyX: "A", KeyZ: "B", KeyS: "X", KeyA: "Y",
  KeyQ: "L", KeyW: "R",
  Enter: "Start",
  ShiftLeft: "Select",
  ShiftRight: "Select",
};

export function createInputController() {
  let state: InputState = emptyInput();

  function onKeyDown(e: KeyboardEvent) {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    state = { ...state, [k]: true };
  }
  function onKeyUp(e: KeyboardEvent) {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    state = { ...state, [k]: false };
  }

  function attach() {
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: false });
  }
  function detach() {
    window.removeEventListener("keydown", onKeyDown as any);
    window.removeEventListener("keyup", onKeyUp as any);
  }

  function setTouch(touchX?: number, touchY?: number, touching?: boolean) {
    state = { ...state, touchX, touchY, touching };
  }
  function getState() { return state; }

  return { attach, detach, getState, setTouch };
}

export function emptyInput(): InputState {
  return { A:false,B:false,X:false,Y:false,L:false,R:false,Start:false,Select:false,Up:false,Down:false,Left:false,Right:false };
}
