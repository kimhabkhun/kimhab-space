/**
 * APK Signing Block parser (signature schemes v2 / v3 / v3.1).
 * The block sits immediately before the ZIP central directory:
 *
 *   [u64 size][id-value pairs…][u64 size]["APK Sig Block 42"]
 *
 * Each pair: [u64 length][u32 id][value]. We detect which schemes are
 * present and extract the first signer's certificate (DER) for
 * fingerprinting. Scheme v4 lives in a separate .idsig file and cannot
 * be detected from the APK itself.
 */

const MAGIC = "APK Sig Block 42";
export const SCHEME_V2_ID = 0x7109871a;
export const SCHEME_V3_ID = 0xf05368c0;
export const SCHEME_V31_ID = 0x1b93ad61;

export interface SigningBlock {
  ids: Map<number, Uint8Array>;
}

export function parseApkSigningBlock(u8: Uint8Array, cdOffset: number): SigningBlock | null {
  if (cdOffset < 32 || cdOffset > u8.length) return null;
  for (let i = 0; i < 16; i++) {
    if (u8[cdOffset - 16 + i] !== MAGIC.charCodeAt(i)) return null;
  }
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const size = Number(dv.getBigUint64(cdOffset - 24, true));
  const blockStart = cdOffset - 8 - size;
  if (blockStart < 0 || Number(dv.getBigUint64(blockStart, true)) !== size) return null;

  const ids = new Map<number, Uint8Array>();
  let p = blockStart + 8;
  const pairsEnd = cdOffset - 24;
  while (p + 12 <= pairsEnd) {
    const len = Number(dv.getBigUint64(p, true));
    if (len < 4 || p + 8 + len > pairsEnd) break;
    const id = dv.getUint32(p + 8, true);
    ids.set(id, u8.subarray(p + 12, p + 8 + len));
    p += 8 + len;
  }
  return { ids };
}

/**
 * Pull the first signer's first certificate out of a v2/v3 scheme block.
 * Both schemes share the same prefix layout on this path:
 *   signers(len) → signer(len) → signedData(len) → digests(len), certificates(len) → cert(len)
 * All length prefixes are u32 little-endian.
 */
export function certFromSchemeBlock(value: Uint8Array): Uint8Array | null {
  try {
    const dv = new DataView(value.buffer, value.byteOffset, value.byteLength);
    let p = 4; // skip signers sequence length
    p += 4; // skip first signer length
    const signedDataLen = dv.getUint32(p, true);
    const sdStart = p + 4;
    if (sdStart + signedDataLen > value.length) return null;
    let q = sdStart;
    const digestsLen = dv.getUint32(q, true);
    q += 4 + digestsLen;
    const certsLen = dv.getUint32(q, true);
    q += 4;
    const certsEnd = q + certsLen;
    if (certsEnd > value.length) return null;
    const certLen = dv.getUint32(q, true);
    q += 4;
    if (certLen === 0 || q + certLen > certsEnd) return null;
    return value.slice(q, q + certLen);
  } catch {
    return null;
  }
}
