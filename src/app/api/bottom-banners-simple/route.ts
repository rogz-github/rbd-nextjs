import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/bottom-banners-simple - Create new bottom banner image (simplified)
export async function POST(request: NextRequest) {
  try {
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { bgColor, linkUrl, image } = body

    // Simple validation
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    
    const bannerImage = await prisma.bannerBottomImages.create({
      data: {
        bgColor: bgColor || null,
        linkUrl: linkUrl || null,
        image: image
      }
    })


    return NextResponse.json({
      success: true,
      data: bannerImage,
      message: 'Bottom banner image created successfully'
    })
  } catch (error) {
    console.error('Error creating bottom banner image:', error)
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorName = error instanceof Error ? error.name : 'Unknown'
    const errorCode = (error as any)?.code || 'UNKNOWN'
    const errorMeta = (error as any)?.meta || null
    const errorStack = error instanceof Error ? error.stack : undefined
    
 
    
    return NextResponse.json(
      { 
        error: 'Failed to create bottom banner image', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
