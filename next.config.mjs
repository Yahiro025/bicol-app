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
};

export default nextConfig; // Changed from module.exports

//const withPWA = require('next-pwa')({
  //dest: 'public',
  //disable: process.env.NODE_ENV === 'development',
  //register: true,
  //skipWaiting: true,
//});

const isMobile = process.env.NEXT_PUBLIC_PLATFORM === 'mobile';

/*module.exports = withPWA({
  // Next.js config
  reactStrictMode: true,
  output: isMobile ? 'export' : undefined,
  images: {
    unoptimized: true, // Always unoptimized for Capacitor compatibility
  },
}); */
