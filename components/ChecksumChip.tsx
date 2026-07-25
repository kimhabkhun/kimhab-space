"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The core trust signal: SHA-256 in JetBrains Mono inside a
 * star-yellow-bordered chip, with copy-to-clipboard.
 */
export default function ChecksumChip({ sha256 }: { sha256: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(sha256);
    } catch {
      // Clipboard API unavailable (old browser / http) — select-and-copy fallback
      const ta = document.createElement("textarea");
      ta.value = sha256;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  const short = `${sha256.slice(0, 10)}…${sha256.slice(-6)}`;

  return (
    <span
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-star/60 bg-star/[0.06] py-1.5 pl-3 pr-1.5"
      title="Verify this file is genuine"
    >
      <span aria-hidden="true" className="text-xs text-star">
        ✦
      </span>
      <span className="sr-only">SHA-256 checksum:</span>
      <code className="truncate font-mono text-xs text-ink/90">
        {copied ? "Copied ✓" : short}
      </code>
      <button
        type="button"
        onClick={copy}
        className="rounded-full bg-raised px-2.5 py-1 font-mono text-[11px] text-ink/80 transition-colors hover:bg-star/20 hover:text-star"
        aria-label="Copy full checksum"
      >
        {copied ? "✓" : "Copy checksum"}
      </button>
    </span>
  );
}
