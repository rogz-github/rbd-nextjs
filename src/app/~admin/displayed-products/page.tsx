'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Copy, 
  Trash2, 
  Settings,
  ChevronDown,
  Plus,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  itemNumber: string
  currentPrice: number
  originalPrice: number
  imageUrl: string
  isOnSale: boolean
}

interface DisplayedProductsPageProps {}

export default function DisplayedProductsPage({}: DisplayedProductsPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchBy, setSearchBy] = useState('title')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(100)
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('Sale')
  const [bottomImages, setBottomImages] = useState<{ id: number; image: string; linkUrl?: string | null }[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('Category')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLimit, setSelectedLimit] = useState<number>(6)
  const [productCategories, setProductCategories] = useState<{category: string, count: number}[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Unisex Jogger Sweatpant - BLACK - XS',
      itemNumber: 'D0102H7WY96',
      currentPrice: 29.84,
      originalPrice: 34.16,
      imageUrl: '/placeholder-product.jpg',
      isOnSale: true
    },
    {
      id: '2',
      title: 'Cayla - Sofa Table - Dark Oak',
      itemNumber: 'D0102HEGL5X',
      currentPrice: 518.30,
      originalPrice: 609.76,
      imageUrl: '/placeholder-product.jpg',
      isOnSale: true
    },
    {
      id: '3',
      title: 'Wonder Nation Girls Kid Tough Ribbed Tank Top Sizes 4-18 Plus',
      itemNumber: 'D010275P748',
      currentPrice: 37.87,
      originalPrice: 47.34,
      imageUrl: '/placeholder-product.jpg',
      isOnSale: true
    },
    {
      id: '4',
      title: 'VEVOR Low Profile Floor Jack 3 Ton Heavy Steel Single Piston Hydraulic Pump',
      itemNumber: 'D0102HPCNKI',
      currentPrice: 89.99,
      originalPrice: 89.99,
      imageUrl: '/placeholder-product.jpg',
      isOnSale: false
    }
  ]

  const menuItems = [
    { id: 'sale', name: 'Sale', active: true },
    { id: 'powell', name: 'Powell Items', active: false },
    { id: 'featured', name: 'Featured', active: false },
    { id: 'loved', name: "Thing's You Love", active: false },
    { id: 'best-deal', name: 'Best Deal', active: false }
  ]

  const generateOptions = [
    'Select options',
    'Category',
    'Subcategory',
    'Subsubcategory',
    'Subsubsubcategory',
    'Brand',
    'Random Products',
    'Random Sale Products',
    'Random No Sale Products'
  ]

  // Function to fetch categories from Product table
  const fetchProductCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await fetch('/api/admin/products/categories', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProductCategories(data.categories || [])
        // Set first category as default if none selected
        if (data.categories && data.categories.length > 0 && !selectedCategory) {
          setSelectedCategory(data.categories[0].category)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const limitOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]

  useEffect(() => {
    if (status === 'loading') return

    if (!session || !session.user?.isAdmin) {
      router.push('/~admin')
      return
    }

    // Simulate loading products
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)

    // Load bottom banner images for the first generator select (Image list)
    ;(async () => {
      try {
        const res = await fetch('/api/admin/banners/bottom-images', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setBottomImages(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load image list', err)
      }
    })()

    // Load product categories
    fetchProductCategories()
  }, [session, status, router])

  // Fetch categories when option changes to Category
  useEffect(() => {
    if (selectedOption === 'Category') {
      fetchProductCategories()
    }
  }, [selectedOption])

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchTerm, 'by:', searchBy)
  }

  const handleUpdateDisplayed = () => {
    // Implement update displayed functionality
    console.log('Updating displayed products')
  }

  const handleRemoveAll = () => {
    // Implement remove all functionality
    console.log('Removing all items')
  }

  const handleGenerateItems = () => {
    // Implement generate items functionality
    console.log('Generating items with:', {
      option: selectedOption,
      category: selectedCategory,
      limit: selectedLimit
    })
    
    // Here you would implement the actual generation logic
    // For now, just show a success message
    alert(`Generating ${selectedLimit} items from ${selectedOption}: ${selectedCategory}`)
  }

  const handleManageProduct = (productId: string) => {
    // Implement manage product functionality
    console.log('Managing product:', productId)
  }

  const handleDeleteProduct = (productId: string) => {
    // Implement delete product functionality
    console.log('Deleting product:', productId)
  }

  const handleCopyItemNumber = (itemNumber: string) => {
    navigator.clipboard.writeText(itemNumber)
    // You could add a toast notification here
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading displayed products...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user?.isAdmin) {
    return null
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
          
          {/* Navigation Items */}
          <div className="space-y-2 mb-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedMenuCategory(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Generate Items Section */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Generate Items</h3>
            <div className="space-y-4">
              {/* First field: Select options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select options</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {generateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Second field: Select Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedOption !== 'Category' || loadingCategories}
                >
                  {loadingCategories ? (
                    <option value="">Loading categories...</option>
                  ) : selectedOption === 'Category' ? (
                    productCategories.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.category}
                      </option>
                    ))
                  ) : (
                    <option value="">Select an option first</option>
                  )}
                </select>
              </div>

              {/* Third field: Select Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Limit</label>
                <div className="relative">
                  <input
                    type="number"
                    value={selectedLimit}
                    onChange={(e) => setSelectedLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedLimit(6)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateItems}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Items
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Displayed Products</h1>
        </div>

        {/* Action Bar */}
        <div className="bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleUpdateDisplayed}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Displayed
            </button>
            <button
              onClick={handleRemoveAll}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove All Items
            </button>
          </div>

          {/* Pagination and Search */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1 to 15 of {totalProducts} Products
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="title">Search By</option>
                  <option value="itemNumber">Item Number</option>
                  <option value="price">Price</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                          {product.title}
                          <button
                            onClick={() => handleCopyItemNumber(product.itemNumber)}
                            className="ml-2 p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          ITEM NO : {product.itemNumber}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-600">
                            ${product.currentPrice.toFixed(2)}
                          </span>
                          {product.isOnSale && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleManageProduct(product.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
