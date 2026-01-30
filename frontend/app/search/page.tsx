"use client"
import { Button } from "@/components/ui/button"
import BusinessListItem from "@/components/business-list-item"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { Filter, Grid, List, MapPin, Star, Clock, DollarSign, Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"

// Client-only wrapper to prevent hydration issues
const ClientOnlySelect = dynamic(() => Promise.resolve(({ value, onValueChange, children, className, placeholder }: any) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    {children}
  </Select>
)), { ssr: false })

const ClientOnlyInput = dynamic(() => Promise.resolve(({ className, ...props }: any) => (
  <input className={className} {...props} />
)), { ssr: false })

type Business = {
  id: string
  _id?: string
  slug?: string
  name: string
  category: string
  city: string
  address: string
  description: string
  logo?: string
  logoUrl?: string
  logoPublicId?: string
  imageUrl?: string
  phone?: string
  email?: string
  status?: "pending" | "approved" | "rejected"
}

function AdsSlot({ k }: { k?: string }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])
  return (
    <div className="my-6">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4083132987699578"
        data-ad-slot="3877186043"
        data-ad-format="auto"
        data-full-width-responsive="true"
        key={k}
        suppressHydrationWarning
      />
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [fetchedOnce, setFetchedOnce] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const query = searchParams.get("q") || ""
  const city = searchParams.get("city") || ""
  const category = searchParams.get("category") || ""
  const status = searchParams.get("status") || ""
  const limit = 20

  const [cities, setCities] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [categoriesList, setCategoriesList] = useState<Array<{ slug: string; name: string }>>([])
  const [showAllCategories, setShowAllCategories] = useState(Boolean(searchParams.get("allCategories")))
  const [showAllCities, setShowAllCities] = useState(true)

  useEffect(() => {
    setCurrentPage(1)
    setBusinesses([])
  }, [query, city, category])

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setError("")
        const initialLoad = currentPage === 1
        setIsLoading(initialLoad)
        setIsFetchingMore(!initialLoad)
        if (initialLoad) setFetchedOnce(false)
        const params = new URLSearchParams()
        params.set("page", String(currentPage))
        params.set("limit", String(limit))
        if (query.trim()) params.set("q", query.trim())
        if (city.trim()) params.set("city", city.trim())
        if (category.trim()) params.set("category", category.trim())
        if (status.trim()) params.set("status", status.trim())

        const res = await fetch(`/api/business?${params.toString()}`, { cache: "no-store", signal: controller.signal })
        const ct = res.headers.get('content-type') || ''
        let data: any = null
        if (ct.includes('application/json')) {
          data = await res.json()
        } else {
          const txt = await res.text()
          throw new Error(txt || `Server ${res.status} ${res.statusText}`)
        }
        if (!res.ok || !data?.ok) throw new Error(data?.error || `Server ${res.status} ${res.statusText}`)
        const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const items: Business[] = (data.businesses || []).map((b: any) => {
          const derivedLogoUrl = (!b.logoUrl && b.logoPublicId && cloud)
            ? `https://res.cloudinary.com/${cloud}/image/upload/c_fit,w_200,h_200,q_auto,f_auto/${b.logoPublicId}`
            : undefined
          return {
            id: b.id || b._id?.toString?.() || "",
            slug: b.slug,
            name: b.name,
            category: b.category,
            city: b.city,
            address: b.address,
            description: b.description,
            logo: b.logo,
            logoUrl: b.logoUrl || derivedLogoUrl,
            logoPublicId: b.logoPublicId,
            imageUrl: b.imageUrl,
            phone: b.phone,
            email: b.email,
            status: b.status,
          }
        })
        setBusinesses((prev) => currentPage === 1 ? items : prev.concat(items))
        setTotal(data.pagination?.total || items.length)
        setTotalPages(data.pagination?.pages || 1)
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setError(e?.message || "Failed to load listings")
        if (currentPage === 1) setBusinesses([])
        setTotal(0)
        setTotalPages(1)
      } finally {
        setIsLoading(false)
        setIsFetchingMore(false)
        setFetchedOnce(true)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [query, city, category, status, currentPage])

  const hasMore = useMemo(() => currentPage < totalPages, [currentPage, totalPages])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {}
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        if (!isLoading && !isFetchingMore && hasMore) {
          setCurrentPage((p) => (p < totalPages ? p + 1 : p))
        }
      }
    }, { root: null, rootMargin: '300px', threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isLoading, isFetchingMore, totalPages])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [cRes, catRes] = await Promise.all([
          fetch('/api/cities', { cache: 'no-store' }),
          fetch('/api/categories?limit=200&nocache=1', { cache: 'no-store' }),
        ])
        const citiesJson = await cRes.json().catch(() => ({}))
        const categoriesJson = await catRes.json().catch(() => ({}))
        if (alive) {
          const cityList: Array<{ id: string; name: string; slug: string }> = Array.isArray(citiesJson?.cities)
            ? citiesJson.cities.map((c: any) => {
                const cityId = String(c.id || c._id || c.slug || c.name);
                const cityName = c.name || '';
                const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
                // Use unique ID for slug to ensure uniqueness (combine id with slug)
                const uniqueSlug = `${citySlug}-${cityId}`;
                return { id: cityId, name: cityName, slug: uniqueSlug };
              })
            : []
          setCities(cityList)
          const catList: Array<{ slug: string; name: string }> = Array.isArray(categoriesJson?.categories)
            ? categoriesJson.categories.map((x: any) => ({ slug: x.slug, name: x.name || x.slug }))
            : []
          setCategoriesList(catList)
        }
      } catch {
        if (alive) {
          setCities([])
          setCategoriesList([])
        }
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    setShowAllCategories(Boolean(searchParams.get("allCategories")))
  }, [searchParams])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  const displayedCategories = useMemo(() => (
    showAllCategories ? categoriesList : categoriesList.slice(0, 8)
  ), [categoriesList, showAllCategories])

  const displayedCities = useMemo(() => (
    showAllCities ? cities : cities.slice(0, 8)
  ), [cities, showAllCities])

  const [citySearch, setCitySearch] = useState("")

  const interleavedList = useMemo(() => {
    const elements: React.ReactNode[] = []
    businesses.forEach((b, idx) => {
      elements.push(
        <div key={b.id} className={viewMode === 'grid' ? '' : 'border-b border-gray-100 last:border-b-0'}>
          <BusinessListItem business={b} compact={viewMode === 'list'} />
        </div>
      )
      if ((idx + 1) % 6 === 0) {
        elements.push(<AdsSlot key={`ad-${currentPage}-${idx}`} />)
      }
    })
    return elements
  }, [businesses, currentPage, viewMode])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">
                {query ? `Search Results for "${query}"` : 'Browse Businesses'}
              </h1>
                <p className="text-sm sm:text-base text-gray-600">
                Found {total.toLocaleString()} businesses
                {city && <span> in {city.charAt(0).toUpperCase() + city.slice(1)}</span>}
                {category && <span> in {category.replace("-", " ")}</span>}
              </p>
            </div>
            
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Sort Dropdown */}
              <ClientOnlySelect 
                value={sortBy} 
                onValueChange={setSortBy}
                className="w-40"
                placeholder="Sort by"
              >
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviewed</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </ClientOnlySelect>

              {/* View Toggle */}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              </div>

            {/* Mobile Sort and View Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <ClientOnlySelect 
                value={sortBy} 
                onValueChange={setSortBy}
                className="flex-1 h-9 text-sm"
                placeholder="Sort by"
              >
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviewed</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </ClientOnlySelect>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-2"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile Category Filters */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateParam('category','')}
                className={`filter-chip ${!category ? 'filter-chip-active' : ''}`}
              >
                All Categories
              </button>
              {categoriesList.slice(0, 10).map((c) => {
                const active = category === c.slug
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => updateParam('category', active ? '' : c.slug)}
                    className={`filter-chip ${active ? 'filter-chip-active' : ''}`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile City Filters */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Cities</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateParam('city','')}
                className={`filter-chip ${!city ? 'filter-chip-active' : ''}`}
              >
                All Cities
              </button>
              {cities.map((ct) => {
                const active = city === ct.slug || city.toLowerCase() === ct.name.toLowerCase()
                return (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => updateParam('city', active ? '' : ct.slug)}
                    className={`filter-chip ${active ? 'filter-chip-active' : ''}`}
                  >
                    {ct.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Results */}
          <section className="lg:col-span-3 lg:order-1">
            {isLoading && (
              <div className="flex flex-col sm:flex-row items-center justify-center py-12 sm:py-16 gap-3">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                <span className="text-sm sm:text-base text-gray-600">Loading businesses...</span>
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-600 py-6 sm:py-8 bg-red-50 rounded-lg border border-red-200 px-4">
                <p className="text-sm sm:text-base">{error}</p>
              </div>
            )}
            
            {!isLoading && !error && businesses.length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" 
                  : "bg-card border border-border rounded-xl shadow-md hover:shadow-lg transition-all duration-300 divide-y divide-gray-100"
                }>
                  {interleavedList}
                </div>
                
                <div ref={sentinelRef} className="h-10" />
                {(isFetchingMore || (hasMore && !isLoading)) && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                    <span className="text-gray-600">Loading more businesses...</span>
                  </div>
                )}
              </>
            ) : null}
            
            {!isLoading && !error && fetchedOnce && businesses.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all businesses.</p>
                <Button asChild>
                  <Link href="/search">Browse All Businesses</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Desktop Sidebar Filters - Right Side */}
          <aside className="hidden lg:block lg:order-2">
            <div className="bg-card border border-border rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Filters
              </h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {displayedCategories.map((c) => {
                    const checked = category === c.slug
                    return (
                      <label key={c.slug} className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={checked}
                          onChange={(e) => updateParam('category', e.target.checked ? c.slug : '')}
                        />
                        <span className="text-sm text-gray-700">{c.name}</span>
                      </label>
                    )
                  })}
                </div>
                {categoriesList.length > 8 && (
                  <button onClick={() => setShowAllCategories((v) => !v)} className="mt-3 text-sm text-primary hover:underline">
                    {showAllCategories ? 'Show Less' : `View All (${categoriesList.length - 8} more)`}
                  </button>
                )}
              </div>

              {/* Cities */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Cities</h4>
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <ClientOnlyInput
                      type="text"
                      placeholder="Search cities..."
                      value={citySearch}
                      onChange={(e: any) => setCitySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {displayedCities
                    .filter((ct) => !citySearch || ct.name.toLowerCase().includes(citySearch.toLowerCase()))
                    .map((ct) => {
                      const active = city === ct.slug || city.toLowerCase() === ct.name.toLowerCase()
                      return (
                        <label key={ct.id} className="flex items-center gap-2 cursor-pointer select-none p-2 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={active}
                            onChange={(e) => updateParam('city', e.target.checked ? ct.slug : '')}
                          />
                          <span className="text-sm text-gray-700">{ct.name}</span>
                        </label>
                      )
                    })}
                </div>
                {cities.length > 8 && (
                  <button onClick={() => setShowAllCities((v) => !v)} className="mt-3 text-sm text-primary hover:underline">
                    {showAllCities ? 'Show Less' : `View All (${cities.length - 8} more)`}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}