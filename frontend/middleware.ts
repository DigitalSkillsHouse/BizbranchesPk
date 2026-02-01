import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bizbranches.pk'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const directBusiness = pathname.match(/^\/business\/([^\/]+)\/?$/i)
  if (directBusiness) {
    return NextResponse.redirect(new URL(`/${directBusiness[1]}`, req.url), 308)
  }

  const nestedBusiness = pathname.match(/^\/(?:city|category)(?:\/[^\/]+){1,3}\/business\/([^\/]+)\/?$/i)
  if (nestedBusiness) {
    return NextResponse.redirect(new URL(`/${nestedBusiness[1]}`, req.url), 308)
  }

  const res = NextResponse.next()

  // Security headers (AdSense/GA compatible)
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
  if (req.nextUrl.protocol === 'https:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  // CSP: allow self, AdSense, GA4, Funding Choices, Google Maps
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google.com https://www.gstatic.com https://fundingchoicesmessages.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://analytics.google.com",
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://maps.google.com https://www.google.com",
  ].join('; ')
  res.headers.set('Content-Security-Policy', csp)

  return res
}

export const config = {
  matcher: ['/((?!_next|api|static).*)'],
}
