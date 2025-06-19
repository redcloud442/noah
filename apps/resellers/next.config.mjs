/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:8080"
            : "https://noah-1v48.onrender.com"
        }/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
