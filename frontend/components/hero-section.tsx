"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronsUpDown, Search, MapPin, TrendingUp, Star, Users, Building2, ArrowRight, Plus } from "lucide-react"
import { cities } from "@/lib/mock-data"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [businessSuggestions, setBusinessSuggestions] = useState<any[]>([])
  const [categorySuggestions, setCategorySuggestions] = useState<any[]>([])
  const [combinedSuggestions, setCombinedSuggestions] = useState<Array<{ type: 'business' | 'category'; data: any }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const [categoriesList, setCategoriesList] = useState<Array<{ slug: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      const q = searchQuery.trim()
      if (q.length >= 1) {
        try {
          const params = new URLSearchParams({ q, limit: '8' })
          if (selectedCity) params.set('city', selectedCity)
          if (selectedCategory) params.set('category', selectedCategory)

          const [bRes, cRes] = await Promise.all([
            fetch(`/api/business?${params.toString()}&searchMode=regex&suggest=1`, { cache: 'no-store' }),
            fetch(`/api/categories?q=${encodeURIComponent(q)}&limit=6`),
          ])
          const bJson = bRes.ok ? await bRes.json() : { businesses: [] }
          const cJson = cRes.ok ? await cRes.json() : { categories: [] }

          const b = (bJson?.businesses || []) as any[]
          const c = (cJson?.categories || []) as any[]

          setBusinessSuggestions(b)
          setCategorySuggestions(c)
          const combined: Array<{ type: 'business' | 'category'; data: any }> = [
            ...b.map((x) => ({ type: 'business' as const, data: x })),
            ...c.map((x) => ({ type: 'category' as const, data: x })),
          ].sort((a, b) => (a.type === 'business' && b.type === 'category' ? -1 : a.type === 'category' && b.type === 'business' ? 1 : 0))
          setCombinedSuggestions(combined)
          setShowSuggestions(combined.length > 0)
          setSelectedSuggestionIndex(-1)
        } catch (e) {
          setBusinessSuggestions([])
          setCategorySuggestions([])
          setCombinedSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        setBusinessSuggestions([])
        setCategorySuggestions([])
        setCombinedSuggestions([])
        setShowSuggestions(false)
      }
    }, 200)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedCity, selectedCategory])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setCategoriesLoading(true)
        const res = await fetch('/api/categories?limit=200&nocache=1', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        const list: any[] = Array.isArray(data?.categories) ? data.categories : []
        if (alive) setCategoriesList(list.map((c: any) => ({ slug: c.slug, name: c.name || c.slug })))
      } catch {
        if (alive) setCategoriesList([])
      } finally {
        if (alive) setCategoriesLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || combinedSuggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < combinedSuggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : combinedSuggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          const sel = combinedSuggestions[selectedSuggestionIndex]
          if (sel.type === 'business') {
            router.push(`/${sel.data.slug || sel.data.id}`)
          } else if (sel.type === 'category') {
            router.push(`/category/${sel.data.slug}`)
          }
        } else {
          handleSearch(e)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (item: { type: 'business' | 'category'; data: any }) => {
    setShowSuggestions(false)
    if (item.type === 'business') {
      setSearchQuery(item.data.name)
      router.push(`/${item.data.slug || item.data.id}`)
    } else {
      setSearchQuery(item.data.name)
      router.push(`/category/${item.data.slug}`)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)

    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedCity) params.set("city", selectedCity)
    if (selectedCategory) params.set("category", selectedCategory)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center justify-center overflow-visible py-6 sm:py-8 md:py-12 z-50">
      {/* Full HD Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/local-business-directory-city-buildings.webp)'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      

      <div className="relative container mx-auto px-4 sm:px-6 text-center z-10">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] shadow-black">
            Pakistan Free Business Listing Directory
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium text-white mb-4 sm:mb-6 leading-tight px-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] shadow-black max-w-2xl mx-auto">
            Find local businesses across Pakistan. Add your business free, search by city and category, read reviews, and get contact details.
          </p>


          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">80K+</div>
                <div className="text-xs sm:text-sm text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Businesses</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">5M+</div>
                <div className="text-xs sm:text-sm text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Happy Users</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">1M+</div>
                <div className="text-xs sm:text-sm text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Search Container */}
        <form onSubmit={handleSearch} className="search-container max-w-5xl mx-auto mb-4 sm:mb-8 relative z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-5 relative z-50">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="relative sm:col-span-5 z-[9999]">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  ref={searchInputRef}
                  placeholder="Search businesses..."
                  className="h-12 pl-12 pr-4 text-base border-0 bg-white focus:bg-white focus:ring-2 focus:ring-primary/30 rounded-xl transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchQuery.trim() && combinedSuggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                />

              {/* Search Suggestions */}
              {showSuggestions && combinedSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 z-[9999] bg-white border-2 border-gray-200 rounded-xl shadow-2xl mt-2 max-h-64 sm:max-h-80 overflow-y-auto"
                >
                  {businessSuggestions.length > 0 && (
                    <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Businesses</div>
                  )}
                  {businessSuggestions.map((business, index) => (
                    <div
                      key={`b-${business.id || business._id || business.slug || index}`}
                      className={`p-4 cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors ${
                        index === selectedSuggestionIndex ? "bg-gray-50" : ""
                      }`}
                      onClick={() => handleSuggestionClick({ type: 'business', data: business })}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={business.image || business.logoUrl || "/placeholder.svg"}
                          alt={business.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{business.name}</div>
                          <div className="text-sm text-gray-600">
                            {business.category} • {business.city.charAt(0).toUpperCase() + business.city.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {categorySuggestions.length > 0 && (
                    <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Categories</div>
                  )}
                  {categorySuggestions.map((cat, i) => {
                    const globalIndex = businessSuggestions.length + i
                    return (
                      <div
                        key={`c-${cat.slug}`}
                        className={`p-4 cursor-pointer border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          globalIndex === selectedSuggestionIndex ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleSuggestionClick({ type: 'category', data: cat })}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl">
                            <span>{cat.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900">{cat.name}</div>
                            <div className="text-sm text-gray-600">Browse category</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              </div>

            {/* City Selector - same as category page Filter by City */}
            <div className="sm:col-span-3">
              <Select value={selectedCity || "all"} onValueChange={(v) => setSelectedCity(v === "all" ? "" : v)}>
                <SelectTrigger className="h-12 bg-white border-0 hover:bg-gray-50 focus:ring-2 focus:ring-primary/30 transition-all duration-200 text-base rounded-xl">
                  <div className="flex items-center space-x-2 min-w-0">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="All Cities" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.slug} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selector */}
            <div className="sm:col-span-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 bg-white border-0 hover:bg-gray-50 focus:ring-2 focus:ring-primary/30 transition-all duration-200 text-base rounded-xl">
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Category"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-1">
              <Button 
                type="submit" 
                className="w-full min-h-[48px] h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl text-base font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label="Search businesses"
              >
                <Search className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
            </div>
          </div>
        </form>

        {/* CTAs: Find businesses + Add your business free */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link
            href="/search"
            className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm sm:text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
          >
            Browse All Businesses
          </Link>
          <Link
            href="/add"
            className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
            aria-label="Add your business free"
          >
            Add Your Business Free
          </Link>
        </div>
      </div>
    </section>
  )
}