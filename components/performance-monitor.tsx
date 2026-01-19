"use client"

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR) {
      return
    }

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        } else if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        } else if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      // Performance Observer not supported
    }

    // Monitor API response times
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const start = performance.now()
      try {
        const response = await originalFetch(...args)
        const end = performance.now()
        console.log(`API ${args[0]}: ${(end - start).toFixed(2)}ms`)
        return response
      } catch (error) {
        const end = performance.now()
        console.log(`API ${args[0]} (error): ${(end - start).toFixed(2)}ms`)
        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
      observer.disconnect()
    }
  }, [])

  return null
}
