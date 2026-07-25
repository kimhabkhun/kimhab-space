import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publishedApps, getApp, latestVersion, formatDate, DEFAULT_ACCENT } from "@/lib/apps";
import PlatformBadges from "@/components/PlatformBadges";
import ChecksumChip from "@/components/ChecksumChip";
import DownloadButton from "@/components/DownloadButton";
import ScreenshotCarousel from "@/components/ScreenshotCarousel";
import VersionTimeline from "@/components/VersionTimeline";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedApps().map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return {};
  return {
    title: app.name,
    description: app.shortDescription,
  };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app || !app.published) notFound();

  const accent = app.accent ?? DEFAULT_ACCENT;
  const latest = latestVersion(app);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      {/* Header with accent glow */}
      <header className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${accent}2E 0%, transparent 70%)`,
          }}
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={app.icon}
            alt=""
            width={96}
            height={96}
            className="rounded-3xl border border-white/10"
          />
          <div>
            <h1 className="font-display text-[2.5rem] font-bold leading-tight">
              {app.name}
            </h1>
            <p className="mt-2 max-w-xl text-muted">{app.shortDescription}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-raised px-2.5 py-1 text-xs text-ink/90">
                {app.category}
              </span>
              <PlatformBadges platforms={app.platforms} />
            </div>
          </div>
        </div>
      </header>

      {/* Latest version panel */}
      <section
        aria-labelledby="latest-heading"
        className="mt-12 rounded-[20px] border border-white/[0.06] bg-surface p-6 sm:p-8"
        style={{ boxShadow: `0 0 60px -30px ${accent}66` }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="latest-heading" className="text-xl font-medium">
            Latest version
          </h2>
          <span className="rounded-full border border-star/60 bg-star/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-star">
            v{latest.versionName}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">Size</dt>
            <dd className="mt-1 font-mono text-sm">{latest.fileSizeMB} MB</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Min Android
            </dt>
            <dd className="mt-1 font-mono text-sm">{latest.minAndroid}+</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Released
            </dt>
            <dd className="mt-1 font-mono text-sm">
              {formatDate(latest.releasedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted">
              Version code
            </dt>
            <dd className="mt-1 font-mono text-sm">{latest.versionCode}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <DownloadButton
            href={latest.mediafireUrl}
            label={`Download v${latest.versionName}`}
          />
          <ChecksumChip sha256={latest.sha256} />
        </div>

        <p className="mt-4 text-xs text-muted">
          Heads up: MediaFire shows ads. The real button is the green one.{" "}
          <a href="/install" className="text-nebula hover:text-ink">
            See the install guide
          </a>{" "}
          if anything looks off.
        </p>
        <p className="mt-2 text-xs text-muted">
          Downloaded it? Check it against the checksum above with the{" "}
          <a href="/tools/apk-verifier" className="text-nebula hover:text-ink">
            in-browser APK verifier
          </a>{" "}
          — no commands needed.
        </p>

        {app.ios && (app.ios.testflightUrl || app.ios.appstoreUrl) && (
          <div className="mt-6 border-t border-white/5 pt-5">
            <p className="text-xs uppercase tracking-widest text-muted">
              Also on iOS
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {app.ios.testflightUrl && (
                <DownloadButton
                  href={app.ios.testflightUrl}
                  label="Join the TestFlight beta"
                  secondary
                />
              )}
              {app.ios.appstoreUrl && (
                <DownloadButton
                  href={app.ios.appstoreUrl}
                  label="Get it on the App Store"
                  secondary
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Screenshots */}
      <section aria-labelledby="shots-heading" className="mt-14">
        <h2 id="shots-heading" className="text-xl font-medium">
          Screenshots
        </h2>
        <div className="mt-5">
          <ScreenshotCarousel screenshots={app.screenshots} appName={app.name} />
        </div>
      </section>

      {/* About */}
      <section aria-labelledby="about-heading" className="mt-14">
        <h2 id="about-heading" className="text-xl font-medium">
          About this app
        </h2>
        <p className="mt-4 leading-relaxed text-muted">{app.description}</p>
      </section>

      {/* What's new in latest */}
      <section aria-labelledby="new-heading" className="mt-14">
        <h2 id="new-heading" className="text-xl font-medium">
          What&apos;s new in v{latest.versionName}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {latest.changelog.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="text-nebula">
                –
              </span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* Permissions */}
      <section aria-labelledby="perm-heading" className="mt-14">
        <h2 id="perm-heading" className="text-xl font-medium">
          What it can touch
        </h2>
        <p className="mt-2 text-sm text-muted">
          Every permission this app asks for, and why. Nothing else.
        </p>
        <ul className="mt-4 space-y-2">
          {app.permissions.map((p) => {
            const [name, why] = p.split(" — ");
            return (
              <li
                key={p}
                className="flex flex-wrap items-baseline gap-x-2 rounded-xl border border-white/[0.06] bg-surface px-4 py-3 text-sm"
              >
                <span className="font-medium">{name}</span>
                {why && <span className="text-muted">— {why}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Version history */}
      <section aria-labelledby="history-heading" className="mt-14">
        <h2 id="history-heading" className="text-xl font-medium">
          Version history
        </h2>
        <p className="mt-2 text-sm text-muted">
          Every release, with its own download and checksum. Verify anything you
          grab.
        </p>
        <div className="mt-8">
          <VersionTimeline app={app} />
        </div>
      </section>
    </div>
  );
}
