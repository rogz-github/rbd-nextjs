import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculatePricing } from '@/lib/pricing'

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

    // Get cart items with product details using Prisma ORM
    console.log('Fetching cart items for:', { userType, userId })
    
    const cartItems = await prisma.cart.findMany({
      where: {
        userType: userType,
        userId: userId,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get product details separately for now
    const cartItemsWithProducts = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await prisma.product.findUnique({
          where: { id: cartItem.prodId },
          select: {
            id: true,
            spuNo: true,
            name: true,
            slug: true,
            salePrice: true,
            msrp: true,
            discountedPrice: true,
            mainImage: true,
            images: true,
            brand: true,
            category1: true,
            inventory: true
          }
        })
        return { ...cartItem, product }
      })
    )

    console.log('Cart items from Prisma ORM:', cartItemsWithProducts)

    // Calculate totals using proper pricing logic
    let subtotal = 0
    const itemsWithTotals = cartItemsWithProducts
      .filter(item => item.product !== null) // Filter out items with missing products
      .map(item => {
        const product = item.product! // We know it's not null after filtering
        const pricing = calculatePricing(
          product.msrp ? Number(product.msrp) : 0, 
          product.discountedPrice ? Number(product.discountedPrice) : 0
        )
        const itemTotal = pricing.finalPrice * item.prodQuantity
        subtotal += itemTotal
        
        // Map to the expected format for the frontend
        return {
          cart_id: item.id,
          user_type: item.userType,
          user_id: item.userId,
          prod_id: item.prodId,
          prod_quantity: item.prodQuantity,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          product_id: product.id,
          spu_no: product.spuNo,
          name: product.name,
          slug: product.slug,
          sale_price: product.salePrice ? Number(product.salePrice) : 0,
          msrp: product.msrp ? Number(product.msrp) : 0,
          discounted_price: product.discountedPrice ? Number(product.discountedPrice) : 0,
          main_image: product.mainImage,
          images: product.images,
          brand: product.brand,
          category_1: product.category1,
          inventory: product.inventory,
          itemTotal: itemTotal
        }
      })

    const response = NextResponse.json({
      success: true,
      cartItems: itemsWithTotals,
      subtotal: subtotal,
      itemCount: cartItemsWithProducts.length,
      userType,
      userId
    })

    // Add cache-busting headers to prevent caching of cart data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
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
