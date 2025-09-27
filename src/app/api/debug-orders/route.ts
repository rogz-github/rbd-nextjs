import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptOrderData } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug orders API - Fetching all orders')
    
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found orders:', orders.length)

    // Get all unique user IDs from orders
    const userIds = Array.from(new Set(orders.map(order => order.coUserId)))
    
    // Fetch user data for all orders
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    // Create a user lookup map
    const userMap = new Map(users.map(user => [user.id, user]))

    // Format orders with user data and decrypt sensitive information
    const formattedOrders = orders.map(order => {
      const decryptedOrder = decryptOrderData(order)
      const user = userMap.get(order.coUserId)
      
      // Parse order items
      let orderItems = []
      try {
        orderItems = JSON.parse(decryptedOrder.orderItems || '[]')
      } catch (error) {
        console.error('Error parsing order items:', error)
        orderItems = []
      }

      return {
        id: order.coId.toString(),
        orderNumber: decryptedOrder.coOrderId,
        total: parseFloat(decryptedOrder.coTotalPrice.toString()),
        status: decryptedOrder.coStatus,
        createdAt: decryptedOrder.coCreated,
        user: user ? {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        } : {
          name: 'Guest User',
          email: 'N/A'
        },
        items: orderItems.map((item: any) => ({
          product: {
            name: item.name || item.productName || 'Unknown Product'
          },
          quantity: item.quantity || item.qty || 1,
          price: parseFloat((item.price || item.unitPrice || 0).toString())
        }))
      }
    })

    console.log('Formatted orders:', formattedOrders.length)
    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Debug orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
