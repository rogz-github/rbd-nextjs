import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptOrderData } from '@/lib/encryption'

// GET - Fetch single order details for regular users
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('API - Session:', session?.user?.id)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Convert ID to integer
    const orderId = parseInt(params.id)
    console.log('API - Order ID:', orderId)
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      )
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { coId: orderId }
    })
    console.log('API - Order found:', !!order)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Security: Only allow users to access their own orders
    console.log('API - Order user ID:', order.coUserId, 'Session user ID:', parseInt(session.user.id))
    if (order.coUserId !== parseInt(session.user.id)) {
      console.log('API - Unauthorized access attempt')
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to order' },
        { status: 403 }
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

    // Decrypt sensitive data
    const decryptedOrder = decryptOrderData(order)

    // Parse addresses from decrypted data
    let shippingAddress = {}
    let billingAddress = {}
    
    try {
      shippingAddress = decryptedOrder.shippingAddress ? JSON.parse(decryptedOrder.shippingAddress) : {}
      billingAddress = decryptedOrder.billingAddress ? JSON.parse(decryptedOrder.billingAddress) : {}
    } catch (error) {
      console.error('Error parsing addresses:', error)
    }

    // Parse order items from the decrypted order.orderItems field
    let orderItems = []
    try {
      // Handle both encrypted and unencrypted data
      let parsedItems
      if (typeof decryptedOrder.orderItems === 'string') {
        try {
          parsedItems = JSON.parse(decryptedOrder.orderItems)
        } catch (parseError) {
          console.error('Error parsing orderItems string:', parseError)
          parsedItems = []
        }
      } else if (Array.isArray(decryptedOrder.orderItems)) {
        parsedItems = decryptedOrder.orderItems
      } else {
        parsedItems = []
      }
      
      orderItems = parsedItems.map((item: any, index: number) => {
        const price = parseFloat((item.sale_price || item.price || item.unitPrice || 0).toString()) || 0
        const quantity = item.prod_quantity || item.quantity || item.qty || 1
        
        console.log(`API - Item ${index}:`, {
          name: item.name,
          sale_price: item.sale_price,
          parsed_price: price,
          quantity: quantity,
          total: price * quantity
        })
        
        return {
          id: index + 1,
          quantity: quantity,
          price: price,
          product: {
            id: item.prod_id || item.productId || index + 1,
            name: item.name || item.productName || 'Unknown Product',
            price: price,
            images: item.images || (item.main_image ? [item.main_image] : []),
            description: item.description || ''
          }
        }
      })
    } catch (error) {
      console.error('Error parsing order items:', error)
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
        email: 'N/A'
      },
      orderItems,
      // Calculate totals from decrypted data
      subtotal: parseFloat((decryptedOrder.coSubtotal || 0).toString()) || 0,
      // Calculate tax and shipping based on subtotal
      tax: (() => {
        const subtotal = parseFloat((decryptedOrder.coSubtotal || 0).toString()) || 0
        return subtotal * 0.08 // 8% tax
      })(),
      shipping: (() => {
        const subtotal = parseFloat((decryptedOrder.coSubtotal || 0).toString()) || 0
        return subtotal >= 50 ? 0 : 9.99 // Free shipping if subtotal >= 50
      })(),
      total: parseFloat((decryptedOrder.coTotalPrice || 0).toString()) || 0,
      // Format dates
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }

    console.log('API - Final order details:', {
      orderId: orderDetails.coId,
      orderItemsCount: orderDetails.orderItems?.length || 0,
      firstItem: orderDetails.orderItems?.[0],
      subtotal: orderDetails.subtotal,
      tax: orderDetails.tax,
      shipping: orderDetails.shipping,
      total: orderDetails.total
    })

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
