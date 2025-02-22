import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:8080"
            : "https://loadbalancer.primepinas.com"
        }/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
