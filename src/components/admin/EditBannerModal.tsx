'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Upload, Image as ImageIcon, Calendar, Link, Eye, EyeOff } from 'lucide-react'

interface EditBannerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  banner: {
    id: number
    title: string
    description?: string
    imageUrl: string
    videoUrl?: string
    link?: string
    isActive: boolean
    position: number
    startDate?: string
    endDate?: string
    type: 'IMAGE' | 'VIDEO'
  } | null
}

interface FormData {
  title: string
  description: string
  imageUrl: string
  videoUrl: string
  linkUrl: string
  isActive: boolean
  position: number
  startDate: string
  endDate: string
  type: 'IMAGE' | 'VIDEO'
}

interface FormErrors {
  [key: string]: string
}

export function EditBannerModal({ isOpen, onClose, onSuccess, banner }: EditBannerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    linkUrl: '',
    isActive: true,
    position: 0,
    startDate: '',
    endDate: '',
    type: 'IMAGE'
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when banner changes
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        imageUrl: banner.imageUrl || '',
        videoUrl: banner.videoUrl || '',
        linkUrl: banner.link || '',
        isActive: banner.isActive,
        position: banner.position,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        type: banner.type
      })
      
      // Set preview URL based on banner type
      if (banner.type === 'VIDEO' && banner.videoUrl) {
        setPreviewUrl(banner.videoUrl)
      } else if (banner.type === 'IMAGE' && banner.imageUrl) {
        setPreviewUrl(banner.imageUrl)
      } else {
        setPreviewUrl('')
      }
    }
  }, [banner])

  useEffect(() => {
    setMounted(true)
  }, [])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      isActive: true,
      position: 0,
      startDate: '',
      endDate: '',
      type: 'IMAGE'
    })
    setErrors({})
    setPreviewUrl('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']

  const handleFileUpload = async (file: File) => {
    if (!file) return

    const isImage = allowedImageTypes.includes(file.type)
    const isVideo = allowedVideoTypes.includes(file.type)

    if (!isImage && !isVideo) {
      setErrors({ file: 'Please select a valid image or video file' })
      return
    }

    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      const maxSizeMB = isImage ? 5 : 50
      setErrors({ file: `File size must be less than ${maxSizeMB}MB` })
      return
    }

    setUploading(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        if (isImage) {
          setFormData(prev => ({ ...prev, imageUrl: result.url, type: 'IMAGE' }))
        } else {
          setFormData(prev => ({ ...prev, videoUrl: result.url, type: 'VIDEO' }))
        }
        setPreviewUrl(result.url)
      } else {
        setErrors({ file: result.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ file: 'Upload failed. Please try again.' })
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
    if (formData.type === 'IMAGE') {
      setFormData(prev => ({ ...prev, imageUrl: url }))
    } else {
      setFormData(prev => ({ ...prev, videoUrl: url }))
    }
    setPreviewUrl(url)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return url.startsWith('/')
    }
  }

  const isValidVideoUrl = (url: string) => {
    if (!url) return true
    return isValidUrl(url) && (url.includes('video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg'))
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.type === 'IMAGE') {
      if (!formData.imageUrl.trim()) {
        newErrors.imageUrl = 'Image URL is required'
      } else if (!isValidUrl(formData.imageUrl)) {
        newErrors.imageUrl = 'Please enter a valid image URL'
      }
    } else {
      if (!formData.videoUrl.trim()) {
        newErrors.videoUrl = 'Video URL is required'
      } else if (!isValidVideoUrl(formData.videoUrl)) {
        newErrors.videoUrl = 'Please enter a valid video URL'
      }
    }

    if (formData.linkUrl && !isValidUrl(formData.linkUrl)) {
      newErrors.linkUrl = 'Please enter a valid link URL'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch(`/api/banners/${banner?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.type === 'IMAGE' ? formData.imageUrl : '',
          videoUrl: formData.type === 'VIDEO' ? formData.videoUrl : '',
          link: formData.linkUrl,
          isActive: formData.isActive,
          position: formData.position,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          type: formData.type
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Show success message (you can implement toast here if needed)
        onSuccess()
        handleClose()
      } else {
        setErrors({ submit: result.error || 'Failed to update banner' })
      }
    } catch (error) {
      console.error('Update error:', error)
      setErrors({ submit: 'Failed to update banner. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !isOpen || !banner) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 h-screen w-screen z-[9999] flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Edit Banner</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="IMAGE"
                    checked={formData.type === 'IMAGE'}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'IMAGE' | 'VIDEO' }))}
                    className="mr-2"
                  />
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Image
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="VIDEO"
                    checked={formData.type === 'VIDEO'}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'IMAGE' | 'VIDEO' }))}
                    className="mr-2"
                  />
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Video
                </label>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {formData.type === 'IMAGE' ? 'Image' : 'Video'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={formData.type === 'IMAGE' ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
                {errors.file && (
                  <span className="text-sm text-red-600">{errors.file}</span>
                )}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'IMAGE' ? 'Image' : 'Video'} URL
              </label>
              <input
                type="url"
                name={formData.type === 'IMAGE' ? 'imageUrl' : 'videoUrl'}
                value={formData.type === 'IMAGE' ? formData.imageUrl : formData.videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={`Enter ${formData.type === 'IMAGE' ? 'image' : 'video'} URL`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.imageUrl && (
                <span className="text-sm text-red-600">{errors.imageUrl}</span>
              )}
              {errors.videoUrl && (
                <span className="text-sm text-red-600">{errors.videoUrl}</span>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  {formData.type === 'IMAGE' ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={600}
                      height={400}
                      className="w-full h-auto rounded"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-auto rounded"
                      style={{ maxHeight: '400px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter banner title"
              />
              {errors.title && (
                <span className="text-sm text-red-600">{errors.title}</span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter banner description"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="inline h-4 w-4 mr-1" />
                Link URL
              </label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter link URL (optional)"
              />
              {errors.linkUrl && (
                <span className="text-sm text-red-600">{errors.linkUrl}</span>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.endDate && (
                  <span className="text-sm text-red-600">{errors.endDate}</span>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Banner'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
