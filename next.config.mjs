import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for Capacitor mobile builds
  output: process.env.NEXT_PUBLIC_PLATFORM === 'mobile' ? 'export' : undefined,
  
  images: {
    unoptimized: true,
  },
  
  turbopack: {
    root: resolve(__dirname, '.'),
  },

  // Cache static assets aggressively at the CDN edge
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
