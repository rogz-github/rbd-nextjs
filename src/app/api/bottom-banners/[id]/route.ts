import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bottom-banners/[id] - Get single bottom banner image
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const bannerImage = await prisma.bannerBottomImages.findUnique({
      where: { id }
    })

    if (!bannerImage) {
      return NextResponse.json({ error: 'Banner image not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: bannerImage
    })
  } catch (error) {
    console.error('Error fetching bottom banner image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bottom banner image' },
      { status: 500 }
    )
  }
}

// PUT /api/bottom-banners/[id] - Update bottom banner image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { bgColor, linkUrl, image } = body

    // Check if banner image exists
    const existingImage = await prisma.bannerBottomImages.findUnique({
      where: { id }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Banner image not found' }, { status: 404 })
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

    const updatedImage = await prisma.bannerBottomImages.update({
      where: { id },
      data: {
        bgColor: bgColor || null,
        linkUrl: linkUrl || null,
        image: image
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedImage,
      message: 'Bottom banner image updated successfully'
    })
  } catch (error) {
    console.error('Error updating bottom banner image:', error)
    return NextResponse.json(
      { error: 'Failed to update bottom banner image' },
      { status: 500 }
    )
  }
}

// DELETE /api/bottom-banners/[id] - Delete bottom banner image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Check if banner image exists
    const existingImage = await prisma.bannerBottomImages.findUnique({
      where: { id }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Banner image not found' }, { status: 404 })
    }

    await prisma.bannerBottomImages.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Bottom banner image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting bottom banner image:', error)
    return NextResponse.json(
      { error: 'Failed to delete bottom banner image' },
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
