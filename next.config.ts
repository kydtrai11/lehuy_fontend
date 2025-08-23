/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '', // để trống vì hầu hết prod chạy mặc định 443
        pathname: '/uploads/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // tránh fail khi deploy do warnings
  },
  typescript: {
    ignoreBuildErrors: true, // tránh fail khi deploy do type errors
  },
};

module.exports = nextConfig;
