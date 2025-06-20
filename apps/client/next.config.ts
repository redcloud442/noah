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
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
