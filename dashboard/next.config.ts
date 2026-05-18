import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — Netlify-friendly, no Node server required at runtime.
  output: "export",
  images: { unoptimized: true },
  // Pretty URLs: /tank/123 -> /tank/123/index.html
  trailingSlash: true,
};

export default nextConfig;
