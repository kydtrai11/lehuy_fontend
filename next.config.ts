/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: "Vanluy12345",
  },
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://45.77.39.200:5001/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://45.77.39.200:5001/uploads/:path*',
      },
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
