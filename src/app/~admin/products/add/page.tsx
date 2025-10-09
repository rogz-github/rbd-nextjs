'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save,
  ArrowLeft,
  Package,
  DollarSign,
  FileText,
  AlertCircle,
  Image,
  Settings,
  Tag,
  Truck,
  Globe,
  Plus,
  X,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminFooter } from '@/components/admin/AdminFooter'

interface ProductFormData {
  name: string
  description: string
  shortDescription: string
  sku: string
  category1: string
  category2: string
  category3: string
  category4: string
  fullCategory: string
  brand: string
  supplier: string
  salePrice: string
  discountedPrice: string
  msrp: string
  inventory: string
  mainImage: string
  images: string[]
  status: 'active' | 'draft' | 'archived'
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('product-info')
  const [variants, setVariants] = useState<Array<{option: string, value: string}>>([])

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  const addVariant = () => {
    setVariants([...variants, { option: '', value: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: 'option' | 'value', value: string) => {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const generateRandomValues = () => {
    const sampleProducts = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
        shortDescription: 'Premium wireless headphones with noise cancellation',
        sku: `WBH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        category1: 'Electronics',
        category2: 'Audio',
        category3: 'Headphones',
        category4: 'Wireless',
        brand: 'TechSound',
        supplier: 'AudioTech Solutions',
        msrp: '199.99',
        discountedPrice: '149.99',
        salePrice: '149.99',
        inventory: '50',
        mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        status: 'active' as 'active' | 'draft' | 'archived',
        metaTitle: 'Wireless Bluetooth Headphones - Premium Audio',
        metaDescription: 'Shop premium wireless headphones with noise cancellation. 30-hour battery life, superior sound quality.',
        metaKeywords: 'headphones, wireless, bluetooth, noise cancellation, audio'
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable organic cotton t-shirt. Made from 100% organic cotton, perfect for everyday wear.',
        shortDescription: 'Sustainable organic cotton t-shirt',
        sku: `OCT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        category1: 'Clothing',
        category2: 'Tops',
        category3: 'T-Shirts',
        category4: 'Organic',
        brand: 'EcoWear',
        supplier: 'Green Fashion Co.',
        msrp: '29.99',
        discountedPrice: '19.99',
        salePrice: '19.99',
        inventory: '100',
        mainImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        status: 'active' as 'active' | 'draft' | 'archived',
        metaTitle: 'Organic Cotton T-Shirt - Sustainable Fashion',
        metaDescription: 'Eco-friendly organic cotton t-shirt. Comfortable, sustainable, and perfect for everyday wear.',
        metaKeywords: 't-shirt, organic, cotton, sustainable, clothing'
      },
      {
        name: 'Smart Home Security Camera',
        description: 'Advanced smart security camera with 4K video, night vision, and AI-powered motion detection. Keep your home safe 24/7.',
        shortDescription: '4K smart security camera with AI detection',
        sku: `SHS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        category1: 'Electronics',
        category2: 'Security',
        category3: 'Cameras',
        category4: 'Smart Home',
        brand: 'SecureHome',
        supplier: 'Smart Security Inc.',
        msrp: '299.99',
        discountedPrice: '249.99',
        salePrice: '249.99',
        inventory: '25',
        mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        status: 'active' as 'active' | 'draft' | 'archived',
        metaTitle: 'Smart Home Security Camera - 4K AI Detection',
        metaDescription: 'Advanced 4K smart security camera with night vision and AI motion detection for complete home security.',
        metaKeywords: 'security camera, smart home, 4K, night vision, AI, surveillance'
      }
    ]

    const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
    
    setFormData({
      ...formData,
      name: randomProduct.name,
      description: randomProduct.description,
      shortDescription: randomProduct.shortDescription,
      sku: randomProduct.sku,
      category1: randomProduct.category1,
      category2: randomProduct.category2,
      category3: randomProduct.category3,
      category4: randomProduct.category4,
      brand: randomProduct.brand,
      supplier: randomProduct.supplier,
      msrp: randomProduct.msrp,
      discountedPrice: randomProduct.discountedPrice,
      salePrice: randomProduct.salePrice,
      inventory: randomProduct.inventory,
      mainImage: randomProduct.mainImage,
      status: randomProduct.status,
      metaTitle: randomProduct.metaTitle,
      metaDescription: randomProduct.metaDescription,
      metaKeywords: randomProduct.metaKeywords
    })

    // Generate some random variants
    const randomVariants = [
      { option: 'Size', value: 'Large' },
      { option: 'Color', value: 'Black' },
      { option: 'Material', value: 'Premium' }
    ]
    setVariants(randomVariants)

    // Clear any existing errors
    setErrors({})
    
    toast.success('Random values generated successfully!')
  }

  const handleSaveDraft = async () => {
    try {
      setIsLoading(true)
      setErrors({})
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          ...formData,
          status: 'draft',
          fullCategory: formData.fullCategory || formData.category1
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle different types of server errors
        if (response.status === 401) {
          throw new Error('You are not authorized to save products. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('You do not have permission to save products. Admin access required.')
        } else if (response.status === 409) {
          throw new Error('A product with this SKU already exists. Please use a different SKU.')
        } else if (response.status === 422) {
          // Validation errors from server
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map((err: any) => err.message || err).join(', ')
            throw new Error(`Validation failed: ${errorMessages}`)
          } else if (errorData.error) {
            throw new Error(`Validation failed: ${errorData.error}`)
          } else {
            throw new Error('Invalid data provided. Please check your input and try again.')
          }
        } else if (response.status >= 500) {
          throw new Error('Server error occurred. Please try again later or contact support.')
        } else {
          throw new Error(errorData.error || errorData.message || 'Failed to save product draft. Please try again.')
        }
      }

      const result = await response.json()
      toast.success('Product saved as draft successfully!', {
        duration: 4000,
        style: {
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
        }
      })
      router.push('/~admin/products')
    } catch (error) {
      console.error('Error saving product draft:', error)
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        }
      })
      
      // Also show a more detailed error in the console for debugging
      console.error('Detailed error information:', {
        error,
        formData: {
          name: formData.name,
          sku: formData.sku,
          category1: formData.category1,
          status: 'draft'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    category1: '',
    category2: '',
    category3: '',
    category4: '',
    fullCategory: '',
    brand: '',
    supplier: '',
    salePrice: '',
    discountedPrice: '',
    msrp: '',
    inventory: '0',
    mainImage: '',
    images: [],
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }

      // Auto-calculate sale price when MSRP or discount changes
      if (name === 'msrp' || name === 'discountedPrice') {
        const msrp = name === 'msrp' ? parseFloat(value) : parseFloat(prev.msrp)
        const discount = name === 'discountedPrice' ? parseFloat(value) : parseFloat(prev.discountedPrice || '0')
        
        if (!isNaN(msrp)) {
          const salePrice = Math.max(0, msrp - (isNaN(discount) ? 0 : discount))
          newData.salePrice = salePrice.toFixed(2)
        }
      }

      return newData
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Product Name Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters long'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Product name must be less than 100 characters'
    }

    // Description Validation
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long'
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }

    // SKU Validation
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU (Stock Keeping Unit) is required'
    } else if (formData.sku.trim().length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters long'
    } else if (formData.sku.trim().length > 50) {
      newErrors.sku = 'SKU must be less than 50 characters'
    } else if (!/^[A-Z0-9-_]+$/.test(formData.sku.trim())) {
      newErrors.sku = 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'
    }

    // Primary Category Validation
    if (!formData.category1.trim()) {
      newErrors.category1 = 'Primary category is required'
    } else if (formData.category1.trim().length < 2) {
      newErrors.category1 = 'Primary category must be at least 2 characters long'
    } else if (formData.category1.trim().length > 50) {
      newErrors.category1 = 'Primary category must be less than 50 characters'
    }

    // MSRP Validation
    if (!formData.msrp || formData.msrp.trim() === '') {
      newErrors.msrp = 'MSRP (Manufacturer\'s Suggested Retail Price) is required'
    } else {
      const msrpValue = parseFloat(formData.msrp)
      if (isNaN(msrpValue)) {
        newErrors.msrp = 'MSRP must be a valid number'
      } else if (msrpValue <= 0) {
        newErrors.msrp = 'MSRP must be greater than $0.00'
      } else if (msrpValue > 999999.99) {
        newErrors.msrp = 'MSRP cannot exceed $999,999.99'
      } else if (msrpValue < 0.01) {
        newErrors.msrp = 'MSRP must be at least $0.01'
      }
    }

    // Discounted Price Validation (if provided)
    if (formData.discountedPrice && formData.discountedPrice.trim() !== '') {
      const discountedValue = parseFloat(formData.discountedPrice)
      const msrpValue = parseFloat(formData.msrp || '0')
      
      if (isNaN(discountedValue)) {
        newErrors.discountedPrice = 'Discounted price must be a valid number'
      } else if (discountedValue < 0) {
        newErrors.discountedPrice = 'Discounted price cannot be negative'
      } else if (discountedValue >= msrpValue) {
        newErrors.discountedPrice = 'Discounted price must be less than MSRP'
      } else if (discountedValue > 999999.99) {
        newErrors.discountedPrice = 'Discounted price cannot exceed $999,999.99'
      }
    }

    // Inventory Validation
    if (formData.inventory && formData.inventory.trim() !== '') {
      const inventoryValue = parseInt(formData.inventory)
      if (isNaN(inventoryValue)) {
        newErrors.inventory = 'Inventory must be a valid number'
      } else if (inventoryValue < 0) {
        newErrors.inventory = 'Inventory cannot be negative'
      } else if (inventoryValue > 999999) {
        newErrors.inventory = 'Inventory cannot exceed 999,999 units'
      }
    }

    // Image URL Validation
    if (formData.mainImage && formData.mainImage.trim() !== '') {
      const urlPattern = /^https?:\/\/.+\..+/
      if (!urlPattern.test(formData.mainImage.trim())) {
        newErrors.mainImage = 'Please enter a valid image URL (must start with http:// or https://)'
      }
    }

    // Brand Validation (if provided)
    if (formData.brand && formData.brand.trim() !== '') {
      if (formData.brand.trim().length > 50) {
        newErrors.brand = 'Brand name must be less than 50 characters'
      }
    }

    // Meta Title Validation (if provided)
    if (formData.metaTitle && formData.metaTitle.trim() !== '') {
      if (formData.metaTitle.trim().length > 60) {
        newErrors.metaTitle = 'Meta title should be less than 60 characters for better SEO'
      }
    }

    // Meta Description Validation (if provided)
    if (formData.metaDescription && formData.metaDescription.trim() !== '') {
      if (formData.metaDescription.trim().length > 160) {
        newErrors.metaDescription = 'Meta description should be less than 160 characters for better SEO'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const errorCount = Object.keys(errors).length
      toast.error(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          ...formData,
          fullCategory: formData.fullCategory || formData.category1
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle different types of server errors
        if (response.status === 401) {
          throw new Error('You are not authorized to create products. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('You do not have permission to create products. Admin access required.')
        } else if (response.status === 409) {
          throw new Error('A product with this SKU already exists. Please use a different SKU.')
        } else if (response.status === 422) {
          // Validation errors from server
          if (data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors.map((err: any) => err.message || err).join(', ')
            throw new Error(`Validation failed: ${errorMessages}`)
          } else if (data.error) {
            throw new Error(`Validation failed: ${data.error}`)
          } else {
            throw new Error('Invalid data provided. Please check your input and try again.')
          }
        } else if (response.status >= 500) {
          throw new Error('Server error occurred. Please try again later or contact support.')
        } else {
          throw new Error(data.error || data.message || 'Failed to create product. Please try again.')
        }
      }
      
      toast.success('Product created successfully!')
      router.push('/~admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage, {
        duration: 6000, // Show for 6 seconds
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        }
      })
      
      // Also show a more detailed error in the console for debugging
      console.error('Detailed error information:', {
        error,
        formData: {
          name: formData.name,
          sku: formData.sku,
          category1: formData.category1,
          msrp: formData.msrp
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={handleMobileMenuClose} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader onMobileMenuToggle={handleMobileMenuToggle} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add a new Product</h1>
                <p className="text-gray-600 mt-1">Orders placed across your store</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'product-info', name: 'Product information', icon: FileText },
                { id: 'product-image', name: 'Product Image', icon: Image },
                { id: 'variants', name: 'Variants', icon: Settings },
                { id: 'inventory', name: 'Inventory', icon: Package },
                { id: 'pricing', name: 'Pricing', icon: DollarSign },
                { id: 'organize', name: 'Organize', icon: Tag }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Product Information Tab */}
          {activeTab === 'product-info' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Product information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.name ? (
                    <p className="text-sm text-red-600 flex items-start">
                      <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className={`text-xs ${formData.name.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.name.length}/100 characters
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter product description"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-sm text-red-600 flex items-start">
                      <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{errors.description}</span>
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className={`text-xs ${formData.description.length > 2000 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.description.length}/2000 characters
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter short description"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter SKU"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.sku}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category1" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Category *
                </label>
                <input
                  type="text"
                  id="category1"
                  name="category1"
                  value={formData.category1}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category1 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Electronics"
                />
                {errors.category1 && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category1}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category2" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Category
                </label>
                <input
                  type="text"
                  id="category2"
                  name="category2"
                  value={formData.category2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Smartphones"
                />
              </div>

              <div>
                <label htmlFor="category3" className="block text-sm font-medium text-gray-700 mb-2">
                  Tertiary Category
                </label>
                <input
                  type="text"
                  id="category3"
                  name="category3"
                  value={formData.category3}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., iPhone"
                />
              </div>

              <div>
                <label htmlFor="category4" className="block text-sm font-medium text-gray-700 mb-2">
                  Quaternary Category
                </label>
                <input
                  type="text"
                  id="category4"
                  name="category4"
                  value={formData.category4}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., iPhone 15 Pro"
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
            </div>
          )}

          {/* Product Image Tab */}
          {activeTab === 'product-image' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Image</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add media from URL
                  </label>
                  <input
                    type="url"
                    name="mainImage"
                    value={formData.mainImage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drag and drop your image here</p>
                  <p className="text-gray-500 mb-4">or</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Variants</h2>
              
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Option"
                        value={variant.option}
                        onChange={(e) => updateVariant(index, 'option', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Value"
                        value={variant.value}
                        onChange={(e) => updateVariant(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another option</span>
                </button>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Inventory</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
                      Product in stock now
                    </label>
                    <input
                      type="number"
                      id="inventory"
                      name="inventory"
                      value={formData.inventory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product in transit
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Type</h3>
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="shippingType"
                        value="seller"
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Fulfilled by Seller</div>
                        <p className="text-sm text-gray-500">
                          You'll be responsible for product delivery. Any damage or delay during shipping may cost you a Damage fee.
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="shippingType"
                        value="company"
                        defaultChecked
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Fulfilled by Company name <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">RECOMMENDED</span></div>
                        <p className="text-sm text-gray-500">
                          Your product, Our responsibility. For a measly fee, we will handle the delivery process for you.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="msrp" className="block text-sm font-medium text-gray-700 mb-2">
                    Best Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="msrp"
                      name="msrp"
                      value={formData.msrp}
                      onChange={handleInputChange}
                      step="0.01"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.msrp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.msrp && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.msrp}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Discounted Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Charge tax on this product</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">In stock</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Organize Tab */}
          {activeTab === 'organize' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Organize</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category1" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Category
                  </label>
                  <select
                    id="category1"
                    name="category1"
                    value={formData.category1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="Books">Books</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select vendor</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Published</option>
                    <option value="archived">Inactive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>
            </div>
          )}

        </form>
          </div>
        </main>
        
        {/* Footer */}
        <AdminFooter />
      </div>

      {/* Floating Generate Random Button - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={generateRandomValues}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 group"
          title="Generate Random Product Data (Development Only)"
        >
          <Package className="w-5 h-5" />
          <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">
            Generate Random
          </span>
        </button>
      )}
    </div>
  )
}
