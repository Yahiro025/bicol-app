const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const isMobile = process.env.NEXT_PUBLIC_PLATFORM === 'mobile';

module.exports = withPWA({
  // Next.js config
  reactStrictMode: true,
  output: isMobile ? 'export' : undefined,
  images: {
    unoptimized: true, // Always unoptimized for Capacitor compatibility
  },
});
