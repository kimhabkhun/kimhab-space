import { apps, type App, type AppVersion } from "@/data/apps";

export function publishedApps(): App[] {
  return apps.filter((a) => a.published);
}

export function getApp(slug: string): App | undefined {
  return apps.find((a) => a.slug === slug);
}

export function latestVersion(app: App): AppVersion {
  return app.versions[0];
}

/** Published apps, newest release first — powers "Latest drops". */
export function latestDrops(): App[] {
  return [...publishedApps()].sort(
    (a, b) =>
      +new Date(latestVersion(b).releasedAt) -
      +new Date(latestVersion(a).releasedAt)
  );
}

/** Fixed locale so server and client render identical strings. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const DEFAULT_ACCENT = "#7C5CFF";
