import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const isDocker = process.env.IS_DOCKER === 'true'

    return [
      {
        source: '/api/:path*',
        destination: isDocker
          ? 'http://backend:5000/:path*'     // inside Docker
          : 'http://localhost:5000/:path*', // outside Docker
      },
    ]
  },
  // Increase timeout
  serverRuntimeConfig: {
    apiTimeout: 300000, // 5 minutes
  },
};

export default nextConfig;
