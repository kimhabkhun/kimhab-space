/**
 * Streaming MD5 (RFC 1321). Web Crypto deliberately omits MD5, but some
 * developers still publish MD5 sums for legacy comparison, so we compute
 * it ourselves — in chunks, yielding to the UI between chunks so large
 * APKs don't freeze the tab.
 *
 * MD5 is displayed for compatibility only; it is NOT collision-resistant
 * and must never be the sole basis for trusting a file.
 */

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// K[i] = floor(abs(sin(i+1)) * 2^32) — the standard constant table.
const K = new Uint32Array(64);
for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);

class Md5 {
  private state = new Int32Array([0x67452301, 0xefcdab89 | 0, 0x98badcfe | 0, 0x10325476]);
  private buffer = new Uint8Array(64);
  private bufLen = 0;
  private totalBytes = 0;
  private words = new Int32Array(16);

  update(data: Uint8Array): void {
    this.totalBytes += data.length;
    let p = 0;
    if (this.bufLen > 0) {
      const need = 64 - this.bufLen;
      const take = Math.min(need, data.length);
      this.buffer.set(data.subarray(0, take), this.bufLen);
      this.bufLen += take;
      p = take;
      if (this.bufLen === 64) {
        this.processBlock(this.buffer, 0);
        this.bufLen = 0;
      }
    }
    while (p + 64 <= data.length) {
      this.processBlock(data, p);
      p += 64;
    }
    if (p < data.length) {
      this.buffer.set(data.subarray(p), 0);
      this.bufLen = data.length - p;
    }
  }

  digestHex(): string {
    // Padding: 0x80, zeros to 56 mod 64, then 64-bit little-endian bit count
    const bits = this.totalBytes * 8;
    const pad = new Uint8Array(((this.bufLen < 56 ? 56 : 120) - this.bufLen) + 8);
    pad[0] = 0x80;
    const lo = bits >>> 0;
    const hi = Math.floor(bits / 4294967296);
    const dv = new DataView(pad.buffer);
    dv.setUint32(pad.length - 8, lo, true);
    dv.setUint32(pad.length - 4, hi, true);
    this.update(pad);

    let out = "";
    for (let w = 0; w < 4; w++) {
      const v = this.state[w] >>> 0;
      out +=
        (v & 0xff).toString(16).padStart(2, "0") +
        ((v >>> 8) & 0xff).toString(16).padStart(2, "0") +
        ((v >>> 16) & 0xff).toString(16).padStart(2, "0") +
        ((v >>> 24) & 0xff).toString(16).padStart(2, "0");
    }
    return out;
  }

  private processBlock(bytes: Uint8Array, offset: number): void {
    const M = this.words;
    for (let i = 0; i < 16; i++) {
      const o = offset + i * 4;
      M[i] = bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24);
    }
    let A = this.state[0];
    let B = this.state[1];
    let C = this.state[2];
    let D = this.state[3];

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
    }

    this.state[0] = (this.state[0] + A) | 0;
    this.state[1] = (this.state[1] + B) | 0;
    this.state[2] = (this.state[2] + C) | 0;
    this.state[3] = (this.state[3] + D) | 0;
  }
}

/**
 * Hash `data` in chunks (default 4 MB), reporting progress 0–100 and
 * yielding to the event loop between chunks to keep the UI responsive.
 */
export async function md5Hex(
  data: Uint8Array,
  onProgress?: (pct: number) => void,
  chunkSize = 4 * 1024 * 1024
): Promise<string> {
  const md5 = new Md5();
  for (let p = 0; p < data.length; p += chunkSize) {
    md5.update(data.subarray(p, Math.min(p + chunkSize, data.length)));
    onProgress?.(Math.min(100, Math.round(((p + chunkSize) / data.length) * 100)));
    await new Promise((r) => setTimeout(r, 0));
  }
  if (data.length === 0) onProgress?.(100);
  return md5.digestHex();
}
