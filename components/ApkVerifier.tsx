"use client";

import { useCallback, useRef, useState } from "react";
import {
  analyzeApk,
  type ApkAnalysis,
  type StageKey,
  type StageState,
} from "@/lib/apk/analyze";
import { colonize, formatBytes, normalizeHex } from "@/lib/apk/binary";
import { apiToAndroid } from "@/lib/apk/axml";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "read", label: "Reading file" },
  { key: "hashes", label: "Computing hashes" },
  { key: "zip", label: "Reading ZIP structure" },
  { key: "signature", label: "Extracting signature" },
  { key: "manifest", label: "Parsing manifest" },
];

type Phase = "idle" | "working" | "done" | "fatal";

/* ---------- small shared pieces ---------- */

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — nothing sensible to do */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="shrink-0 rounded-full bg-raised px-2.5 py-1 font-mono text-[11px] text-ink/80 transition-colors hover:bg-star/20 hover:text-star"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function HashRow({
  name,
  value,
  highlight = false,
  note,
}: {
  name: string;
  value: string;
  highlight?: boolean;
  note?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-3 ${
        highlight ? "border-star/60 bg-star/[0.06]" : "border-white/[0.06] bg-void/40"
      }`}
    >
      <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-widest text-muted">
        {name}
      </span>
      <code className="min-w-0 flex-1 break-all font-mono text-xs text-ink/90">{value}</code>
      <CopyButton value={value} label={`Copy ${name} hash`} />
      {note && <p className="w-full text-[11px] text-muted">{note}</p>}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-white/[0.06] bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 py-2.5 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-mono text-sm">{value}</dd>
    </div>
  );
}

function MatchBadge({ state }: { state: "match" | "mismatch" }) {
  return state === "match" ? (
    <p className="mt-3 flex items-center gap-2 rounded-xl border border-[#5EF2B8]/50 bg-[#5EF2B8]/10 px-4 py-3 text-sm font-medium text-[#5EF2B8]">
      ✅ Match — this file is identical to the official release.
    </p>
  ) : (
    <p className="mt-3 flex items-center gap-2 rounded-xl border border-[#FF6B8B]/50 bg-[#FF6B8B]/10 px-4 py-3 text-sm font-medium text-[#FF6B8B]">
      ❌ Does not match — do NOT install this file.
    </p>
  );
}

/* ---------- the verifier ---------- */

export default function ApkVerifier() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stages, setStages] = useState<Record<StageKey, StageState>>({
    read: "pending",
    hashes: "pending",
    zip: "pending",
    signature: "pending",
    manifest: "pending",
  });
  const [hashPct, setHashPct] = useState(0);
  const [result, setResult] = useState<ApkAnalysis | null>(null);
  const [fatal, setFatal] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [officialHash, setOfficialHash] = useState("");
  const [officialCert, setOfficialCert] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setPhase("working");
    setResult(null);
    setFatal("");
    setHashPct(0);
    setStages({ read: "pending", hashes: "pending", zip: "pending", signature: "pending", manifest: "pending" });
    try {
      const analysis = await analyzeApk(file, {
        onStage: (stage, state) => setStages((s) => ({ ...s, [stage]: state })),
        onHashProgress: setHashPct,
      });
      setResult(analysis);
      setPhase("done");
    } catch (e) {
      setFatal(e instanceof Error ? e.message : "Something went wrong while reading the file.");
      setPhase("fatal");
    }
  }, []);

  function reset() {
    setPhase("idle");
    setResult(null);
    setFatal("");
    setOfficialHash("");
    setOfficialCert("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const hashCompare = (() => {
    const wanted = normalizeHex(officialHash);
    if (!wanted || !result) return null;
    if (wanted.length !== 64) return "partial" as const;
    return wanted === result.hashes.sha256 ? ("match" as const) : ("mismatch" as const);
  })();

  const certCompare = (() => {
    const wanted = normalizeHex(officialCert);
    if (!wanted || !result?.signature?.certSha256) return null;
    if (wanted.length !== 64) return "partial" as const;
    return wanted === result.signature.certSha256 ? ("match" as const) : ("mismatch" as const);
  })();

  const sig = result?.signature;
  const man = result?.manifest;

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      {phase !== "done" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={`rounded-[20px] border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-nebula bg-nebula/[0.07]" : "border-white/15 bg-surface"
          }`}
        >
          <p aria-hidden="true" className="text-3xl">
            🛰️
          </p>
          <p className="mt-3 font-medium">Drop an APK here</p>
          <p className="mt-1 text-sm text-muted">
            or pick one from your device — it never leaves your browser
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={phase === "working"}
            className="btn-outline mt-5 inline-block px-5 py-2.5 text-sm disabled:opacity-50"
          >
            Choose APK file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".apk,application/vnd.android.package-archive"
            className="sr-only"
            aria-label="Choose an APK file to verify"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>
      )}

      {/* Progress */}
      {phase === "working" && (
        <div className="rounded-[20px] border border-white/[0.06] bg-surface p-6" aria-live="polite">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted">Analyzing…</h2>
          <ul className="mt-4 space-y-2.5">
            {STAGES.map((s) => {
              const st = stages[s.key];
              return (
                <li key={s.key} className="flex items-center gap-3 text-sm">
                  <span aria-hidden="true" className="w-5 text-center">
                    {st === "done" && <span className="text-[#5EF2B8]">✓</span>}
                    {st === "failed" && <span className="text-[#FF6B8B]">✕</span>}
                    {st === "active" && (
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-nebula border-t-transparent" />
                    )}
                    {st === "pending" && <span className="text-muted">·</span>}
                  </span>
                  <span className={st === "pending" ? "text-muted" : ""}>
                    {s.label}
                    {s.key === "hashes" && st === "active" && hashPct > 0 && (
                      <span className="ml-2 font-mono text-xs text-muted">{hashPct}%</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {phase === "fatal" && (
        <div className="rounded-[20px] border border-[#FF6B8B]/50 bg-[#FF6B8B]/10 p-6">
          <p className="text-sm font-medium text-[#FF6B8B]">Couldn&apos;t analyze that file</p>
          <p className="mt-2 text-sm text-muted">{fatal}</p>
          <button type="button" onClick={reset} className="btn-outline mt-4 px-5 py-2.5 text-sm">
            Try another file
          </button>
        </div>
      )}

      {/* Results */}
      {phase === "done" && result && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 truncate font-mono text-sm text-muted">
              {result.fileName} · {formatBytes(result.fileSizeBytes)}
            </p>
            <button type="button" onClick={reset} className="btn-outline px-4 py-2 text-sm">
              Verify another file
            </button>
          </div>

          {result.zipError && (
            <div className="rounded-[20px] border border-star/40 bg-star/[0.06] p-5 text-sm text-muted">
              <span className="font-medium text-star">Note:</span> {result.zipError} File hashes
              below are still valid for comparison.
            </div>
          )}

          {/* Comparison — first, because it's the decision-maker */}
          <Card title="Compare with the official values">
            <p className="text-sm text-muted">
              Paste what the developer published, and this tool compares it against the file you
              just analyzed. For apps from Kimhab Space, the SHA-256 is on each app&apos;s page.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Official SHA-256 file hash
                </span>
                <input
                  type="text"
                  value={officialHash}
                  onChange={(e) => setOfficialHash(e.target.value)}
                  placeholder="e.g. 3c9a1f0d7b42e6a5…"
                  spellCheck={false}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-void/40 px-4 py-3 font-mono text-xs text-ink placeholder:text-muted focus:border-nebula"
                />
                {hashCompare === "partial" && (
                  <p className="mt-2 text-xs text-muted">
                    Keep pasting — a SHA-256 hash is 64 hex characters.
                  </p>
                )}
                {(hashCompare === "match" || hashCompare === "mismatch") && (
                  <MatchBadge state={hashCompare} />
                )}
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Official signing-certificate SHA-256 fingerprint
                </span>
                <input
                  type="text"
                  value={officialCert}
                  onChange={(e) => setOfficialCert(e.target.value)}
                  placeholder="e.g. A1:B2:C3:… (colons optional)"
                  spellCheck={false}
                  disabled={!sig?.certSha256}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-void/40 px-4 py-3 font-mono text-xs text-ink placeholder:text-muted focus:border-nebula disabled:opacity-40"
                />
                {!sig?.certSha256 && (
                  <p className="mt-2 text-xs text-muted">
                    No certificate could be extracted from this file, so fingerprint comparison is
                    unavailable.
                  </p>
                )}
                {certCompare === "partial" && (
                  <p className="mt-2 text-xs text-muted">
                    A certificate fingerprint is 64 hex characters (colons are fine).
                  </p>
                )}
                {(certCompare === "match" || certCompare === "mismatch") && (
                  <MatchBadge state={certCompare} />
                )}
              </label>
            </div>
          </Card>

          {/* Hashes */}
          <Card title="File hashes">
            <div className="space-y-3">
              <HashRow name="SHA-256" value={result.hashes.sha256} highlight />
              <HashRow name="SHA-1" value={result.hashes.sha1} />
              <HashRow
                name="MD5"
                value={result.hashes.md5}
                note="SHA-1 and MD5 are shown for legacy comparison only — they are not collision-resistant. Trust SHA-256."
              />
            </div>
          </Card>

          {/* Signature */}
          <Card title="Signing certificate">
            {sig && (
              <>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["v1 (JAR)", sig.schemes.v1],
                      ["v2", sig.schemes.v2],
                      ["v3", sig.schemes.v3],
                      ["v3.1", sig.schemes.v31],
                    ] as const
                  ).map(([label, present]) => (
                    <span
                      key={label}
                      className={`rounded-full border px-3 py-1 font-mono text-xs ${
                        present
                          ? "border-star/60 bg-star/10 text-star"
                          : "border-white/10 text-muted"
                      }`}
                    >
                      {present ? "✓" : "–"} {label}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  Scheme v4 lives in a separate .idsig file, so it can&apos;t be detected from the
                  APK alone.
                </p>

                {sig.certSha256 && (
                  <div className="mt-4 space-y-3">
                    <HashRow name="SHA-256" value={colonize(sig.certSha256)} highlight />
                    {sig.certSha1 && <HashRow name="SHA-1" value={colonize(sig.certSha1)} />}
                    <dl>
                      {sig.subject && <InfoRow label="Subject (who signed it)" value={sig.subject} />}
                      {sig.issuer && <InfoRow label="Issuer" value={sig.issuer} />}
                    </dl>
                    <p className="text-[11px] leading-relaxed text-muted">
                      The certificate is extracted and fingerprinted, not cryptographically
                      validated against every byte of the file — so always compare the file hash
                      above as well. Android app certificates are usually self-signed; that&apos;s
                      normal. What matters is that the fingerprint matches the developer&apos;s
                      published one.
                    </p>
                  </div>
                )}
                {sig.error && <p className="mt-4 text-sm text-muted">{sig.error}</p>}
              </>
            )}
            {!sig && <p className="text-sm text-muted">Signature information unavailable.</p>}
          </Card>

          {/* APK info */}
          <Card title="APK information">
            {man ? (
              <dl>
                {man.label && <InfoRow label="Application name" value={man.label} />}
                {man.packageName && <InfoRow label="Package name" value={man.packageName} />}
                {man.versionName && <InfoRow label="Version name" value={man.versionName} />}
                {man.versionCode !== undefined && (
                  <InfoRow label="Version code" value={String(man.versionCode)} />
                )}
                {man.minSdk !== undefined && (
                  <InfoRow
                    label="Minimum Android"
                    value={`API ${man.minSdk}${apiToAndroid(man.minSdk) ? ` (Android ${apiToAndroid(man.minSdk)})` : ""}`}
                  />
                )}
                {man.targetSdk !== undefined && (
                  <InfoRow
                    label="Target Android"
                    value={`API ${man.targetSdk}${apiToAndroid(man.targetSdk) ? ` (Android ${apiToAndroid(man.targetSdk)})` : ""}`}
                  />
                )}
                <InfoRow label="APK size" value={formatBytes(result.fileSizeBytes)} />
                {man.label === null && (
                  <p className="pt-3 text-[11px] text-muted">
                    The app name is stored as a localized resource inside the APK, which this tool
                    doesn&apos;t unpack — the package name above is the reliable identifier.
                  </p>
                )}
              </dl>
            ) : (
              <p className="text-sm text-muted">
                {result.manifestError ?? "Manifest information unavailable."}
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
