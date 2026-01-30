import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Star, Clock, ExternalLink, Verified } from "lucide-react"
import Link from "next/link"

interface Business {
  id: string
  slug?: string
  name: string
  category: string
  city?: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  description?: string
  logo?: string
  logoUrl?: string
  status?: "pending" | "approved" | "rejected"
}

interface Props {
  business: Business
  compact?: boolean
}

export default function BusinessListItem({ business, compact = false }: Props) {
  const rating = 4.2 + Math.random() * 0.8 // Mock rating
  const reviewCount = Math.floor(Math.random() * 200) + 10 // Mock review count
  const isOpen = Math.random() > 0.3 // Mock open status
  const isFeatured = Math.random() > 0.8 // Mock featured status

  if (compact) {
    return (
      <Link href={`/${business.slug || business.id}`} className="block">
        <div className="p-5 sm:p-6 hover:bg-gray-50 transition-colors duration-200 min-h-[140px] sm:min-h-[160px] cursor-pointer">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 flex-shrink-0 shadow-md">
              <img
                src={
                  (business.logoUrl || business.logo)
                    ? (() => {
                        const raw = business.logoUrl || business.logo || ''
                        if (/^https?:\/\//i.test(raw)) return raw
                        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        if (!cloudName) return "/placeholder.svg"
                        const cleanId = String(raw).replace(/\.[^/.]+$/, '')
                        return `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_200,h_200,q_auto,f_auto/${cleanId}`
                      })()
                    : "/placeholder.svg"
                }
                alt={`${business.name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                        {business.name}
                      </h3>
                      {isFeatured && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          <Star className="h-3 w-3 fill-white" />
                          Featured
                        </span>
                      )}
                      {business.status === "approved" && (
                        <Verified className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {business.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                        <span className="text-gray-500">({reviewCount})</span>
                      </div>
                    </div>

                    {/* Description */}
                    {business.description && (
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2 leading-relaxed">
                        {business.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {business.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{business.city}</span>
                        </span>
                      )}
                      <span className={`flex items-center gap-1 font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                        <Clock className="h-4 w-4" />
                        {isOpen ? 'Open now' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <Button size="sm" asChild className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="flex items-center gap-1">
                      View Details
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/${business.slug || business.id}`} className="block h-full">
      <div className={`relative bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 h-full flex flex-col cursor-pointer group ${isFeatured ? 'bg-gradient-to-br from-primary/5 via-purple-50/50 to-pink-50/50 border-primary/30 ring-2 ring-primary/10' : 'hover:border-primary/30'}`}>
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              <Star className="h-3 w-3 fill-white" />
              Featured
            </span>
          </div>
        )}

        {/* Logo Section - Larger and more prominent */}
        <div className="relative mb-4">
          <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 border-2 border-gray-200 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
          <img
            src={
              (business.logoUrl || business.logo)
                ? (() => {
                    const raw = business.logoUrl || business.logo || ''
                    if (/^https?:\/\//i.test(raw)) return raw
                    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                    if (!cloudName) return "/placeholder.svg"
                    const cleanId = String(raw).replace(/\.[^/.]+$/, '')
                      return `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_400,h_400,q_auto,f_auto/${cleanId}`
                  })()
                : "/placeholder.svg"
            }
            alt={`${business.name} logo`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
          />
          </div>
          {/* Verified Badge */}
          {business.status === "approved" && (
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-lg">
              <Verified className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col">
          {/* Business Name and Category */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {business.name}
            </h3>
          </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border border-primary/20">
              {business.category}
            </span>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm sm:text-base font-bold text-gray-900">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">({reviewCount} reviews)</span>
            <div className="ml-auto flex items-center gap-1">
              <span className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {isOpen ? 'Open now' : 'Closed'}
              </span>
            </div>
          </div>

          {/* Location */}
          {business.city && (
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{business.city}</span>
            </div>
          )}

          {/* Description */}
          {business.description && (
            <p className="text-sm text-gray-600 line-clamp-1 mb-4 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
            {business.phone && (
              <Button size="sm" asChild className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-xs">Call</span>
                </a>
              </Button>
            )}
            {business.email && (
              <Button size="sm" variant="outline" asChild className="flex-1" onClick={(e) => e.stopPropagation()}>
                <a href={`mailto:${business.email}`} className="flex items-center justify-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-xs">Email</span>
                </a>
            </Button>
            )}
          </div>

          {/* View Details Button */}
          <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center gap-2">
              <span>View Details</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </Button>
        </div>
      </div>
    </Link>
  )
}