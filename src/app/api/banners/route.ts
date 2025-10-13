import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// import { broadcastBannerUpdate } from './events/route' // Disabled for now

// Validation schema for banner creation
const createBannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  link: z.string().refine((val) => {
    if (!val) return true // Optional field
    // Allow relative paths starting with /
    if (val.startsWith('/')) return true
    // Allow full URLs
    try {
      new URL(val)
      return true
    } catch {
      return false
    }
  }, 'Link URL must be a valid URL or relative path starting with /').optional(),
  isActive: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
  startDate: z.string().refine((val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Invalid start date').optional(),
  endDate: z.string().refine((val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Invalid end date').optional(),
}).refine((data) => {
  // Ensure either imageUrl or videoUrl is provided based on type
  if (data.type === 'IMAGE') {
    return data.imageUrl && data.imageUrl.trim() !== ''
  } else if (data.type === 'VIDEO') {
    return data.videoUrl && data.videoUrl.trim() !== ''
  }
  return false
}, {
  message: 'Image URL is required for IMAGE type, Video URL is required for VIDEO type',
  path: ['imageUrl', 'videoUrl']
}).refine((data) => {
  // Validate URL format based on type
  if (data.type === 'IMAGE' && data.imageUrl) {
    // Allow uploaded image URLs (starting with /images/banners/)
    if (data.imageUrl.startsWith('/images/banners/')) {
      return true
    }
    // Allow relative paths starting with /
    if (data.imageUrl.startsWith('/')) {
      return true
    }
    // Allow full URLs
    try {
      new URL(data.imageUrl)
      return true
    } catch {
      return false
    }
  } else if (data.type === 'VIDEO' && data.videoUrl) {
    // Allow uploaded video URLs (starting with /videos/banners/)
    if (data.videoUrl.startsWith('/videos/banners/')) {
      return true
    }
    // Allow relative paths starting with /
    if (data.videoUrl.startsWith('/')) {
      return true
    }
    // Allow full URLs
    try {
      new URL(data.videoUrl)
      return true
    } catch {
      return false
    }
  }
  return true
}, {
  message: 'Valid URL is required',
  path: ['imageUrl', 'videoUrl']
})

// GET - Fetch all banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminView = searchParams.get('admin') === 'true'
    
    // Check if this is an admin request
    if (adminView) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || (session.user as any)?.isAdmin
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin permissions required' },
          { status: 403 }
        )
      }

      // Return all banners for admin
      const banners = await prisma.banner.findMany({
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      const response = NextResponse.json({ 
        success: true, 
        data: banners 
      })
      
      // Disable caching for admin view to ensure fresh data
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    }

    // Return only active banners for public view
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const response = NextResponse.json({ 
      success: true, 
      data: banners 
    })
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60')
    response.headers.set('ETag', `"banners-${Date.now()}"`)
    response.headers.set('Last-Modified', new Date().toUTCString())
    
    return response
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

// POST - Create new banner
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createBannerSchema.parse(body)

    // Check for duplicate titles
    const existingBanner = await prisma.banner.findFirst({
      where: { title: validatedData.title }
    })

    if (existingBanner) {
      return NextResponse.json(
        { success: false, error: 'A banner with this title already exists' },
        { status: 400 }
      )
    }

    // Validate date range if both dates are provided
    if (validatedData.startDate && validatedData.endDate) {
      const startDate = new Date(validatedData.startDate)
      const endDate = new Date(validatedData.endDate)
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        )
      }
    }

    // Create banner
    const banner = await prisma.banner.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl || '',
        videoUrl: validatedData.videoUrl || '',
        type: validatedData.type,
        link: validatedData.link,
        isActive: validatedData.isActive,
        position: validatedData.position,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      }
    })

    const response = NextResponse.json({ 
      success: true, 
      banner,
      message: 'Banner created successfully' 
    })
    
    // Add cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Broadcast update to connected clients
    // broadcastBannerUpdate() // Disabled for now
    
    return response
  } catch (error) {
    console.error('Error creating banner:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}