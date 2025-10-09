import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/cart/[id] - Delete a specific cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cartId = parseInt(params.id)
    
    if (isNaN(cartId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid cart item ID' 
        },
        { status: 400 }
      )
    }

    // Check if cart item exists
    const existingItem = await prisma.cart.findUnique({
      where: { id: cartId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cart item not found' 
        },
        { status: 404 }
      )
    }

    // Delete the cart item
    await prisma.cart.delete({
      where: { id: cartId }
    })

    return NextResponse.json({
      success: true,
      message: 'Cart item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting cart item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/cart/[id] - Update a specific cart item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cartId = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(cartId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid cart item ID' 
        },
        { status: 400 }
      )
    }

    // Check if cart item exists
    const existingItem = await prisma.cart.findUnique({
      where: { id: cartId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cart item not found' 
        },
        { status: 404 }
      )
    }

    // Update the cart item
    const updatedItem = await prisma.cart.update({
      where: { id: cartId },
      data: {
        prodQuantity: body.prodQuantity || existingItem.prodQuantity,
        status: body.status || existingItem.status
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
