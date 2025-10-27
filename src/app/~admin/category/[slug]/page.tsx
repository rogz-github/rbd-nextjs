'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Settings,
  Image as ImageIcon,
  Package,
  Tag,
  GripVertical,
  X
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CategoryData {
  pcstId: number
  pcstImg: string
  pcstSlug: string
  pcstCat: string
  totalProduct: number
  pcstPosition: number
  banner?: string
  imageVector: string
  cat2Lists: string
  displayedItems: string
  seoTitle: string
  seoDesc: string
  createdAt: string
  updatedAt: string
}

type CategoryDataOrArray = CategoryData | CategoryData[]

// Helper function to format numbers with commas
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface CategoryPageProps {
  params: {
    slug: string
  }
}

// Sortable Category Row Component
function SortableCategoryRow({ 
  category, 
  onDelete, 
  onView,
  onEdit,
  showProductCount = false
}: { 
  category: CategoryData
  onDelete: (category: CategoryData) => void
  onView: (slug: string) => void
  onEdit: (slug: string) => void
  showProductCount?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category.pcstId
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="p-6 hover:bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12 rounded-lg object-cover"
              src={category.pcstImg || '/placeholder-product.jpg'}
              alt={category.pcstCat}
            />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">{category.pcstCat}</h4>
            <p className="text-sm text-gray-500">Slug: {category.pcstSlug}</p>
            <p className="text-sm text-gray-500">Position: {category.pcstPosition}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <GripVertical 
            className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing mr-2"
            {...attributes} 
            {...listeners}
          />
          {showProductCount && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {formatNumber(category.totalProduct)} products
            </span>
          )}
          <button 
            onClick={() => onEdit(category.pcstSlug)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button 
            onClick={() => onDelete(category)}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit Category Modal Component
function EditCategoryModal({ 
  category, 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  category: CategoryData
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    pcstImg: category.pcstImg,
    banner: category.banner || '',
    pcstCat: category.pcstCat,
    seoTitle: category.seoTitle,
    seoDesc: category.seoDesc,
    pcstSlug: category.pcstSlug
  })
  const [previewUrl, setPreviewUrl] = useState(category.pcstImg)
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(category.banner || '')
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when category changes
  useEffect(() => {
    setFormData({
      pcstImg: category.pcstImg,
      banner: category.banner || '',
      pcstCat: category.pcstCat,
      seoTitle: category.seoTitle,
      seoDesc: category.seoDesc,
      pcstSlug: category.pcstSlug
    })
    setPreviewUrl(category.pcstImg)
    setBannerPreviewUrl(category.banner || '')
    setErrors({})
  }, [category])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileUpload = async (file: File, isBanner: boolean = false) => {
    if (isBanner) {
      setUploadingBanner(true)
    } else {
      setUploading(true)
    }
    setErrors({})

    try {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      
      if (!allowedImageTypes.includes(file.type)) {
        setErrors({ image: 'Only JPEG, PNG, WebP, and GIF files are allowed' })
        return
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors({ image: 'File size must be less than 5MB' })
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        if (isBanner) {
          setFormData(prev => ({ ...prev, banner: result.url }))
          setBannerPreviewUrl(result.url)
        } else {
          setFormData(prev => ({ ...prev, pcstImg: result.url }))
          setPreviewUrl(result.url)
        }
        setErrors({})
      } else {
        setErrors({ image: result.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ image: 'Upload failed. Please try again.' })
    } finally {
      if (isBanner) {
        setUploadingBanner(false)
      } else {
        setUploading(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, isBanner)
    }
  }

  const handleUrlChange = (url: string, isBanner: boolean = false) => {
    if (isBanner) {
      setFormData(prev => ({ ...prev, banner: url }))
      setBannerPreviewUrl(url)
    } else {
      setFormData(prev => ({ ...prev, pcstImg: url }))
      setPreviewUrl(url)
    }
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch(`/api/admin/categories/${category.pcstSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pcstId: category.pcstId,
          ...formData
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        setErrors({ form: errorData.error || 'Failed to update category' })
      }
    } catch (error) {
      console.error('Update error:', error)
      setErrors({ form: 'Failed to update category. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Category One</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={previewUrl || '/placeholder-product.jpg'}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex space-x-2">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, false)}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or enter image URL"
                  value={formData.pcstImg}
                  onChange={(e) => handleUrlChange(e.target.value, false)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={bannerPreviewUrl || '/placeholder-product.jpg'}
                  alt="Banner Preview"
                  className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex space-x-2">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or enter banner URL"
                  value={formData.banner}
                  onChange={(e) => handleUrlChange(e.target.value, true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>
            </div>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              name="pcstCat"
              value={formData.pcstCat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              name="pcstSlug"
              value={formData.pcstSlug}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>

          {/* SEO Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Title
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Description
            </label>
            <textarea
              name="seoDesc"
              value={formData.seoDesc}
              onChange={handleInputChange}
              maxLength={255}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categoryData, setCategoryData] = useState<CategoryDataOrArray | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryData | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Handle drag end for reordering categories
  const handleDragEnd = async (event: DragEndEvent) => {
    // Only handle drag if we have an array of categories
    if (!categoryData || !Array.isArray(categoryData)) return

    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = categoryData.findIndex(cat => cat.pcstId === active.id)
    const newIndex = categoryData.findIndex(cat => cat.pcstId === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newCategories = arrayMove(categoryData, oldIndex, newIndex)
    
    // Update positions
    const updatedCategories = newCategories.map((category, index) => ({
      ...category,
      pcstPosition: index
    }))

    setCategoryData(updatedCategories)

    // Update positions in the database
    try {
      const response = await fetch('/api/admin/categories/reorder', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories: updatedCategories.map(category => ({
            id: category.pcstId,
            position: category.pcstPosition
          }))
        })
      })

      if (!response.ok) {
        console.error('Failed to update category positions')
        // Revert on error
        fetchCategoryData()
      } else {
        showToast('Category positions updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Error updating category positions:', error)
      // Revert on error
      fetchCategoryData()
    }
  }

  // Generate categories from Product table
  const generateCategories = async () => {
    setShowGenerateModal(false)
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/categories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const message = `Successfully processed ${data.total} categories (${data.created} created, ${data.updated} updated)`
        showToast(message, 'success')
        // Refresh the categories list
        fetchCategoryData()
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Error generating categories', 'error')
      }
    } catch (error) {
      console.error('Error generating categories:', error)
      showToast('Error generating categories', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle delete category
  const handleDeleteClick = (category: CategoryData) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  // Handle edit click
  const handleEditClick = (slug: string) => {
    if (!categoryData) return
    
    const isMultipleCategories = Array.isArray(categoryData)
    
    if (isMultipleCategories && categoryData) {
      const category = categoryData.find(cat => cat.pcstSlug === slug)
      if (category) {
        setCategoryToEdit(category)
        setShowEditModal(true)
      }
    } else {
      router.push(`/~admin/category/${slug}`)
    }
  }

  // Close edit modal
  const handleEditModalClose = () => {
    setShowEditModal(false)
    setCategoryToEdit(null)
  }

  // Delete category
  const deleteCategory = async () => {
    if (!categoryToDelete) return

    setShowDeleteModal(false)
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.pcstSlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        showToast('Category deleted successfully', 'success')
        // If we're viewing a single category that was deleted, redirect to list
        if (!isMultipleCategories) {
          router.push('/~admin/category/all')
        } else {
          // Refresh the categories list
          fetchCategoryData()
        }
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Error deleting category', 'error')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      showToast('Error deleting category', 'error')
    } finally {
      setIsDeleting(false)
      setCategoryToDelete(null)
    }
  }

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.isAdmin) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch category data
  const fetchCategoryData = async () => {
    try {
      if (params.slug === 'one') {
        // If slug is 'one', fetch all categories from CategoryOne table
        const response = await fetch('/api/admin/categories')
        if (response.ok) {
          const data = await response.json()
          setCategoryData(data)
        } else {
          showToast('Error fetching categories list', 'error')
        }
      } else {
        // For specific category slug, fetch single category
        const response = await fetch(`/api/admin/categories/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          setCategoryData(data)
        } else if (response.status === 404) {
          showToast('Category not found', 'error')
          router.push('/~admin/dashboard')
        } else {
          showToast('Error fetching category data', 'error')
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
      showToast('Error fetching category data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (session?.user?.isAdmin) {
      fetchCategoryData()
    }
    return () => setMounted(false)
  }, [session, params.slug])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/~admin/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Check if we have multiple categories (array) or single category
  const isMultipleCategories = Array.isArray(categoryData)
  const categories = isMultipleCategories ? categoryData : [categoryData]

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isMultipleCategories ? 'Category One Management' : categories[0].pcstCat}
            </h1>
            <p className="mt-2 text-gray-600">
              {isMultipleCategories 
                ? 'Manage all categories from CategoryOne table' 
                : 'Manage category settings and products'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
            {isMultipleCategories && (
              <button
                onClick={() => setShowGenerateModal(true)}
                disabled={isGenerating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Generate from Products
                  </>
                )}
              </button>
            )}
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isMultipleCategories ? 'Add Category' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 gap-6 mb-8 ${
        (isMultipleCategories || (session?.user as any)?.role === 'SUPER_ADMIN') ? 'md:grid-cols-4' : 'md:grid-cols-3'
      }`}>
        {/* Show Total Categories/Products card: always for multiple, or for SUPER_ADMIN when single */}
        {(isMultipleCategories || (session?.user as any)?.role === 'SUPER_ADMIN') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {isMultipleCategories ? 'Total Categories' : 'Total Products'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isMultipleCategories 
                        ? categories.length 
                        : formatNumber(categories[0].totalProduct)
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {isMultipleCategories ? 'Average Position' : 'Position'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isMultipleCategories 
                      ? Math.round(categories.reduce((sum, cat) => sum + cat.pcstPosition, 0) / categories.length)
                      : categories[0].pcstPosition
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Show Total Products card only for SUPER_ADMIN when multiple categories, or Slug card for everyone */}
        {((isMultipleCategories && (session?.user as any)?.role === 'SUPER_ADMIN') || (!isMultipleCategories)) && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tag className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {isMultipleCategories ? 'Total Products' : 'Slug'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 truncate">
                      {isMultipleCategories 
                        ? formatNumber(categories.reduce((sum, cat) => sum + cat.totalProduct, 0))
                        : categories[0].pcstSlug
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                  <dd className="text-lg font-medium text-green-600">Active</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Search and Filter */}
      {isMultipleCategories && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      )}

      {/* Categories List or Single Category Details */}
      {isMultipleCategories ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Categories List</h3>
            <p className="text-sm text-gray-500 mt-1">Drag the grip icon to reorder categories</p>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(category => category.pcstId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200">
                {categories
                  .filter(category => 
                    searchTerm === '' || 
                    category.pcstCat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    category.pcstSlug.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((category) => (
                    <SortableCategoryRow
                      key={category.pcstId}
                      category={category}
                      onDelete={handleDeleteClick}
                      onView={(slug) => router.push(`/~admin/category/${slug}`)}
                      onEdit={handleEditClick}
                      showProductCount={(session?.user as any)?.role === 'SUPER_ADMIN'}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <>
          {/* Single Category Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Image</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  className="h-20 w-20 rounded-lg object-cover"
                  src={categories[0].pcstImg || '/placeholder-product.jpg'}
                  alt={categories[0].pcstCat}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Current image: {categories[0].pcstImg}</p>
                <button className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Edit className="w-4 h-4 mr-2" />
                  Change Image
                </button>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={categories[0].seoTitle}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                <textarea
                  value={categories[0].seoDesc}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
            </div>
            <div className="mt-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit SEO Settings
              </button>
            </div>
          </div>

          {/* Category Data */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categories[0].pcstCat}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={categories[0].pcstSlug}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="number"
                  value={categories[0].pcstPosition}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Vector</label>
                <input
                  type="text"
                  value={categories[0].imageVector}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Category Details
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Eye className="w-4 h-4 mr-2" />
                Preview Category
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Category Settings
              </button>
              <button 
                onClick={() => handleDeleteClick(categories[0])}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Category
              </button>
            </div>
          </div>
        </>
      )}

      {/* Generate Categories Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="p-6 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Generate Categories from Products</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  This will analyze all products and create/update categories based on the <code className="bg-gray-100 px-1 rounded">category_1</code> field.
                </p>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">What will happen:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• New categories will be created for unique category_1 values</li>
                    <li>• Existing categories will be updated with current product counts</li>
                    <li>• Categories will be automatically positioned and slugified</li>
                  </ul>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateCategories}
                    className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Generate Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="py-4 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Category</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the category <strong>{categoryToDelete.pcstCat}</strong>?
                </p>
                <div className="mt-4 text-left">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This action cannot be undone.
                    </p>
                    {categoryToDelete.totalProduct > 0 && (
                      <p className="text-sm text-yellow-800 mt-2">
                        This category contains {categoryToDelete.totalProduct} products. Deleting it will not remove the products themselves.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="items-center justify-center px-4 py-3 flex">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setCategoryToDelete(null)
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteCategory}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Category'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && categoryToEdit && (
        <EditCategoryModal
          category={categoryToEdit}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onSuccess={() => {
            fetchCategoryData()
            handleEditModalClose()
          }}
        />
      )}
    </div>
  )
}
