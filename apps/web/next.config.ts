import type { NextConfig } from "next";

/*
 * Baseline security headers from day one. The app's Content-Security-Policy is added with the app
 * shell (M7) and uploads (Step 2), when its API origin and upload storage are known: a guessed
 * policy now would either break those or be too loose to mean anything.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Browsers ignore HSTS over plain HTTP, so this is safe locally and active once on HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
