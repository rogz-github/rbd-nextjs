'use client'

import Link from 'next/link'
import { useState } from 'react'

const categories = [
  {
    name: 'HOME, GARDEN & TOOLS',
    slug: 'home-garden-tools',
    description: 'Everything you need for your home and garden',
    icon: '🏠',
    color: 'bg-green-100 text-green-800'
  },
  {
    name: 'OUTDOOR',
    slug: 'outdoor',
    description: 'Gear for outdoor adventures and activities',
    icon: '🏕️',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    name: 'BEAUTY & HEALTH',
    slug: 'beauty-health',
    description: 'Beauty products and health essentials',
    icon: '💄',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    name: 'ELECTRONICS',
    slug: 'electronics',
    description: 'Latest electronics and gadgets',
    icon: '📱',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    name: 'AUTOMOTIVE',
    slug: 'automotive',
    description: 'Car accessories and automotive supplies',
    icon: '🚗',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    name: 'INDUSTRIAL',
    slug: 'industrial',
    description: 'Industrial equipment and supplies',
    icon: '⚙️',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    name: 'CLOTHING, SHOES & JEWELRY',
    slug: 'clothing-shoes-jewelry',
    description: 'Fashion and accessories',
    icon: '👗',
    color: 'bg-red-100 text-red-800'
  }
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover products across all our categories
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                      Shop Now
                    </span>
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-gray-600 mb-6">
                Browse all our products or contact our support team for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  View All Products
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
