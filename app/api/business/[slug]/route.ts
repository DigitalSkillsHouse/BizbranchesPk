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

// GET /api/business/:slug - Get individual business by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const models = await getModels();
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Slug is required' }, { status: 400 });
    }
    
    const business = await models.businesses.findOne(
      { slug, status: 'approved' },
      { projection: { _id: 0 } }
    );
    
    if (!business) {
      return NextResponse.json({ ok: false, error: 'Business not found' }, { status: 404 });
    }
    
    // Build CDN URL for logo
    const enrichedBusiness = {
      ...business,
      logoUrl: business.logoUrl || buildCdnUrl(business.logoPublicId)
    };
    
    const response = NextResponse.json({ ok: true, business: enrichedBusiness });
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (err: any) {
    console.error('Error fetching business:', {
      error: err?.message || 'Unknown error',
      stack: err?.stack,
      slug: slug,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ 
      ok: false, 
      error: process.env.NODE_ENV === 'development' ? err?.message || 'Failed to fetch business' : 'Failed to fetch business. Please try again later.'
    }, { status: 500 });
  }
}
