import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Kimhab Space and the apps distributed here.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        Terms of Service
      </h1>
      <p className="mt-3 font-mono text-xs text-muted">
        Last updated: 25 July 2026
      </p>

      <section className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <div>
          <h2 className="text-lg font-medium text-ink">1. The deal</h2>
          <p className="mt-2">
            Kimhab Space distributes apps I built, free of charge. By
            downloading or using them, you agree to these terms. If you
            don&apos;t agree, don&apos;t download the apps — no hard feelings.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">
            2. &quot;As is&quot;, no warranty
          </h2>
          <p className="mt-2">
            Every app is provided <strong className="text-ink">as is</strong>{" "}
            and <strong className="text-ink">as available</strong>, without
            warranty of any kind — express or implied — including fitness for a
            particular purpose, reliability, or availability. I build these
            carefully, but you use them at your own risk.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">3. No liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, I am not liable for any
            damages arising from the use or inability to use these apps —
            including data loss, device issues, or anything caused by misuse of
            the apps.
          </p>
          <p className="mt-2">
            <strong className="text-ink">Important:</strong> I am especially
            not responsible for modified or repackaged copies of my apps
            obtained from anywhere other than this site. Only APKs whose
            SHA-256 checksum matches the one published here are mine. Verify
            before you install.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">
            4. No redistribution or reselling
          </h2>
          <p className="mt-2">
            The apps are free for your personal use. You may not resell them,
            bundle them, re-upload them to other stores or download sites, or
            present them as your own. Send people here instead — that keeps the
            checksum chain intact.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">
            5. Apps may change or disappear
          </h2>
          <p className="mt-2">
            Any app may be updated, changed, or discontinued at any time,
            without notice. Old versions may be removed. This is a one-person
            project — I&apos;ll always try to be graceful about it, but I
            can&apos;t promise forever.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">6. Governing law</h2>
          <p className="mt-2">
            These terms are governed by the laws of the Kingdom of Cambodia.
            Any disputes fall under the jurisdiction of Cambodian courts.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">7. Questions</h2>
          <p className="mt-2">
            Anything unclear? Reach out via the{" "}
            <a href="/contact" className="text-nebula hover:text-ink">
              contact page
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
