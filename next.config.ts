import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: zero server code. Build with `npx next build`, deploy /out.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
