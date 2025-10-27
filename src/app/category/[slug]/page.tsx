'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { sanitizeImageUrl } from '@/lib/image-utils'
import { calculatePricing, formatPrice } from '@/lib/pricing'

interface Category {
  id: number
  name: string
  slug: string
  children?: Category[]
}

interface Product {
  id: string
  spuNo: string
  name: string
  slug: string
  salePrice: number
  msrp: number
  discountedPrice: number
  mainImage: string
  brand: string
  category1: string
}

function isValidCategoryPath(slugs: string[], categories: Category[]): boolean {
  if (slugs.length === 0) return false
  
  for (const cat of categories) {
    if (cat.slug === slugs[0]) {
      if (slugs.length === 1) return true
      
      if (cat.children) {
        let currentLevel = cat.children
        for (let i = 1; i < slugs.length; i++) {
          const found = currentLevel.find(c => c.slug === slugs[i])
          if (!found) return false
          
          if (i === slugs.length - 1) return true
          currentLevel = found.children || []
        }
      }
    }
  }
  
  return false
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; path: string }>>([])
  const [isValidCategory, setIsValidCategory] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/categories.json')
        const data = await response.json()
        setCategories(data)
        
        if (params.slug) {
          // Handle both single slug and array of slugs
          const slugString = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
          const slugArray = slugString.split('/')
          
          // Validate the path
          const isValid = isValidCategoryPath(slugArray, data)
          
          if (!isValid) {
            router.push('/')
            return
          }
          
          setIsValidCategory(true)
          
          // Get the last slug
          const currentSlug = slugArray[slugArray.length - 1]
          const formattedCategory = currentSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
          
          setCategoryName(formattedCategory)
          
          // Build breadcrumbs
          const crumbs: Array<{ name: string; path: string }> = []
          let currentPath = ''
          
          slugArray.forEach((slug, index) => {
            currentPath += (currentPath ? '/' : '') + slug
            const formattedName = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
            crumbs.push({ name: formattedName, path: `/category/${currentPath}` })
          })
          
          setBreadcrumbs(crumbs)
          
          setProducts([])
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        router.push('/')
      }
    }
    
    loadCategories()
  }, [params.slug, router])

  if (!isValidCategory && !loading) {
    return null
  }

  if (loading || !isValidCategory) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="mb-6 text-sm">
            <Link href="/" className="text-pink-600 hover:text-pink-700">
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                <span className="mx-2 text-gray-400">/</span>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-700">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="text-pink-600 hover:text-pink-700">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600">
            Discover our collection of {categoryName.toLowerCase()} products
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              We're working on adding products to this category. Check back soon!
            </p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-w-1 aspect-h-1">
                    <Image
                      src={sanitizeImageUrl(product.mainImage)}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    <div className="flex items-center justify-between">
                      {(() => {
                        const pricing = calculatePricing(product.msrp, product.discountedPrice)
                        return (
                          <>
                            <span className="text-lg font-semibold text-pink-600">
                              {formatPrice(pricing.finalPrice)}
                            </span>
                            {pricing.hasDiscount && pricing.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(pricing.originalPrice)}
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
