'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface Banner {
  id: number
  title: string
  description?: string
  imageUrl: string
  videoUrl?: string
  link?: string
  type?: 'IMAGE' | 'VIDEO'
  position: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

interface Slide {
  id: number
  type: 'image' | 'video'
  src: string
  poster?: string
  alt: string
  link?: string
}

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(new Set())
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Preload slide content
  const preloadSlide = (slideIndex: number) => {
    if (preloadedSlides.has(slideIndex) || slideIndex < 0 || slideIndex >= slides.length) return
    
    const slide = slides[slideIndex]
    if (!slide) return

    if (slide.type === 'image') {
      // Preload image
      const img = new window.Image()
      img.src = slide.src
      img.onload = () => {
        setPreloadedSlides(prev => new Set(Array.from(prev).concat(slideIndex)))
      }
    } else if (slide.type === 'video') {
      // Preload video
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = slide.src
      video.onloadedmetadata = () => {
        setPreloadedSlides(prev => new Set(Array.from(prev).concat(slideIndex)))
      }
    }
  }

  // Preload adjacent slides
  useEffect(() => {
    if (slides.length === 0) return

    // Preload current slide
    preloadSlide(currentSlide)
    
    // Preload next slide
    const nextSlide = (currentSlide + 1) % slides.length
    preloadSlide(nextSlide)
    
    // Preload previous slide
    const prevSlide = (currentSlide - 1 + slides.length) % slides.length
    preloadSlide(prevSlide)
  }, [currentSlide, slides, preloadedSlides])

  // Fetch banners from database with optimized caching
  const fetchBanners = async (isPolling = false) => {
    try {
      const response = await fetch('/api/banners', {
        headers: {
          'Cache-Control': isPolling ? 'no-cache' : 'max-age=300',
          'If-Modified-Since': lastUpdateTime ? new Date(lastUpdateTime).toUTCString() : ''
        }
      })
      
      if (response.status === 304) {
        // No changes, skip update
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Filter for active banners and sort by position
        const activeBanners = data.data
          .filter((banner: Banner) => banner.isActive)
          .sort((a: Banner, b: Banner) => a.position - b.position)
        
        const bannerSlides: Slide[] = activeBanners.map((banner: Banner) => ({
          id: banner.id,
          type: (banner.type || 'IMAGE').toLowerCase() as 'image' | 'video',
          src: banner.type === 'VIDEO' ? banner.videoUrl || banner.imageUrl : banner.imageUrl,
          poster: banner.type === 'VIDEO' ? banner.imageUrl : undefined,
          alt: banner.title,
          link: banner.link
        }))
        
        // Only update if slides have actually changed
        const slidesChanged = JSON.stringify(slides) !== JSON.stringify(bannerSlides)
        if (slidesChanged) {
          setSlides(bannerSlides)
          setPreloadedSlides(new Set()) // Reset preloaded slides
          setLastUpdateTime(Date.now())
          
          if (isPolling) {
            console.log('🔄 Slider updated with new banners')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      if (!isPolling) {
        // Only use fallback on initial load, not during polling
        setSlides([
          {
            id: 1,
            type: "image",
            src: "/images/banners/1759127189680_vpu8xw8u2fi.webp",
            alt: "Featured Product"
          },
          {
            id: 2,
            type: "image",
            src: "/images/banners/1759127416020_b3cildy7le5.webp",
            alt: "Special Offer"
          },
          {
            id: 3,
            type: "image", 
            src: "/images/banners/1759127804740_iniy76p5zmm.webp",
            alt: "New Collection"
          },
          {
            id: 4,
            type: "image",
            src: "/images/banners/1759132444907_ad6gj7it48s.jpg",
            alt: "Limited Time Deal"
          }
        ])
      }
    } finally {
      if (!isPolling) {
        setLoading(false)
      }
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBanners()
  }, [])

  // Polling for updates every 30 seconds (fallback)
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchBanners(true)
    }, 30000) // Poll every 30 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [slides, lastUpdateTime])

  // Server-Sent Events for real-time updates - Temporarily disabled
  useEffect(() => {
    // Only connect to SSE if not in admin mode
    // if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin')) {
    //   const eventSource = new EventSource('/api/banners/events')
    //   eventSourceRef.current = eventSource

    //   eventSource.onmessage = (event) => {
    //     try {
    //       const data = JSON.parse(event.data)
          
    //       if (data.type === 'banner-updated') {
    //         console.log('🔄 Real-time update received, refreshing banners...')
    //         fetchBanners(true)
    //       }
    //     } catch (error) {
    //       console.error('Error parsing SSE message:', error)
    //     }
    //   }

    //   eventSource.onerror = (error) => {
    //     console.error('SSE connection error:', error)
    //     // Fallback to polling if SSE fails
    //     if (pollingIntervalRef.current) {
    //       clearInterval(pollingIntervalRef.current)
    //     }
    //     pollingIntervalRef.current = setInterval(() => {
    //       fetchBanners(true)
    //     }, 10000) // More frequent polling as fallback
    //   }

    //   return () => {
    //     eventSource.close()
    //     eventSourceRef.current = null
    //   }
    // }
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }



  const currentSlideData = slides[currentSlide]

  // Show loading state
  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[735px] bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          </div>
        </div>
      </section>
    )
  }

  // Show message if no banners
  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">No banners available</div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden">
      {/* Slider Container - 100% width with auto height */}
      <div 
        className="relative w-full h-auto overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media Content - Natural height */}
        <div className="relative w-full">
          {currentSlideData.type === 'image' ? (
            <Image
              src={currentSlideData.src}
              alt={currentSlideData.alt}
              width={1920}
              height={1080}
              className="w-full h-auto object-cover object-center transition-all duration-1000 ease-in-out image-high-quality"
              priority={currentSlide === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <video
              ref={(el) => {
                if (el) videoRefs.current[currentSlide] = el
              }}
              src={currentSlideData.src}
              className="w-full h-auto object-cover object-center transition-all duration-1000 ease-in-out image-high-quality"
              autoPlay
              muted
              loop
              playsInline
              preload={preloadedSlides.has(currentSlide) ? "auto" : "metadata"}
              poster={currentSlideData.poster}
              onLoadedData={(e) => {
                // Force high quality rendering
                const video = e.target as HTMLVideoElement;
                video.style.imageRendering = '-webkit-optimize-contrast';
                video.style.imageRendering = 'crisp-edges';
              }}
              onError={(e) => {
                console.error('Video failed to load:', currentSlideData.src);
              }}
            />
          )}
        </div>

        {/* Preload hidden slides for smooth transitions */}
        <div className="hidden">
          {slides.map((slide, index) => {
            if (index === currentSlide) return null;
            
            return slide.type === 'image' ? (
              <Image
                key={`preload-${slide.id}`}
                src={slide.src}
                alt={slide.alt}
                width={1920}
                height={1080}
                priority={index === (currentSlide + 1) % slides.length || index === (currentSlide - 1 + slides.length) % slides.length}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                quality={60}
              />
            ) : (
              <video
                key={`preload-${slide.id}`}
                src={slide.src}
                preload="metadata"
                muted
                playsInline
                poster={slide.poster}
              />
            );
          })}
        </div>

        {/* Navigation Arrows - Pink circular design with glow effect */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 z-10 touch-manipulation shadow-lg hover:shadow-xl"
          style={{
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
          }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 z-10 touch-manipulation shadow-lg hover:shadow-xl"
          style={{
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
          }}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>


        {/* Slide Indicators - Pink theme with glow effect */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentSlide 
                  ? 'bg-pink-500 scale-110 shadow-lg' 
                  : 'bg-white/60 hover:bg-pink-300 hover:scale-105'
              }`}
              style={index === currentSlide ? {
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.5), 0 0 30px rgba(236, 72, 153, 0.3)'
              } : {}}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
 
    </section>
  )
}
