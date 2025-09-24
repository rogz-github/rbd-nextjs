import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const product = await prisma.product.create({
      data: {
        spuNo: data.spuNo || `SPU-${Date.now()}`,
        slug: data.slug,
        fullCategory: data.fullCategory || data.category1 || "General",
        category1: data.category1,
        name: data.name,
        description: data.description,
        salePrice: data.salePrice,
        msrp: data.msrp,
        sku: data.sku,
        inventory: data.inventory || "0",
        mainImage: data.mainImage || "/images/placeholder-product.jpg",
        images: data.images || [],
        brand: data.brand,
        status: data.status || "active",
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    )
  }
}
