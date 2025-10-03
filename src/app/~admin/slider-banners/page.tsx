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
  GripVertical,
  X
} from 'lucide-react'
import { AddBannerModal } from '@/components/admin/AddBannerModal'
import { EditBannerModal } from '@/components/admin/EditBannerModal'
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

interface SliderBanner {
  id: number
  title: string
  description?: string
  imageUrl: string
  videoUrl?: string
  type: 'IMAGE' | 'VIDEO'
  link?: string
  isActive: boolean
  position: number
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// Sortable Row Component
function SortableBannerRow({ 
  banner, 
  onDelete, 
  onToggleActive, 
  onEdit,
  onActivate,
  onPreview
}: { 
  banner: SliderBanner
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
  onEdit: (banner: SliderBanner) => void
  onActivate: (id: number) => void
  onPreview: (url: string, title: string, type: 'IMAGE' | 'VIDEO') => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: banner.id,
    disabled: !banner.isActive // Disable dragging for inactive banners
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (!banner.isActive ? 0.6 : 1),
  }

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'z-50' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div 
            className="flex-shrink-0 h-16 w-24 relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              const url = banner.type === 'VIDEO' ? banner.videoUrl : banner.imageUrl
              if (url) {
                onPreview(url, banner.title, banner.type)
              }
            }}
          >
            {banner.type === 'VIDEO' ? (
              <video
                className="rounded-lg object-contain w-full h-full"
                src={banner.videoUrl}
                poster={banner.imageUrl}
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                className="rounded-lg object-contain"
                src={banner.imageUrl}
                alt={banner.title}
                fill
                sizes="96px"
              />
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{banner.title}</div>
        {banner.description && (
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {banner.description}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          banner.type === 'VIDEO' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {banner.type === 'VIDEO' ? 'Video' : 'Image'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleActive(banner.id, banner.isActive)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            banner.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {banner.isActive ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <GripVertical 
            className={`w-4 h-4 mr-2 ${
              banner.isActive 
                ? 'text-gray-400 cursor-grab active:cursor-grabbing' 
                : 'text-gray-200 cursor-not-allowed'
            }`}
            {...(banner.isActive ? attributes : {})} 
            {...(banner.isActive ? listeners : {})}
          />
          <span className={`text-sm ${banner.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
            {banner.position}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(banner.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(banner)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit className="w-4 h-4" />
          </button>
          {banner.isActive ? (
            <button
              onClick={() => onDelete(banner.id)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onActivate(banner.id)}
              className="text-green-600 hover:text-green-900"
              title="Activate banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function SliderBannersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [banners, setBanners] = useState<SliderBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<SliderBanner | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; type: 'IMAGE' | 'VIDEO' } | null>(null)

  // Toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000) // Auto hide after 4 seconds
  }

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.isAdmin) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners?admin=true')
      if (response.ok) {
        const data = await response.json()
        // Sort banners: active first by position, then inactive by position
          const sortedBanners = (data.data || []).sort((a: SliderBanner, b: SliderBanner) => {
            if (a.isActive && !b.isActive) return -1
            if (!a.isActive && b.isActive) return 1
            return a.position - b.position
          })
        setBanners(sortedBanners)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchBanners()
    }
  }, [session])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleDelete = async (id: number) => {
    try {
      // Find the banner to get its current data
      const bannerToUpdate = banners.find(banner => banner.id === id)
      if (!bannerToUpdate) {
        showToast('Banner not found', 'error')
        return
      }
      
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: false, 
          position: 10000,
          imageUrl: bannerToUpdate.imageUrl,
          videoUrl: bannerToUpdate.videoUrl,
          type: bannerToUpdate.type
        })
      })
      
      if (response.ok) {
        setBanners(banners.map(banner => 
          banner.id === id 
            ? { ...banner, isActive: false, position: 10000 }
            : banner
        ))
        setDeleteConfirm(null)
        showToast('Banner deactivated successfully!', 'success')
      } else {
        const result = await response.json()
        showToast(`Failed to deactivate banner: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error deactivating banner:', error)
      showToast('Error deactivating banner. Please try again.', 'error')
    }
  }

  const handleActivate = async (id: number) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: true,
          position: banners.filter(b => b.isActive).length // Set to next available position
        })
      })
      
      if (response.ok) {
        setBanners(banners.map(banner => 
          banner.id === id 
            ? { ...banner, isActive: true, position: banners.filter(b => b.isActive).length }
            : banner
        ))
        showToast('Banner activated successfully!', 'success')
      } else {
        const result = await response.json()
        showToast(`Failed to activate banner: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error activating banner:', error)
      showToast('Error activating banner. Please try again.', 'error')
    }
  }

  const handleBannerAdded = () => {
    fetchBanners() // Refresh the banners list
    showToast('Banner created successfully!', 'success')
  }

  const handleBannerUpdated = () => {
    fetchBanners() // Refresh the banners list
    showToast('Banner updated successfully!', 'success')
  }

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (response.ok) {
        setBanners(banners.map(banner => 
          banner.id === id ? { ...banner, isActive: !isActive } : banner
        ))
      }
    } catch (error) {
      console.error('Error updating banner:', error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      // Only work with active banners
      const activeBanners = banners.filter(banner => banner.isActive)
      const inactiveBanners = banners.filter(banner => !banner.isActive)
      
      const oldIndex = activeBanners.findIndex(banner => banner.id === active.id)
      const newIndex = activeBanners.findIndex(banner => banner.id === over?.id)

      // Only proceed if both banners are active
      if (oldIndex === -1 || newIndex === -1) return

      const newActiveBanners = arrayMove(activeBanners, oldIndex, newIndex)
      
      // Update positions only for active banners
      const updatedActiveBanners = newActiveBanners.map((banner, index) => ({
        ...banner,
        position: index
      }))

      // Combine active and inactive banners
      const updatedBanners = [...updatedActiveBanners, ...inactiveBanners]
      setBanners(updatedBanners)

      // Update positions in the database (only active banners)
      try {
        const response = await fetch('/api/banners/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            banners: updatedActiveBanners.map(banner => ({
              id: banner.id,
              position: banner.position
            }))
          })
        })

        if (!response.ok) {
          console.error('Failed to update banner positions')
          // Revert on error
          fetchBanners()
        }
      } catch (error) {
        console.error('Error updating banner positions:', error)
        // Revert on error
        fetchBanners()
      }
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
              <h1 className="text-3xl font-bold text-gray-900">Slider Banners</h1>
              <p className="mt-2 text-gray-600">Manage your homepage slider banners</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Banners</dt>
                    <dd className="text-lg font-medium text-gray-900">{banners.length}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Banners</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {banners.filter(b => b.isActive).length}
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
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Inactive Banners</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {banners.filter(b => !b.isActive).length}
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
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {banners.filter(b => b.startDate || b.endDate).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banners Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Banners</h3>
            
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No banners</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new banner.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Banner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={banners.filter(banner => banner.isActive).map(banner => banner.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="bg-white divide-y divide-gray-200">
                        {banners.map((banner) => (
                          <SortableBannerRow
                            key={banner.id}
                            banner={banner}
                            onDelete={setDeleteConfirm}
                            onToggleActive={toggleActive}
                            onEdit={setEditingBanner}
                            onActivate={handleActivate}
                            onPreview={(url, title, type) => setPreviewImage({ url, title, type })}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </DndContext>
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
                  Deactivate Banner
                </h3>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  This banner will be hidden from the frontend and removed from the ordering system. 
                  You can reactivate it later if needed.
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
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Add Banner Modal */}
        <AddBannerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleBannerAdded}
        />

        {/* Edit Banner Modal */}
        <EditBannerModal
          isOpen={!!editingBanner}
          onClose={() => setEditingBanner(null)}
          onSuccess={handleBannerUpdated}
          banner={editingBanner}
        />

        {/* Image/Video Preview Modal */}
        {previewImage && mounted && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-75 h-screen w-screen z-[10000] flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{previewImage.title}</h3>
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
                  {previewImage.type === 'IMAGE' ? (
                    <Image
                      src={previewImage.url}
                      alt={previewImage.title}
                      width={800}
                      height={600}
                      className="max-w-full max-h-full object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                      priority
                      onError={() => {
                        console.error('Failed to load image:', previewImage.url)
                        setPreviewImage(null)
                      }}
                    />
                  ) : (
                    <video
                      src={previewImage.url}
                      controls
                      className="max-w-full max-h-full object-contain"
                      autoPlay
                      onError={() => {
                        console.error('Failed to load video:', previewImage.url)
                        setPreviewImage(null)
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
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
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
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
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
