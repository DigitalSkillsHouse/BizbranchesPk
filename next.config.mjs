// Conditionally use standalone mode only for Railway, not for AWS Amplify
// AWS Amplify works better with standard Next.js build
// Railway works best with standalone mode

// Check for AWS Amplify environment variables (set during Amplify builds)
const isAmplify = !!(
  process.env.AWS_AMPLIFY_APP_ID || 
  process.env.AWS_EXECUTION_ENV || 
  process.env.AWS_REGION ||
  process.env.AMPLIFY_CLI_VERSION ||
  process.env.AMPLIFY_DIFF_DEPLOY ||
  process.env.AMPLIFY_MONOREPO_APP_ROOT
);

// Check for Railway (Railway sets RAILWAY_ENVIRONMENT)
const isRailway = !!(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_NAME
);

// Use standalone mode for Railway, or if explicitly set, or if not Amplify
// Default to standalone unless we're on Amplify
const useStandalone = 
  process.env.USE_STANDALONE === 'true' || 
  isRailway || 
  (!isAmplify && process.env.USE_STANDALONE !== 'false');

if (process.env.NODE_ENV === 'production') {
  console.log(`[Next.js Config] Platform detection:`, {
    isAmplify,
    isRailway,
    useStandalone,
    nodeEnv: process.env.NODE_ENV
  });
}

const nextConfig = {
  // Only use standalone mode for Railway (not Amplify)
  ...(useStandalone && { output: 'standalone' }),
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
  // Removed API rewrites - using Next.js API routes directly
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
  //     },
  //   ]
  // },
}
export default nextConfig





// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: false,
//     domains: ["res.cloudinary.com"],
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//         pathname: "/**",
//       },
//     ],
//   },
//   async redirects() {
//     return [
//       // Legacy direct business URL -> clean slug
//       { source: '/business/:slug', destination: '/:slug', permanent: true },
//       // Legacy nested city/category paths -> clean slug
//       { source: '/city/:path*/business/:slug', destination: '/:slug', permanent: true },
//       { source: '/category/:path*/business/:slug', destination: '/:slug', permanent: true },
//       // Redirect explicit /404 path to homepage
//       { source: '/404', destination: '/', permanent: false },
//     ]
//   },
// }

// export default nextConfig
