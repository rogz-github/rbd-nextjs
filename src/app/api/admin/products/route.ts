import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  let body: any = null
  
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Admin role required.' }, { status: 403 })
    }

    body = await request.json()
    const {
      name,
      description,
      shortDescription,
      sku,
      category1,
      category2,
      category3,
      category4,
      fullCategory,
      brand,
      supplier,
      salePrice,
      discountedPrice,
      msrp,
      inventory,
      mainImage,
      images,
      status = 'active',
      metaTitle,
      metaDescription,
      metaKeywords
    } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 422 })
    }
    
    if (!category1 || !category1.trim()) {
      return NextResponse.json({ error: 'Primary category is required' }, { status: 422 })
    }

    // Generate unique identifiers
    const spuNo = `SPU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Provide default mainImage if empty
    const defaultMainImage = mainImage && mainImage.trim() ? mainImage : '/images/placeholder-product.jpg'

    // Create product in database
    const product = await prisma.product.create({
      data: {
        spuNo,
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        shortDescription: shortDescription?.trim() || null,
        sku: sku?.trim() || null,
        category1: category1.trim(),
        category2: category2?.trim() || null,
        category3: category3?.trim() || null,
        category4: category4?.trim() || null,
        fullCategory: (fullCategory || category1).trim(),
        brand: brand?.trim() || null,
        supplier: supplier?.trim() || null,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        msrp: msrp ? parseFloat(msrp) : null,
        inventory: inventory || '0',
        mainImage: defaultMainImage,
        images: images ? images : null,
        status,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        metaKeywords: metaKeywords?.trim() || null
      }
    })

    return NextResponse.json({ 
      success: true, 
      product: {
        id: product.id,
        spuNo: product.spuNo,
        name: product.name,
        slug: product.slug
      }
    })

  } catch (error) {
    console.error('Error creating product:', error)
    console.error('Request body:', body)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      console.error('Prisma error details:', {
        code: prismaError.code,
        meta: prismaError.meta,
        message: prismaError.message
      })
      
      switch (prismaError.code) {
        case 'P2002':
          // Unique constraint violation
          if (prismaError.meta?.target?.includes('sku')) {
            return NextResponse.json(
              { error: 'A product with this SKU already exists. Please use a different SKU.' },
              { status: 409 }
            )
          } else if (prismaError.meta?.target?.includes('spuNo')) {
            return NextResponse.json(
              { error: 'A product with this SPU number already exists. Please try again.' },
              { status: 409 }
            )
          } else if (prismaError.meta?.target?.includes('slug')) {
            return NextResponse.json(
              { error: 'A product with this name already exists. Please use a different name.' },
              { status: 409 }
            )
          }
          break
        case 'P2003':
          // Foreign key constraint violation
          return NextResponse.json(
            { error: 'Invalid reference in the data. Please check your input.' },
            { status: 422 }
          )
        case 'P2025':
          // Record not found
          return NextResponse.json(
            { error: 'The requested resource was not found.' },
            { status: 404 }
          )
        default:
          break
      }
    }
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message
      if (errorMessage.includes('Invalid value') || errorMessage.includes('validation')) {
        return NextResponse.json(
          { error: `Validation error: ${errorMessage}` },
          { status: 422 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create product. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    console.log('🔍 GET API Session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      role: (session?.user as any)?.role,
      isAdmin: (session?.user as any)?.isAdmin 
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Admin role required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { spuNo: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Debug: Log the query parameters
    console.log('🔍 GET API Query params:', { page, limit, search, status, skip })
    
    // Debug: Check database connection and total products
    const totalProductsInDB = await prisma.product.count()
    console.log('🔍 Total products in database:', totalProductsInDB)
    
    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          spuNo: true,
          name: true,
          sku: true,
          salePrice: true,
          discountedPrice: true,
          msrp: true,
          inventory: true,
          mainImage: true,
          status: true,
          category1: true,
          brand: true,
          createdAt: true
        }
      }),
      prisma.product.count({ where })
    ])
    
    // Debug: Log the results
    console.log('🔍 GET API Results:', { 
      productsCount: products.length, 
      totalCount: total,
      firstProduct: products[0]?.name || 'No products',
      whereClause: where
    })

    const response = NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}