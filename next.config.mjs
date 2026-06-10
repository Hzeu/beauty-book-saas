/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // SECURITY FIX: Removed ignoreBuildErrors - must fix TypeScript errors
    // This ensures all type safety issues are caught before build
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Accept-CH', value: 'Sec-CH-Prefers-Color-Scheme' },
          { key: 'Vary', value: 'Sec-CH-Prefers-Color-Scheme' },
        ],
      },
    ]
  },
}

export default nextConfig
