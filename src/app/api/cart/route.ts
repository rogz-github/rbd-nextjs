import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all cart items using raw SQL
    const cartItems = await prisma.$queryRaw`
      SELECT * FROM "Cart" 
      ORDER BY "createdAt" DESC
    `
    
    return NextResponse.json({
      success: true,
      data: cartItems
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create cart item using raw SQL
    const result = await prisma.$executeRaw`
      INSERT INTO "Cart" (id, "user_type", "user_id", "prod_id", "prod_quantity", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${body.userType || 'guest'}, ${parseInt(body.userId) || 1}, ${body.prodId || 'prod-123'}, ${parseInt(body.prodQuantity) || 1}, ${body.status || 'active'}, NOW(), NOW())
    `
    
    return NextResponse.json({
      success: true,
      message: 'Cart item created successfully'
    })
  } catch (error) {
    console.error('Error creating cart item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
