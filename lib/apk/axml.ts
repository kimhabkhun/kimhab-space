/**
 * Android binary XML (AXML) parser — reads just the manifest fields we
 * display: package, versionName/Code, min/target SDK, and the app label
 * when it's stored inline (labels are usually resource references into
 * resources.arsc, which we deliberately don't parse).
 */

export interface ManifestInfo {
  packageName?: string;
  versionName?: string;
  versionCode?: number;
  minSdk?: number;
  targetSdk?: number;
  /** null = present but stored as a resource reference */
  label?: string | null;
}

const CHUNK_STRING_POOL = 0x0001;
const CHUNK_XML = 0x0003;
const CHUNK_RESOURCE_MAP = 0x0180;
const CHUNK_START_ELEMENT = 0x0102;

const ATTR_VERSION_CODE = 0x0101021b;
const ATTR_VERSION_NAME = 0x0101021c;
const ATTR_MIN_SDK = 0x0101020c;
const ATTR_TARGET_SDK = 0x01010270;
const ATTR_LABEL = 0x01010001;

const TYPE_STRING = 0x03;
const TYPE_INT_DEC = 0x10;

export function parseBinaryManifest(data: Uint8Array): ManifestInfo {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (data.length < 8 || dv.getUint16(0, true) !== CHUNK_XML) {
    throw new Error("Not an Android binary XML file.");
  }
  const fileSize = Math.min(dv.getUint32(4, true), data.length);

  let pool: { base: number; count: number; utf8: boolean; stringsStart: number; offsets: number } | null =
    null;
  let resIds: number[] = [];
  const info: ManifestInfo = {};
  const utf8Decoder = new TextDecoder();

  const getString = (i: number): string => {
    if (!pool || i === 0xffffffff || i >= pool.count) return "";
    const entryOff = dv.getUint32(pool.offsets + i * 4, true);
    let p = pool.base + pool.stringsStart + entryOff;
    if (pool.utf8) {
      // char count (1–2 bytes), then byte count (1–2 bytes), then UTF-8 data
      const c1 = dv.getUint8(p);
      p += c1 & 0x80 ? 2 : 1;
      let byteLen = dv.getUint8(p);
      if (byteLen & 0x80) {
        byteLen = ((byteLen & 0x7f) << 8) | dv.getUint8(p + 1);
        p += 2;
      } else {
        p += 1;
      }
      return utf8Decoder.decode(data.subarray(p, p + byteLen));
    }
    let charLen = dv.getUint16(p, true);
    p += 2;
    if (charLen & 0x8000) {
      charLen = ((charLen & 0x7fff) << 16) | dv.getUint16(p, true);
      p += 2;
    }
    let s = "";
    for (let k = 0; k < charLen; k++) s += String.fromCharCode(dv.getUint16(p + k * 2, true));
    return s;
  };

  let off = 8;
  while (off + 8 <= fileSize) {
    const type = dv.getUint16(off, true);
    const headerSize = dv.getUint16(off + 2, true);
    const size = dv.getUint32(off + 4, true);
    if (size < 8 || off + size > fileSize) break;

    if (type === CHUNK_STRING_POOL && !pool) {
      pool = {
        base: off,
        count: dv.getUint32(off + 8, true),
        utf8: (dv.getUint32(off + 16, true) & 0x100) !== 0,
        stringsStart: dv.getUint32(off + 20, true),
        offsets: off + headerSize,
      };
    } else if (type === CHUNK_RESOURCE_MAP) {
      resIds = [];
      for (let p = off + headerSize; p + 4 <= off + size; p += 4) {
        resIds.push(dv.getUint32(p, true));
      }
    } else if (type === CHUNK_START_ELEMENT && pool) {
      const elementName = getString(dv.getUint32(off + 20, true));
      const attributeStart = dv.getUint16(off + 24, true);
      const attributeSize = dv.getUint16(off + 26, true);
      const attributeCount = dv.getUint16(off + 28, true);
      const base = off + 16 + attributeStart;

      for (let a = 0; a < attributeCount; a++) {
        const ap = base + a * attributeSize;
        if (ap + 20 > off + size) break;
        const nameIdx = dv.getUint32(ap + 4, true);
        const rawIdx = dv.getUint32(ap + 8, true);
        const dataType = dv.getUint8(ap + 15);
        const dataVal = dv.getUint32(ap + 16, true);
        const resId = nameIdx < resIds.length ? resIds[nameIdx] : 0;
        const attrName = getString(nameIdx);
        const stringValue = (): string | undefined =>
          dataType === TYPE_STRING
            ? getString(dataVal)
            : rawIdx !== 0xffffffff
              ? getString(rawIdx)
              : undefined;

        if (elementName === "manifest") {
          if (attrName === "package") info.packageName = stringValue() ?? info.packageName;
          else if (resId === ATTR_VERSION_CODE && dataType === TYPE_INT_DEC) info.versionCode = dataVal;
          else if (resId === ATTR_VERSION_NAME) info.versionName = stringValue();
        } else if (elementName === "uses-sdk") {
          if (resId === ATTR_MIN_SDK && dataType === TYPE_INT_DEC) info.minSdk = dataVal;
          else if (resId === ATTR_TARGET_SDK && dataType === TYPE_INT_DEC) info.targetSdk = dataVal;
        } else if (elementName === "application") {
          if (resId === ATTR_LABEL) {
            info.label = dataType === TYPE_STRING ? (stringValue() ?? null) : null;
          }
        }
      }
      // Everything we need appears by the <application> element
      if (elementName === "application") break;
    }
    off += size;
  }
  return info;
}

/** Rough API level → Android version, for friendlier display. */
export function apiToAndroid(api: number): string | null {
  const map: Record<number, string> = {
    21: "5.0", 22: "5.1", 23: "6.0", 24: "7.0", 25: "7.1", 26: "8.0", 27: "8.1",
    28: "9", 29: "10", 30: "11", 31: "12", 32: "12L", 33: "13", 34: "14",
    35: "15", 36: "16",
  };
  return map[api] ?? null;
}
