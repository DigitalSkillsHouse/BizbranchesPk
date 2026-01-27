// Railway-optimized Next.js configuration
const isRailway = !!(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_NAME
);

const nextConfig = {
  // Always use standalone for Railway
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    domains: ["res.cloudinary.com"],
  },
  async redirects() {
    return [
      { source: '/business/:slug', destination: '/:slug', permanent: true },
      { source: '/city/:path*/business/:slug', destination: '/:slug', permanent: true },
      { source: '/category/:path*/business/:slug', destination: '/:slug', permanent: true },
      { source: '/404', destination: '/', permanent: false },
    ]
  },
}

export default nextConfig
