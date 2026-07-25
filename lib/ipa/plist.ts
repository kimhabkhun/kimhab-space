/**
 * Apple property-list parsing for the IPA verifier — supports both the
 * binary format ("bplist00", used by Info.plist in shipped apps) and the
 * XML format (used by provisioning profiles). Self-contained: no
 * DOMParser, so the same code runs in the browser and in Node tests.
 */

export type PlistValue =
  | string
  | number
  | boolean
  | null
  | Uint8Array
  | PlistValue[]
  | { [key: string]: PlistValue };

export function parsePlist(data: Uint8Array): PlistValue {
  if (data.length >= 8) {
    let isBinary = true;
    const magic = "bplist0";
    for (let i = 0; i < magic.length; i++) {
      if (data[i] !== magic.charCodeAt(i)) {
        isBinary = false;
        break;
      }
    }
    if (isBinary) return parseBinaryPlist(data);
  }
  return parseXmlPlist(new TextDecoder().decode(data));
}

/* ---------------- binary plist ---------------- */

function parseBinaryPlist(data: Uint8Array): PlistValue {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const n = data.length;
  if (n < 40) throw new Error("Binary plist too small");
  const t = n - 32; // trailer
  const offsetIntSize = data[t + 6];
  const objectRefSize = data[t + 7];
  const numObjects = Number(dv.getBigUint64(t + 8, false));
  const topObject = Number(dv.getBigUint64(t + 16, false));
  const tableOffset = Number(dv.getBigUint64(t + 24, false));
  if (numObjects <= 0 || numObjects > 1_000_000) throw new Error("Binary plist: bad object count");

  const readUint = (off: number, size: number): number => {
    let v = 0;
    for (let i = 0; i < size; i++) v = v * 256 + data[off + i];
    return v;
  };

  const offsets: number[] = [];
  for (let i = 0; i < numObjects; i++) {
    offsets.push(readUint(tableOffset + i * offsetIntSize, offsetIntSize));
  }

  const parseObject = (index: number, depth: number): PlistValue => {
    if (depth > 32 || index >= numObjects) return null;
    let off = offsets[index];
    const marker = data[off];
    const type = marker >> 4;
    let info = marker & 0x0f;
    off += 1;

    // Extended length: info == 0xF means an int object follows with the count
    const readLength = (): number => {
      if (info !== 0x0f) return info;
      const im = data[off];
      const size = 1 << (im & 0x0f);
      const len = readUint(off + 1, size);
      off += 1 + size;
      return len;
    };

    switch (type) {
      case 0x0:
        if (info === 0x8) return false;
        if (info === 0x9) return true;
        return null;
      case 0x1: {
        const size = 1 << info;
        if (size === 8) return Number(dv.getBigUint64(off, false));
        return readUint(off, size);
      }
      case 0x2:
        return info === 2 ? dv.getFloat32(off, false) : dv.getFloat64(off, false);
      case 0x3: {
        // seconds since 2001-01-01 UTC
        const secs = dv.getFloat64(off, false);
        return new Date((secs + 978307200) * 1000).toISOString();
      }
      case 0x4: {
        const len = readLength();
        return data.slice(off, off + len);
      }
      case 0x5: {
        const len = readLength();
        let s = "";
        for (let i = 0; i < len; i++) s += String.fromCharCode(data[off + i]);
        return s;
      }
      case 0x6: {
        const len = readLength();
        let s = "";
        for (let i = 0; i < len; i++) s += String.fromCharCode(dv.getUint16(off + i * 2, false));
        return s;
      }
      case 0x8:
        return readUint(off, info + 1); // UID
      case 0xa:
      case 0xc: {
        const len = readLength();
        const arr: PlistValue[] = [];
        for (let i = 0; i < len; i++) {
          arr.push(parseObject(readUint(off + i * objectRefSize, objectRefSize), depth + 1));
        }
        return arr;
      }
      case 0xd: {
        const len = readLength();
        const obj: { [key: string]: PlistValue } = {};
        for (let i = 0; i < len; i++) {
          const key = parseObject(readUint(off + i * objectRefSize, objectRefSize), depth + 1);
          const val = parseObject(
            readUint(off + (len + i) * objectRefSize, objectRefSize),
            depth + 1
          );
          if (typeof key === "string") obj[key] = val;
        }
        return obj;
      }
      default:
        return null;
    }
  };

  return parseObject(topObject, 0);
}

/* ---------------- XML plist ---------------- */

