import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/models';
import { CreateBusinessSchema, BusinessSchema } from '@/lib/schemas';
import cloudinary from '@/lib/cloudinary';
import { pingGoogleSitemap } from '@/lib/google-ping';

// Helper to build a Cloudinary CDN URL from a public_id when logoUrl is missing
const buildCdnUrl = (publicId?: string | null) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return undefined;

  // If it's already a full URL, return as is
  if (publicId.startsWith('http')) return publicId;

  // Normalize possible full Cloudinary-style path to extract the public_id including folders
  let cleanId = publicId
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v?\d+\//, '') // strip host + delivery + optional version
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, ''); // strip host + delivery (no version)

  // Remove file extension, Cloudinary works without it for transformation URLs
  cleanId = cleanId.replace(/\.[^/.]+$/, '');

  // Generate a resized, auto-format URL
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fit,w_200,h_200,q_auto,f_auto/${cleanId}`;
};

async function uploadToCloudinary(buffer: Buffer): Promise<{ url: string; public_id: string } | null> {
  try {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cition/business-logos",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto", width: 200, height: 200, crop: "fit" }],
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload_stream error:", error);
            return reject(error);
          }
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      stream.end(buffer);
    });
  } catch (e) {
    console.error("uploadToCloudinary failed:", e);
    return null;
  }
}

// Validation helper function
async function validateUniqueBusinessName(name: string, excludeId?: string): Promise<boolean> {
  try {
    const models = await getModels();
    const filter: any = { 
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    };
    
    // Exclude current business when updating
    if (excludeId) {
      const { ObjectId } = require("mongodb") as typeof import("mongodb");
      filter._id = { $ne: new ObjectId(excludeId) };
    }
    
    const existing = await models.businesses.findOne(filter);
    return !existing; // Return true if name is unique (no existing business found)
  } catch (error) {
    console.error('Error validating unique business name:', error);
    return false; // Assume not unique on error for safety
  }
}

// GET /api/business - List businesses with pagination
export async function GET(request: NextRequest) {
  try {
    const models = await getModels();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    
    const filter: any = { status: 'approved' };
    
    // Optional filters
    if (searchParams.get('category')) {
      const categoryQuery = searchParams.get('category') as string;
      const categoryRegex = new RegExp(`^${categoryQuery}$`, 'i');
      filter.category = categoryRegex;
    }
    if (searchParams.get('city')) {
      const cityQuery = searchParams.get('city') as string;
      const cityRegex = new RegExp(`^${cityQuery}$`, 'i');
      filter.city = cityRegex;
    }
    let businesses;
    let total;
    
    if (searchParams.get('q')) {
      const searchTerm = searchParams.get('q') as string;
      const searchRegex = new RegExp(searchTerm, 'i');
      
      // Build search filter
      const searchFilter = {
        ...filter,
        $or: [
          { name: searchRegex },
          { category: searchRegex },
          { subCategory: searchRegex },
          { description: searchRegex }
        ]
      };
      
      // Use aggregation for relevance scoring
      businesses = await models.businesses.aggregate([
        { $match: searchFilter },
        {
          $addFields: {
            searchScore: {
              $add: [
                // Category exact match (highest priority)
                { $cond: [{ $regexMatch: { input: "$category", regex: `^${searchTerm}$`, options: "i" } }, 100, 0] },
                // Category contains term
                { $cond: [{ $regexMatch: { input: "$category", regex: searchTerm, options: "i" } }, 50, 0] },
                // Subcategory contains term
                { $cond: [{ $regexMatch: { input: "$subCategory", regex: searchTerm, options: "i" } }, 40, 0] },
                // Name starts with term
                { $cond: [{ $regexMatch: { input: "$name", regex: `^${searchTerm}`, options: "i" } }, 30, 0] },
                // Name contains term
                { $cond: [{ $regexMatch: { input: "$name", regex: searchTerm, options: "i" } }, 20, 0] },
                // Description contains term (lowest priority)
                { $cond: [{ $regexMatch: { input: "$description", regex: searchTerm, options: "i" } }, 5, 0] }
              ]
            }
          }
        },
        { $sort: { searchScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]).toArray();
      
      total = await models.businesses.countDocuments(searchFilter);
    } else {
      businesses = await models.businesses
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      total = await models.businesses.countDocuments(filter);
    }
    
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
    console.error('Error fetching businesses:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to fetch businesses' }, { status: 500 });
  }
}

// POST /api/business - Create business with optional logo upload
export async function POST(request: NextRequest) {
  try {
    const models = await getModels();
    const formData = await request.formData();

    // Extract text fields from FormData
    const formDataObj: any = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'logo') {
        formDataObj[key] = typeof value === 'string' ? value : value.toString();
      }
    }

    const data = {
      name: String(formDataObj.name || "").trim(),
      category: String(formDataObj.category || "").trim(),
      subCategory: String(formDataObj.subcategory || formDataObj.subCategory || "").trim(),
      province: String(formDataObj.province || "").trim(),
      city: String(formDataObj.city || "").trim(),
      area: String(formDataObj.area || "").trim(),
      postalCode: String(formDataObj.postalCode || "").trim(),
      address: String(formDataObj.address || "").trim(),
      phone: String(formDataObj.phone || "").trim(),
      contactPerson: String(formDataObj.contactPerson || "").trim() || "",
      whatsapp: String(formDataObj.whatsapp || "").trim() || "",
      email: String(formDataObj.email || "").trim(),
      description: String(formDataObj.description || "").trim(),
      websiteUrl: String(formDataObj.websiteUrl || "").trim(),
      facebookUrl: String(formDataObj.facebookUrl || "").trim(),
      gmbUrl: String(formDataObj.gmbUrl || "").trim(),
      youtubeUrl: String(formDataObj.youtubeUrl || "").trim(),
      profileUsername: String(formDataObj.profileUsername || "").trim(),
      // Bank fields
      swiftCode: String(formDataObj.swiftCode || "").trim(),
      branchCode: String(formDataObj.branchCode || "").trim(),
      cityDialingCode: String(formDataObj.cityDialingCode || "").trim(),
      iban: String(formDataObj.iban || "").trim(),
    };

    // Normalize URL fields: if provided without scheme, prepend https://
    const ensureUrl = (val: string) => {
      if (!val) return val;
      if (/^https?:\/\//i.test(val)) return val;
      return `https://${val}`;
    };
    data.websiteUrl = ensureUrl(data.websiteUrl);
    data.facebookUrl = ensureUrl(data.facebookUrl);
    data.gmbUrl = ensureUrl(data.gmbUrl);
    data.youtubeUrl = ensureUrl(data.youtubeUrl);

    // Check if description contains error messages
    if (data.description && data.description.includes('Business Not Found')) {
      console.error('ERROR: Description contains error messages!');
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid description content detected", 
        details: "Description field contains error messages"
      }, { status: 400 });
    }

    // Validate using Zod schema
    const validationResult = CreateBusinessSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return NextResponse.json({ 
        ok: false, 
        error: "Validation failed", 
        details: validationResult.error.errors,
        receivedData: data 
      }, { status: 400 });
    }

    const validatedData = validationResult.data;
    const logoFile = formData.get('logo') as File | null;

    let logoUrl: string | undefined;
    let logoPublicId: string | undefined;

    // Handle logo upload to Cloudinary
    if (logoFile && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploaded = await uploadToCloudinary(buffer);
      if (uploaded) {
        logoUrl = uploaded.url;
        logoPublicId = uploaded.public_id;
      }
    }

    // Generate unique slug from name
    const baseSlug = String(validatedData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 120);
    let uniqueSlug = baseSlug || `business-${Date.now()}`;
    let attempt = 0;
    while (await models.businesses.findOne({ slug: uniqueSlug })) {
      attempt += 1;
      uniqueSlug = `${baseSlug}-${attempt}`;
    }

    // Create business document with schema validation
    const businessDoc = BusinessSchema.parse({
      ...validatedData,
      slug: uniqueSlug,
      logoUrl: logoUrl || undefined,
      logoPublicId: logoPublicId || undefined,
      status: "pending" as const,
      createdAt: new Date(),
    });

    // Insert into database
    const result = await models.businesses.insertOne(businessDoc);

    // Update category count
    await models.categories.updateOne(
      { slug: validatedData.category },
      { $inc: { count: 1 } }
    );

    return NextResponse.json({ 
      ok: true, 
      id: result.insertedId, 
      business: { ...businessDoc, _id: result.insertedId } 
    }, { status: 201 });
  } catch (err: any) {
    console.error("Business creation error:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message || "Internal server error" 
    }, { status: 500 });
  }
}

// PATCH /api/business - Admin: approve or reject a business
export async function PATCH(request: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ ok: false, error: "Missing ADMIN_SECRET" }, { status: 500 });
    }

    const bearer = request.headers.get('authorization') || "";
    const headerSecret = request.headers.get('x-admin-secret') || (bearer.startsWith("Bearer ") ? bearer.slice(7) : "");
    if (headerSecret !== adminSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id?.trim();
    const nextStatus = body.status?.trim() as "approved" | "pending" | "rejected" | undefined;
    if (!id || !nextStatus || !["approved", "pending", "rejected"].includes(nextStatus)) {
      return NextResponse.json({ ok: false, error: "id and valid status are required" }, { status: 400 });
    }

    const { ObjectId } = require("mongodb") as typeof import("mongodb");
    const models = await getModels();
    const result = await models.businesses.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: nextStatus, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: "Business not found" }, { status: 404 });
    }

    // Ping Google when business is approved
    if (nextStatus === "approved" && result.modifiedCount > 0) {
      pingGoogleSitemap().catch(console.error);
    }

    return NextResponse.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to update status" }, { status: 500 });
  }
}
