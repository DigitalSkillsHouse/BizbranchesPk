import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, Star, Users, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SITE_NAME } from "@/lib/site"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer - same structure as Digital Skills House (digitalskillshouse.pk) */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Column - wide, like DSH */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                <Image src="/BizBranches.jpeg" alt="BizBranches" fill className="object-contain" sizes="48px" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">BizBranches.Pk</span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 max-w-md">
              Pakistan&apos;s free business listing directory. Find local businesses by city and category, add your business free,
              read reviews, and get contact details. Trusted across Pakistan.
            </p>

            {/* Stats Row - like DSH (500+ Students, 95% Job Placement, etc.) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center py-3 px-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="text-xl sm:text-2xl font-bold text-green-400">50K+</div>
                <div className="text-xs text-gray-400 mt-0.5">Businesses</div>
              </div>
              <div className="text-center py-3 px-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">2M+</div>
                <div className="text-xs text-gray-400 mt-0.5">Users</div>
              </div>
              <div className="text-center py-3 px-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">1M+</div>
                <div className="text-xs text-gray-400 mt-0.5">Reviews</div>
              </div>
            </div>

            {/* Contact - Address, Phone, Email (icon + text like DSH) */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Pakistan — Find businesses in your city</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                <a href="tel:+923142552851" className="hover:text-green-400 transition-colors">
                  0314-2552851
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-green-400 flex-shrink-0" />
                <a href="mailto:support@bizbranches.pk" className="hover:text-green-400 transition-colors break-all">
                  support@bizbranches.pk
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - like DSH Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Browse Businesses</span>
                </Link>
              </li>
              <li>
                <Link href="/add" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">List Your Business</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories - like DSH Courses column */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4 uppercase tracking-wide">Popular Categories</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/category/restaurants" className="hover:text-green-400 transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/category/healthcare" className="hover:text-green-400 transition-colors">
                  Healthcare
                </Link>
              </li>
              <li>
                <Link href="/category/education" className="hover:text-green-400 transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/category/automotive" className="hover:text-green-400 transition-colors">
                  Automotive
                </Link>
              </li>
              <li>
                <Link href="/category/real-estate" className="hover:text-green-400 transition-colors">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="hover:text-green-400 transition-colors">
                  Technology
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Strip - like DSH "Ready to Start? Enroll Now | Call" */}
        <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/50 rounded-xl px-6 py-5 sm:px-8 sm:py-6 border border-gray-700/50">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-semibold text-white mb-1">Ready to grow your business?</h4>
              <p className="text-sm text-gray-400">List your business for free and reach millions of customers.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6">
                <Link href="/add" className="flex items-center gap-2">
                  List Your Business
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <a
                href="tel:+923142552851"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 transition-colors text-sm font-medium"
              >
                <Phone className="h-4 w-4" />
                Call: 0314-2552851
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright + Legal (like DSH footer bottom) */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left" suppressHydrationWarning>
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <a href="/sitemap.xml" className="text-gray-400 hover:text-green-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
