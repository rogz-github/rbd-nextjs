'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Upload, Image as ImageIcon, Calendar, Link, Eye, EyeOff } from 'lucide-react'

interface AddBannerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  title: string
  description: string
  imageUrl: string
  videoUrl: string
  linkUrl: string
  isActive: boolean
  order: number
  startDate: string
  endDate: string
  type: 'IMAGE' | 'VIDEO'
}

interface FormErrors {
  [key: string]: string
}

export function AddBannerModal({ isOpen, onClose, onSuccess }: AddBannerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    linkUrl: '',
    isActive: true,
    order: 0,
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

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      isActive: true,
      order: 0,
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    // Validate based on banner type
    if (formData.type === 'IMAGE') {
      if (!formData.imageUrl.trim()) {
        newErrors.imageUrl = 'Image is required - please upload a file or enter an image URL'
      } else if (!isValidImageUrl(formData.imageUrl)) {
        newErrors.imageUrl = 'Please enter a valid image URL or upload a file'
      }
    } else if (formData.type === 'VIDEO') {
      if (!formData.videoUrl.trim()) {
        newErrors.videoUrl = 'Video is required - please upload a file or enter a video URL'
      } else if (!isValidVideoUrl(formData.videoUrl)) {
        newErrors.videoUrl = 'Please enter a valid video URL or upload a file'
      }
    }

    if (formData.linkUrl && !isValidUrl(formData.linkUrl)) {
      newErrors.linkUrl = 'Please enter a valid URL'
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    if (formData.order < 0) {
      newErrors.order = 'Order must be 0 or greater'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    // Allow relative paths starting with /
    if (url.startsWith('/')) {
      return true
    }
    
    // Allow full URLs
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidImageUrl = (url: string): boolean => {
    // Allow uploaded image URLs (starting with /images/banners/)
    if (url.startsWith('/images/banners/')) {
      return true
    }
    
    // Allow relative paths starting with /
    if (url.startsWith('/')) {
      return true
    }
    
    // Allow full URLs
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidVideoUrl = (url: string): boolean => {
    // Allow uploaded video URLs (starting with /videos/banners/)
    if (url.startsWith('/videos/banners/')) {
      return true
    }
    
    // Allow relative paths starting with /
    if (url.startsWith('/')) {
      return true
    }
    
    // Allow full URLs
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setErrors({})

    try {
      // Validate file type
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']
      const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]
      
      if (!allowedTypes.includes(file.type)) {
        setErrors({ imageUrl: 'Only JPEG, PNG, WebP, GIF, MP4, WebM, and OGG files are allowed' })
        return
      }

      // Validate file size based on type
      const isVideo = allowedVideoTypes.includes(file.type)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024 // 50MB for videos, 5MB for images
      const maxSizeMB = isVideo ? 50 : 5

      if (file.size > maxSize) {
        setErrors({ imageUrl: `File size must be less than ${maxSizeMB}MB` })
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
        // Update the appropriate URL field based on file type
        if (isVideo) {
          setFormData(prev => ({ 
            ...prev, 
            videoUrl: result.url,
            type: 'VIDEO',
            imageUrl: '' // Clear image URL when uploading video
          }))
        } else {
          setFormData(prev => ({ 
            ...prev, 
            imageUrl: result.url,
            type: 'IMAGE',
            videoUrl: '' // Clear video URL when uploading image
          }))
        }
        setPreviewUrl(result.url)
        // Clear any existing errors
        setErrors(prev => ({ ...prev, imageUrl: '', videoUrl: '' }))
      } else {
        setErrors({ imageUrl: result.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ imageUrl: 'Upload failed. Please try again.' })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order.toString()),
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        if (result.details) {
          const newErrors: FormErrors = {}
          result.details.forEach((detail: any) => {
            newErrors[detail.field] = detail.message
          })
          setErrors(newErrors)
        } else {
          setErrors({ general: result.error || 'Failed to create banner' })
        }
      }
    } catch (error) {
      console.error('Error creating banner:', error)
      setErrors({ general: 'Failed to create banner. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 h-screen w-screen z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">Add New Banner</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter banner title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter banner description (optional)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Banner Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Type *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="IMAGE"
                    checked={formData.type === 'IMAGE'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Image</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="VIDEO"
                    checked={formData.type === 'VIDEO'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Video</span>
                </label>
              </div>
            </div>

            {/* Image/Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'IMAGE' ? 'Banner Image *' : 'Banner Video *'}
              </label>
              
              {/* File Upload Section */}
              <div className="space-y-4">
                {/* Upload Options */}
                <div className="flex flex-col sm:flex-row gap-4">
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
                    className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </span>
                  </button>
                  
                  <div className="flex items-center">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="px-3 text-sm text-gray-500">or</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  
                  <input
                    type="text"
                    name={formData.type === 'IMAGE' ? 'imageUrl' : 'videoUrl'}
                    value={formData.type === 'IMAGE' ? formData.imageUrl : formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder={
                      formData.type === 'IMAGE' 
                        ? (formData.imageUrl ? "Image URL (auto-filled from upload)" : "Enter image URL manually")
                        : (formData.videoUrl ? "Video URL (auto-filled from upload)" : "Enter video URL manually")
                    }
                    className={`flex-1 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (formData.type === 'IMAGE' ? errors.imageUrl : errors.videoUrl)
                        ? 'border-red-300' 
                        : (formData.type === 'IMAGE' ? formData.imageUrl : formData.videoUrl)
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300'
                    }`}
                    disabled={!!(formData.type === 'IMAGE' ? formData.imageUrl : formData.videoUrl)}
                  />
                </div>

                {/* Image/Video Preview */}
                {(previewUrl || (formData.type === 'IMAGE' ? formData.imageUrl : formData.videoUrl)) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="relative w-full h-80">
                      {formData.type === 'IMAGE' ? (
                        <Image
                          src={previewUrl || formData.imageUrl}
                          alt="Banner preview"
                          fill
                          className="object-contain rounded-lg border-2 border-gray-200"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <video
                          src={previewUrl || formData.videoUrl}
                          controls
                          className="w-full h-full object-contain rounded-lg border-2 border-gray-200"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl('')
                          setFormData(prev => ({ 
                            ...prev, 
                            imageUrl: '', 
                            videoUrl: '',
                            type: 'IMAGE'
                          }))
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {(errors.imageUrl || errors.videoUrl) && (
                <p className="mt-2 text-sm text-red-600">
                  {formData.type === 'IMAGE' ? errors.imageUrl : errors.videoUrl}
                </p>
              )}
            </div>

            {/* Link URL */}
            <div>
              <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="linkUrl"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.linkUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="/products/example or https://example.com"
                />
              </div>
              {errors.linkUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.linkUrl}</p>
              )}
            </div>

            {/* Order and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.order ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.order && (
                  <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Banner is Active
                  </label>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Schedule (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Banner'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
