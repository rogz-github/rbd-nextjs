import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { cartItemId, quantity, guestUserId } = await request.json()

    console.log('Cart update request:', { cartItemId, quantity, guestUserId, session: !!session })

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: 'Cart item ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be greater than 0' },
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

    console.log('User info:', { userType, userId })

    // Update cart item quantity using Prisma ORM
    console.log('Executing update query with:', { cartItemId, quantity, userType, userId })
    
    // First, check if the cart item exists and belongs to the user
    const existingItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userType: userType,
        userId: userId,
        status: 'active'
      }
    })

    console.log('Existing cart item found:', existingItem)

    if (!existingItem) {
      console.log('No cart item found or unauthorized')
      return NextResponse.json(
        { success: false, message: 'Cart item not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the cart item
    const updatedItem = await prisma.cart.update({
      where: { id: cartItemId },
      data: {
        prodQuantity: quantity,
        updatedAt: new Date()
      }
    })

    console.log('Cart item updated successfully:', updatedItem)
    
    // Verify the update by fetching the item again
    const verifyItem = await prisma.cart.findUnique({
      where: { id: cartItemId }
    })
    console.log('Verification - cart item after update:', verifyItem)
    
    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully'
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
