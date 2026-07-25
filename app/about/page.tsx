import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who's behind Kimhab Space, why it exists, and the no-ads promise.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        About
      </h1>

      <section className="mt-10 space-y-5 leading-relaxed text-muted">
        <h2 className="text-xl font-medium text-ink">Hey, I&apos;m Kimhab</h2>
        <p>
          I&apos;m a solo developer from Cambodia, and Kimhab Space is my
          personal universe — every app here is something I built because I
          wanted it to exist. A music player that doesn&apos;t phone home. A
          scanner that doesn&apos;t sell your history. A workout log that
          doesn&apos;t hide your own data behind a subscription.
        </p>

        <h2 className="pt-4 text-xl font-medium text-ink">
          Why this site exists
        </h2>
        <p>
          App stores are full of free apps that aren&apos;t really free —
          you pay with ads, trackers, and nag screens. I wanted one quiet
          corner of the internet where the deal is simple: you download the
          app, it works, that&apos;s the whole transaction. No accounts, no
          analytics SDKs, no dark patterns.
        </p>
        <p>
          Hosting my own download hub also means I can ship updates the moment
          they&apos;re ready and publish a checksum for every single build, so
          you can prove the file you got is the file I made.
        </p>

        <h2 className="pt-4 text-xl font-medium text-ink">
          The no-ads promise
        </h2>
        <p>
          Every app on this site is free, with no ads and no tracking —
          forever. Not &quot;free until it gets popular.&quot; Not &quot;free
          with a premium tier coming soon.&quot; If that ever changes for some
          future app, it will never change retroactively for anything already
          published here.
        </p>
        <p>
          The one honest catch: downloads go through MediaFire, and MediaFire
          shows its own ads on the download page. The{" "}
          <Link href="/install" className="text-nebula hover:text-ink">
            install guide
          </Link>{" "}
          shows you exactly which button is real.
        </p>

        <h2 className="pt-4 text-xl font-medium text-ink">Say hi</h2>
        <p>
          Found a bug? Want a feature? Just want to say the voice changer made
          your group chat worse in the best way?{" "}
          <Link href="/contact" className="text-nebula hover:text-ink">
            Get in touch
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
