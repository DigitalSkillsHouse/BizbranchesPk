import { NextRequest, NextResponse } from "next/server";
import { urlEntry } from "@/lib/sitemap";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3002";
const SITEMAP_BUSINESS_LIMIT = 45000;

export const revalidate = 300;

/**
 * GET /sitemap/businesses/[page] — One chunk of business listing URLs (paginated).
 * Each chunk stays under Google's 50,000 URL limit. New listings appear via pagination.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const { page: pageParam } = await context.params;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/sitemap/businesses?page=${page}&limit=${SITEMAP_BUSINESS_LIMIT}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        {
          status: 200,
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const data = await res.json();
    const businesses: Array<{ slug: string; updatedAt: string }> = data.businesses || [];

    const urls = businesses.map((b: { slug: string; updatedAt: string }) =>
      urlEntry(`/${encodeURIComponent(b.slug)}`, {
        lastmod: new Date(b.updatedAt),
        changefreq: "weekly",
        priority: "0.7",
      })
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
