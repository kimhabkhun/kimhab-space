import type { Metadata } from "next";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "How to install",
  description:
    "Installing APKs from Kimhab Space: unknown sources, the MediaFire fake-button trap, and verifying SHA-256 checksums.",
};

const faq = [
  {
    q: "Why does Android warn me before installing?",
    a: "Any app that doesn't come from the Play Store triggers that warning — it's Android being cautious, not a judgment about the file. That's exactly why every download here ships with a SHA-256 checksum: verify it and you know the APK is byte-for-byte the one I built.",
  },
  {
    q: "Why MediaFire instead of the Play Store?",
    a: "Play Store publishing costs money and adds review delays for every tiny update. Hosting APKs on MediaFire keeps everything free and lets me ship fixes the moment they're ready. iOS versions will go through TestFlight/App Store since Apple allows nothing else.",
  },
  {
    q: "How do I know the APK wasn't tampered with?",
    a: "Compute the SHA-256 of the file you downloaded (commands above) and compare it with the checksum on the app's page here. If they match, the file is genuine. If they don't — delete it and download again from this site only.",
  },
  {
    q: "Will apps update themselves?",
    a: "No. Sideloaded apps don't auto-update. Check the app's page here now and then — the version history shows what's new, and newer versions install right over the old one without losing your data.",
  },
  {
    q: "The checksum doesn't match. What now?",
    a: "Delete the file immediately and don't install it. Re-download from the link on this site — if it still doesn't match, stop and email me. Never install a copy of my apps from any other website.",
  },
];

export default function InstallPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        How to install
      </h1>
      <p className="mt-3 text-muted">
        Two minutes, start to finish. Android first, checksums after.
      </p>

      {/* Step-by-step */}
      <section aria-labelledby="steps-heading" className="mt-12">
        <h2 id="steps-heading" className="text-xl font-medium">
          Installing on Android
        </h2>
        <ol className="mt-6 space-y-4">
          {[
            {
              title: "Download the APK",
              body: "Hit the download button on the app's page. It opens MediaFire — grab the file from there (see the warning below about which button is real).",
            },
            {
              title: "Allow installs from your browser",
              body: "Open the downloaded file. Android will say your browser \"isn't allowed to install unknown apps\" — tap Settings, flip the toggle for that one app, and go back. You only do this once per browser.",
            },
            {
              title: "Install",
              body: "Tap Install on the confirmation screen. If Google Play Protect pops up, tap 'More details' → 'Install anyway' — that prompt appears for every sideloaded app, verified or not.",
            },
            {
              title: "Done — open it",
              body: "The app is now in your launcher like any other. No account, no setup, no ads.",
            },
          ].map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-white/[0.06] bg-surface p-5"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nebula font-mono text-sm font-medium text-void"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* MediaFire fake button warning — illustrated */}
      <section aria-labelledby="mediafire-heading" className="mt-14">
        <h2 id="mediafire-heading" className="text-xl font-medium">
          The MediaFire fake-button trap
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Heads up: MediaFire shows ads, and some of those ads are giant fake
          &quot;DOWNLOAD&quot; buttons. The real button is the green one, with
          the file name and size right above it. Everything else is bait.
        </p>

        <figure className="mt-6 rounded-2xl border border-white/[0.06] bg-surface p-5">
          <svg
            viewBox="0 0 560 260"
            role="img"
            aria-label="Illustration of a MediaFire download page: two flashy fake download buttons marked with crosses, and the real green download button marked with a check"
            className="w-full"
          >
            {/* page frame */}
            <rect x="10" y="10" width="540" height="240" rx="14" fill="#1D2140" />
            <rect x="10" y="10" width="540" height="34" rx="14" fill="#14172B" />
            <circle cx="30" cy="27" r="5" fill="#FF6B8B" />
            <circle cx="48" cy="27" r="5" fill="#FFD166" />
            <circle cx="66" cy="27" r="5" fill="#5EF2B8" />

            {/* fake ad button 1 */}
            <rect x="40" y="64" width="220" height="44" rx="8" fill="#FF4757" />
            <text x="150" y="91" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
              ⬇ DOWNLOAD NOW!!
            </text>
            <text x="276" y="94" fill="#FF6B8B" fontSize="26" fontWeight="bold" fontFamily="sans-serif">
              ✕
            </text>

            {/* fake ad button 2 */}
            <rect x="300" y="64" width="220" height="44" rx="8" fill="#2E86DE" />
            <text x="410" y="91" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
              FREE DOWNLOAD ▶
            </text>
            <text x="528" y="94" fill="#FF6B8B" fontSize="26" fontWeight="bold" fontFamily="sans-serif">
              ✕
            </text>

            {/* real file row */}
            <text x="40" y="156" fill="#EDEEFF" fontSize="13" fontFamily="monospace">
              offline-music-player-1.2.0.apk (9.4 MB)
            </text>
            <rect x="40" y="172" width="200" height="46" rx="8" fill="#27AE60" />
            <text x="140" y="200" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
              Download
            </text>
            <text x="256" y="204" fill="#5EF2B8" fontSize="28" fontWeight="bold" fontFamily="sans-serif">
              ✓
            </text>
            <text x="290" y="200" fill="#9AA0C3" fontSize="13" fontFamily="sans-serif">
              ← this one. Green, boring, real.
            </text>
          </svg>
          <figcaption className="mt-3 text-xs text-muted">
            Flashy = fake. The genuine button is green and sits under the file
            name and size.
          </figcaption>
        </figure>
      </section>

      {/* Checksum verification */}
      <section aria-labelledby="verify-heading" className="mt-14">
        <h2 id="verify-heading" className="text-xl font-medium">
          Verify the SHA-256 checksum
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Every version on this site lists its checksum in a{" "}
          <span className="text-star">yellow-bordered chip</span>. Run one of
          these on the file you downloaded and compare — they should match
          exactly.
        </p>

        <div className="mt-6 space-y-4">
          {[
            { os: "Windows (Command Prompt)", cmd: "certutil -hashfile app.apk SHA256" },
            { os: "macOS (Terminal)", cmd: "shasum -a 256 app.apk" },
            { os: "Linux", cmd: "sha256sum app.apk" },
          ].map((row) => (
            <div key={row.os}>
              <p className="text-xs uppercase tracking-widest text-muted">
                {row.os}
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-star/30 bg-surface px-4 py-3">
                <code className="font-mono text-sm text-ink">{row.cmd}</code>
              </pre>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          Swap <code className="font-mono">app.apk</code> for the actual file
          name you downloaded.
        </p>
        <p className="mt-4 text-sm text-muted">
          Not a command-line person? Use the{" "}
          <a href="/tools/apk-verifier" className="text-nebula hover:text-ink">
            in-browser APK verifier
          </a>{" "}
          instead — drop the file in, compare the hash, done. Nothing gets
          uploaded.
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="mt-14">
        <h2 id="faq-heading" className="text-xl font-medium">
          FAQ
        </h2>
        <div className="mt-6">
          <FaqAccordion items={faq} />
        </div>
      </section>
    </div>
  );
}
