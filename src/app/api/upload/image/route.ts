import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB for videos

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || (session.user as any)?.isAdmin
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin permissions required' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, MP4, WebM, and OGG files are allowed' 
        },
        { status: 400 }
      )
    }

    // Validate file size based on type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideoFile = ALLOWED_VIDEO_TYPES.includes(file.type)
    const maxSize = isImage ? MAX_IMAGE_SIZE : isVideoFile ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    const maxSizeMB = isImage ? 5 : 50

    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size is ${maxSizeMB}MB` 
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`

    // Create appropriate directory based on file type
    const subDir = isVideoFile ? 'videos' : 'images'
    const bannersDir = join(process.cwd(), 'public', subDir, 'banners')
    
    if (!existsSync(bannersDir)) {
      await mkdir(bannersDir, { recursive: true })
    }

    // Save file
    const filePath = join(bannersDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Return the public URL
    const publicUrl = `/${subDir}/banners/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
      isVideo: isVideoFile
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
