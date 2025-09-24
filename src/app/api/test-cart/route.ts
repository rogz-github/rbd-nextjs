import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test if we can connect to the database
    await prisma.$connect()
    
    // Try to get the Cart table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Cart' 
      ORDER BY ordinal_position;
    `
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      cartTableStructure: result
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Test creating a cart item
    const cartItem = await prisma.cart.create({
      data: {
        userType: body.userType || 'guest',
        userId: parseInt(body.userId) || 1,
        prodId: body.prodId || 'prod-123',
        prodQuantity: parseInt(body.prodQuantity) || 1,
        status: body.status || 'active'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cart item created successfully',
      cartItem
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
