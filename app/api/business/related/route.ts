import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category')?.trim();
    const city = searchParams.get('city')?.trim();
    const excludeSlug = searchParams.get('excludeSlug')?.trim();

    if (!category || !city) {
      return NextResponse.json({ ok: false, error: "category and city are required" }, { status: 400 });
    }

    const models = await getModels();
    const filter: any = {
      category,
      city,
      status: "approved",
    };
    if (excludeSlug) {
      filter.slug = { $ne: excludeSlug };
    }

    const businesses = await models.businesses
      .find(filter, {
        projection: { _id: 1, name: 1, slug: 1, category: 1, city: 1, logoUrl: 1, description: 1 },
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray();

    const serialized = businesses.map((b: any) => ({
      ...b,
      id: b._id.toString(),
      _id: undefined,
    }));

    const response = NextResponse.json({ ok: true, businesses: serialized });
    response.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return response;
  } catch (err: any) {
    console.error("Error fetching related businesses:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch related businesses" }, { status: 500 });
  }
}
