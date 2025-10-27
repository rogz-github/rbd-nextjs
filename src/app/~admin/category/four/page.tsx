'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  Tag,
  GripVertical,
  X,
  ChevronLeft,
  ChevronRight
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

interface CategoryFourData {
  psssstId: number
  psssstImg: string
  psssstCat: string
  psssstSubcat: string
  psssstSubsubcat: string
  psssstSubsubsubcat: string
  psssstSlug: string
  psssstTotalProduct: number
  psssstHighprice: string
  psssstPosition: number
  cat1Slug: string
  cat2Slug: string
  cat3Slug: string
  totalInstock: number
  totalOutstock: number
  seoTitle: string
  seoDesc: string
  createdAt: string
  updatedAt: string
}

// Helper function to format numbers with commas
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface CategoryOneData {
  pcstId: number
  pcstImg: string
  pcstSlug: string
  pcstCat: string
  totalProduct: number
  pcstPosition: number
}

// Sortable Category Row Component
function SortableCategoryRow({ 
  category, 
  onDelete, 
  onView,
  onEdit,
  isSuperAdmin = false
}: { 
  category: CategoryFourData
  onDelete: (category: CategoryFourData) => void
  onView: (slug: string) => void
  onEdit: (slug: string) => void
  isSuperAdmin?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category.psssstId
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
              src={category.psssstImg || '/placeholder-product.jpg'}
              alt={category.psssstSubsubsubcat}
            />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">{category.psssstSubsubsubcat}</h4>
            <p className="text-sm text-gray-500">Slug: {category.psssstSlug}</p>
            <p className="text-sm text-gray-500">Position: {category.psssstPosition}</p>
            <p className="text-sm text-gray-500">Parent: {category.psssstCat} / {category.psssstSubcat} / {category.psssstSubsubcat}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <GripVertical 
            className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing mr-2"
            {...attributes} 
            {...listeners}
          />
          {isSuperAdmin && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {formatNumber(category.psssstTotalProduct)} products
            </span>
          )}
          <button 
            onClick={() => onEdit(category.psssstSlug)}
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
  category: CategoryFourData
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    psssstImg: category.psssstImg,
    psssstSubsubsubcat: category.psssstSubsubsubcat,
    seoTitle: category.seoTitle,
    seoDesc: category.seoDesc,
    psssstSlug: category.psssstSlug
  })
  const [previewUrl, setPreviewUrl] = useState(category.psssstImg)
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when category changes
  useEffect(() => {
    setFormData({
      psssstImg: category.psssstImg,
      psssstSubsubsubcat: category.psssstSubsubsubcat,
      seoTitle: category.seoTitle,
      seoDesc: category.seoDesc,
      psssstSlug: category.psssstSlug
    })
    setPreviewUrl(category.psssstImg)
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

  const handleFileUpload = async (file: File) => {
    setUploading(true)
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
        setFormData(prev => ({ ...prev, psssstImg: result.url }))
        setPreviewUrl(result.url)
        setErrors({})
      } else {
        setErrors({ image: result.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ image: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, psssstImg: url }))
    setPreviewUrl(url)
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/admin/category-four', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psssstId: category.psssstId,
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
          <h3 className="text-xl font-semibold text-gray-900">Edit Category Four</h3>
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
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or enter image URL"
                  value={formData.psssstImg}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Subcategory Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              name="psssstSubsubsubcat"
              value={formData.psssstSubsubsubcat}
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
              name="psssstSlug"
              value={formData.psssstSlug}
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
              maxLength={200}
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

export default function CategoryFourPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryFourData[]>([])
  const [categoryOneList, setCategoryOneList] = useState<CategoryOneData[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryOne, setSelectedCategoryOne] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryFourData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryFourData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

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

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.isAdmin) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/category-four')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        showToast('Error fetching categories', 'error')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      showToast('Error fetching categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch category one list
  const fetchCategoryOneList = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategoryOneList(data)
      }
    } catch (error) {
      console.error('Error fetching category one list:', error)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (session?.user?.isAdmin) {
      fetchCategories()
      fetchCategoryOneList()
    }
    return () => setMounted(false)
  }, [session])

  // Handle delete click
  const handleDeleteClick = (category: CategoryFourData) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  // Handle edit click
  const handleEditClick = (slug: string) => {
    const category = categories.find(cat => cat.psssstSlug === slug)
    if (category) {
      setCategoryToEdit(category)
      setShowEditModal(true)
    }
  }

  // Close edit modal
  const handleEditModalClose = () => {
    setShowEditModal(false)
    setCategoryToEdit(null)
  }

  // Filter categories based on search and category one filter
  const filteredCategories = categories.filter(category => {
    // Filter by category one
    const matchesCategoryOne = !selectedCategoryOne || category.psssstCat === selectedCategoryOne
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      category.psssstSubsubsubcat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.psssstSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.psssstCat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.psssstSubcat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.psssstSubsubcat.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategoryOne && matchesSearch
  })

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategoryOne])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCategories.length)
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

  // Generate categories from Product table
  const generateCategories = async () => {
    setShowGenerateModal(false)
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/category-four/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const message = `Successfully processed ${data.total} categories (${data.created} created, ${data.updated} updated)`
        showToast(message, 'success')
        fetchCategories()
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

  // Delete category
  const deleteCategory = async () => {
    if (!categoryToDelete) return

    setShowDeleteModal(false)
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/category-four/${categoryToDelete.psssstSlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        showToast('Category deleted successfully', 'success')
        fetchCategories()
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

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find indices in the filtered categories
    const filteredOldIndex = filteredCategories.findIndex(cat => cat.psssstId === active.id)
    const filteredNewIndex = filteredCategories.findIndex(cat => cat.psssstId === over.id)

    if (filteredOldIndex === -1 || filteredNewIndex === -1) return

    // Reorder the filtered categories
    const reorderedFiltered = arrayMove(filteredCategories, filteredOldIndex, filteredNewIndex)
    
    // Update positions in the filtered categories
    const updatedFiltered = reorderedFiltered.map((category, index) => ({
      ...category,
      psssstPosition: index
    }))

    // Update the main categories array with the new positions
    const updatedCategories = categories.map(cat => {
      const updatedFilteredCat = updatedFiltered.find(fc => fc.psssstId === cat.psssstId)
      return updatedFilteredCat || cat
    })

    setCategories(updatedCategories)

    // Update positions in the database
    try {
      const response = await fetch('/api/admin/category-four/reorder', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories: updatedCategories.map(category => ({
            id: category.psssstId,
            position: category.psssstPosition
          }))
        })
      })

      if (!response.ok) {
        console.error('Failed to update category positions')
        fetchCategories()
      } else {
        showToast('Category positions updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Error updating category positions:', error)
      fetchCategories()
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Category Four Management</h1>
            <p className="mt-2 text-gray-600">Manage your sub-sub-subcategories</p>
          </div>
          <div className="flex items-center space-x-3">
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 gap-6 mb-8 ${
        (session?.user as any)?.role === 'SUPER_ADMIN' ? 'md:grid-cols-4' : 'md:grid-cols-3'
      }`}>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Categories</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredCategories.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {(session?.user as any)?.role === 'SUPER_ADMIN' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tag className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(filteredCategories.reduce((sum, cat) => sum + cat.psssstTotalProduct, 0))}
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
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Stock</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(filteredCategories.reduce((sum, cat) => sum + cat.totalInstock, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(filteredCategories.reduce((sum, cat) => sum + cat.totalOutstock, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
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
          <div className="w-64">
            <select
              value={selectedCategoryOne}
              onChange={(e) => setSelectedCategoryOne(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Category One</option>
              {categoryOneList.map((cat1) => (
                <option key={cat1.pcstId} value={cat1.pcstCat}>
                  {cat1.pcstCat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Categories List</h3>
          <p className="text-sm text-gray-500 mt-1">Drag the grip icon to reorder categories</p>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={paginatedCategories.map(category => category.psssstId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200">
                {paginatedCategories.map((category) => (
                  <SortableCategoryRow
                    key={category.psssstId}
                    category={category}
                    onDelete={handleDeleteClick}
                    onView={(slug) => console.log('View:', slug)}
                    onEdit={handleEditClick}
                    isSuperAdmin={(session?.user as any)?.role === 'SUPER_ADMIN'}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Pagination */}
        {filteredCategories.length > 0 && totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{startIndex + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">{endIndex}</span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredCategories.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {(() => {
                    // Always show 5 page numbers when possible
                    let startPage = 1
                    let endPage = totalPages
                    
                    if (totalPages <= 10) {
                      // Show all pages if 10 or fewer
                      startPage = 1
                      endPage = totalPages
                    } else if (currentPage <= 3) {
                      // Show pages 1-5 when near the start
                      startPage = 1
                      endPage = 5
                    } else if (currentPage >= totalPages - 2) {
                      // Show last 5 pages when near the end
                      startPage = totalPages - 4
                      endPage = totalPages
                    } else {
                      // Show 5 pages centered around current page
                      startPage = currentPage - 2
                      endPage = currentPage + 2
                    }
                    
                    const pagesToShow = []
                    for (let page = startPage; page <= endPage; page++) {
                      pagesToShow.push(page)
                    }
                    
                    return pagesToShow.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    ))
                  })()}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Categories Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="p-6 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Generate Category Four from Products</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  This will analyze all products and create/update categories based on the <code className="bg-gray-100 px-1 rounded">category_4</code> field.
                </p>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">What will happen:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• New categories will be created for unique category_4 values</li>
                    <li>• Existing categories will be updated with current product counts</li>
                    <li>• Categories will be automatically positioned and slugified</li>
                    <li>• Parent categories (category_1, category_2, and category_3) will be linked</li>
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

      {/* Edit Category Modal */}
      {showEditModal && categoryToEdit && (
        <EditCategoryModal
          category={categoryToEdit}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onSuccess={() => {
            fetchCategories()
            handleEditModalClose()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
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
                  Are you sure you want to delete the category <strong>{categoryToDelete.psssstSubsubsubcat}</strong>?
                </p>
                <div className="mt-4 text-left">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This action cannot be undone.
                    </p>
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
    </div>
  )
}

