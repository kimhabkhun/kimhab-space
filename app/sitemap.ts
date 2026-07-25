import type { MetadataRoute } from "next";
import { publishedApps, latestVersion } from "@/lib/apps";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/apps",
    "/install",
    "/about",
    "/terms",
    "/privacy",
    "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
  }));

  const appPages = publishedApps().map((app) => ({
    url: `${SITE_URL}/apps/${app.slug}`,
    lastModified: new Date(latestVersion(app).releasedAt),
    changeFrequency: "weekly" as const,
  }));

  return [...staticPages, ...appPages];
}
