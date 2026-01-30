"use client"

import { CategoriesSection } from "@/components/categories-section"
import { TopListingsSection } from "@/components/top-listings-section"
import { TopCitiesSection } from "@/components/top-cities-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FAQSection } from "@/components/faq-section"
import { HeroSection } from "@/components/hero-section"
import { AdSenseSlot } from "@/components/adsense-slot"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <TopListingsSection />
        
        {/* Center ad - between listings and categories */}
        <div className="w-full px-4 py-4 sm:py-6 max-w-4xl mx-auto">
          <AdSenseSlot slotId="home-center-ad" />
        </div>
        
        <CategoriesSection />
        <TopCitiesSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      
      {/* Ad above footer */}
      <div className="w-full px-4 py-4 sm:py-6 max-w-4xl mx-auto">
        <AdSenseSlot slotId="home-footer-ad" />
      </div>
    </div>
  )
}
