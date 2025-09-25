import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Order } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    console.log('=== ORDER CREATION DEBUG ===')
    console.log('Raw order data received:', JSON.stringify(orderData, null, 2))
    console.log('User ID:', orderData.userId, 'Type:', typeof orderData.userId)
    console.log('User Type:', orderData.userType)
    console.log('Amount:', orderData.amount)
    console.log('Cart Items Count:', orderData.cartItems?.length || 0)
    console.log('Status:', orderData.status)
    
    // Validate required fields
    if (!orderData.amount || orderData.amount <= 0) {
      console.error('Invalid amount')
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid amount',
          error: 'Amount is required and must be greater than 0'
        },
        { status: 400 }
      )
    }
    
    // Map the new order data to the actual database schema
    const mappedData: any = {
      coOrderId: `ORDER-${Date.now()}`,
      coUserId: parseInt(orderData.userId) || 0,
      coType: orderData.userType || 'guest',
      coNotes: `PayPal Order - ${Date.now()}`,
      coSubtotal: parseFloat((orderData.orderDetails?.subtotal || orderData.amount || 0).toString()),
      coTotalDiscount: 0,
      coTotalPrice: parseFloat((orderData.amount || 0).toString()),
      coPaymentType: 'PayPal',
      coStatus: orderData.status === 'captured' ? 'Processing' : 'Pending',
      coCreated: new Date().toISOString(),
      orderItems: JSON.stringify(orderData.cartItems || []),
      shippingAddress: JSON.stringify(orderData.orderDetails?.shippingAddress || {}),
      billingAddress: JSON.stringify(orderData.orderDetails?.billingAddress || {}),
      totalItems: orderData.cartItems?.length || 0,
      paypalResponse: orderData.paypalResponse || null
    }
    
    console.log('Mapped data for database:', JSON.stringify(mappedData, null, 2))
    
    const order = await prisma.order.create({
      data: mappedData
    })

    console.log('Order created successfully with ID:', order.coId)
    console.log('=== ORDER CREATION SUCCESS ===')
    
    return NextResponse.json({ 
      success: true, 
      id: order.coId,
      orderNumber: orderData.orderDetails?.orderNumber || `ORD-${order.coId}`,
      message: 'Order created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('=== END ERROR ===')
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
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
      where: { coUserId: parseInt(userId) },
      orderBy: { coCreated: 'desc' as const }
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
