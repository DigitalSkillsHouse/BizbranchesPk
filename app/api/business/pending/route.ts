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

// GET /api/business/pending - List pending businesses (frontend submissions only)
export async function GET(request: NextRequest) {
  try {
    const models = await getModels();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    
    // Only show pending businesses that were submitted from frontend (not admin panel)
    const filter: any = { 
      status: 'pending',
      $and: [
        { source: { $ne: 'admin' } },
        { createdBy: { $exists: false } }
      ]
    };
    
    const businesses = await models.businesses
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await models.businesses.countDocuments(filter);
    
    // Build CDN URLs for logos
    const enrichedBusinesses = businesses.map((business: any) => ({
      ...business,
      logoUrl: business.logoUrl || buildCdnUrl(business.logoPublicId)
    }));
    
    return NextResponse.json({
      ok: true,
      businesses: enrichedBusinesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('Error fetching pending businesses:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to fetch pending businesses' }, { status: 500 });
  }
}
