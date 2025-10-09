import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { productId, quantity = 1, guestUserId } = await request.json()

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
    } else if (guestUserId) {
      userType = 'guest'
      // Use the provided guest user ID
      userId = parseInt(guestUserId)
      console.log('Guest user - using provided guestUserId:', guestUserId, 'converted to:', userId)
    } else {
      // For guest users without a provided ID, generate a temporary one
      userId = Math.floor(Math.random() * 1000000) + 100000
      console.log('Guest user - generated new ID:', userId)
    }
    
    console.log('Final user type and ID:', { userType, userId })

    // Check if product exists using Prisma ORM
    console.log('Checking product exists for ID:', productId)
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { id: true, name: true, salePrice: true }
    })

    console.log('Product query result:', product)

    if (!product) {
      console.log('Product not found, trying to find any product...')
      // Try to find any product to see if the table exists
      const anyProduct = await prisma.product.findFirst({
        select: { id: true, name: true }
      })
      console.log('Any product found:', anyProduct)
      
      return NextResponse.json(
        { success: false, message: 'Product not found', productId, availableProducts: anyProduct },
        { status: 404 }
      )
    }

    // Check if item already exists in cart for this user using Prisma ORM
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userType: userType,
        userId: parseInt(userId.toString()),
        prodId: parseInt(productId),
        status: 'active'
      }
    })

    if (existingCartItem) {
      // Update existing item quantity
      await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: {
          prodQuantity: existingCartItem.prodQuantity + quantity,
          updatedAt: new Date()
        }
      })
    } else {
      // Add new item to cart using Prisma ORM (auto-increment ID)
      await prisma.cart.create({
        data: {
          userType: userType,
          userId: parseInt(userId.toString()),
          prodId: parseInt(productId),
          prodQuantity: quantity,
          status: 'active'
        }
      })
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
