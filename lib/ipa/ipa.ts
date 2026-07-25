/**
 * iOS IPA analysis — an .ipa is a ZIP with Payload/<App>.app/ inside.
 * We read Info.plist for metadata, the Mach-O executable's code
 * signature for the real signing certificate, and the embedded
 * provisioning profile (when present) for distribution details.
 * Everything runs in the browser; nothing is executed or uploaded.
 */

import { readEntry, type ZipEntry } from "../apk/zip";
import { certsFromPkcs7, pkcs7Content, parseCertificateNames } from "../apk/der";
import { sha256Hex, sha1Hex } from "../apk/binary";
import { extractCodeSignature } from "./macho";
import { parsePlist, plistDict, plistString, plistArray, type PlistValue } from "./plist";

export interface IosInfo {
  appName?: string;
  bundleId?: string;
  version?: string; // CFBundleShortVersionString
  build?: string; // CFBundleVersion
  minOs?: string;
  executable?: string;
}

export interface IosSignature {
  distribution?: string;
  teamId?: string;
  identifier?: string;
  profileName?: string;
  profileTeamName?: string;
  profileExpires?: string;
  certSha256?: string;
  certSha1?: string;
  subject?: string;
  issuer?: string;
  error?: string;
}

export interface IosResult {
  info?: IosInfo;
  infoError?: string;
  signature: IosSignature;
}

const norm = (name: string) => name.replace(/\\/g, "/");

export function findIpaAppDir(entries: ZipEntry[]): string | null {
  for (const e of entries) {
    const m = norm(e.name).match(/^Payload\/([^/]+\.app)\//);
    if (m) return m[1];
  }
  return null;
}

function findEntry(entries: ZipEntry[], path: string): ZipEntry | undefined {
  return entries.find((e) => norm(e.name) === path);
}

export async function readIosInfo(
  u8: Uint8Array,
  entries: ZipEntry[],
  appDir: string
): Promise<IosInfo> {
  const entry = findEntry(entries, `Payload/${appDir}/Info.plist`);
  if (!entry) throw new Error("Info.plist not found in the app bundle.");
  const plist = plistDict(parsePlist(await readEntry(u8, entry)));
  if (!plist) throw new Error("Info.plist is not a dictionary.");
  return {
    appName: plistString(plist.CFBundleDisplayName) ?? plistString(plist.CFBundleName),
    bundleId: plistString(plist.CFBundleIdentifier),
    version: plistString(plist.CFBundleShortVersionString),
    build: plistString(plist.CFBundleVersion),
    minOs: plistString(plist.MinimumOSVersion),
    executable: plistString(plist.CFBundleExecutable),
  };
}

/** Among a CMS cert chain, pick the leaf: the cert that issued no other. */
function pickLeafCert(certs: Uint8Array[]): { der: Uint8Array; subject: string; issuer: string } | null {
  const parsed = certs.flatMap((der) => {
    try {
      const names = parseCertificateNames(der);
      return [{ der, ...names }];
    } catch {
      return [];
    }
  });
  if (parsed.length === 0) return null;
  const issuers = new Set(parsed.map((c) => c.issuer));
  return parsed.find((c) => !issuers.has(c.subject) || c.subject === c.issuer) ?? parsed[0];
}

export async function readIosSignature(
  u8: Uint8Array,
  entries: ZipEntry[],
  appDir: string,
  executable?: string
): Promise<IosSignature> {
  const sig: IosSignature = {};

  // 1) The authoritative source: the Mach-O executable's code signature
  const execName = executable ?? appDir.replace(/\.app$/i, "");
  const execEntry = findEntry(entries, `Payload/${appDir}/${execName}`);
  let certDer: Uint8Array | null = null;
  if (execEntry) {
    try {
      const macho = extractCodeSignature(await readEntry(u8, execEntry));
      if (macho) {
        sig.identifier = macho.identifier;
        sig.teamId = macho.teamId;
        if (macho.cms) {
          const leaf = pickLeafCert(certsFromPkcs7(macho.cms));
          if (leaf) {
            certDer = leaf.der;
            sig.subject = leaf.subject;
            sig.issuer = leaf.issuer;
          }
        }
      }
    } catch {
      /* fall through to the provisioning profile */
    }
  }

  // 2) The provisioning profile (ad-hoc/TestFlight/enterprise builds)
  const profileEntry = findEntry(entries, `Payload/${appDir}/embedded.mobileprovision`);
  if (profileEntry) {
    try {
      const cms = await readEntry(u8, profileEntry);
      const payload = pkcs7Content(cms);
      const profile = payload ? plistDict(parsePlist(payload)) : null;
      if (profile) {
        sig.profileName = plistString(profile.Name);
        sig.profileTeamName = plistString(profile.TeamName);
        sig.profileExpires = plistString(profile.ExpirationDate);
        const team = plistArray(profile.TeamIdentifier);
        if (!sig.teamId && team) sig.teamId = plistString(team[0]);

        const entitlements = plistDict(profile.Entitlements as PlistValue);
        const getTaskAllow = entitlements?.["get-task-allow"] === true;
        if (getTaskAllow) sig.distribution = "Development build";
        else if (profile.ProvisionsAllDevices === true) sig.distribution = "Enterprise distribution";
        else if (plistArray(profile.ProvisionedDevices)) sig.distribution = "Ad hoc (device-limited)";
        else sig.distribution = "Distribution (App Store / TestFlight)";

        if (!certDer) {
          const devCerts = plistArray(profile.DeveloperCertificates);
          const first = devCerts?.[0];
          if (first instanceof Uint8Array) {
            certDer = first;
            try {
              const names = parseCertificateNames(first);
              sig.subject = names.subject;
              sig.issuer = names.issuer;
            } catch {
              /* fingerprints alone are still useful */
            }
          }
        }
      }
    } catch {
      /* profile unreadable — not fatal */
    }
  } else if (certDer) {
    // Signed, but no embedded profile → App Store style distribution
    sig.distribution = "App Store (no embedded provisioning profile)";
  }

  if (certDer) {
    [sig.certSha256, sig.certSha1] = await Promise.all([sha256Hex(certDer), sha1Hex(certDer)]);
  } else {
    sig.error =
      "No signing certificate could be extracted — the app may be unsigned, encrypted by the App Store, or use an unusual layout.";
  }
  return sig;
}
