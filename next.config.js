// @ts-nocheck

/** @type {Object} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https: http:;",
        },
      ],
    },
  ],
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  }
};

module.exports = nextConfig;