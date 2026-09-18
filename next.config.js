const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence Next.js 15 workspace-root warning from multiple lockfiles on machine
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'storage.example.com' },
    ],
  },
}

module.exports = nextConfig
