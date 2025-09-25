import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
