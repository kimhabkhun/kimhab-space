import type { Metadata } from "next";
import Link from "next/link";
import ApkVerifier from "@/components/ApkVerifier";

export const metadata: Metadata = {
  title: "APK & IPA verifier",
  description:
    "Verify Android APKs and iOS IPAs before installing: SHA-256/SHA-1/MD5 hashes, signing certificate fingerprints, and app info — computed entirely in your browser. Nothing is uploaded.",
};

export default function ApkVerifierPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        APK &amp; IPA verifier
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Check that an app file really is the one the developer built — file
        hashes, signing certificate, and app details, before you install
        anything. Android APKs and iOS IPAs, auto-detected.
      </p>

      {/* Privacy notice — the headline feature */}
      <div className="mt-8 rounded-[20px] border border-star/50 bg-star/[0.06] p-5">
        <p className="text-sm font-medium text-star">
          ✦ 100% private — your file never leaves your device
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Everything runs locally in your browser using the Web Crypto API.
          Nothing is uploaded, stored, or logged — there is no server to send
          it to; this whole site is static files. The APK is read as plain
          binary data and is never installed or executed. Close the tab and
          it&apos;s gone from memory.
        </p>
      </div>

      <div className="mt-8">
        <ApkVerifier />
      </div>

      {/* How to use it */}
      <section aria-labelledby="how-heading" className="mt-14">
        <h2 id="how-heading" className="text-xl font-medium">
          How to use this
        </h2>
        <ol className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-nebula">1.</span>
            Download an APK or IPA — from{" "}
            <Link href="/apps" className="text-nebula hover:text-ink">
              my apps
            </Link>{" "}
            or anywhere else.
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-nebula">2.</span>
            Drop it in the verifier above.
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-nebula">3.</span>
            Compare the SHA-256 with the one published on the app&apos;s page
            (mine live in the yellow checksum chips). Match = genuine file.
            Mismatch = delete it.
          </li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Prefer the command line? The{" "}
          <Link href="/install" className="text-nebula hover:text-ink">
            install guide
          </Link>{" "}
          has one-line checksum commands for Windows, macOS, and Linux.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          iOS note: App Store and TestFlight install apps directly, so most
          people never handle a raw .ipa. This is for sideloaded builds
          (AltStore and friends), enterprise distributions, and developers
          checking their own exports.
        </p>
      </section>
    </div>
  );
}
