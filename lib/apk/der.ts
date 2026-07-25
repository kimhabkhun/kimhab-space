/**
 * Minimal DER/ASN.1 reader — enough to pull X.509 certificates out of
 * APK signatures and render their subject/issuer names. This is a
 * structural parser only: it does NOT validate signatures or chains.
 */

export interface Tlv {
  tag: number;
  header: number; // offset of the tag byte
  start: number; // offset of the content
  length: number;
  end: number; // content end (exclusive)
}

export function readTlv(u8: Uint8Array, offset: number): Tlv {
  if (offset + 2 > u8.length) throw new Error("DER: truncated");
  const tag = u8[offset];
  let length = u8[offset + 1];
  let p = offset + 2;
  if (length & 0x80) {
    const n = length & 0x7f;
    if (n === 0 || n > 4) throw new Error("DER: unsupported length form");
    length = 0;
    for (let i = 0; i < n; i++) length = length * 256 + u8[p + i];
    p += n;
  }
  if (p + length > u8.length) throw new Error("DER: length out of bounds");
  return { tag, header: offset, start: p, length, end: p + length };
}

export function derChildren(u8: Uint8Array, node: Tlv): Tlv[] {
  const out: Tlv[] = [];
  let p = node.start;
  while (p < node.end) {
    const child = readTlv(u8, p);
    out.push(child);
    p = child.end;
  }
  return out;
}

function decodeOid(u8: Uint8Array, node: Tlv): string {
  const b = u8.subarray(node.start, node.end);
  if (b.length === 0) return "";
  const first = b[0];
  const arc1 = first < 40 ? 0 : first < 80 ? 1 : 2;
  const parts: number[] = [arc1, first - 40 * arc1];
  let v = 0;
  for (let i = 1; i < b.length; i++) {
    v = v * 128 + (b[i] & 0x7f);
    if ((b[i] & 0x80) === 0) {
      parts.push(v);
      v = 0;
    }
  }
  return parts.join(".");
}

function decodeDerString(u8: Uint8Array, node: Tlv): string {
  const bytes = u8.subarray(node.start, node.end);
  if (node.tag === 0x0c) return new TextDecoder().decode(bytes); // UTF8String
  if (node.tag === 0x1e) {
    // BMPString (UTF-16BE) — decoded manually for browser compatibility
    let s = "";
    for (let i = 0; i + 1 < bytes.length; i += 2) s += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
    return s;
  }
  // PrintableString / IA5String / T61String — latin1-ish
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

const OID_NAMES: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.4": "SN",
  "2.5.4.5": "serialNumber",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "2.5.4.12": "T",
  "2.5.4.42": "GN",
  "1.2.840.113549.1.9.1": "E",
  "0.9.2342.19200300.100.1.1": "UID",
  "0.9.2342.19200300.100.1.25": "DC",
};

/** X.501 Name (SEQUENCE OF SET OF AttributeTypeAndValue) → "CN=…, O=…, C=…" */
function nameToString(u8: Uint8Array, nameNode: Tlv): string {
  const parts: string[] = [];
  for (const rdnSet of derChildren(u8, nameNode)) {
    for (const atv of derChildren(u8, rdnSet)) {
      const kids = derChildren(u8, atv);
      if (kids.length < 2) continue;
      const oid = decodeOid(u8, kids[0]);
      parts.push(`${OID_NAMES[oid] ?? oid}=${decodeDerString(u8, kids[1])}`);
    }
  }
  return parts.join(", ");
}

export interface CertNames {
  subject: string;
  issuer: string;
}

/** Extract subject/issuer from a DER-encoded X.509 certificate. */
export function parseCertificateNames(der: Uint8Array): CertNames {
  const cert = readTlv(der, 0);
  if (cert.tag !== 0x30) throw new Error("Not a DER certificate");
  const tbs = derChildren(der, cert)[0];
  const kids = derChildren(der, tbs);
  let i = 0;
  if (kids[i]?.tag === 0xa0) i++; // [0] version (optional)
  i++; // serialNumber
  i++; // signature algorithm
  const issuer = kids[i++];
  i++; // validity
  const subject = kids[i];
  if (!issuer || !subject) throw new Error("Malformed certificate structure");
  return {
    issuer: nameToString(der, issuer),
    subject: nameToString(der, subject),
  };
}

/**
 * Extract certificate DERs from a PKCS#7/CMS SignedData blob
 * (the META-INF/*.RSA|DSA|EC file used by APK signature scheme v1).
 */
export function certsFromPkcs7(der: Uint8Array): Uint8Array[] {
  const root = readTlv(der, 0); // ContentInfo
  const explicit = derChildren(der, root).find((k) => k.tag === 0xa0);
  if (!explicit) throw new Error("PKCS#7: no SignedData content");
  const signedData = readTlv(der, explicit.start);
  const certsNode = derChildren(der, signedData).find((k) => k.tag === 0xa0);
  if (!certsNode) throw new Error("PKCS#7: no certificates present");
  return derChildren(der, certsNode)
    .filter((c) => c.tag === 0x30)
    .map((c) => der.slice(c.header, c.end));
}
