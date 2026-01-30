"use client"
import React, { useRef, useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Star, FileText, Globe, MessageCircle, User } from 'lucide-react'
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdSenseSlot } from "@/components/adsense-slot"

export default function BusinessDetailPage({
  initialBusiness,
  initialReviews = [],
  initialRatingAvg = 0,
  initialRatingCount = 0,
  initialRelated = []
}: {
  initialBusiness?: any
  initialReviews?: any[]
  initialRatingAvg?: number
  initialRatingCount?: number
  initialRelated?: any[]
}) {
  const params = useParams() as { id?: string; slug?: string }
  const businessId = (params.id || params.slug || "") as string
  const [business, setBusiness] = useState<any>(initialBusiness || null)
  const [reviews, setReviews] = useState<any[]>(initialReviews)
  const [related, setRelated] = useState<any[]>(initialRelated)
  const [recentBusinesses, setRecentBusinesses] = useState<any[]>([])
  const [ratingAvg, setRatingAvg] = useState(initialRatingAvg)
  const [ratingCount, setRatingCount] = useState(initialRatingCount)
  const [loading, setLoading] = useState(!initialBusiness)
  const [openReview, setOpenReview] = useState(false)
  const [reviewerName, setReviewerName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  useEffect(() => {
    const fetchBusiness = async () => {
      if (initialBusiness) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/business/${encodeURIComponent(businessId)}`)
        if (response.ok) {
          const data = await response.json()
          setBusiness(data.business)
        }
      } catch (error) {
        console.error("Error fetching business:", error)
      } finally {
        setLoading(false)
      }
    }

    if (businessId && !initialBusiness) {
      fetchBusiness()
    }
  }, [businessId, initialBusiness])

  // Fetch existing reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!business) return
      
      try {
        const businessIdParam = business._id || business.id || businessId
        const response = await fetch(`/api/reviews?businessId=${encodeURIComponent(businessIdParam)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.ok) {
            setReviews(data.reviews || [])
            setRatingAvg(data.ratingAvg || 0)
            setRatingCount(data.ratingCount || 0)
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }

    if (business && reviews.length === 0) {
      fetchReviews()
    }
  }, [business, businessId])

  // Fetch related and recent businesses
  useEffect(() => {
    const fetchRelatedBusinesses = async () => {
      if (!business) return
      
      try {
        // Fetch businesses in same category
        const relatedResponse = await fetch(`/api/business?category=${encodeURIComponent(business.category)}&limit=8`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          if (relatedData.ok && relatedData.businesses) {
            // Filter out current business
            const filteredRelated = relatedData.businesses.filter((b: any) => 
              b.slug !== business.slug && b._id !== business._id
            )
            setRelated(filteredRelated)
          }
        }

        // Fetch recent businesses
        const recentResponse = await fetch(`/api/business?limit=8`)
        if (recentResponse.ok) {
          const recentData = await recentResponse.json()
          if (recentData.ok && recentData.businesses) {
            // Filter out current business
            const filteredRecent = recentData.businesses.filter((b: any) => 
              b.slug !== business.slug && b._id !== business._id
            )
            setRecentBusinesses(filteredRecent)
          }
        }
      } catch (error) {
        console.error('Error fetching related businesses:', error)
      }
    }

    if (business) {
      fetchRelatedBusinesses()
    }
  }, [business])

  const handleSubmitReview = async () => {
    if (reviewComment.trim().length < 3) return
    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?._id || business?.id || businessId,
          name: reviewerName.trim() || 'Anonymous',
          rating: reviewRating,
          comment: reviewComment.trim()
        })
      })
      
      const result = await response.json()
      console.log('Review submission result:', result)
      
      if (response.ok && result.ok) {
        const newReview = {
          name: reviewerName.trim() || 'Anonymous',
          rating: reviewRating,
          comment: reviewComment.trim(),
          createdAt: new Date().toISOString()
        }
        setReviews(prev => [newReview, ...prev])
        setRatingCount(prev => prev + 1)
        setRatingAvg(prev => ((prev * ratingCount) + reviewRating) / (ratingCount + 1))
        setReviewerName('')
        setReviewRating(5)
        setReviewComment('')
        setOpenReview(false)
      } else {
        console.error('Review submission failed:', result)
        alert('Failed to submit review. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading business details...</p>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Business Not Found</h1>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-red-500">Home</Link> /
        <Link href={`/category/${business.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-red-500">
          {business.category}
        </Link> /
        <span className="text-red-500 font-medium">{business.name}</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Logo */}
        <div className="w-40 h-40 relative border rounded-lg overflow-hidden bg-white">
          <Image
            src={business.logoUrl || "/placeholder.svg"}
            alt={business.name}
            fill
            className="object-contain p-2"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {business.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm text-gray-600">
              Rating {ratingCount > 0 ? ratingAvg.toFixed(1) : '0.0'}
            </span>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(ratingAvg) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Category: {business.category} • City: {business.city}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setOpenReview(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FileText className="w-4 h-4" /> Add a Review
            </button>
            {business.phone && (
              <a 
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
            )}
            {business.email && (
              <a 
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>
            )}
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <MapPin className="w-4 h-4" /> Get Directions
            </a>
          </div>
        </div>
      </div>

      {/* Business Description & Map */}
      {business.description && (
        <section className="mt-8">
          {/* Breadcrumb above description */}
          <div className="mb-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href={`/category/${business.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-600">
                {business.category}
              </Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">{business.name} - Official Details</span>
            </nav>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Description Box - 60% */}
            <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ℹ</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">About {business.name}</h2>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className={`text-gray-700 leading-relaxed whitespace-pre-line ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                  {business.description}
                </p>
                {business.description.length > 200 && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>

            {/* Map Box - 40% */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-64 relative">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(business.address + ', ' + business.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 bg-gray-50">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(business.address + ', ' + business.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Center ad - between description and reviews */}
      <div className="my-8">
        <AdSenseSlot slotId="business-center-ad" />
      </div>

      {/* Business Information & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Reviews Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">
                {ratingCount > 0 ? ratingAvg.toFixed(1) : '0.0'}
              </span>
              <span className="text-gray-600">
                ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
              </span>
            </div>
            <Button 
              onClick={() => setOpenReview(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold shadow-lg"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Write a Review
            </Button>
          </div>

          <div className="space-y-4">
            {/* Always show real reviews first */}
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">{review.name || 'Anonymous'}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(n => (
                    <Star 
                      key={n} 
                      className={`h-4 w-4 ${
                        n <= review.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}

            {/* Show dummy reviews as fillers if less than 3 real reviews and not showing all */}
            {!showAllReviews && reviews.length < 3 && (
              <>
                {reviews.length === 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700">Sample Reviews (Will be replaced with real reviews)</span>
                    </div>
                  </div>
                )}
                
                {/* Dummy Review 1 - Show if less than 1 real review */}
                {reviews.length < 1 && (
                  <div className="bg-white border rounded-lg p-4 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-600">Sarah Johnson</span>
                      <span className="text-sm text-gray-400">Sample Review</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(n => (
                        <Star 
                          key={n} 
                          className={`h-4 w-4 ${
                            n <= 5 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 italic">"Excellent service and professional staff. Highly recommend this business to anyone looking for quality service. Will definitely come back!"</p>
                  </div>
                )}

                {/* Dummy Review 2 - Show if less than 2 real reviews */}
                {reviews.length < 2 && (
                  <div className="bg-white border rounded-lg p-4 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-600">Mike Chen</span>
                      <span className="text-sm text-gray-400">Sample Review</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(n => (
                        <Star 
                          key={n} 
                          className={`h-4 w-4 ${
                            n <= 4 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 italic">"Great experience overall. The team was knowledgeable and helpful. Good value for money and timely service delivery."</p>
                  </div>
                )}

                {/* Dummy Review 3 - Show if less than 3 real reviews */}
                <div className="bg-white border rounded-lg p-4 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-600">Emma Wilson</span>
                    <span className="text-sm text-gray-400">Sample Review</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(n => (
                      <Star 
                        key={n} 
                        className={`h-4 w-4 ${
                          n <= 5 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"Outstanding customer service! They went above and beyond to meet our needs. Professional, reliable, and friendly staff."</p>
                </div>

                <div className="text-center mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium">👆 Sample reviews shown as placeholders</p>
                  <p className="text-xs text-yellow-600 mt-1">{reviews.length === 0 ? 'Be the first to leave a real review!' : `${3 - reviews.length} more real reviews needed to fill this section`}</p>
                </div>
              </>
            )}

            {/* Read More / Show Less Button */}
            {reviews.length > 3 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="px-6 py-2"
                >
                  {showAllReviews ? `Show Less Reviews` : `Read More Reviews (${reviews.length - 3} more)`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Business Information Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Business Information</h3>
              
              <div className="space-y-4">
                {/* Phone */}
                {business.phone && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{business.phone}</p>
                    </div>
                    <a 
                      href={`tel:${business.phone}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Call
                    </a>
                  </div>
                )}

                {/* WhatsApp */}
                {business.whatsapp && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600">{business.whatsapp}</p>
                    </div>
                    <a 
                      href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      Chat
                    </a>
                  </div>
                )}

                {/* Email */}
                {business.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600 break-all">{business.email}</p>
                    </div>
                    <a 
                      href={`mailto:${business.email}`}
                      className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                    >
                      Email
                    </a>
                  </div>
                )}

                {/* Website */}
                {business.websiteUrl && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Website</p>
                      <p className="text-sm text-gray-600 truncate">{business.websiteUrl}</p>
                    </div>
                    <a 
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                    >
                      Visit
                    </a>
                  </div>
                )}

                {/* Contact Person */}
                {business.contactPerson && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <User className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Contact Person</p>
                      <p className="text-sm text-gray-600">{business.contactPerson}</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{business.address}</p>
                    {business.city && (
                      <p className="text-sm text-gray-500 capitalize">{business.city}</p>
                    )}
                  </div>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Map
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recently Added Businesses */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">
          Recently Added Businesses
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentBusinesses.slice(0, 5).map((recentBusiness, index) => (
            <div
              key={recentBusiness.id || recentBusiness._id || index}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
            >
              <div className="relative h-24 bg-gray-50">
                <Image
                  src={recentBusiness.logoUrl || "/placeholder.svg"}
                  alt={recentBusiness.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {recentBusiness.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {recentBusiness.category}
                </p>
                <Link
                  href={`/${recentBusiness.slug || recentBusiness._id}`}
                  className="text-red-500 text-xs font-medium hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}}
        </div>

        {recentBusinesses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Loading recent businesses...
          </div>
        )}
      </section>

      {/* Similar Businesses */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Similar Businesses in {business.category}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.slice(0, 5).map((relatedBusiness, index) => (
              <div
                key={relatedBusiness.id || relatedBusiness._id || index}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
              >
                <div className="relative h-24 bg-gray-50">
                  <Image
                    src={relatedBusiness.logoUrl || "/placeholder.svg"}
                    alt={relatedBusiness.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {relatedBusiness.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {relatedBusiness.category}
                  </p>
                  <Link
                    href={`/${relatedBusiness.slug || relatedBusiness._id}`}
                    className="text-red-500 text-xs font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review Dialog */}
      <Dialog open={openReview} onOpenChange={setOpenReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>Share your experience with {business.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                placeholder="Optional" 
                value={reviewerName} 
                onChange={e => setReviewerName(e.target.value)} 
              />
            </div>
            <div>
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setReviewRating(n)}
                    className="p-1"
                  >
                    <Star className={`h-6 w-6 ${n <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">{reviewRating} / 5</span>
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea 
                id="comment" 
                placeholder="Write your review..." 
                value={reviewComment} 
                onChange={e => setReviewComment(e.target.value)} 
                rows={4} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReview(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={submitting || reviewComment.trim().length < 3}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}