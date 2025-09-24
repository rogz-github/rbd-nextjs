import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    
    console.log('Simple cart test - Product ID:', productId)
    
    // Just try to add a simple cart item
    const result = await prisma.$executeRaw`
      INSERT INTO "Cart" (
        id, "user_type", "user_id", "prod_id", "prod_quantity", 
        status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), 'test', 99999, ${productId}, 1, 
        'active', NOW(), NOW()
      )
    `
    
    return NextResponse.json({
      success: true,
      message: 'Simple cart test successful',
      productId,
      result
    })
  } catch (error) {
    console.error('Simple cart test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Simple cart test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