function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (_, g: string) => {
    switch (g) {
      case "amp": return "&";
      case "lt": return "<";
      case "gt": return ">";
      case "quot": return '"';
      case "apos": return "'";
    }
    return String.fromCodePoint(
      g[1] === "x" || g[1] === "X" ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10)
    );
  });
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s+/g, ""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

interface XmlTag {
  name: string;
  closing: boolean;
  selfClosing: boolean;
}

class XmlCursor {
  pos = 0;
  constructor(private s: string) {}

  nextTag(): XmlTag | null {
    for (;;) {
      const lt = this.s.indexOf("<", this.pos);
      if (lt < 0) return null;
      if (this.s.startsWith("<!--", lt)) {
        const end = this.s.indexOf("-->", lt);
        if (end < 0) return null;
        this.pos = end + 3;
        continue;
      }
      if (this.s.startsWith("<?", lt) || this.s.startsWith("<!", lt)) {
        const end = this.s.indexOf(">", lt);
        if (end < 0) return null;
        this.pos = end + 1;
        continue;
      }
      const gt = this.s.indexOf(">", lt);
      if (gt < 0) return null;
      const raw = this.s.slice(lt + 1, gt).trim();
      this.pos = gt + 1;
      return {
        name: raw.replace(/^\//, "").replace(/\/$/, "").split(/[\s/]/)[0],
        closing: raw.startsWith("/"),
        selfClosing: raw.endsWith("/"),
      };
    }
  }

  /** Text content up to (and consuming) the closing tag with this name. */
  textUntilClose(name: string): string {
    const close = `</${name}`;
    const idx = this.s.indexOf(close, this.pos);
    if (idx < 0) {
      this.pos = this.s.length;
      return "";
    }
    const text = this.s.slice(this.pos, idx);
    const gt = this.s.indexOf(">", idx);
    this.pos = gt < 0 ? this.s.length : gt + 1;
    return text;
  }
}

function parseXmlValue(cur: XmlCursor, tag: XmlTag, depth: number): PlistValue {
  if (depth > 32) return null;
  switch (tag.name) {
    case "true":
      return true;
    case "false":
      return false;
    case "string":
    case "key":
      return tag.selfClosing ? "" : decodeEntities(cur.textUntilClose(tag.name));
    case "integer":
      return tag.selfClosing ? 0 : parseInt(cur.textUntilClose("integer").trim(), 10);
    case "real":
      return tag.selfClosing ? 0 : parseFloat(cur.textUntilClose("real").trim());
    case "date":
      return tag.selfClosing ? "" : cur.textUntilClose("date").trim();
    case "data":
      return tag.selfClosing ? new Uint8Array(0) : base64ToBytes(cur.textUntilClose("data"));
    case "array": {
      const arr: PlistValue[] = [];
      if (tag.selfClosing) return arr;
      for (;;) {
        const t = cur.nextTag();
        if (!t || (t.closing && t.name === "array")) break;
        if (!t.closing) arr.push(parseXmlValue(cur, t, depth + 1));
      }
      return arr;
    }
    case "dict": {
      const obj: { [key: string]: PlistValue } = {};
      if (tag.selfClosing) return obj;
      let pendingKey: string | null = null;
      for (;;) {
        const t = cur.nextTag();
        if (!t || (t.closing && t.name === "dict")) break;
        if (t.closing) continue;
        if (t.name === "key") {
          pendingKey = t.selfClosing ? "" : decodeEntities(cur.textUntilClose("key"));
        } else if (pendingKey !== null) {
          obj[pendingKey] = parseXmlValue(cur, t, depth + 1);
          pendingKey = null;
        } else {
          parseXmlValue(cur, t, depth + 1); // orphan value — consume and drop
        }
      }
      return obj;
    }
    default:
      // Unknown element — consume its content and return null
      if (!tag.selfClosing) cur.textUntilClose(tag.name);
      return null;
  }
}

function parseXmlPlist(xml: string): PlistValue {
  const cur = new XmlCursor(xml);
  for (;;) {
    const t = cur.nextTag();
    if (!t) throw new Error("Not a valid plist (no root value found)");
    if (t.closing) continue;
    if (t.name === "plist") continue;
    return parseXmlValue(cur, t, 0);
  }
}

/* ---------------- typed accessors ---------------- */

export function plistDict(v: PlistValue): { [key: string]: PlistValue } | null {
  return v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Uint8Array)
    ? (v as { [key: string]: PlistValue })
    : null;
}

export function plistString(v: PlistValue | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function plistArray(v: PlistValue | undefined): PlistValue[] | null {
  return Array.isArray(v) ? v : null;
}
