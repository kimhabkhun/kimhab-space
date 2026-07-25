/**
 * Minimal read-only ZIP parser — just enough to analyze an APK:
 * locate the central directory, list entries, and inflate single files
 * (AndroidManifest.xml, META-INF signature files). The APK is treated
 * strictly as binary data; nothing is executed.
 */

export interface ZipEntry {
  name: string;
  method: number; // 0 = stored, 8 = deflate
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

export interface ZipInfo {
  entries: ZipEntry[];
  centralDirOffset: number;
}

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

export function parseZip(u8: Uint8Array): ZipInfo {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const len = u8.length;
  if (len < 22) throw new Error("File is too small to be an APK.");

  // EOCD sits at the end, possibly followed by a comment (max 65535 bytes)
  let eocd = -1;
  const floor = Math.max(0, len - 22 - 65535);
  for (let i = len - 22; i >= floor; i--) {
    if (dv.getUint32(i, true) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a valid APK/ZIP (end-of-archive record not found).");

  const count = dv.getUint16(eocd + 10, true);
  const cdOffset = dv.getUint32(eocd + 16, true);
  if (cdOffset === 0xffffffff) throw new Error("ZIP64 archives are not supported.");
  if (cdOffset >= len) throw new Error("Corrupt archive (central directory out of bounds).");

  const entries: ZipEntry[] = [];
  const decoder = new TextDecoder();
  let p = cdOffset;
  for (let i = 0; i < count; i++) {
    if (p + 46 > len || dv.getUint32(p, true) !== CEN_SIG) break;
    const method = dv.getUint16(p + 10, true);
    const compressedSize = dv.getUint32(p + 20, true);
    const uncompressedSize = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localHeaderOffset = dv.getUint32(p + 42, true);
    entries.push({
      name: decoder.decode(u8.subarray(p + 46, p + 46 + nameLen)),
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { entries, centralDirOffset: cdOffset };
}

export async function readEntry(u8: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const p = entry.localHeaderOffset;
  if (p + 30 > u8.length || dv.getUint32(p, true) !== LOC_SIG) {
    throw new Error(`Corrupt local header for "${entry.name}".`);
  }
  const nameLen = dv.getUint16(p + 26, true);
  const extraLen = dv.getUint16(p + 28, true);
  const start = p + 30 + nameLen + extraLen;
  const comp = u8.subarray(start, start + entry.compressedSize);

  if (entry.method === 0) return comp.slice();
  if (entry.method === 8) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This browser can't decompress ZIP entries (DecompressionStream unavailable).");
    }
    const stream = new Blob([comp.slice().buffer])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  throw new Error(`Unsupported compression method ${entry.method} for "${entry.name}".`);
}
