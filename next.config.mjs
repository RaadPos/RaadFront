/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

/**
 * basePath — every route RaadFront owns is prefixed with /shop.
 * Inside the app you still write <Link href="/mahad-electronics">;
 * Next prepends /shop automatically. Only hardcode /shop in things
 * Next does NOT rewrite: sitemap.xml strings, canonical URLs,
 * JSON-LD, og:url, raw <a href> back to raadapp.com root.
 */
const basePath = "/shop";

// Content Security Policy. Product/logo images come from Supabase storage.
// Dev needs 'unsafe-eval' + websockets for React Fast Refresh; prod is tight.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https://*.supabase.co",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"

  /**
   * output: "standalone" — required because RaadFront's Railway start
   * command is `node .next/standalone/server.js`. Without this option
   * that file never gets generated at build time, and the deploy
   * crashes on boot with "cannot find module".
   */
  output: "standalone",

  basePath,

  /**
   * assetPrefix — keeps _next/static requests under /shop so
   * TheRaadWeb's rewrite catches them. Without this, chunk requests
   * go out as raadapp.com/_next/... , hit TheRaadWeb's own build,
   * 404, and the storefront renders as a blank white page with no
   * styles. If you ever see a blank page, check this line first.
   */
  assetPrefix: basePath,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME || "localhost",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;