import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Treat framer-motion as external for server components
  serverExternalPackages: ['framer-motion'],
  // Empty turbopack config to silence warnings
  turbopack: {},
};

export default nextConfig;
