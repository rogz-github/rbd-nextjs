'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

    window.addEventListener('bannerUpdated', handleRefresh)

    return () => {
      clearInterval(interval)
      window.removeEventListener('bannerUpdated', handleRefresh)
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
      </div>
    </section>
  )
}
