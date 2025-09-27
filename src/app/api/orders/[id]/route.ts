import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptOrderData } from '@/lib/encryption'

// Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions)
    
    const order = await prisma.order.findFirst({
      where: { 
        coId: parseInt(params.id)
      }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Security: Only allow users to access their own orders
    // For authenticated users, verify they own this order
    if (session?.user?.id && parseInt(session.user.id) !== order.coUserId) {
      console.error('Unauthorized access attempt to order:', params.id, 'by user:', session.user.id)
      return NextResponse.json(
        { message: 'Unauthorized access to order' },
        { status: 403 }
      )
    }

    // For guest users, we'll allow access (they might have the order ID from email)
    // but we should consider adding additional validation like email verification

    // Decrypt sensitive data before returning
    const decryptedOrder = decryptOrderData(order)

    return NextResponse.json(decryptedOrder)
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
