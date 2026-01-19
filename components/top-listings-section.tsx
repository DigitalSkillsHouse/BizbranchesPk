"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { categories, mockBusinesses } from "@/lib/mock-data"

type FeaturedCategoryCardProps = {
  categoryName: string
  categorySlug: string
}

function BusinessCard({ b }: { b: (typeof mockBusinesses)[number] }) {
  return (
    <div className="block group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden cursor-default select-none transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md" aria-disabled="true">
      <div className="relative">
        <Image
          src={b.image || "/placeholder.svg"}
          alt={b.name}
          width={400}
          height={200}
          unoptimized
          className="w-full h-40 object-contain bg-white"
        />
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">Featured</Badge>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {b.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {b.category}
          </Badge>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">{b.city}</span>
        </div>
        {b.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{b.phone}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function FeaturedCategoryCard({ categoryName, categorySlug }: FeaturedCategoryCardProps) {
  const list = useMemo(
    () => mockBusinesses.filter((b) => b.category.toLowerCase() === categoryName.toLowerCase()),
    [categoryName],
  )

  const meta = useMemo(() => categories.find((c) => c.slug === categorySlug), [categorySlug])

  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState(true)

  useEffect(() => {
    // ensure initially visible
    setAnim(true)
    if (list.length <= 1) return
    const id = setInterval(() => {
      setAnim(false)
      setIndex((i) => (i + 1) % list.length)
      // trigger a reflowed fade-in
      requestAnimationFrame(() => setAnim(true))
    }, 4000)
    return () => clearInterval(id)
  }, [list.length])

  const first = list.length > 0 ? list[index % list.length] : undefined
  const second = list.length > 0 ? list[(index + 1) % list.length] : undefined

  return (
    <Card className="h-full">
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>{meta?.icon ?? "⭐"}</span>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {categoryName}
              </CardTitle>
              {meta?.count ? (
                <p className="text-[11px] text-muted-foreground">{meta.count} listings</p>
              ) : null}
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full border border-primary/30 opacity-60 cursor-not-allowed select-none">
            View all
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4" dir="ltr">
        {first ? (
          <div className={`transition-all duration-500 ${anim ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} key={`b1-${first.id}`}>
            <BusinessCard b={first} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No businesses yet.</p>
        )}
        {second && (
          <div className={`transition-all duration-500 ${anim ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} key={`b2-${second.id}`}>
            <BusinessCard b={second} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TopListingsSection() {
  const [featured, setFeatured] = useState<(typeof mockBusinesses)[number][]>([])
  useEffect(() => {
    const load = async () => {
      try {
        const url = `/api/business/featured?limit=8`
        const res = await fetch(url)
        const json = await res.json()
        if (json?.ok && Array.isArray(json.businesses)) {
          const mapped = json.businesses.map((b: any) => ({
            id: String(b._id || b.slug || b.id || b.name),
            name: b.name,
            category: b.category,
            city: (b.city || '').toLowerCase(),
            phone: b.phone || '',
            image: b.logoUrl || '/placeholder.svg',
          }))
          setFeatured(mapped)
        }
      } catch {}
    }
    load()
  }, [])
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const play = useCallback(() => {
    if (!emblaApi) return
    autoplayRef.current && clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
  }, [emblaApi])

  const pause = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    play()
    return () => pause()
  }, [emblaApi, onSelect, play, pause])
  return (
    <section className="py-16 bg-muted/30" dir="ltr">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Top Listings</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the most trusted and highly-rated businesses across Pakistan, handpicked for their excellence.
          </p>
        </div>
        {featured.length > 0 && (() => {
          const pairs: typeof featured[] = []
          for (let i = 0; i < featured.length; i += 2) {
            pairs.push(featured.slice(i, i + 2))
          }
          return (
            <div className="mb-10">
              <div className="relative overflow-hidden" ref={emblaRef} onMouseEnter={pause} onMouseLeave={play}>
                <div className="flex gap-6 items-stretch">
                  {pairs.map((pair, idx) => (
                    <div key={idx} className="min-w-0 flex-[0_0_100%] md:flex-[0_0_50%]">
                      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-h-[520px]">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-7 w-7 rounded-lg bg-primary/10" aria-hidden />
                            <div>
                              <p className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Top listings</p>
                              <p className="text-[11px] text-muted-foreground">Handpicked for you</p>
                            </div>
                          </div>
                          <Link href="/search" className="text-[11px] px-3 py-1 rounded-full border border-primary/30 hover:bg-primary/5 transition">
                            View all
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {pair.map((b) => (
                            <BusinessCard key={b.id} b={b} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dots */}
              <div className="mt-4 flex justify-center gap-2">
                {pairs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${selectedIndex === i ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
                  />
                ))}
              </div>
            </div>
          )
        })()}

        {featured.length === 0 && (() => {
          const desired = ["restaurants", "healthcare", "education", "automotive"]
          const featured = desired
            .map((slug) => categories.find((c) => c.slug === slug))
            .filter((c): c is typeof categories[number] => Boolean(c))

          const rows = [featured.slice(0, 2), featured.slice(2, 4)]

          return (
            <div className="space-y-8">
              {rows.map((row, idx) => (
                <div key={idx} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {row.map((cat) => (
                      <FeaturedCategoryCard key={cat.slug} categoryName={cat.name} categorySlug={cat.slug} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        <div className="text-center mt-12">
          <Link href="/search">
            <Button size="lg" className="px-8">
              View All Listings
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
