import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "inactive"' },
        { status: 400 }
      )
    }

    const updatedBanner = await prisma.bannerBottomImages.update({
      where: {
        id: parseInt(id)
      },
      data: {
        status
      }
    })

    const response = NextResponse.json(updatedBanner)
    
    // Add cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error updating banner status:', error)
    return NextResponse.json(
      { error: 'Failed to update banner status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.bannerBottomImages.delete({
      where: {
        id: parseInt(id)
      }
    })

    const response = NextResponse.json({ success: true })
    
    // Add cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}