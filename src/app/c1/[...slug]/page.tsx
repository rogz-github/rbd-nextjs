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
  image?: string
  banner?: string
  position?: number
  totalProducts?: number
  visible?: boolean
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

function isValidCategoryPath(slugs: string[], categories: Category[]): { valid: boolean; category?: Category; subcategories?: Category[] } {
  if (slugs.length === 0) return { valid: false }
  
  // Check if first slug matches any root category
  for (const cat of categories) {
    if (cat.slug === slugs[0]) {
      if (slugs.length === 1) {
        // Single slug - return the category and its children (category2)
        return { valid: true, category: cat, subcategories: cat.children }
      }
      
      // Check if subsequent slugs are valid children
      if (cat.children) {
        let currentLevel = cat.children
        let foundCategory: Category | undefined
        
        for (let i = 1; i < slugs.length; i++) {
          const found = currentLevel.find(c => c.slug === slugs[i])
          if (!found) return { valid: false }
          
          if (i === slugs.length - 1) {
            foundCategory = found
            return { valid: true, category: found, subcategories: found.children }
          }
          currentLevel = found.children || []
        }
      }
    }
  }
  
  return { valid: false }
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [categoryImage, setCategoryImage] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; path: string }>>([])
  const [isValidCategory, setIsValidCategory] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [isCategory1Only, setIsCategory1Only] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/categories.json')
        const data = await response.json()
        setCategories(data)
        
        if (params.slug) {
          const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug]
          
          // Validate that this is a valid category path and get category info
          const result = isValidCategoryPath(slugArray, data)
          
          if (!result.valid) {
            router.push('/')
            return
          }
          
          setIsValidCategory(true)
          
          // Set current category
          if (result.category) {
            setCurrentCategory(result.category)
            setCategoryName(result.category.name)
            // Use banner if available, otherwise fall back to image
            const displayImage = result.category.banner || result.category.image || '/placeholder-product.jpg'
            setCategoryImage(displayImage)
          }
          
          // Check if this is category1 only (single slug)
          if (slugArray.length === 1 && result.subcategories) {
            setIsCategory1Only(true)
            setSubcategories(result.subcategories.filter(cat => cat.visible !== false))
          } else if (result.subcategories) {
            setIsCategory1Only(false)
            setSubcategories(result.subcategories.filter(cat => cat.visible !== false))
          }
          
          // Build breadcrumbs
          const crumbs: Array<{ name: string; path: string }> = []
          let currentPath = ''
          
          slugArray.forEach((slug, index) => {
            currentPath += (currentPath ? '/' : '') + slug
            const formattedName = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
            crumbs.push({ name: formattedName, path: `/c1/${currentPath}` })
          })
          
          setBreadcrumbs(crumbs)
          
          // For now, we'll show a placeholder since we don't have the API set up
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
    return null // Will redirect
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
      <div className="w-full">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="container py-4 text-sm">
            <Link href="/" className="text-pink-600 hover:text-pink-700">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/c1" className="text-pink-600 hover:text-pink-700">
              Categories
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

        {/* Category Banner - only show for category1 */}
        {isCategory1Only && currentCategory && (
          <div className="relative w-full h-48 md:h-64 bg-gray-200 mb-8">
            {categoryImage && (
              <Image
                src={sanitizeImageUrl(categoryImage)}
                alt={categoryName}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {categoryName}
              </h1>
            </div>
          </div>
        )}

        <div className="container py-8">
          {/* For nested categories, show smaller header */}
          {!isCategory1Only && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {categoryName}
              </h1>
              <p className="text-gray-600">
                Discover our collection of {categoryName.toLowerCase()} products
              </p>
            </div>
          )}

          {/* Show Category Grid for category1 only */}
          {isCategory1Only && subcategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subcategories.map((subcategory) => {
                // Get the current slug path from params
                const currentPath = params.slug ? (Array.isArray(params.slug) ? params.slug : [params.slug]).join('/') : ''
                
                return (
                  <Link
                    key={subcategory.id}
                    href={`/c1/${currentPath}/${subcategory.slug}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                  <div className="aspect-square bg-gray-200 relative">
                    {subcategory.image ? (
                      <Image
                        src={sanitizeImageUrl(subcategory.image)}
                        alt={subcategory.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors text-center">
                      {subcategory.name}
                    </h3>
                  </div>
                </Link>
                )
              })}
            </div>
          ) : subcategories.length > 0 ? (
            // Show subcategories for nested paths
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/c1/${breadcrumbs.map(b => b.path.split('/c1/')[1] || b.path).join('/')}/${subcategory.slug}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 relative">
                    {subcategory.image ? (
                      <Image
                        src={sanitizeImageUrl(subcategory.image)}
                        alt={subcategory.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors text-center">
                      {subcategory.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : products.length === 0 ? (
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
    </div>
  )
}

