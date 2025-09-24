import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    // Create order with related data
    const order = await prisma.order.create({
      data: {
        orderNumber: orderData.orderNumber,
        total: orderData.total,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        paymentId: orderData.paymentId,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        userId: orderData.userId,
        orderItems: {
          create: orderData.items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: Number(item.product.price),
          }))
        },
        shippingAddress: {
          create: {
            firstName: orderData.shippingAddress.firstName,
            lastName: orderData.shippingAddress.lastName,
            address1: orderData.shippingAddress.address1,
            address2: orderData.shippingAddress.address2,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            zip: orderData.shippingAddress.zip,
            country: orderData.shippingAddress.country,
            phone: orderData.shippingAddress.phone,
          }
        },
        billingAddress: {
          create: orderData.sameAsBilling ? {
            firstName: orderData.shippingAddress.firstName,
            lastName: orderData.shippingAddress.lastName,
            address1: orderData.shippingAddress.address1,
            address2: orderData.shippingAddress.address2,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            zip: orderData.shippingAddress.zip,
            country: orderData.shippingAddress.country,
            phone: orderData.shippingAddress.phone,
          } : {
            firstName: orderData.billingAddress.firstName,
            lastName: orderData.billingAddress.lastName,
            address1: orderData.billingAddress.address1,
            address2: orderData.billingAddress.address2,
            city: orderData.billingAddress.city,
            state: orderData.billingAddress.state,
            zip: orderData.billingAddress.zip,
            country: orderData.billingAddress.country,
            phone: orderData.billingAddress.phone,
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        shippingAddress: true,
        billingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
