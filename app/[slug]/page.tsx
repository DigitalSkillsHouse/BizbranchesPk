import { headers } from "next/headers";
import { BusinessSchema } from "@/components/business-schema";
import BusinessDetailPage from "../business/[id]/page";

function serializeId(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(serializeId);
  if (typeof doc !== 'object') return doc;
  // Handle Buffer, ObjectId, or objects with toJSON
  if (typeof doc.toJSON === 'function') {
    try {
      const jsonVal = doc.toJSON();
      if (typeof jsonVal === 'object') return serializeId(jsonVal);
      return jsonVal;
    } catch {}
  }
  const out: any = {};
  for (const key in doc) {
    if (key === '_id') {
      out.id = String(doc._id);
      continue;
    }
    const val = doc[key];
    if (val && typeof val === 'object') {
      if (typeof val.toJSON === 'function') {
        try {
          const jsonVal = val.toJSON();
          out[key] = typeof jsonVal === 'object' ? serializeId(jsonVal) : jsonVal;
        } catch {
          out[key] = String(val);
        }
      } else {
        out[key] = serializeId(val);
      }
    } else {
      out[key] = val;
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  let business: any = null;
  
  try {
    // Fetch business data from API route
    const response = await fetch(`${baseUrl}/api/business/${encodeURIComponent(slug)}`, {
      headers: {
        ...Object.fromEntries((await headers()).entries()),
      },
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.ok && data.business) {
        business = serializeId(data.business);
      }
    }
  } catch (error) {
    console.error("Error fetching metadata for business:", error);
    // Continue with null business, will use fallbacks
  }

  // Resolve request domain for title formatting
  const domain = host.replace(/^(https?:\/\/)?/i, "").replace(/\/$/, "");

  const businessName = business?.name || slug;
  const title = `${domain}/${businessName}`;
  
  let description = "Discover local businesses on BizBranches.";
  if (business?.description) {
    const rawDesc = typeof business.description === "string" ? business.description : "";
    const normalized = rawDesc.replace(/\s+/g, " ").trim();
    description = normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function BusinessBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  let business: any = null;
  let related: any[] = [];
  let reviews: any[] = [];
  let ratingCount = 0;
  let ratingAvg = 0;

  try {
    // Fetch business data
    const bizResponse = await fetch(`${baseUrl}/api/business/${encodeURIComponent(slug)}`, {
      headers: {
        ...Object.fromEntries((await headers()).entries()),
      },
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!bizResponse.ok) {
      console.error(`Failed to fetch business: ${bizResponse.status} - ${bizResponse.statusText}`);
      // Return a page with error information instead of throwing
      return (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground">The business you're looking for doesn't exist or is currently unavailable.</p>
            <p className="text-sm text-muted-foreground mt-4">Error: Failed to load business data ({bizResponse.status})</p>
          </div>
        </div>
      );
    }

    const bizData = await bizResponse.json();
    if (!bizData.ok || !bizData.business) {
      console.error(bizData.error || "Business not found");
      // Return a page with error information
      return (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground">The business you're looking for doesn't exist or is currently unavailable.</p>
            <p className="text-sm text-muted-foreground mt-4">Error: {bizData.error || "Business data not available"}</p>
          </div>
        </div>
      );
    }
    business = serializeId(bizData.business);

    // Fetch related businesses (same category and city)
    if (business?.category && business?.city) {
      try {
        const relatedResponse = await fetch(
          `${baseUrl}/api/business/related?category=${encodeURIComponent(business.category)}&city=${encodeURIComponent(business.city)}&excludeSlug=${encodeURIComponent(business.slug)}`,
          {
            next: {
              revalidate: 7200, // Revalidate every 2 hours
            },
          }
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          if (relatedData.ok && Array.isArray(relatedData.businesses)) {
            related = relatedData.businesses.map(serializeId);
          }
        }
      } catch (error) {
        console.error("Error fetching related businesses:", error);
        // Continue with empty related array
      }
    }

    // Fetch reviews and aggregates
    try {
      const reviewsResponse = await fetch(`${baseUrl}/api/reviews?businessId=${encodeURIComponent(business.id || slug)}`, {
        next: {
          revalidate: 1800, // Revalidate every 30 minutes
        },
      });
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.ok) {
          reviews = reviewsData.reviews.map(serializeId);
          ratingCount = reviewsData.ratingCount || reviews.length;
          ratingAvg = reviewsData.ratingAvg || 0;
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Continue with empty reviews array
    }
  } catch (error) {
    console.error("Error in BusinessBySlugPage:", error);
    // Return a page with error information
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Service Unavailable</h1>
          <p className="text-muted-foreground">We're having trouble loading business details right now. Please try again later.</p>
          <p className="text-sm text-muted-foreground mt-4">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
          <p className="text-muted-foreground">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BusinessSchema business={business} />
      <BusinessDetailPage
        initialBusiness={business}
        initialReviews={reviews}
        initialRatingAvg={ratingAvg}
        initialRatingCount={ratingCount}
        initialRelated={related}
      />
    </>
  );
}