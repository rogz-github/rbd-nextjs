import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG CART TABLE ===')
    
    // Get all cart items
    const allCartItems = await prisma.cart.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('All cart items in database:', allCartItems)
    
    return NextResponse.json({
      success: true,
      message: 'Cart debug data retrieved',
      data: {
        totalItems: allCartItems.length,
        items: allCartItems.map(item => ({
          id: item.id,
          userType: item.userType,
          userId: item.userId,
          prodId: item.prodId,
          prodQuantity: item.prodQuantity,
          status: item.status,
          createdAt: item.createdAt,
          productName: item.product?.name || 'Unknown'
        }))
      }
    })
  } catch (error) {
    console.error('Error debugging cart:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to debug cart', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
