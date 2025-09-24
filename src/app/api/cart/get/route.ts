import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const guestUserId = searchParams.get('guestUserId')

    // Determine user type and ID
    let userType = 'guest'
    let userId: number | string = ''

    if (session?.user?.id) {
      userType = 'authenticated'
      // Convert string ID to integer for database
      userId = parseInt(session.user.id as string)
    } else if (guestUserId) {
      userType = 'guest'
      // Convert guest user ID to integer
      userId = parseInt(guestUserId)
    } else {
      return NextResponse.json({
        success: true,
        cartItems: [],
        message: 'No user session or guest ID provided'
      })
    }

    // Get cart items with product details
    const cartItems = await prisma.$queryRaw`
      SELECT 
        c.id as cart_id,
        c."user_type",
        c."user_id",
        c."prod_id",
        c."prod_quantity",
        c.status,
        c."createdAt",
        c."updatedAt",
        p.id as product_id,
        p."spu_no",
        p.name,
        p.slug,
        p."sale_price",
        p."msrp",
        p."discounted_price",
        p."main_image",
        p.images,
        p.brand,
        p."category_1",
        p.inventory
      FROM "Cart" c
      LEFT JOIN "Product" p ON c."prod_id" = p.id
      WHERE c."user_type" = ${userType} 
      AND c."user_id" = ${userId}
      AND c.status = 'active'
      ORDER BY c."createdAt" DESC
    ` as any[]

    // Calculate totals
    let subtotal = 0
    const itemsWithTotals = cartItems.map(item => {
      const itemTotal = Number(item.sale_price || 0) * item.prod_quantity
      subtotal += itemTotal
      return {
        ...item,
        itemTotal: itemTotal
      }
    })

    return NextResponse.json({
      success: true,
      cartItems: itemsWithTotals,
      subtotal: subtotal,
      itemCount: cartItems.length,
      userType,
      userId
    })
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch cart items',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
