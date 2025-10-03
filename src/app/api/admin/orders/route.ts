import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptOrderData } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Admin orders API - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      role: session?.user?.role,
      isAdmin: session?.user?.isAdmin
    })
    
    if (!session || !session.user?.isAdmin) {
      console.log('Admin orders API - Unauthorized access attempt')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '8')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build where clause for filtering
    const whereClause: any = {}
    
    // Add status filter if provided
    if (status && status !== 'ALL') {
      whereClause.coStatus = status
    }

    // Get total count for pagination (without fetching all records)
    const totalCount = await prisma.order.count({
      where: whereClause
    })

    // Fetch only the required page of orders with pagination
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit
    })

    // Get all unique user IDs from orders (only for current page)
    const userIds = Array.from(new Set(orders.map((order: any) => order.coUserId)))
    
    // Fetch user data for current page orders only
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
    const userMap = new Map(users.map((user: any) => [user.id, user]))

    // Format orders with user data and decrypt sensitive information
    const formattedOrders = orders.map((order: any) => {
      const decryptedOrder = decryptOrderData(order)
      const user = userMap.get(order.coUserId)
      
      // Parse order items
      let orderItems = []
      try {
        const parsedItems = JSON.parse(decryptedOrder.orderItems || '[]')
        orderItems = Array.isArray(parsedItems) ? parsedItems : []
      } catch (error) {
        console.error('Error parsing order items:', error)
        orderItems = []
      }

      return {
        id: order.coId.toString(),
        orderNumber: decryptedOrder.coOrderId,
        total: parseFloat(decryptedOrder.coTotalPrice.toString()),
        status: order.coStatus, // Use original order coStatus, not decrypted
        createdAt: decryptedOrder.coCreated,
        user: user ? {
          name: `${(user as any).firstName} ${(user as any).lastName}`,
          email: (user as any).email
        } : {
          name: 'Guest User',
          email: 'N/A'
        },
        items: orderItems.map((item: any) => ({
          product: {
            name: item.name || item.productName || 'Unknown Product'
          },
          quantity: item.prod_quantity || item.quantity || item.qty || 1,
          price: parseFloat((item.sale_price || item.discounted_price || item.itemTotal || item.price || item.unitPrice || 0).toString())
        }))
      }
    })

    // Return paginated response with metadata
    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
