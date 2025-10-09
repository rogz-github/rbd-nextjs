import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all cart items using Prisma ORM
    const cartItems = await prisma.cart.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
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
    
    // Create cart item using Prisma ORM
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
      data: cartItem
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
