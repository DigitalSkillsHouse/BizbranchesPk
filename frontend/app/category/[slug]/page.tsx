"use client"
import { ListingCard } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cities } from "@/lib/mock-data"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import FancyLoader from "@/components/fancy-loader"
import { ArrowRight, Building2, Grid3x3, List } from "lucide-react"
import Link from "next/link"
import { BreadcrumbSchema } from "@/components/breadcrumb-schema"
import { CtaAddBusiness } from "@/components/cta-add-business"
import { AdSection } from "@/components/ad-section"
import { slugify } from "@/lib/utils"
import { logger } from "@/lib/logger"

type Subcategory = { name: string; slug: string }

export default function CategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const categorySlug = params.slug as string
  const subcategoryParam = searchParams.get('subcategory') || null

  const [categoryInfo, setCategoryInfo] = useState<any>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([])
  const [selectedCity, setSelectedCity] = useState("all")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [apiPage, setApiPage] = useState(1)
  const [apiTotalPages, setApiTotalPages] = useState(1)
  const [apiTotal, setApiTotal] = useState(0)
  const PAGE_SIZE = 12
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null)

  const prettyName = categorySlug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")

  // Fetch category info and subcategories
  useEffect(() => {
    let active = true
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        const catRes = await fetch(`/api/categories?slug=${categorySlug}`)
        if (catRes.ok) {
          const catData = await catRes.json()
          if (catData?.category) {
            if (active) {
              setCategoryInfo(catData.category)
              const subCats = catData.category.subcategories || []
              setSubcategories(subCats.map((s: any) => ({
                name: s.name || s.slug,
                slug: s.slug || (s.name ? slugify(s.name) : '')
              })))
            }
          }
        }
      } catch (error) {
        logger.error("Error fetching category:", error)
      } finally {
        if (active) setLoading(false)
      }
    }
    if (categorySlug) fetchCategoryData()
    return () => { active = false }
  }, [categorySlug])

  // Fetch businesses when subcategory is selected
  useEffect(() => {
    if (!selectedSubcategory) {
      setBusinesses([])
      setFilteredBusinesses([])
      return
    }

    let active = true
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        // Fetch businesses filtered by category and subcategory
        const subSlug = subcategories.find((s) => s.name === selectedSubcategory || s.slug === selectedSubcategory)?.slug || selectedSubcategory
        const bizRes = await fetch(`/api/business?category=${encodeURIComponent(categorySlug)}&subCategory=${encodeURIComponent(subSlug)}&page=1&limit=${PAGE_SIZE}`)
        if (!bizRes.ok) throw new Error("Failed to fetch businesses")
        const bizData = await bizRes.json()
        if (!active) return
        const pagination = bizData?.pagination || {}
        const total = pagination.total ?? 0
        const pages = pagination.pages ?? (Math.ceil(total / PAGE_SIZE) || 1)
        setBusinesses(bizData.businesses || [])
        setApiPage(1)
        setApiTotalPages(pages)
        setApiTotal(total)
      } catch (error) {
        logger.error("Error fetching businesses:", error)
        if (active) {
          setBusinesses([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchBusinesses()
    return () => { active = false }
  }, [selectedSubcategory, categorySlug, subcategories])

  const loadMore = useCallback(async () => {
    if (loadingMore || !selectedSubcategory) return
    const next = apiPage + 1
    if (next > apiTotalPages) return
    const subSlug = subcategories.find((s) => s.name === selectedSubcategory || s.slug === selectedSubcategory)?.slug || selectedSubcategory
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/business?category=${encodeURIComponent(categorySlug)}&subCategory=${encodeURIComponent(subSlug)}&page=${next}&limit=${PAGE_SIZE}`)
      if (!res.ok) throw new Error("Failed to fetch more")
      const data = await res.json()
      const pagination = data?.pagination || {}
      const total = pagination.total ?? apiTotal
      const pages = pagination.pages ?? (Math.ceil(total / PAGE_SIZE) || apiTotalPages)
      setBusinesses((prev) => prev.concat(data.businesses || []))
      setApiPage(next)
      setApiTotalPages(pages)
      if (total > 0) setApiTotal(total)
    } catch (e) {
      logger.error("Load more failed", e)
    } finally {
      setLoadingMore(false)
    }
  }, [categorySlug, selectedSubcategory, subcategories, apiPage, apiTotalPages, loadingMore])

  useEffect(() => {
    let filtered = businesses

    // Filter by city if selected
    if (selectedCity !== "all") {
      filtered = filtered.filter((business) => 
        business.city && business.city.toLowerCase() === selectedCity.toLowerCase()
      )
    }

    setFilteredBusinesses(filtered)
  }, [businesses, selectedCity])

  // Infinite scroll: load more when sentinel is in view (trigger 500px before bottom)
  useEffect(() => {
    if (!selectedSubcategory || loadingMore || apiPage >= apiTotalPages) return
    const el = loadMoreSentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: null, rootMargin: "500px 0px", threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [selectedSubcategory, loadingMore, apiPage, apiTotalPages, loadMore])

  const handleSubcategoryClick = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName)
    router.push(`/category/${categorySlug}?subcategory=${encodeURIComponent(subcategoryName)}`)
  }

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null)
    router.push(`/category/${categorySlug}`)
  }

  const categoryName = categoryInfo?.name || prettyName
  const categoryIcon = categoryInfo?.icon || "📦"

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: categoryName, url: `/category/${categorySlug}` },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-7xl">
        {/* Header Section - One H1 per page: primary keyword + location */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-gray-900">{categoryName}</span>
          </nav>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-2xl sm:text-3xl md:text-4xl" aria-hidden>{categoryIcon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 sm:mb-2 break-words">
                {categoryName} Businesses in Pakistan
              </h1>
              {categoryInfo?.count !== undefined && (
                <p className="text-sm sm:text-base text-gray-600">
                  {categoryInfo.count} businesses available
                </p>
              )}
            </div>
          </div>

          {/* Back button when viewing businesses */}
          {selectedSubcategory && (
            <Button
              variant="outline"
              onClick={handleBackToSubcategories}
              className="mb-6"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Subcategories
            </Button>
          )}
        </div>

        {/* Show Subcategories if no subcategory selected */}
        {!selectedSubcategory && (
          <div className="mb-8 sm:mb-12">
            {loading ? (
              <div className="py-12 sm:py-16 flex items-center justify-center">
                <FancyLoader />
              </div>
            ) : subcategories.length > 0 ? (
              <>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Browse Subcategories</h2>
                  <p className="text-sm sm:text-base text-gray-600">Select a subcategory to view businesses in Pakistan</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {subcategories.map((subcat) => (
                    <Card
                      key={subcat.slug}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 overflow-hidden"
                      onClick={() => handleSubcategoryClick(subcat.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                          {subcat.name}
                        </h3>
                        <p className="text-sm text-gray-600">View businesses</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-600 mb-4">No subcategories available for this category.</p>
                <Link href={`/search?category=${categorySlug}`}>
                  <Button>View All Businesses</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        <AdSection slotId="category-center-ad" className="my-6 sm:my-8" />

        {/* Show Businesses when subcategory is selected */}
        {selectedSubcategory && (
          <>
            {/* Subcategory Header */}
            <div className="mb-8 bg-gradient-to-r from-primary/10 via-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedSubcategory} – Listings
                  </h2>
                  <p className="text-gray-600">
                    {apiTotal > 0
                      ? `Showing ${filteredBusinesses.length} of ${apiTotal.toLocaleString()} businesses`
                      : `${filteredBusinesses.length} businesses found`}
                    {selectedCity !== "all" && (
                      <span> in {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* City Filter */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by City:</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.slug} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Business Listings - ad every 3 cards, smooth infinite scroll + Load more button */}
            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <FancyLoader />
              </div>
            ) : filteredBusinesses.length > 0 ? (
              <>
                <div className="mb-8">
                  {filteredBusinesses.map((business, index) => (
                    <div key={business.id || business._id}>
                      {index > 0 && index % 3 === 0 && (
                        <AdSection slotId="category-inline-ad" className="my-6 sm:my-8" />
                      )}
                      <div className="py-4 border-b border-gray-100 last:border-b-0">
                        <ListingCard business={business} variant="compact" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load more: button + infinite scroll sentinel */}
                {apiPage < apiTotalPages && (
                  <div ref={loadMoreSentinelRef} className="min-h-[100px] flex flex-col items-center justify-center py-6 gap-4">
                    {loadingMore ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FancyLoader />
                        <span className="text-sm">Loading more businesses...</span>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadMore}
                        className="shrink-0"
                      >
                        Load more businesses
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-4">
                  No businesses available for "{selectedSubcategory}" subcategory yet.
                </p>
                <Button variant="outline" onClick={handleBackToSubcategories}>
                  Back to Subcategories
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
