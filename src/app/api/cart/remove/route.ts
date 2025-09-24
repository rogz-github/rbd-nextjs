import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')

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
    } else {
      return NextResponse.json(
        { success: false, message: 'User session required' },
        { status: 401 }
      )
    }

    // Remove cart item (soft delete by setting status to 'removed')
    const result = await prisma.$executeRaw`
      UPDATE "Cart" 
      SET status = 'removed',
          "updatedAt" = NOW()
      WHERE id = ${cartItemId}
      AND "user_type" = ${userType} 
      AND "user_id" = ${userId}
    `

    if (result === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    })
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
