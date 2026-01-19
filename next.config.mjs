const nextConfig = {
  output: 'standalone', // ← ADD THIS LINE
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
