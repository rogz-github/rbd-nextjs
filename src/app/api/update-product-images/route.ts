import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Update the first product (MacBook Pro) with the Doba image
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET "main_image" = 'https://image.doba.com/dg4-jnDShKsAQFbz/d0101h2rtpy.webp',
          images = '["https://image.doba.com/dg4-jnDShKsAQFbz/d0101h2rtpy.webp"]'
      WHERE "spu_no" = 'SPU-001'
    `
    
    // Update other products with Unsplash images
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET "main_image" = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          images = '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"]'
      WHERE "spu_no" = 'SPU-002'
    `
    
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET "main_image" = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
          images = '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"]'
      WHERE "spu_no" = 'SPU-003'
    `
    
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET "main_image" = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
          images = '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"]'
      WHERE "spu_no" = 'SPU-004'
    `
    
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET "main_image" = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          images = '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"]'
      WHERE "spu_no" = 'SPU-005'
    `
    
    return NextResponse.json({
      success: true,
      message: 'Product images updated successfully'
    })
  } catch (error) {
    console.error('Error updating product images:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update product images',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
