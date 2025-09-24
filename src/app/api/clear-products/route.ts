import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Clear all products using raw SQL
    const result = await prisma.$executeRaw`DELETE FROM "Product"`
    
    return NextResponse.json({
      success: true,
      message: 'All products cleared successfully',
      count: result
    })
  } catch (error) {
    console.error('Error clearing products:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
