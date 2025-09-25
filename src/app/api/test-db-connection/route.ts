import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database query test result:', result)
    
    // Test Order table structure
    const orderCount = await prisma.order.count()
    console.log('Order table count:', orderCount)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      orderCount: orderCount
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}