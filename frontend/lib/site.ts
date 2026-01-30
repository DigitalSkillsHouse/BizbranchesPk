/**
 * Canonical site URL for SEO (meta canonical, Open Graph, schema).
 * Prefer env in production; fallback for local/dev.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://bizbranches.pk";

export const SITE_NAME = "LocatorBranches";
export const SITE_DESCRIPTION =
  "Pakistan's premier business directory. Find and connect with trusted local businesses. Search by category, location, or name. Read reviews and grow your business.";
