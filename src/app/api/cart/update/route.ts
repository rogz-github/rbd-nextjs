import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { cartItemId, quantity, guestUserId } = await request.json()

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

    // Update cart item quantity
    const result = await prisma.$executeRaw`
      UPDATE "Cart" 
      SET "prod_quantity" = ${quantity},
          "updatedAt" = NOW()
      WHERE id = ${cartItemId}
      AND "user_type" = ${userType} 
      AND "user_id" = ${userId}
      AND status = 'active'
    `

    if (result === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found or unauthorized' },
        { status: 404 }
      )
    }

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
