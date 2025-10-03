import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// Note: Real-time updates disabled for now

// Validation schema for banner updates
const updateBannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  imageUrl: z.string().nullable().optional().refine((val) => {
    // Allow empty string or null for video banners
    if (!val || val === '' || val === null) {
      return true
    }
    // Allow uploaded image URLs (starting with /images/banners/)
    if (val.startsWith('/images/banners/')) {
      return true
    }
    // Allow uploaded video URLs (starting with /videos/banners/)
    if (val.startsWith('/videos/banners/')) {
      return true
    }
    // Allow relative paths starting with /
    if (val.startsWith('/')) {
      return true
    }
    // Allow full URLs
    try {
      new URL(val)
      return true
    } catch {
      return false
    }
  }, 'Valid image URL is required').optional(),
  videoUrl: z.string().nullable().optional(),
  type: z.enum(['IMAGE', 'VIDEO']).optional(),
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
  isActive: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
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
})

// GET - Fetch single banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Convert ID to integer
    const bannerId = parseInt(params.id)
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.findUnique({
      where: { id: bannerId }
    })

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      banner 
    })
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

// PATCH - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Convert ID to integer
    const bannerId = parseInt(params.id)
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateBannerSchema.parse(body)

    // Check for duplicate titles (excluding current banner)
    if (validatedData.title) {
      const duplicateBanner = await prisma.banner.findFirst({
        where: { 
          title: validatedData.title,
          id: { not: bannerId }
        }
      })

      if (duplicateBanner) {
        return NextResponse.json(
          { success: false, error: 'A banner with this title already exists' },
          { status: 400 }
        )
      }
    }

    // Validate date range if both dates are provided
    const startDate = validatedData.startDate ? new Date(validatedData.startDate) : existingBanner.startDate
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : existingBanner.endDate
    
    if (startDate && endDate && startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Update banner
    const updateData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      updatedAt: new Date(),
    }
    
    const banner = await prisma.banner.update({
      where: { id: bannerId },
      data: updateData
    })

    const response = NextResponse.json({ 
      success: true, 
      banner,
      message: 'Banner updated successfully' 
    })
    
    // Add cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Broadcast update to connected clients
    // broadcastBannerUpdate() // Disabled for now
    
    return response
  } catch (error) {
    console.error('Error updating banner:', error)
    
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
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

// DELETE - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Convert ID to integer
    const bannerId = parseInt(params.id)
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      )
    }

    // Delete banner
    await prisma.banner.delete({
      where: { id: bannerId }
    })

    const response = NextResponse.json({ 
      success: true,
      message: 'Banner deleted successfully' 
    })
    
    // Add cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Broadcast update to connected clients
    // broadcastBannerUpdate() // Disabled for now
    
    return response
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
