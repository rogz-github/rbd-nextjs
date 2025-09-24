import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Determine user type and ID
    let userType = 'guest'
    let userId: number | string = ''

    if (session?.user?.id) {
      userType = 'authenticated'
      // Convert string ID to integer for database
      userId = parseInt(session.user.id as string)
      console.log('Authenticated user - session.user.id:', session.user.id, 'converted to:', userId)
    } else {
      // For guest users, we'll use a temporary integer ID
      userId = Math.floor(Math.random() * 1000000) + 100000
    }
    
    console.log('Final user type and ID:', { userType, userId })

    // Check if product exists using raw SQL
    console.log('Checking product exists for ID:', productId)
    const products = await prisma.$queryRaw`
      SELECT id, name, "sale_price" FROM "Product" 
      WHERE id = ${productId}
      LIMIT 1
    ` as any[]

    console.log('Product query result:', products)

    if (!products || products.length === 0) {
      console.log('Product not found, trying to find any product...')
      // Try to find any product to see if the table exists
      const anyProduct = await prisma.$queryRaw`SELECT id, name FROM "Product" LIMIT 1` as any[]
      console.log('Any product found:', anyProduct)
      
      return NextResponse.json(
        { success: false, message: 'Product not found', productId, availableProducts: anyProduct },
        { status: 404 }
      )
    }

    // Check if item already exists in cart for this user
    const existingCartItem = await prisma.$queryRaw`
      SELECT * FROM "Cart" 
      WHERE "user_type" = ${userType} 
      AND "user_id" = ${userId} 
      AND "prod_id" = ${productId}
      AND status = 'active'
      LIMIT 1
    ` as any[]

    if (existingCartItem && existingCartItem.length > 0) {
      // Update existing item quantity
      await prisma.$executeRaw`
        UPDATE "Cart" 
        SET "prod_quantity" = "prod_quantity" + ${quantity},
            "updatedAt" = NOW()
        WHERE "user_type" = ${userType} 
        AND "user_id" = ${userId} 
        AND "prod_id" = ${productId}
        AND status = 'active'
      `
    } else {
      // Add new item to cart
      await prisma.$executeRaw`
        INSERT INTO "Cart" (
          id, "user_type", "user_id", "prod_id", "prod_quantity", 
          status, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${userType}, ${userId}, ${productId}, ${quantity}, 
          'active', NOW(), NOW()
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
      userType,
      userId
    })
  } catch (error) {
    console.error('Error adding item to cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add item to cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
