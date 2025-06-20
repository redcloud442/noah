import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "umypvsozlsjtjfsakqxg.supabase.co",
        protocol: "https",
      },
      {
        hostname: "undraw.co",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
