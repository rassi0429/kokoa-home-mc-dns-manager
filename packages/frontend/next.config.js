/** @type {import('next').NextConfig} */
// Load environment variables from .env file
require('dotenv').config();

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kokoa-home-mc-dns-manager/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
