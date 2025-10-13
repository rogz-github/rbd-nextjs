'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Link as LinkIcon,
  Palette
} from 'lucide-react'
import { AddBottomBannerModal } from '@/components/admin/AddBottomBannerModal'
import { EditBottomBannerModal } from '@/components/admin/EditBottomBannerModal'

interface BottomBannerImage {
  id: number
  bgColor?: string
  linkUrl?: string
  image?: string
  status: string
  created: string
}

export default function BottomBannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bannerImages, setBannerImages] = useState<BottomBannerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingImage, setEditingImage] = useState<BottomBannerImage | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)

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

  // Fetch banner images (all statuses for admin)
  const fetchBannerImages = async () => {
    try {
      const response = await fetch(`/api/bottom-banners?t=${Date.now()}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBannerImages(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching banner images:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchBannerImages()
    }
  }, [session])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/bottom-banners/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBannerImages(bannerImages.filter(img => img.id !== id))
        setDeleteConfirm(null)
        showToast('Banner image deleted successfully!', 'success')
        // Dispatch custom event to refresh homepage
        window.dispatchEvent(new CustomEvent('bannerUpdated'))
      } else {
        const result = await response.json()
        showToast(`Failed to delete banner image: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error deleting banner image:', error)
      showToast('Error deleting banner image. Please try again.', 'error')
    }
  }

  const handleImageAdded = () => {
    fetchBannerImages()
    showToast('Banner image created successfully!', 'success')
    // Dispatch custom event to refresh homepage
    window.dispatchEvent(new CustomEvent('bannerUpdated'))
  }

  const handleImageUpdated = () => {
    fetchBannerImages()
    showToast('Banner image updated successfully!', 'success')
    // Dispatch custom event to refresh homepage
    window.dispatchEvent(new CustomEvent('bannerUpdated'))
  }

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/bottom-banners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setBannerImages(bannerImages.map(img => 
          img.id === id ? { ...img, status: newStatus } : img
        ))
        showToast(`Banner ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success')
        // Dispatch custom event to refresh homepage
        window.dispatchEvent(new CustomEvent('bannerUpdated'))
      } else {
        const result = await response.json()
        showToast(`Failed to update status: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Error updating status. Please try again.', 'error')
    }
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bottom Banner Images</h1>
            <p className="mt-2 text-gray-600">Manage your bottom banner images (10 images max)</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={bannerImages.length >= 10}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              bannerImages.length >= 10
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Image
            {bannerImages.length >= 10 && (
              <span className="ml-2 text-xs">(Max 10)</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
                  <dd className="text-lg font-medium text-gray-900">{bannerImages.length}/10</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LinkIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">With Links</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bannerImages.filter(img => img.linkUrl).length}
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
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bannerImages.filter(img => img.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Images Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Banner Images</h3>
          
          {bannerImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No banner images</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first banner image.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bannerImages.map((image) => (
                <div key={image.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="relative">
                    {image.image ? (
                      <div 
                        className="relative h-48 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage({ url: image.image!, title: `Banner Image ${image.id}` })}
                      >
                        <Image
                          src={image.image}
                          alt={`Banner Image ${image.id}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full rounded-lg bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Background Color Preview */}
                    {image.bgColor && (
                      <div 
                        className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: image.bgColor }}
                        title={`Background: ${image.bgColor}`}
                      />
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">ID: {image.id}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          image.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {image.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusToggle(image.id, image.status)}
                          className={`${
                            image.status === 'active' 
                              ? 'text-orange-600 hover:text-orange-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={`${image.status === 'active' ? 'Deactivate' : 'Activate'} banner`}
                        >
                          {image.status === 'active' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingImage(image)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(image.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {image.linkUrl && (
                      <div className="flex items-center text-sm text-blue-600">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        <span className="truncate">{image.linkUrl}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created: {new Date(image.created).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && mounted && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 h-screen w-screen z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mt-4 mb-2">
                Delete Banner Image
              </h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                This action cannot be undone. The banner image will be permanently removed.
              </p>
            </div>
            
            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Delete
                </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Banner Modal */}
      <AddBottomBannerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleImageAdded}
      />

      {/* Edit Banner Modal */}
      <EditBottomBannerModal
        isOpen={!!editingImage}
        onClose={() => setEditingImage(null)}
        onSuccess={handleImageUpdated}
        image={editingImage}
      />

      {/* Image Preview Modal */}
      {previewImage && mounted && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 h-screen w-screen z-[10000] flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{previewImage?.title}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="relative w-full h-[70vh] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={previewImage?.url || ''}
                  alt={previewImage?.title || 'Preview'}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  priority
                  onError={() => {
                    console.error('Failed to load image:', previewImage?.url)
                    setPreviewImage(null)
                  }}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[10000]">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toast?.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast?.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast?.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        )}
    </div>
  )
}
