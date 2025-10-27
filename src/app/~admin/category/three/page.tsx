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

interface CategoryThreeData {
  pssstId: number
  pssstImg: string
  pssstCat: string
  pssstSubcat: string
  pssstSubsubcat: string
  pssstSlug: string
  pssstTotalProduct: number
  pssstHighprice: string
  pssstPosition: number
  cat1Slug: string
  cat2Slug: string
  totalInstock: number
  totalOutstock: number
  cat4Slug: string
  cat2TotalInstock: number
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
  category: CategoryThreeData
  onDelete: (category: CategoryThreeData) => void
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
    id: category.pssstId
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
              src={category.pssstImg || '/placeholder-product.jpg'}
              alt={category.pssstSubsubcat}
            />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">{category.pssstSubsubcat}</h4>
            <p className="text-sm text-gray-500">Slug: {category.pssstSlug}</p>
            <p className="text-sm text-gray-500">Position: {category.pssstPosition}</p>
            <p className="text-sm text-gray-500">Parent: {category.pssstCat} / {category.pssstSubcat}</p>
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
              {formatNumber(category.pssstTotalProduct)} products
            </span>
          )}
          <button 
            onClick={() => onEdit(category.pssstSlug)}
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

export default function CategoryThreePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryThreeData[]>([])
  const [categoryOneList, setCategoryOneList] = useState<CategoryOneData[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryOne, setSelectedCategoryOne] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryThreeData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
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
      const response = await fetch('/api/admin/category-three')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || data)
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
  const handleDeleteClick = (category: CategoryThreeData) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  // Filter categories based on search and category one filter
  const filteredCategories = categories.filter(category => {
    // Filter by category one
    const matchesCategoryOne = !selectedCategoryOne || category.pssstCat === selectedCategoryOne
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      category.pssstSubsubcat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.pssstSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.pssstCat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.pssstSubcat.toLowerCase().includes(searchTerm.toLowerCase())
    
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
      const response = await fetch('/api/admin/category-three/generate', {
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
      const response = await fetch(`/api/admin/category-three/${categoryToDelete.pssstSlug}`, {
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
    const filteredOldIndex = filteredCategories.findIndex(cat => cat.pssstId === active.id)
    const filteredNewIndex = filteredCategories.findIndex(cat => cat.pssstId === over.id)

    if (filteredOldIndex === -1 || filteredNewIndex === -1) return

    // Reorder the filtered categories
    const reorderedFiltered = arrayMove(filteredCategories, filteredOldIndex, filteredNewIndex)
    
    // Update positions in the filtered categories
    const updatedFiltered = reorderedFiltered.map((category, index) => ({
      ...category,
      pssstPosition: index
    }))

    // Update the main categories array with the new positions
    const updatedCategories = categories.map(cat => {
      const updatedFilteredCat = updatedFiltered.find(fc => fc.pssstId === cat.pssstId)
      return updatedFilteredCat || cat
    })

    setCategories(updatedCategories)

    // Update positions in the database
    try {
      const response = await fetch('/api/admin/category-three/reorder', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories: updatedCategories.map(category => ({
            id: category.pssstId,
            position: category.pssstPosition
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
            <h1 className="text-3xl font-bold text-gray-900">Category Three Management</h1>
            <p className="mt-2 text-gray-600">Manage your sub-subcategories</p>
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
                    {formatNumber(filteredCategories.reduce((sum, cat) => sum + cat.pssstTotalProduct, 0))}
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
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={paginatedCategories.map(category => category.pssstId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200">
                {paginatedCategories.map((category) => (
                  <SortableCategoryRow
                    key={category.pssstId}
                    category={category}
                    onDelete={handleDeleteClick}
                    onView={(slug) => console.log('View:', slug)}
                    onEdit={(slug) => console.log('Edit:', slug)}
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Generate Category Three from Products</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  This will analyze all products and create/update categories based on the <code className="bg-gray-100 px-1 rounded">category_3</code> field.
                </p>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">What will happen:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• New categories will be created for unique category_3 values</li>
                    <li>• Existing categories will be updated with current product counts</li>
                    <li>• Categories will be automatically positioned and slugified</li>
                    <li>• Parent categories (category_1 and category_2) will be linked</li>
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
                  Are you sure you want to delete the category <strong>{categoryToDelete.pssstSubsubcat}</strong>?
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

