'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  discount: number
  image: string
}

interface SaleItemsSliderProps {
  products: Product[]
}

export function SaleItemsSlider({ products }: SaleItemsSliderProps) {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={5}
        slidesPerView={7}
        navigation={{
          nextEl: '.swiper-button-next-sale',
          prevEl: '.swiper-button-prev-sale',
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 24,
          },
        }}
        className="sale-items-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev-sale absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button className="swiper-button-next-sale absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

    </div>
  )
}

// Product card component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
      <div className="relative">
        <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
          Free Shipping
        </div>
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          ${product.discount.toFixed(2)} off
        </div>
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          {/* Placeholder for product image */}
          <div className="w-16 h-20 bg-gray-400 rounded-lg flex items-center justify-center">
            <span className="text-gray-600 text-xs">Product</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 font-bold text-lg">${product.price.toFixed(2)}</span>
          <span className="text-gray-500 line-through text-sm">${product.originalPrice.toFixed(2)}</span>
        </div>
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h4>
      </div>
    </div>
  )
}
