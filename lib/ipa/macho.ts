/**
 * Extracts the code-signature CMS blob from a Mach-O executable —
 * this is where an iOS app's real signing certificate lives
 * (LC_CODE_SIGNATURE load command → superblob → CMS wrapper).
 * Purely structural reads; the binary is never executed.
 */

const FAT_MAGIC = 0xcafebabe;
const FAT_MAGIC_64 = 0xcafebabf;
const MH_MAGIC_64 = 0xfeedfacf;
const MH_MAGIC_32 = 0xfeedface;
const LC_CODE_SIGNATURE = 0x1d;
const CSMAGIC_EMBEDDED_SIGNATURE = 0xfade0cc0;
const CSMAGIC_CODEDIRECTORY = 0xfade0c02;
const CSMAGIC_BLOBWRAPPER = 0xfade0b01; // CMS signature
const CPU_TYPE_ARM64 = 0x0100000c;

export interface CodeSignatureInfo {
  cms?: Uint8Array;
  identifier?: string;
  teamId?: string;
}

function cString(u8: Uint8Array, off: number, max = 256): string {
  let s = "";
  for (let i = off; i < Math.min(off + max, u8.length) && u8[i] !== 0; i++) {
    s += String.fromCharCode(u8[i]);
  }
  return s;
}

export function extractCodeSignature(u8: Uint8Array, depth = 0): CodeSignatureInfo | null {
  try {
    if (u8.length < 32 || depth > 2) return null;
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);

    // FAT (multi-architecture) binary: descend into the arm64 slice
    const beMagic = dv.getUint32(0, false);
    if (beMagic === FAT_MAGIC || beMagic === FAT_MAGIC_64) {
      const is64 = beMagic === FAT_MAGIC_64;
      const nfat = dv.getUint32(4, false);
      const entrySize = is64 ? 32 : 20;
      let fallback: { off: number; size: number } | null = null;
      let chosen: { off: number; size: number } | null = null;
      for (let i = 0; i < Math.min(nfat, 16); i++) {
        const e = 8 + i * entrySize;
        if (e + entrySize > u8.length) break;
        const cputype = dv.getInt32(e, false);
        const off = is64 ? Number(dv.getBigUint64(e + 8, false)) : dv.getUint32(e + 8, false);
        const size = is64 ? Number(dv.getBigUint64(e + 16, false)) : dv.getUint32(e + 12, false);
        if (off + size > u8.length) continue;
        if (!fallback) fallback = { off, size };
        if (cputype === CPU_TYPE_ARM64 && !chosen) chosen = { off, size };
      }
      const slice = chosen ?? fallback;
      return slice ? extractCodeSignature(u8.subarray(slice.off, slice.off + slice.size), depth + 1) : null;
    }

    // Thin Mach-O
    const magic = dv.getUint32(0, true);
    let headerSize: number;
    if (magic === MH_MAGIC_64) headerSize = 32;
    else if (magic === MH_MAGIC_32) headerSize = 28;
    else return null;

    const ncmds = dv.getUint32(16, true);
    let p = headerSize;
    for (let i = 0; i < ncmds && p + 8 <= u8.length; i++) {
      const cmd = dv.getUint32(p, true);
      const cmdsize = dv.getUint32(p + 4, true);
      if (cmdsize < 8) break;
      if (cmd === LC_CODE_SIGNATURE && p + 16 <= u8.length) {
        const dataoff = dv.getUint32(p + 8, true);
        const datasize = dv.getUint32(p + 12, true);
        return parseSuperblob(u8, dv, dataoff, datasize);
      }
      p += cmdsize;
    }
    return null;
  } catch {
    return null;
  }
}

function parseSuperblob(
  u8: Uint8Array,
  dv: DataView,
  start: number,
  size: number
): CodeSignatureInfo | null {
  if (start + 12 > u8.length || dv.getUint32(start, false) !== CSMAGIC_EMBEDDED_SIGNATURE) {
    return null;
  }
  const end = Math.min(start + size, u8.length);
  const count = dv.getUint32(start + 8, false);
  const info: CodeSignatureInfo = {};

  for (let i = 0; i < Math.min(count, 32); i++) {
    const e = start + 12 + i * 8;
    if (e + 8 > end) break;
    const blobOff = start + dv.getUint32(e + 4, false);
    if (blobOff + 8 > end) continue;
    const blobMagic = dv.getUint32(blobOff, false);
    const blobLen = dv.getUint32(blobOff + 4, false);
    if (blobOff + blobLen > end) continue;

    if (blobMagic === CSMAGIC_BLOBWRAPPER && blobLen > 8) {
      info.cms = u8.slice(blobOff + 8, blobOff + blobLen);
    } else if (blobMagic === CSMAGIC_CODEDIRECTORY && blobLen >= 44) {
      const version = dv.getUint32(blobOff + 8, false);
      const identOffset = dv.getUint32(blobOff + 20, false);
      if (identOffset > 0 && blobOff + identOffset < end) {
        info.identifier = cString(u8, blobOff + identOffset);
      }
      if (version >= 0x20200 && blobLen >= 52) {
        const teamOffset = dv.getUint32(blobOff + 48, false);
        if (teamOffset > 0 && blobOff + teamOffset < end) {
          info.teamId = cString(u8, blobOff + teamOffset);
        }
      }
    }
  }
  return info.cms || info.identifier || info.teamId ? info : null;
}
