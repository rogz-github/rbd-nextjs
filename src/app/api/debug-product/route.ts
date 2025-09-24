import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Slug parameter required'
      })
    }

    // Get product by slug
    const products = await prisma.$queryRaw`
      SELECT id, name, slug, "sale_price", status FROM "Product" 
      WHERE slug = ${slug} AND status = 'active'
      LIMIT 1
    ` as any[]

    return NextResponse.json({
      success: true,
      product: products[0] || null,
      allProducts: await prisma.$queryRaw`SELECT id, name, slug FROM "Product" LIMIT 5` as any[]
    })
  } catch (error) {
    console.error('Debug product error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Debug failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
