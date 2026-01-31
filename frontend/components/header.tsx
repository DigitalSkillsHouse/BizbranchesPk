"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, Building2, Star, MapPin, Plus } from "lucide-react"

export function Header() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const closeMenu = () => setOpen(false)
  
  const handleCategoriesClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      const categoriesSection = document.getElementById('categories-section')
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push('/#categories-section')
    }
    closeMenu()
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-700 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 max-w-[100vw] overflow-x-hidden">
        <div className="flex items-center justify-between gap-2 h-16 sm:h-20 min-h-[4rem]">
          {/* Mobile Menu Toggle - native button so it's always visible (no variant override) */}
          <button
            type="button"
            className="md:hidden flex-shrink-0 flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg text-white bg-white/10 border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>

          {/* Center Logo - Always visible */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0" onClick={closeMenu} aria-label="Home">
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 group-hover:shadow-xl transition-all duration-300 shadow-lg">
              <Image src="/BizBranches.jpeg" alt="BizBranches" fill className="object-contain" sizes="56px" priority />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">BizBranches.Pk</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8 lg:space-x-12">
            {/* Left Navigation */}
              <nav className="flex items-center space-x-6 lg:space-x-8">
                <Link href="/" className="text-white hover:text-green-400 font-semibold transition-all duration-300 flex items-center space-x-2 text-sm lg:text-base">
                  <Building2 className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Home</span>
              </Link>
                <button onClick={handleCategoriesClick} className="text-white hover:text-green-400 font-semibold transition-all duration-300 flex items-center space-x-2 text-sm lg:text-base">
                  <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Categories</span>
              </button>
            </nav>

            {/* Right Navigation */}
              <nav className="flex items-center space-x-6 lg:space-x-8">
                <Link href="/pending" className="text-white hover:text-green-400 font-semibold transition-all duration-300 flex items-center space-x-2 text-sm lg:text-base">
                  <Star className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Pending Listings</span>
              </Link>
                <Link href="/add" onClick={closeMenu} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm lg:text-base">
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden lg:inline">List Business</span>
                  <span className="lg:hidden">Add</span>
              </Link>
            </nav>
            </div>
          </div>

          {/* Desktop Add Button - Right side on larger screens */}
          <div className="hidden md:block lg:hidden">
            <Link href="/add" onClick={closeMenu} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation - visible only when open, below md breakpoint */}
        <div
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile menu"
          className={`${open ? "block" : "hidden"} md:hidden pb-4 pt-2 w-full`}
        >
          <nav className="bg-white rounded-xl border border-gray-100 shadow-lg mt-2 p-4 space-y-3 w-full">
            <Link href="/" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-gray-900">Home</span>
            </Link>
            <button onClick={handleCategoriesClick} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <span className="font-medium text-gray-900">Categories</span>
            </button>
            
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <Button asChild variant="outline" className="w-full justify-start" onClick={closeMenu}>
                <Link href="/pending" className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>My Listing</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700" onClick={closeMenu}>
                <Link href="/add" className="flex items-center space-x-2 text-white">
                  <Plus className="h-4 w-4" />
                  <span>List Business</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}