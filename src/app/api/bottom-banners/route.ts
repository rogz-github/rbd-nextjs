import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bottom-banners - Get all bottom banner images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bannerImages = await prisma.bannerBottomImages.findMany({
      orderBy: {
        created: 'desc'
      }
    })

    const response = NextResponse.json({
      success: true,
      data: bannerImages
    })
    
    // Disable caching for admin view to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching bottom banner images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bottom banner images' },
      { status: 500 }
    )
  }
}

// POST /api/bottom-banners - Create new bottom banner image
export async function POST(request: NextRequest) {
  try {
    console.log('Bottom banner POST request received')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', { user: session?.user?.email, isAdmin: session?.user?.isAdmin })
    
    if (!session?.user?.isAdmin) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    const { bgColor, linkUrl, image } = body

    // Check if we already have 3 images (max limit)
    const existingCount = await prisma.bannerBottomImages.count()
    if (existingCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum of 3 bottom banner images allowed' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    // Validate background color format if provided
    if (bgColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(bgColor)) {
      return NextResponse.json(
        { error: 'Invalid background color format. Use hex format (e.g., #FF0000)' },
        { status: 400 }
      )
    }

    // Validate URL format if provided
    if (linkUrl && !isValidUrl(linkUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log('Creating banner image with data:', { bgColor, linkUrl, image })
    
    const bannerImage = await prisma.bannerBottomImages.create({
      data: {
        bgColor: bgColor || null,
        linkUrl: linkUrl || null,
        image: image
      }
    })

    console.log('Banner image created successfully:', bannerImage)

    const response = NextResponse.json({
      success: true,
      data: bannerImage,
      message: 'Bottom banner image created successfully'
    })
    
    // Add cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error creating bottom banner image:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to create bottom banner image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}
