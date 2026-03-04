export function blitToCanvas(canvas: HTMLCanvasElement, rgba: Uint8ClampedArray, width: number, height: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = new ImageData(rgba, width, height);
  ctx.putImageData(img, 0, 0);
}

export function ensureCanvasSize(canvas: HTMLCanvasElement, width: number, height: number) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}
