'use client'

import Image from 'next/image'
import Link from 'next/link'

interface PromoBanner {
  id: number
  src: string
  alt: string
  title: string
  subtitle: string
  discount: string
  link?: string
}

export function ImageColumns() {
  // Sample data matching the design in the image
  const banners: PromoBanner[] = [
    {
      id: 1,
      src: "/images/banners/1759137516143_kwzwqmbpphi.webp",
      alt: "Industrial Power Tools Deals",
      title: "Industrial",
      subtitle: "Power Tools",
      discount: "40% OFF",
      link: "/products?category=tools"
    },
    {
      id: 2,
      src: "/images/banners/1759320681770_9bx047nlpej.jpg",
      alt: "Musical Instruments Deals",
      title: "Musical",
      subtitle: "Instruments",
      discount: "35% OFF",
      link: "/products?category=instruments"
    }
  ]

  const PromoBanner = ({ banner }: { banner: PromoBanner }) => (
    <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Wavy abstract shapes at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C150,20 300,100 450,60 C600,20 750,100 900,60 C1050,20 1200,100 1200,100 L1200,120 L0,120 Z"
              fill="rgba(20, 184, 166, 0.8)"
            />
            <path
              d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"
              fill="rgba(6, 182, 212, 0.6)"
            />
            <path
              d="M0,100 C250,60 500,140 750,100 C1000,60 1200,140 1200,140 L1200,120 L0,120 Z"
              fill="rgba(14, 165, 233, 0.4)"
            />
          </svg>
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
          {/* Title in upper left */}
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold leading-tight opacity-90">
              {banner.title}
            </h3>
            <h4 className="text-3xl font-bold leading-tight opacity-90">
              {banner.subtitle}
            </h4>
            <span className="text-2xl font-bold opacity-90">
              Deals
            </span>
          </div>
          
          {/* Discount in upper right */}
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-4xl font-bold text-white" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                WebkitTextStroke: '2px #14b8a6'
              }}>
                {banner.discount.split(' ')[0]}
              </div>
              <div className="text-lg font-bold text-white" style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                WebkitTextStroke: '1px #14b8a6'
              }}>
                {banner.discount.split(' ')[1]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {banners.map((banner) => (
            <PromoBanner key={banner.id} banner={banner} />
          ))}
        </div>
      </div>
    </section>
  )
}
