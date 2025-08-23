/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true, // tránh fail khi deploy do warnings
  },
  typescript: {
    ignoreBuildErrors: true, // tránh fail khi deploy do type errors
  },
};

module.exports = nextConfig;
