/**
 * APK analysis orchestrator — runs entirely in the browser. The file is
 * read into memory, hashed, and structurally parsed. It is never
 * uploaded, stored, or executed; when the page is closed or a new file
 * is analyzed, the memory is released.
 */

import { sha256Hex, sha1Hex } from "./binary";
import { md5Hex } from "./md5";
import { parseZip, readEntry, type ZipEntry } from "./zip";
import {
  parseApkSigningBlock,
  certFromSchemeBlock,
  SCHEME_V2_ID,
  SCHEME_V3_ID,
  SCHEME_V31_ID,
} from "./sigblock";
import { certsFromPkcs7, parseCertificateNames } from "./der";
import { parseBinaryManifest, type ManifestInfo } from "./axml";

export type StageKey = "read" | "hashes" | "zip" | "signature" | "manifest";
export type StageState = "pending" | "active" | "done" | "failed";

export interface SignatureInfo {
  schemes: { v1: boolean; v2: boolean; v3: boolean; v31: boolean };
  certSha256?: string;
  certSha1?: string;
  subject?: string;
  issuer?: string;
  error?: string;
}

export interface ApkAnalysis {
  fileName: string;
  fileSizeBytes: number;
  hashes: { sha256: string; sha1: string; md5: string };
  zipError?: string;
  signature?: SignatureInfo;
  manifest?: ManifestInfo;
  manifestError?: string;
}

export interface AnalyzeCallbacks {
  onStage?: (stage: StageKey, state: StageState) => void;
  onHashProgress?: (pct: number) => void;
}

export async function analyzeApk(file: File, cb: AnalyzeCallbacks = {}): Promise<ApkAnalysis> {
  const stage = (s: StageKey, st: StageState) => cb.onStage?.(s, st);

  stage("read", "active");
  const u8 = new Uint8Array(await file.arrayBuffer());
  stage("read", "done");

  stage("hashes", "active");
  const [sha256, sha1] = await Promise.all([sha256Hex(u8), sha1Hex(u8)]);
  const md5 = await md5Hex(u8, cb.onHashProgress);
  stage("hashes", "done");

  const result: ApkAnalysis = {
    fileName: file.name,
    fileSizeBytes: u8.length,
    hashes: { sha256, sha1, md5 },
  };

  stage("zip", "active");
  let entries: ZipEntry[] = [];
  let cdOffset = -1;
  try {
    const zip = parseZip(u8);
    entries = zip.entries;
    cdOffset = zip.centralDirOffset;
    stage("zip", "done");
  } catch (e) {
    result.zipError = e instanceof Error ? e.message : "Could not read ZIP structure.";
    stage("zip", "failed");
    stage("signature", "failed");
    stage("manifest", "failed");
    return result;
  }

  stage("signature", "active");
  try {
    const v1SigEntry = entries.find((en) => /^META-INF\/.+\.(RSA|DSA|EC)$/i.test(en.name));
    const hasV1 =
      entries.some((en) => /^META-INF\/.+\.SF$/i.test(en.name)) || Boolean(v1SigEntry);

    const block = parseApkSigningBlock(u8, cdOffset);
    const schemes = {
      v1: hasV1,
      v2: Boolean(block?.ids.has(SCHEME_V2_ID)),
      v3: Boolean(block?.ids.has(SCHEME_V3_ID)),
      v31: Boolean(block?.ids.has(SCHEME_V31_ID)),
    };

    // Prefer the newest scheme's certificate, fall back to v1's PKCS#7
    let certDer: Uint8Array | null = null;
    for (const id of [SCHEME_V31_ID, SCHEME_V3_ID, SCHEME_V2_ID]) {
      const value = block?.ids.get(id);
      if (value) {
        certDer = certFromSchemeBlock(value);
        if (certDer) break;
      }
    }
    if (!certDer && v1SigEntry) {
      const pkcs7 = await readEntry(u8, v1SigEntry);
      const certs = certsFromPkcs7(pkcs7);
      if (certs.length > 0) certDer = certs[0];
    }

    const sig: SignatureInfo = { schemes };
    if (certDer) {
      [sig.certSha256, sig.certSha1] = await Promise.all([sha256Hex(certDer), sha1Hex(certDer)]);
      try {
        const names = parseCertificateNames(certDer);
        sig.subject = names.subject;
        sig.issuer = names.issuer;
      } catch {
        sig.error = "Certificate found, but its name fields could not be parsed.";
      }
    } else if (schemes.v1 || schemes.v2 || schemes.v3 || schemes.v31) {
      sig.error = "A signature is present, but the certificate could not be extracted.";
    } else {
      sig.error = "No signature found — this APK is unsigned or uses an unknown format.";
    }
    result.signature = sig;
    stage("signature", sig.certSha256 ? "done" : "failed");
  } catch (e) {
    result.signature = {
      schemes: { v1: false, v2: false, v3: false, v31: false },
      error: e instanceof Error ? e.message : "Signature extraction failed.",
    };
    stage("signature", "failed");
  }

  stage("manifest", "active");
  try {
    const manifestEntry = entries.find((en) => en.name === "AndroidManifest.xml");
    if (!manifestEntry) throw new Error("AndroidManifest.xml not found in the archive.");
    const data = await readEntry(u8, manifestEntry);
    result.manifest = parseBinaryManifest(data);
    stage("manifest", "done");
  } catch (e) {
    result.manifestError = e instanceof Error ? e.message : "Could not parse the manifest.";
    stage("manifest", "failed");
  }

  return result;
}
