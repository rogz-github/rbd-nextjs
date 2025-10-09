import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/cart/clear - Clear all cart items for a user after checkout
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType') || 'guest'

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User ID is required' 
        },
        { status: 400 }
      )
    }

    // Delete all cart items for the user
    const result = await prisma.cart.deleteMany({
      where: {
        userId: parseInt(userId),
        userType: userType
      }
    })

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} cart items successfully`,
      deletedCount: result.count
    })
  } catch (error) {
    console.error('Error clearing cart items:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear cart items',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/cart/clear - Clear cart items by IDs (for specific items)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItemIds } = body

    if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cart item IDs are required' 
        },
        { status: 400 }
      )
    }

    // Delete specific cart items by IDs
    const result = await prisma.cart.deleteMany({
      where: {
        id: {
          in: cartItemIds.map(id => parseInt(id))
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} cart items successfully`,
      deletedCount: result.count
    })
  } catch (error) {
    console.error('Error deleting cart items:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete cart items',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
