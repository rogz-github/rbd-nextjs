'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart, ShoppingCart, ArrowLeft, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import toast from 'react-hot-toast'

interface Product {
  id: string
  spuNo: string
  itemNo: string
  name: string
  slug: string
  fullCategory: string
  category1: string
  category2: string
  category3: string
  category4: string
  supplier: string
  brand: string
  vt1: string
  vv1: string
  vt2: string
  vv2: string
  sku: string
  msrp: number
  salePrice: number
  discountedPrice: number
  dropshippingPrice: number
  map: string
  inventory: string
  inventoryLoc: string
  shippingMethod: string
  shipTo: string
  shippingCost: string
  promotionStart: string
  promotionEnd: string
  mainImage: string
  images: string[]
  description: string
  shortDescription: string
  upc: string
  asin: string
  processingTime: string
  ean: string
  dsFrom: string
  dealId: string
  status: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  createdAt: string
  updatedAt: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products?slug=${params.slug}`)
        const data = await response.json()
        
        if (data.success && data.data.products.length > 0) {
          setProduct(data.data.products[0])
        } else {
          setError('Product not found')
        }
      } catch (err) {
        setError('Failed to fetch product')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  const handleAddToCart = async () => {
    if (product) {
      try {
        setAddingToCart(true)
        console.log('Adding to cart:', { productId: product.id, quantity, productName: product.name })
        await addToCart(product.id, quantity)
        
        // Redirect to cart after successful addition
        setTimeout(() => {
          router.push('/cart')
        }, 1000) // Small delay to show the success message
      } catch (error) {
        console.error('Error adding to cart:', error)
        toast.error('Failed to add item to cart')
      } finally {
        setAddingToCart(false)
      }
    } else {
      console.log('No product available for adding to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images && Array.isArray(product.images) ? product.images : [product.mainImage]
  const discountPercentage = product.msrp && product.salePrice < product.msrp 
    ? Math.round(((product.msrp - product.salePrice) / product.msrp) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.category1}</span>
          {product.category2 && (
            <>
              <span>/</span>
              <span className="text-gray-900">{product.category2}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <Image
                src={images[selectedImage] || product.mainImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                unoptimized={images[selectedImage]?.startsWith('https://')}
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                      unoptimized={image?.startsWith('https://')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.category1}</span>
                {product.category2 && (
                  <>
                    <span>•</span>
                    <span>{product.category2}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {product.shortDescription && (
                <p className="text-lg text-gray-600 mb-6">{product.shortDescription}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${Number(product.salePrice || 0).toFixed(2)}
                </span>
                {product.msrp && product.salePrice < product.msrp && (
                  <span className="text-xl text-gray-500 line-through">
                    ${Number(product.msrp).toFixed(2)}
                  </span>
                )}
              </div>
              
              {product.dropshippingPrice && (
                <p className="text-sm text-gray-600">
                  Dropshipping Price: <span className="font-semibold">${Number(product.dropshippingPrice).toFixed(2)}</span>
                </p>
              )}
            </div>

            {/* Product Variants */}
            {(product.vt1 || product.vt2) && (
              <div className="space-y-4">
                {product.vt1 && product.vv1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {product.vt1}
                    </label>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-primary-600 hover:text-primary-600">
                        {product.vv1}
                      </button>
                    </div>
                  </div>
                )}
                
                {product.vt2 && product.vv2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {product.vt2}
                    </label>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-primary-600 hover:text-primary-600">
                        {product.vv2}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 btn btn-primary btn-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Heart className="w-5 h-5" />
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-600">{product.sku || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Brand:</span>
                  <span className="ml-2 text-gray-600">{product.brand || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Supplier:</span>
                  <span className="ml-2 text-gray-600">{product.supplier || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Inventory:</span>
                  <span className="ml-2 text-gray-600">{product.inventory || '0'}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>1-year warranty included</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
