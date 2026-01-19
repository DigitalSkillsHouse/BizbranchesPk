import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/models';

// Helper to build a Cloudinary CDN URL from a public_id when logoUrl is missing
const buildCdnUrl = (publicId?: string | null) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return undefined;
  if (publicId.startsWith('http')) return publicId;
  let cleanId = publicId
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v?\d+\//, '')
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '');
  cleanId = cleanId.replace(/\.[^/.]+$/, '');
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fit,w_200,h_200,q_auto,f_auto/${cleanId}`;
};

// GET /api/business/featured - Featured approved businesses for homepage sections
export async function GET(request: NextRequest) {
  try {
    const models = await getModels();
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 48);

    const businesses = await models.businesses
      .find({ status: 'approved', featured: true })
      .sort({ featuredAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    const enriched = businesses.map((b: any) => ({
      ...b,
      logoUrl: b.logoUrl || buildCdnUrl(b.logoPublicId),
    }));

    return NextResponse.json({ ok: true, businesses: enriched });
  } catch (err: any) {
    console.error('Error fetching featured businesses:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to fetch featured businesses' }, { status: 500 });
  }
}
