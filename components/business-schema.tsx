interface BusinessSchemaProps {
  business: any;
}

export function BusinessSchema({ business }: BusinessSchemaProps) {
  if (!business) return null;

  const canonicalUrl = `https://bizbranches.pk/${encodeURIComponent(business.slug || business.id || '')}`;
  const sameAs = [business.facebookUrl, business.youtubeUrl, business.gmbUrl, business.websiteUrl]
    .filter((v: any) => typeof v === 'string' && v.trim().length > 0);

  const schemaData: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    image: business.logoUrl || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || undefined,
      addressLocality: business.city || undefined,
      addressRegion: business.province || undefined,
      postalCode: business.postalCode || undefined,
      addressCountry: 'PK',
    },
    telephone: business.phone || undefined,
    email: business.email || undefined,
    url: business.websiteUrl || canonicalUrl,
    priceRange: 'PKR',
    description: typeof business.description === 'string' ? business.description : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  if (business.latitude && business.longitude) {
    schemaData.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}