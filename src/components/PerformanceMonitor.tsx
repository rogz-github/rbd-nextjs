'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log performance metrics
        console.log('Performance Metric:', {
          name: entry.name,
          value: (entry as any).value || 0,
          startTime: entry.startTime,
          duration: entry.duration,
        })

        // Send to analytics (replace with your analytics service)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'performance_metric', {
            metric_name: entry.name,
            metric_value: Math.round((entry as any).value || 0),
            metric_delta: Math.round((entry as any).value || 0),
          })
        }
      }
    })

    // Observe different types of performance entries
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      // Fallback for older browsers
      console.log('Performance Observer not supported')
    }

    // Monitor page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        const firstByte = navigation.responseStart - navigation.requestStart
        
        console.log('Page Load Metrics:', {
          loadTime: Math.round(loadTime),
          domContentLoaded: Math.round(domContentLoaded),
          firstByte: Math.round(firstByte),
          totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
        })

        // Send to analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'page_load_time', {
            load_time: Math.round(loadTime),
            dom_content_loaded: Math.round(domContentLoaded),
            first_byte: Math.round(firstByte),
          })
        }
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
