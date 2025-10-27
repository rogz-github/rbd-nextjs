'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductSliderProps {
  children: ReactNode[]
  className?: string
  cardWidth?: number
  gap?: number
  showArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function ProductSlider({
  children,
  className = '',
  cardWidth = 250,
  gap = 16,
  showArrows = true,
  showDots = false,
  autoPlay = false,
  autoPlayInterval = 5000
}: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const scrollAmount = cardWidth + gap
  const maxIndex = Math.max(0, children.length - 1)

  // Check scroll capabilities
  const updateScrollState = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    }
  }

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    if (sliderRef.current) {
      const targetScroll = index * scrollAmount
      sliderRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  // Navigate functions
  const goToPrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    scrollToIndex(newIndex)
  }

  const goToNext = () => {
    const newIndex = Math.min(maxIndex, currentIndex + 1)
    scrollToIndex(newIndex)
  }

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && children.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % children.length)
        scrollToIndex((currentIndex + 1) % children.length)
      }, autoPlayInterval)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [autoPlay, autoPlayInterval, children.length, currentIndex])

  // Initialize scroll state and reset position
  useEffect(() => {
    const initializeSlider = () => {
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = 0
        setCurrentIndex(0)
        updateScrollState()
      }
    }

    initializeSlider()
    setTimeout(initializeSlider, 100)
    setTimeout(initializeSlider, 500)
  }, [children.length])

  // Update scroll state on scroll
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleScroll = () => {
      updateScrollState()
      // Calculate current index based on scroll position
      const newIndex = Math.round(slider.scrollLeft / scrollAmount)
      setCurrentIndex(Math.min(maxIndex, Math.max(0, newIndex)))
    }

    slider.addEventListener('scroll', handleScroll)
    return () => slider.removeEventListener('scroll', handleScroll)
  }, [scrollAmount, maxIndex])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = 0
        setCurrentIndex(0)
        updateScrollState()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (children.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ minWidth: `${cardWidth}px` }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && children.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              canScrollLeft
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Previous items"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToNext}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              canScrollRight
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Next items"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-pink-500 scale-125'
                  : 'bg-white/60 hover:bg-pink-300'
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

