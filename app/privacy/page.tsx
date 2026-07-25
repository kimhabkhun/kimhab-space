import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Kimhab Space collects nothing. Here's the full breakdown of what that means.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        Privacy Policy
      </h1>
      <p className="mt-3 font-mono text-xs text-muted">
        Last updated: 25 July 2026
      </p>

      <section className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <div>
          <h2 className="text-lg font-medium text-ink">
            1. This site collects nothing
          </h2>
          <p className="mt-2">
            Kimhab Space is a static website. There are no accounts, no forms,
            no cookies set by me, no analytics, and no trackers. I literally
            have no database to put your data in. What you browse here stays
            between you and your browser.
          </p>
          <p className="mt-2">
            The site is served by a hosting provider (Cloudflare Pages), which
            may keep standard server logs (like IP addresses) for security and
            operations under its own policy — that infrastructure is theirs,
            not mine.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">
            2. MediaFire is a third party
          </h2>
          <p className="mt-2">
            Downloads are hosted on MediaFire. When you click a download
            button, you leave this site and MediaFire&apos;s own privacy policy
            applies — including their ads and any cookies they set. I
            don&apos;t control that and don&apos;t receive any data from it.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">
            3. What about the apps themselves?
          </h2>
          <p className="mt-2">
            My apps are built to work offline and collect nothing. None of them
            include analytics or advertising SDKs. Each app&apos;s page lists
            every permission it requests and the reason — that list is the
            complete story of what the app can touch on your device.
          </p>
          <p className="mt-2">
            Data the apps create (your playlists, workout logs, scan history,
            plans) lives on your device only. Deleting the app deletes the
            data, unless you exported a backup yourself.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">4. Changes</h2>
          <p className="mt-2">
            If this policy ever changes (for example, if I add a new
            distribution channel), the update will appear on this page with a
            new date at the top.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-ink">5. Contact</h2>
          <p className="mt-2">
            Privacy questions? Head to the{" "}
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
