"use client"

import { AdSenseSlot } from "@/components/adsense-slot"

interface AdBannerProps {
  placement: "header" | "sticky-footer"
}

export function AdBanner({ placement }: AdBannerProps) {
  if (placement === "header") {
    return (
      <div className="w-full px-4 py-2 sm:py-3 bg-background/80 border-b border-border/50">
        <div className="container mx-auto max-w-4xl">
          <AdSenseSlot slotId="global-header-ad" />
        </div>
      </div>
    )
  }

  if (placement === "sticky-footer") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb">
        <div className="container mx-auto max-w-4xl px-4 py-2">
          <AdSenseSlot slotId="sticky-footer-ad" className="max-h-[100px]" />
        </div>
      </div>
    )
  }

  return null
}
