import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptOrderData } from '@/lib/encryption'

// GET - Fetch all orders for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)

    // Fetch all orders for the user
    const orders = await prisma.order.findMany({
      where: { coUserId: userId },
      orderBy: { createdAt: 'desc' }
    })

    // Process each order to decrypt data and format addresses
    const processedOrders = await Promise.all(
      orders.map(async (order: any) => {
        try {
          // Decrypt sensitive data
          const decryptedOrder = decryptOrderData(order)

          // Parse addresses from decrypted data
          let shippingAddress = {}
          let billingAddress = {}
          
          try {
            // After decryption, these should already be objects
            shippingAddress = decryptedOrder.shippingAddress || {}
            billingAddress = decryptedOrder.billingAddress || {}
          } catch (error) {
            console.error('Error parsing addresses for order', order.coId, ':', error)
          }

          // Parse order items to count total items
          let totalItems = 0
          try {
            // After decryption, orderItems should already be an array
            const parsedItems = Array.isArray(decryptedOrder.orderItems) 
              ? decryptedOrder.orderItems 
              : JSON.parse(decryptedOrder.orderItems || '[]')
            totalItems = parsedItems.reduce((sum: number, item: any) => sum + (item.quantity || item.qty || 1), 0)
          } catch (error) {
            console.error('Error parsing order items for order', order.coId, ':', error)
          }

          return {
            ...order,
            ...decryptedOrder,
            // Ensure coStatus comes from the original order, not decrypted data
            coStatus: order.coStatus,
            shippingAddress,
            billingAddress,
            totalItems,
            // Format dates
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString()
          }
        } catch (error) {
          console.error('Error processing order', order.coId, ':', error)
          // Return basic order data if decryption fails
          return {
            ...order,
            shippingAddress: {},
            billingAddress: {},
            totalItems: 0,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString()
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      orders: processedOrders
    })

  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
