import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serves the prerendered SSG pages (e.g. /apps/[slug]) from static assets.
// Required: without an incremental cache, dynamic-segment pages 404 at
// runtime even though they were prerendered. This override is read-only —
// perfect for a fully prerendered site. If ISR/revalidation is ever added,
// switch to the R2 or KV incremental cache instead.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
