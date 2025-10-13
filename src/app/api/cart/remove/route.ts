import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')
    const guestUserId = searchParams.get('guestUserId')

    if (!cartItemId) {
      return NextResponse.json(
        { success: false, message: 'Cart item ID is required' },
        { status: 400 }
      )
    }

    // Determine user type and ID
    let userType = 'guest'
    let userId = 0

    if (session?.user?.id) {
      userType = 'authenticated'
      userId = parseInt(session.user.id)
    } else if (guestUserId) {
      userType = 'guest'
      userId = parseInt(guestUserId)
    } else {
      return NextResponse.json(
        { success: false, message: 'User session or guest user ID required' },
        { status: 401 }
      )
    }

    // Remove cart item using Prisma ORM (soft delete by setting status to 'removed')
    console.log('Removing cart item:', { cartItemId, userType, userId })
    
    // First, check if the cart item exists and belongs to the user
    const existingItem = await prisma.cart.findFirst({
      where: {
        id: parseInt(cartItemId),
        userType: userType,
        userId: userId,
        status: 'active'
      }
    })

    console.log('Existing cart item found for removal:', existingItem)

    if (!existingItem) {
      console.log('No cart item found or unauthorized for removal')
      return NextResponse.json(
        { success: false, message: 'Cart item not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the cart item status to 'removed'
    const updatedItem = await prisma.cart.update({
      where: { id: parseInt(cartItemId) },
      data: {
        status: 'removed',
        updatedAt: new Date()
      }
    })

    console.log('Cart item removed successfully:', updatedItem)

    const response = NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    })

    // Add cache-busting headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to remove cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
