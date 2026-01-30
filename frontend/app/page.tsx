"use client"

import { CategoriesSection } from "@/components/categories-section"
import { TopListingsSection } from "@/components/top-listings-section"
import { TopCitiesSection } from "@/components/top-cities-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FAQSection } from "@/components/faq-section"
import { HeroSection } from "@/components/hero-section"
import { useEffect, useRef } from "react"

function AdSenseSlot({ slotId }: { slotId: string }) {
  const adRef = useRef<HTMLDivElement>(null)
  const pushedRef = useRef(false)

  useEffect(() => {
    if (pushedRef.current || !adRef.current) return
    
    const initAd = () => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && adRef.current) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({})
          pushedRef.current = true
        }
      } catch (e) {
        // Silently fail - AdSense will handle retries
      }
    }

    // Try immediately
    initAd()
    
    // Also try after a short delay in case script is still loading
    const timeout = setTimeout(initAd, 100)
    
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4083132987699578"
        data-ad-slot="3877186043"
        data-ad-format="auto"
        data-full-width-responsive="true"
        suppressHydrationWarning
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Ad below header */}
      <div className="w-full px-4 py-2 sm:py-3 md:py-4">
        <AdSenseSlot slotId="header-ad" />
      </div>
      
      <main>
        <HeroSection />
        <TopListingsSection />
        
        {/* Ad before category section */}
        <div className="w-full px-4 py-1 sm:py-2 md:py-3">
          <AdSenseSlot slotId="category-ad" />
        </div>
        
        <CategoriesSection />
        <TopCitiesSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      
      {/* Ad above footer */}
      <div className="w-full px-4 py-2 sm:py-3 md:py-4">
        <AdSenseSlot slotId="footer-ad" />
      </div>
    </div>
  )
}
