import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GlobalTopbar } from "@/components/global-topbar";
import GlobalContainer from "@/components/global-container";
import { AdBanner } from "@/components/ad-banner";
import { CtaAddBusiness } from "@/components/cta-add-business";
import { CopyDeterrent } from "@/components/copy-deterrent";
import { Suspense } from "react";
import Script from "next/script";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const defaultTitle = `${SITE_NAME} – Pakistan Free Business Listing Directory`;
const defaultDesc = "Pakistan's free business listing directory. Find local businesses by city and category. Add your business free, read reviews, and get contact details. Trusted across Pakistan.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s – ${SITE_NAME}`,
  },
  description: defaultDesc,
  keywords: "Pakistan business directory, free business listing Pakistan, Pakistani business listing site, add business free Pakistan, local businesses Pakistan",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDesc,
    images: [
      {
        url: "/local-business-directory-city-buildings.webp",
        width: 1200,
        height: 630,
        alt: "BizBranches – Pakistan free business listing directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDesc,
    images: ["/local-business-directory-city-buildings.webp"],
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/BizBranches.jpeg`,
    description: SITE_DESCRIPTION,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@bizbranches.pk",
      telephone: "+923142552851",
      areaServed: "PK",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Organization + WebSite schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {/* ✅ Google Analytics 4 (GA4) - Production Only */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              id="ga4-script"
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-53ZYC74P6Q"
            />
            <Script id="ga4-inline" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-53ZYC74P6Q');
             `}
            </Script>
          </>
        )}

        {/* ✅ Google AdSense: load once globally - Production only */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4083132987699578"
            crossOrigin="anonymous"
          />
        )}
      </head>

      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} pb-20 md:pb-0`} suppressHydrationWarning={true}>
        <CopyDeterrent />
        <Header />
        <AdBanner placement="header" />
        <Suspense fallback={null}>
          <GlobalTopbar />
        </Suspense>
        <GlobalContainer>{children}</GlobalContainer>
        <Footer />
        <CtaAddBusiness variant="sticky" />
      </body>
    </html>
  );
}
