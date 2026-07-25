import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/**
 * Security headers, applied to every route by the Worker.
 * CSP notes:
 * - 'unsafe-inline' in script-src is required by Next.js hydration
 *   bootstrap scripts (static prerender = no per-request nonces).
 * - 'unsafe-inline' in style-src is required by Framer Motion's inline
 *   style attributes.
 * - img-src data: is required by the grain overlay (data: URI in CSS).
 * - Everything else is locked to same-origin; MediaFire links are plain
 *   navigations, which CSP does not restrict.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Deployed to Cloudflare Workers via @opennextjs/cloudflare.
  // NOTE: `output: "export"` was removed — OpenNext is incompatible with it.
  // All pages are still fully prerendered as static HTML at build time.
  images: { unoptimized: true },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

// Lets `next dev` access Cloudflare bindings if any are added later.
initOpenNextCloudflareForDev();
