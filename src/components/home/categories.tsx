import Link from 'next/link'
import { Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2 } from 'lucide-react'

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: Smartphone,
    description: 'Latest gadgets and devices',
    image: '/api/placeholder/300/200',
    productCount: 150
  },
  {
    name: 'Computers',
    slug: 'computers',
    icon: Laptop,
    description: 'Laptops, desktops & accessories',
    image: '/api/placeholder/300/200',
    productCount: 89
  },
  {
    name: 'Audio',
    slug: 'audio',
    icon: Headphones,
    description: 'Headphones, speakers & more',
    image: '/api/placeholder/300/200',
    productCount: 67
  },
  {
    name: 'Photography',
    slug: 'photography',
    icon: Camera,
    description: 'Cameras, lenses & equipment',
    image: '/api/placeholder/300/200',
    productCount: 45
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    icon: Watch,
    description: 'Smartwatches & fitness trackers',
    image: '/api/placeholder/300/200',
    productCount: 32
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    icon: Gamepad2,
    description: 'Gaming consoles & accessories',
    image: '/api/placeholder/300/200',
    productCount: 78
  }
]

export function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover products organized by category to find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-primary-600" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.productCount} products
                    </span>
                    <span className="text-primary-600 font-medium group-hover:underline">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/categories" className="btn btn-primary btn-lg">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  )
}
