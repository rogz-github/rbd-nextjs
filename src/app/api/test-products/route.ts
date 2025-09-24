import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test creating a sample product
    const sampleProduct = await prisma.product.create({
      data: {
        spuNo: 'SPU-001',
        itemNo: 'ITEM-001',
        slug: 'sample-product-1',
        fullCategory: 'Electronics > Computers > Laptops',
        category1: 'Electronics',
        category2: 'Computers',
        category3: 'Laptops',
        name: 'Sample Laptop',
        supplier: 'Tech Supplier Inc',
        brand: 'TechBrand',
        sku: 'SKU-001',
        msrp: 999.99,
        salePrice: 899.99,
        discountedPrice: 799.99,
        dropshippingPrice: 749.99,
        inventory: '10',
        mainImage: '/images/products/laptop-1.jpg',
        images: ['/images/products/laptop-1.jpg', '/images/products/laptop-2.jpg'],
        description: 'A high-quality laptop for professional use',
        shortDescription: 'Professional laptop with great performance',
        status: 'active',
        metaTitle: 'Sample Laptop - Professional Grade',
        metaDescription: 'High-quality professional laptop with excellent performance',
        metaKeywords: 'laptop, computer, professional, tech'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: sampleProduct
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const product = await prisma.product.create({
      data: {
        spuNo: body.spuNo,
        itemNo: body.itemNo,
        slug: body.slug,
        fullCategory: body.fullCategory,
        category1: body.category1,
        category2: body.category2,
        category3: body.category3,
        category4: body.category4,
        name: body.name,
        supplier: body.supplier,
        brand: body.brand,
        vt1: body.vt1,
        vv1: body.vv1,
        vt2: body.vt2,
        vv2: body.vv2,
        sku: body.sku,
        msrp: body.msrp ? parseFloat(body.msrp) : null,
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        discountedPrice: body.discountedPrice ? parseFloat(body.discountedPrice) : null,
        dropshippingPrice: body.dropshippingPrice ? parseFloat(body.dropshippingPrice) : null,
        map: body.map,
        inventory: body.inventory || '0',
        inventoryLoc: body.inventoryLoc,
        shippingMethod: body.shippingMethod,
        shipTo: body.shipTo,
        shippingCost: body.shippingCost || '0',
        promotionStart: body.promotionStart,
        promotionEnd: body.promotionEnd,
        mainImage: body.mainImage,
        images: body.images,
        description: body.description,
        shortDescription: body.shortDescription,
        upc: body.upc,
        asin: body.asin,
        processingTime: body.processingTime,
        ean: body.ean,
        dsFrom: body.dsFrom,
        dealId: body.dealId,
        status: body.status || 'active',
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
