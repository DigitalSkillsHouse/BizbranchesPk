const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3002";

const CACHE_REVALIDATE = 300; // 5 min

export async function fetchHomePageData() {
  let categories: any[] = [];
  let featured: any[] = [];

  try {
    const [categoriesRes, featuredRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/categories?limit=24`, {
        next: { revalidate: CACHE_REVALIDATE },
        headers: { "Content-Type": "application/json" },
      }),
      fetch(`${BACKEND_URL}/api/business/featured?limit=12`, {
        next: { revalidate: CACHE_REVALIDATE },
        headers: { "Content-Type": "application/json" },
      }),
    ]);

    if (categoriesRes.ok) {
      try {
        const data = await categoriesRes.json();
        if (data?.ok && Array.isArray(data.categories)) {
          categories = data.categories;
        }
      } catch {
        // ignore
      }
    }

    if (featuredRes.ok) {
      try {
        const data = await featuredRes.json();
        if (data?.ok && Array.isArray(data.businesses)) {
          featured = data.businesses;
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // Backend unreachable (e.g. during build). Return empty data so prerender succeeds.
  }

  return { categories, featured };
}
