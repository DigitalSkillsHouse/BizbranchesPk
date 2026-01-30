import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

interface Business {
  id: string
  slug?: string
  name: string
  category: string
  city: string
  address: string
  phone?: string
  whatsapp?: string
  email?: string
  description: string
  logo?: string
  logoUrl?: string
  status?: "pending" | "approved" | "rejected"
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        {/* Header with Logo and Business Name */}
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              <img
                src={
                  (business.logoUrl || business.logo) 
                    ? (() => {
                        // If it's already a full URL, use it directly
                        const logo = business.logoUrl || business.logo || '';
                        if (logo.startsWith('http')) return logo;
                        
                        // If it's a Cloudinary public_id, construct the URL
                        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                        if (cloudName && !logo.includes('/') && !logo.startsWith('.')) {
                          return `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_200,h_200,q_auto,f_auto/${logo}`;
                        }
                        
                        // Fallback to the raw logo value or default
                        return logo || "/bank-branch.png";
                      })()
                    : "/bank-branch.png"
                }
                alt={`${business.name} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to default if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/bank-branch.png";
                }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 line-clamp-2 flex items-start sm:items-center gap-2 flex-wrap">
              <span className="truncate">{business.name}</span>
              {business.status === "pending" && (
                <span className="inline-flex items-center rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap">
                  Pending
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-primary text-primary-foreground px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                {business.category}
              </span>
              <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="line-clamp-1">{business.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Well-formatted Description */}
        <div className="mb-3 sm:mb-4">
          <h4 className="font-medium text-xs sm:text-sm text-foreground mb-1 sm:mb-2">About</h4>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3">
            {business.description}
          </p>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 border-t border-gray-100">
          <div className="flex space-x-2">
            {business.phone && (
              <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none">
                <a href={`tel:${business.phone}`} className="flex items-center justify-center">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </Button>
            )}
            {business.email && (
              <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none">
                <a href={`mailto:${business.email}`} className="flex items-center justify-center">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </Button>
            )}
          </div>

          <Button size="sm" asChild className="w-full sm:w-auto">
            <Link href={`/${business.slug || business.id}`} className="text-center">View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
