import Link from "next/link";
import OrbitHero from "@/components/OrbitHero";
import AppCard from "@/components/AppCard";
import { latestDrops, publishedApps } from "@/lib/apps";

export default function HomePage() {
  const apps = publishedApps();
  const drops = latestDrops();

  return (
    <>
      <OrbitHero apps={apps} />

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.75rem] font-semibold">
              Latest drops
            </h2>
            <p className="mt-2 text-sm text-muted">
              Fresh builds, straight from my machine to yours.
            </p>
          </div>
          <Link
            href="/apps"
            className="shrink-0 text-sm text-nebula transition-colors hover:text-ink"
          >
            View all apps →
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((app) => (
            <li key={app.slug}>
              <AppCard app={app} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="rounded-[20px] border border-white/[0.06] bg-surface p-8 text-center sm:p-10">
          <h2 className="font-display text-xl font-semibold">
            First time installing an APK?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Two minutes, one settings toggle, and a checksum to prove the file
            is genuine. I wrote the whole thing down — including which MediaFire
            button is the real one.
          </p>
          <Link
            href="/install"
            className="btn-outline mt-6 inline-block px-6 py-3 text-sm"
          >
            Read the install guide
          </Link>
        </div>
      </section>
    </>
  );
}
