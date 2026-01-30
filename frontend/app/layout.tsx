import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GlobalTopbar } from "@/components/global-topbar";
import GlobalContainer from "@/components/global-container";
import { AdBanner } from "@/components/ad-banner";
import { Suspense } from "react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "LocatorBranches - Discover Amazing Businesses Worldwide | Pakistan's Premier Business Directory",
  description: "Discover Amazing Businesses Worldwide. Find and connect with trusted local businesses across Pakistan and worldwide. Search by category, location, or business name. Read reviews, view contact information, and grow your business with our comprehensive directory platform.",
  keywords: "business directory, find businesses, local businesses, business search, Pakistan businesses, worldwide businesses, business listings, discover businesses",
  openGraph: {
    title: "Discover Amazing Businesses Worldwide | LocatorBranches",
    description: "Discover Amazing Businesses Worldwide. Find trusted local businesses, read reviews, and connect with businesses across Pakistan and worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
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

      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning={true}>
        <Header />
        <AdBanner placement="header" />
        <Suspense fallback={null}>
          <GlobalTopbar />
        </Suspense>
        <GlobalContainer>{children}</GlobalContainer>
        <Footer />
      </body>
    </html>
  );
}
