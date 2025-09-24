import Link from 'next/link'
import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Shop the latest trends and find everything you need in one place. 
              Fast shipping, secure checkout, and excellent customer service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/categories" className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                Browse Categories
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-primary-200" />
                <span className="text-sm text-primary-100">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary-200" />
                <span className="text-sm text-primary-100">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-primary-200" />
                <span className="text-sm text-primary-100">Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary-200" />
                <span className="text-sm text-primary-100">5-Star Rating</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 text-gray-900">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Hero Product Image</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Featured Product</h3>
                <p className="text-gray-600 mb-4">Amazing product description that highlights key features and benefits.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">$99.99</span>
                  <button className="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
