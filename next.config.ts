import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * Photos and models live at stable URLs — the *file name* does not change when
 * the artwork is swapped. Caching them as `immutable` means a browser or CDN
 * keeps serving the old file for a year, so a deploy that replaces an image
 * in place is invisible. These paths always revalidate (cheap 304 via ETag).
 */
const REVALIDATE = [
  { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
];

/** Heavy 3D payloads change rarely — cache them, but still allow revalidation. */
const LONG_CACHE = [
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

/**
 * HTML shells are prerendered, so Next marks them cacheable for a long time.
 * A reverse proxy holding that response means a fresh deploy never reaches
 * the visitor. Pages always revalidate; hashed build output keeps its own
 * immutable cache.
 */
const PAGE_REVALIDATE = [
  { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      // HTML — always revalidate so a new deploy is visible immediately.
      {
        source:
          "/:path((?!_next/static|_next/image|oem|real|models|favicon.ico|robots.txt|sitemap.xml).*)",
        headers: PAGE_REVALIDATE,
      },
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/real/:path*", headers: REVALIDATE },
      { source: "/oem/:path*", headers: REVALIDATE },
      { source: "/models/:path*", headers: LONG_CACHE },
    ];
  },
};

export default nextConfig;
