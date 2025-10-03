import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Direct DB test API called')
    
    // Test database connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Database connected')

    // Test table access
    console.log('Testing banner_bottom_images table...')
    const count = await prisma.bannerBottomImages.count()
    console.log('Table accessible, count:', count)

    // Test creating a record
    console.log('Testing record creation...')
    const testRecord = await prisma.bannerBottomImages.create({
      data: {
        bgColor: '#FF0000',
        linkUrl: 'https://example.com',
        image: '/test-image.jpg'
      }
    })
    console.log('Record created:', testRecord)

    // Clean up
    await prisma.bannerBottomImages.delete({
      where: { id: testRecord.id }
    })
    console.log('Test record cleaned up')

    return NextResponse.json({
      success: true,
      message: 'Direct DB test completed successfully',
      count
    })
  } catch (error) {
    console.error('Direct DB test error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'Unknown',
      meta: (error as any)?.meta || 'Unknown'
    })
    return NextResponse.json(
      { 
        error: 'Direct DB test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
