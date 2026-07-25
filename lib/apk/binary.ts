/** Shared binary helpers for the APK verifier (all client-side). */

export function toHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

/** "aabbcc…" → "AA:BB:CC:…" (the format developers publish fingerprints in). */
export function colonize(hex: string): string {
  return hex.toUpperCase().match(/.{2}/g)?.join(":") ?? hex.toUpperCase();
}

/** Strip separators/whitespace so pasted values compare reliably. */
export function normalizeHex(input: string): string {
  return input.toLowerCase().replace(/[^0-9a-f]/g, "");
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", data as BufferSource)));
}

export async function sha1Hex(data: Uint8Array): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-1", data as BufferSource)));
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
