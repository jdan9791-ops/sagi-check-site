import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://js.hcaptcha.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://hcaptcha.com https://*.hcaptcha.com",
              "connect-src 'self' https://*.supabase.co https://*.upstash.io https://ip-api.com",
              "img-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
