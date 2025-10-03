import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/home/hero'
import { ImageColumns } from '@/components/home/image-columns'

// Lazy load non-critical components
const FeaturedProducts = dynamic(() => import('@/components/home/featured-products').then(mod => ({ default: mod.FeaturedProducts })), {
  loading: () => <FeaturedProductsSkeleton />,
  ssr: false
})

const Categories = dynamic(() => import('@/components/home/categories').then(mod => ({ default: mod.Categories })), {
  loading: () => <CategoriesSkeleton />,
  ssr: false
})

const Features = dynamic(() => import('@/components/home/features').then(mod => ({ default: mod.Features })), {
  loading: () => <FeaturesSkeleton />,
  ssr: false
})

const Newsletter = dynamic(() => import('@/components/home/newsletter').then(mod => ({ default: mod.Newsletter })), {
  loading: () => <NewsletterSkeleton />,
  ssr: false
})

// Skeleton components for better UX
function FeaturedProductsSkeleton() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoriesSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSkeleton() {
  return (
    <section className="py-16 bg-primary-600 text-white">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center animate-pulse">
          <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-white/20 rounded w-48 mx-auto mb-4"></div>
          <div className="h-6 bg-white/20 rounded w-96 mx-auto mb-8"></div>
          <div className="h-12 bg-white/20 rounded w-80 mx-auto"></div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      {/* Critical above-the-fold content */}
      <Hero />
      <ImageColumns />
      
      {/* Non-critical content with lazy loading */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      
      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories />
      </Suspense>
      
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<NewsletterSkeleton />}>
        <Newsletter />
      </Suspense>
    </>
  )
}
