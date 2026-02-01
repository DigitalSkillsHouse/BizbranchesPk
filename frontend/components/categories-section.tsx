"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Grid3x3, Sparkles } from "lucide-react"

type Category = { name: string; slug: string; count?: number; icon?: string; image?: string }

function mapApiToCategory(c: any): Category {
  return {
    name: c.name || c.slug,
    slug: c.slug,
    count: typeof c.count === "number" ? c.count : undefined,
    image: c.imageUrl || categoryImages[c.slug],
    icon: c.icon || fallbackIcon[c.slug] || "📦",
  }
}

// Image mapping per category slug (served from /public - webp for fast load)
const categoryImages: Record<string, string> = {
  restaurants: "/pakistani-restaurant-interior.webp",
  healthcare: "/modern-hospital.webp",
  education: "/school-building-with-playground.webp",
  automotive: "/car-repair-garage.webp",
  retail: "/placeholder.svg",
  "beauty-spa": "/placeholder.svg",
  "real-estate": "/placeholder.svg",
  technology: "/placeholder.svg",
  legal: "/placeholder.svg",
  construction: "/placeholder.svg",
  travel: "/placeholder.svg",
  finance: "/placeholder.svg",
}

// Fallback icons by common slugs (optional, for a nicer UI when image missing)
const fallbackIcon: Record<string, string> = {
  restaurants: "🍽️",
  healthcare: "🏥",
  education: "🎓",
  automotive: "🚗",
  retail: "🛍️",
  "beauty-spa": "💄",
  "real-estate": "🏠",
  technology: "💻",
  legal: "⚖️",
  construction: "🏗️",
  travel: "✈️",
  finance: "💰",
}

export function CategoriesSection({ initialCategories = [] }: { initialCategories?: any[] }) {
  const initialMapped = useMemo(
    () => (Array.isArray(initialCategories) ? initialCategories.map(mapApiToCategory) : []),
    [initialCategories]
  )
  const hasInitial = initialMapped.length > 0
  const [showAll, setShowAll] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialMapped)
  const [loading, setLoading] = useState(!hasInitial)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setError(null)
        const now = Date.now()
        let cached: any[] | null = null
        try {
          const raw = sessionStorage.getItem("categories_initial")
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed?.data && Array.isArray(parsed.data) && (now - (parsed.ts || 0)) < CACHE_TTL_MS) {
              cached = parsed.data
            }
          }
        } catch {}

        if (cached && active && !hasInitial) {
          setCategories(cached.map((c: any) => mapApiToCategory(c)))
        }

        const fres = await fetch(`/api/categories?limit=24`)
        const fdata = await fres.json().catch(() => ({}))
        if (active && fdata?.ok && Array.isArray(fdata.categories) && fdata.categories.length > 0) {
          setCategories(fdata.categories.map((c: any) => mapApiToCategory(c)))
          try {
            sessionStorage.setItem("categories_initial", JSON.stringify({ ts: now, data: fdata.categories }))
          } catch {}
        }
        if (active) setLoading(false)
      } catch (e: any) {
        if (active) {
          setError(e?.message || "Failed to load categories")
          if (!hasInitial) setCategories([])
          setLoading(false)
        }
      }
    })()
    return () => { active = false }
  }, [reloadKey, hasInitial])

  // When user expands, lazily fetch more categories once
  useEffect(() => {
    let active = true
    if (showAll && categories.length < 20 && !loading) {
      ;(async () => {
        try {
          setLoadingMore(true)
          const now = Date.now()
          // Always fetch fresh when expanding to ensure latest from admin panel
          const res = await fetch(`/api/categories?limit=200&nocache=1`, { cache: "no-store" })
          const data = await res.json()
          try {
            if (data?.ok && Array.isArray(data.categories)) {
              sessionStorage.setItem("categories_all", JSON.stringify({ ts: now, data: data.categories }))
            }
          } catch {}
          if (active && data?.ok && Array.isArray(data.categories)) {
            setCategories(data.categories.map((c: any) => mapApiToCategory(c)))
          }
        } catch {
          // ignore errors for the lazy load
        } finally {
          setLoadingMore(false)
        }
      })()
    }
    return () => {
      active = false
    }
  }, [showAll, loading, categories.length])

  const visibleCategories = (showAll ? categories : categories.slice(0, 7))

  return (
    <section id="categories-section" className="pt-6 sm:pt-8 md:pt-12 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4">
            <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Explore Categories</span>
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-3 md:mb-4">
            Browse by <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Explore businesses across different categories and find exactly what you're looking for.
          </p>
          {/* Empty / error state */}
          {!loading && categories.length === 0 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-4">{error ? "Failed to load categories." : "No categories available."}</p>
              <Button variant="outline" onClick={() => { setLoading(true); setReloadKey((k) => k + 1) }}>Retry</Button>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {(loading ? Array.from({ length: 8 }) : visibleCategories).map((category: any, idx: number) =>
            loading ? (
                <div key={idx} className="rounded-2xl border-0 bg-white shadow-lg overflow-hidden">
                  <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-t-2xl" />
                  <div className="p-6">
                    <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mb-3" />
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ) : (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  prefetch
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
                  aria-label={`Browse ${category.name} businesses`}
                >
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group cursor-pointer rounded-2xl border border-gray-200/80">
                  <CardContent className="p-0">
                      <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-purple-50 min-h-[160px]">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={`${category.name} category`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain bg-white group-hover:opacity-90 transition-opacity duration-500"
                          loading="lazy"
                        />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl group-hover:opacity-80 transition-opacity duration-300">{category.icon || "📦"}</span>
                        </div>
                      )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        {typeof category.count === "number" && (
                          <div className="absolute bottom-3 left-3">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                              <p className="text-xs font-semibold text-gray-900">{category.count} businesses</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5 md:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-1.5 sm:mb-2">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                          <span>Explore subcategories</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
            )}
            
            {/* View All Categories Button (8th position when collapsed) */}
          {!loading && !showAll && categories.length > 7 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
                className="group h-full rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-purple-50/50 to-pink-50/50 text-card-foreground shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              aria-label="View all categories"
            >
                <div className="p-6 sm:p-8 h-full w-full flex flex-col items-center justify-center text-center min-h-[240px] sm:min-h-[280px]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Grid3x3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl mb-1.5 sm:mb-2 font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    View All Categories
                </div>
                  <p className="text-xs sm:text-sm text-gray-600">Explore {categories.length - 7} more categories</p>
              </div>
            </button>
          )}
          </div>
        </div>

        {/* Show Less Button */}
        {!loading && showAll && (
          <div className="text-center mt-8 sm:mt-10">
            <Button
              variant="outline"
              size="lg"
              className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-sm sm:text-base font-semibold border-2 hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => setShowAll(false)}
            >
              {loadingMore ? "Loading…" : "Show Less"}
            </Button>
          </div>
        )}
        
      </div>
    </section>
  )
}
