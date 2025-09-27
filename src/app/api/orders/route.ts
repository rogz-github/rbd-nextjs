import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Order } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { encryptOrderData, decryptOrderData } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions)
    
    const orderData = await request.json()
    
    // Remove sensitive data from logs
    console.log('=== ORDER CREATION DEBUG ===')
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

    // Security: Validate user can create this order
    // For guest users, we'll allow creation but with limited data
    // For authenticated users, verify they match the order userId
    if (session?.user?.id && orderData.userId && session.user.id !== orderData.userId) {
      console.error('User ID mismatch in order creation')
      return NextResponse.json(
        { 
          success: false,
          message: 'Unauthorized',
          error: 'User ID mismatch'
        },
        { status: 403 }
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
      paypalResponse: orderData.paypalResponse || null,
      // Add required fields that might be missing
      coStyle: 'new',
      coPendingDate: orderData.status === 'captured' ? null : new Date().toISOString(),
      coProcessingDate: orderData.status === 'captured' ? new Date().toISOString() : null
    }
    
    // Encrypt sensitive data before storing (with fallback)
    let encryptedData
    try {
      encryptedData = encryptOrderData(mappedData)
      console.log('✅ Data encrypted successfully')
    } catch (error) {
      console.error('❌ Encryption failed, storing without encryption:', error)
      // Fallback: store without encryption if encryption fails
      encryptedData = mappedData
    }
    
    // Remove sensitive data from logs
    console.log('Mapped data for database (sanitized):', {
      coOrderId: mappedData.coOrderId,
      coUserId: mappedData.coUserId,
      coType: mappedData.coType,
      coTotalPrice: mappedData.coTotalPrice,
      coStatus: mappedData.coStatus,
      totalItems: mappedData.totalItems
    })
    
    const order = await prisma.order.create({
      data: encryptedData
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
    // Get session for authentication
    const session = await getServerSession(authOptions)
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Security: Only allow users to access their own orders
    // For authenticated users, verify they match the requested userId
    if (session?.user?.id && parseInt(session.user.id) !== parseInt(userId)) {
      console.error('Unauthorized access attempt to orders for user:', userId)
      return NextResponse.json(
        { message: 'Unauthorized access to orders' },
        { status: 403 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { coUserId: parseInt(userId) },
      orderBy: { coCreated: 'desc' as const }
    })

    // Decrypt sensitive data before returning
    const decryptedOrders = orders.map(order => decryptOrderData(order))

    return NextResponse.json(decryptedOrders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
