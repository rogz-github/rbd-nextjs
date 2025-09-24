import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    // Create order with PayPal integration structure
    const order = await prisma.order.create({
      data: {
        paypalOrderId: orderData.paypalOrderId,
        status: orderData.status || 'created',
        amount: orderData.amount,
        currency: orderData.currency || 'USD',
        userId: orderData.userId,
        userType: orderData.userType || 'guest',
        cartItems: orderData.cartItems,
        paypalResponse: orderData.paypalResponse,
        captureId: orderData.captureId,
        capturedAt: orderData.capturedAt ? new Date(orderData.capturedAt) : null
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
