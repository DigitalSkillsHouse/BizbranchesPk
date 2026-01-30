import Link from "next/link"
import { Mail, MapPin, Building2, Star, Users, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">LocatorBranches</h3>
                <p className="text-xs text-gray-400">Business Directory</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4 sm:mb-6 max-w-md">
              Pakistan's premier business directory platform, connecting millions of customers with trusted local businesses. 
              Discover services, read authentic reviews, and grow your business with our comprehensive directory.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">50K+</div>
                <div className="text-xs text-gray-400">Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-accent">2M+</div>
                <div className="text-xs text-gray-400">Users</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">1M+</div>
                <div className="text-xs text-gray-400">Reviews</div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 text-sm">
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:support@bizdirectory.pk" className="hover:text-primary transition-colors break-all">
                  support@bizdirectory.pk
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+923001234567" className="hover:text-primary transition-colors">
                  +92 300 123 4567
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Lahore, Punjab, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  Browse Businesses
                </Link>
              </li>
              <li>
                <Link href="/add" className="hover:text-primary transition-colors">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Categories */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Popular Categories</h4>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
              <li>
                <Link href="/category/restaurants" className="hover:text-primary transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/category/healthcare" className="hover:text-primary transition-colors">
                  Healthcare
                </Link>
              </li>
              <li>
                <Link href="/category/education" className="hover:text-primary transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/category/automotive" className="hover:text-primary transition-colors">
                  Automotive
                </Link>
              </li>
              <li>
                <Link href="/category/real-estate" className="hover:text-primary transition-colors">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="hover:text-primary transition-colors">
                  Technology
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              © 2025 LocatorBranches. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-primary transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}