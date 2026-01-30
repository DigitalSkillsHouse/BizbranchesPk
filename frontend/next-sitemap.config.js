/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || "https://bizbranches.pk", // change to your real domain
    generateRobotsTxt: true,
    outDir: "./public",
    changefreq: "daily",
    priority: 0.7,
    additionalPaths: async (config) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/business`);
        const json = await res.json();
        const businesses = Array.isArray(json) ? json : json.data || [];
  
        return businesses.map((b) => ({
          loc: `/business/${b._id}`, // change to b.slug if needed
          changefreq: "daily",
          priority: 0.7,
          lastmod: new Date().toISOString(),
        }));
      } catch (err) {
        console.error("❌ Error fetching businesses for sitemap:", err);
        return [];
      }
    },
  };
  
