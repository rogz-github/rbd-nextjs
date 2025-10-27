'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SaleItemsSlider } from '../ui/SaleItemsSlider'

interface BannerBottomImage {
  id: number
  bgColor?: string
  linkUrl?: string
  image?: string
  status: string
  created: string
}

export function ImageColumns() {
  const [banners, setBanners] = useState<BannerBottomImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`/api/admin/banners/bottom-images?t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          // Get only 2 random banners from the active banners
          const activeBanners = data || []
          const shuffled = [...activeBanners].sort(() => 0.5 - Math.random())
          const selectedBanners = shuffled.slice(0, 2)
          setBanners(selectedBanners)
        } else {
          console.error('Failed to fetch banners:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching bottom banner images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()

    // Set up auto-refresh every 60 seconds for random banner rotation
    const interval = setInterval(fetchBanners, 60000)

    // Listen for custom refresh events from admin panel
    const handleRefresh = () => {
      console.log('Banner update event received, refreshing banners...')
      fetchBanners()
    }

    // Handle window resize
    const handleResize = () => {
      // Resize handling is now managed by ProductSlider component
    }

    window.addEventListener('bannerUpdated', handleRefresh)
    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('bannerUpdated', handleRefresh)
      window.removeEventListener('resize', handleResize)
    }
  }, [])


  const PromoBanner = ({ banner }: { banner: BannerBottomImage }) => (
    <Link href={banner.linkUrl || '#'} className="block">
      <div className="relative w-full overflow-hidden rounded-lg">
        <Image
          src={banner.image || '/images/placeholder-product.jpg'}
          alt={`Banner ${banner.id}`}
          width={800}
          height={600}
          className="w-full h-auto object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          quality={100}
        />
      </div>
    </Link>
  )

  // Product cards data
  const productCards = [
    {
      id: 1,
      name: "Ergonomic Gaming Chair",
      price: 199.99,
      originalPrice: 249.99,
      discount: 50.00,
      image: "gaming-chair"
    },
    {
      id: 2,
      name: "Minnesota Wild Logo Panel",
      price: 157.57,
      originalPrice: 179.85,
      discount: 22.28,
      image: "minnesota-wild"
    },
    {
      id: 3,
      name: "Mini Kawaii Popular Cat Baby Night Lamp",
      price: 23.25,
      originalPrice: 24.47,
      discount: 1.22,
      image: "cat-lamp"
    },
    {
      id: 4,
      name: "LEVEL UP! UNISEX CLASSIC BASEBALL TEE",
      price: 30.81,
      originalPrice: 41.31,
      discount: 10.50,
      image: "baseball-tee"
    },
    {
      id: 5,
      name: "Houses in Acoma Pueblo - Mexico",
      price: 86.43,
      originalPrice: 94.86,
      discount: 8.43,
      image: "acoma-pueblo"
    },
    {
      id: 6,
      name: "Wireless Bluetooth Headphones",
      price: 64.80,
      originalPrice: 80.00,
      discount: 15.20,
      image: "headphones"
    },
    {
      id: 7,
      name: "Smart Fitness Watch",
      price: 125.00,
      originalPrice: 150.00,
      discount: 25.00,
      image: "smart-watch"
    },
    {
      id: 8,
      name: "Automatic Coffee Maker",
      price: 37.50,
      originalPrice: 50.00,
      discount: 12.50,
      image: "coffee-maker"
    },
    {
      id: 9,
      name: "Premium Yoga Mat",
      price: 22.00,
      originalPrice: 30.00,
      discount: 8.00,
      image: "yoga-mat"
    },
    {
      id: 10,
      name: "Wireless Earbuds",
      price: 38.00,
      originalPrice: 50.00,
      discount: 12.00,
      image: "earbuds"
    }
  ]



  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 md:gap-6 lg:gap-8">
            <div className="flex-1">
              <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Display exactly 2 random banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-1">
              <PromoBanner banner={banner} />
            </div>
          ))}
        </div>
        
        {/* Promotional Section */}
        <div className="mt-16">
          {/* Main Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-1">
                <div className="w-6 h-0.5 bg-pink-500"></div>
                <div className="w-6 h-0.5 bg-pink-500"></div>
                <div className="w-6 h-0.5 bg-pink-500"></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mx-6">
                Best Deal available in the USA
              </h2>
              <div className="flex space-x-1">
                <div className="w-6 h-0.5 bg-pink-500"></div>
                <div className="w-6 h-0.5 bg-pink-500"></div>
                <div className="w-6 h-0.5 bg-pink-500"></div>
              </div>
            </div>
          </div>
          
          {/* Product Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6">
            {/* Automotive */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 10% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Red car with black outline */}
                <div className="relative">
                  <div className="w-12 h-6 bg-red-500 rounded-lg border-2 border-black relative">
                    <div className="absolute -top-1 left-1 w-2 h-2 bg-yellow-400 rounded-full border border-black"></div>
                    <div className="absolute -top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full border border-black"></div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">AUTOMOTIVE</div>
            </div>
            
            {/* Beauty & Health */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 10% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Beauty products with black outline */}
                <div className="relative flex space-x-1">
                  <div className="w-3 h-4 bg-blue-500 rounded border border-black"></div>
                  <div className="w-2 h-3 bg-orange-500 rounded border border-black"></div>
                  <div className="w-2 h-3 bg-green-500 rounded border border-black"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded border border-black"></div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">BEAUTY & HEALTH</div>
            </div>
            
            {/* Beds */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Bed with black outline */}
                <div className="relative">
                  <div className="w-12 h-6 bg-yellow-400 rounded-t-lg border-2 border-black relative">
                    <div className="absolute -top-1 left-1 w-2 h-2 bg-purple-500 rounded-full border border-black"></div>
                    <div className="absolute -top-1 right-1 w-2 h-2 bg-purple-500 rounded-full border border-black"></div>
                    <div className="absolute top-0 left-0 right-0 h-2 bg-white rounded-t-lg border-t border-black"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">BEDS</div>
            </div>
            
            {/* Dining Table */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Dining table with chairs and lamp */}
                <div className="relative">
                  <div className="w-10 h-6 bg-amber-700 rounded-lg border-2 border-black relative">
                    <div className="absolute -left-1 top-1 w-2 h-4 bg-blue-500 rounded border border-black"></div>
                    <div className="absolute -right-1 top-1 w-2 h-4 bg-red-500 rounded border border-black"></div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-yellow-400 rounded-full border border-black"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">DINING TABLE</div>
            </div>
            
            {/* Dressers */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Dresser with colored drawers */}
                <div className="relative">
                  <div className="w-10 h-8 bg-gray-600 rounded-lg border-2 border-black relative">
                    <div className="absolute top-1 left-1 w-1 h-4 bg-purple-500 rounded border border-black"></div>
                    <div className="absolute top-1 left-3 w-1 h-4 bg-blue-400 rounded border border-black"></div>
                    <div className="absolute top-1 right-1 w-1 h-4 bg-green-500 rounded border border-black"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">DRESSERS</div>
            </div>
            
            {/* Electronics */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 15% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Electronics with screens */}
                <div className="relative flex space-x-1">
                  <div className="w-4 h-3 bg-blue-500 rounded border border-black relative">
                    <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-white"></div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded border border-black relative">
                    <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-white"></div>
                  </div>
                  <div className="w-1 h-2 bg-yellow-500 rounded border border-black relative">
                    <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-white"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">ELECTRONICS</div>
            </div>
            
            {/* Furniture */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Red sofa with yellow cushions */}
                <div className="relative">
                  <div className="w-10 h-6 bg-red-500 rounded-lg border-2 border-black relative">
                    <div className="absolute top-0 left-1 w-1 h-4 bg-yellow-400 rounded border border-black"></div>
                    <div className="absolute top-0 right-1 w-1 h-4 bg-yellow-400 rounded border border-black"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">FURNITURE</div>
            </div>
            
            {/* Jewelry */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Jewelry with black outline */}
                <div className="relative flex space-x-1">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full border border-black relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full border border-black"></div>
                  </div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full border border-black"></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full border border-black"></div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">JEWELRY</div>
            </div>
            
            {/* Kitchen */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Kitchen appliances */}
                <div className="relative flex space-x-1">
                  <div className="w-2 h-3 bg-green-500 rounded border border-black"></div>
                  <div className="w-2 h-3 bg-white rounded border border-black"></div>
                  <div className="w-2 h-3 bg-amber-700 rounded border border-black"></div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">KITCHEN</div>
            </div>
            
            {/* Lighting */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 10% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Lightbulb with radiating lines */}
                <div className="relative">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-black relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-300 rounded-full"></div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-300 rounded-full"></div>
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-yellow-300 rounded-full"></div>
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-yellow-300 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">LIGHTING</div>
            </div>
            
            {/* Outdoor */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Outdoor patio set */}
                <div className="relative">
                  <div className="w-10 h-6 bg-green-500 rounded-lg border-2 border-black relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-600 rounded-full border border-black"></div>
                    <div className="absolute -left-1 top-1 w-2 h-4 bg-blue-500 rounded border border-black"></div>
                    <div className="absolute -right-1 top-1 w-2 h-4 bg-red-500 rounded border border-black"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">OUTDOOR</div>
            </div>
            
            {/* Rugs */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md">
                Sale up to 20% Off
              </div>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center mt-2">
                {/* Colorful rug */}
                <div className="relative">
                  <div className="w-8 h-6 bg-gradient-to-r from-orange-400 via-green-400 to-red-400 rounded border-2 border-black"></div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-800 uppercase">RUGS</div>
            </div>
          </div>
        </div>
        
        {/* Product Slider Section */}
        <div className="mt-20">
          <div className="flex items-start gap-6 mb-8">
            {/* ON SALE ITEMS Banner */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white min-w-[300px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-500/20"></div>
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold mb-4">ON SALE ITEMS</h3>
                <button className="bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  View All
                </button>
              </div>
            </div>
            
            {/* Product Slider - Show all items with Swiper */}
            <div className="flex-1 relative max-w-4xl">
              <SaleItemsSlider products={productCards} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
