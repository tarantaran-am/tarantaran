import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import { isProductionDeployment } from "./src/shared/config/deployment";
import { BACKDROP_QUALITY, DEFAULT_QUALITY } from "./src/shared/config/images";

const isDevServer = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // Cloudflare Turnstile guards the "email me a sign-in link" form: its script and its iframe.
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDevServer ? " 'unsafe-eval'" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  // The HEIC decoder for iPhone photos runs in a worker it creates from a blob: URL.
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  // Photos are uploaded from the browser straight to Supabase Storage by a signed URL.
  `connect-src 'self' https://*.sentry.io https://*.supabase.co${isDevServer ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const withMDX = createMDX({
  options: { remarkPlugins: ["remark-frontmatter"] },
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProductionDeployment
          ? securityHeaders
          : [...securityHeaders, { key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  images: {
    // AVIF where the browser supports it (about a fifth lighter than WebP), WebP otherwise.
    formats: ["image/avif", "image/webp"],
    qualities: [BACKDROP_QUALITY, DEFAULT_QUALITY],
    // Every distinct width is a separate billed transformation on Vercel Hobby (5,000/month),
    // so the list is short and stops at 1920.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    // Vendor photos rarely change; keep optimized copies for 31 days instead of re-making them.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withSentryConfig(withNextIntl(withMDX(nextConfig)), {
  org: "tarantaran",
  project: "tarantaran",
  silent: !process.env.CI,
  tunnelRoute: "/api/pulse",
  widenClientFileUpload: true,
});
