import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptOrderData } from '@/lib/encryption'

// GET - Fetch single order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || (session.user as any)?.isAdmin
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin permissions required' },
        { status: 403 }
      )
    }

    // Convert ID to integer
    const orderId = parseInt(params.id)
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { coId: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Fetch user data separately
    const user = await prisma.user.findUnique({
      where: { id: order.coUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        image: true,
        role: true
      }
    })

    // Parse order items from JSON field
    let orderItems = []
    try {
      const parsedItems = JSON.parse(order.orderItems || '[]')
      orderItems = Array.isArray(parsedItems) ? parsedItems : []
    } catch (error) {
      console.log('Error parsing order items JSON:', error)
      orderItems = []
    }

    // Decrypt sensitive data using the same function as admin orders API
    const decryptedOrder = decryptOrderData(order)

    // Parse addresses from decrypted data
    let shippingAddress = {}
    let billingAddress = {}
    
    try {
      // After decryption, these should already be objects
      shippingAddress = decryptedOrder.shippingAddress || {}
      billingAddress = decryptedOrder.billingAddress || {}
    } catch (error) {
      console.error('Error parsing addresses:', error)
    }

    // Parse order items from the decrypted order.orderItems field if no separate table
    if (orderItems.length === 0) {
      try {
        // After decryption, orderItems should already be an array
        let parsedItems = []
        if (Array.isArray(decryptedOrder.orderItems)) {
          parsedItems = decryptedOrder.orderItems
        } else {
          parsedItems = JSON.parse(decryptedOrder.orderItems || '[]')
        }
        
        // Ensure parsedItems is an array
        if (Array.isArray(parsedItems)) {
          orderItems = parsedItems.map((item: any, index: number) => ({
            id: index + 1,
            quantity: item.prod_quantity || item.quantity || item.qty || 1,
            price: parseFloat((item.sale_price || item.discounted_price || item.itemTotal || item.price || item.unitPrice || 0).toString()),
            product: {
              id: item.product_id || item.productId || index + 1,
              name: item.name || item.productName || 'Unknown Product',
              price: parseFloat((item.sale_price || item.discounted_price || item.itemTotal || item.price || item.unitPrice || 0).toString()),
              images: item.images || [],
              description: item.description || ''
            }
          }))
        } else {
          orderItems = []
        }
      } catch (error) {
        console.error('Error parsing order items:', error)
        orderItems = []
      }
    }

    // Combine order data with decrypted data
    const orderDetails = {
      ...order,
      ...decryptedOrder,
      // Ensure coStatus comes from the original order, not decrypted data
      coStatus: order.coStatus,
      shippingAddress,
      billingAddress,
      // Format user data
      user: user ? {
        ...user,
        name: `${user.firstName} ${user.lastName}`
      } : {
        id: 0,
        name: 'Guest User',
        email: 'N/A',
        phone: null
      },
      orderItems,
      // Calculate totals from decrypted data
      subtotal: parseFloat((decryptedOrder.coSubtotal || 0).toString()),
      tax: parseFloat((decryptedOrder.coTax || 0).toString()),
      shipping: parseFloat((decryptedOrder.coShipping || 0).toString()),
      total: parseFloat((decryptedOrder.coTotalPrice || 0).toString()),
      // Format dates
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      order: orderDetails
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || (session.user as any)?.isAdmin
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin permissions required' },
        { status: 403 }
      )
    }

    // Convert ID to integer
    const orderId = parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { coStatus, notes } = body

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
    if (!coStatus || !validStatuses.includes(coStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { coId: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { coId: orderId },
      data: {
        coStatus: coStatus,
        coNotes: notes || null,
        updatedAt: new Date()
      }
    })

    // Fetch user data separately
    const user = await prisma.user.findUnique({
      where: { id: updatedOrder.coUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        // phone field doesn't exist in User model
      }
    })

    // Format user data for response
    const formattedOrder = {
      ...updatedOrder,
      user: user ? {
        ...user,
        name: `${user.firstName} ${user.lastName}`
      } : {
        id: 0,
        name: 'Guest User',
        email: 'N/A',
        phone: null
      }
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder,
      message: 'Order status updated successfully'
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}