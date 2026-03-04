export async function sha1OfArrayBuffer(buf: ArrayBuffer) {
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,"0")).join("");
}
