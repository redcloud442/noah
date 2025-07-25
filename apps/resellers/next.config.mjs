/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:8080"
            : "https://api.pinkful.website"
        }/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
