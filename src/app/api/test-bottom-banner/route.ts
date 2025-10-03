import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Test API called')
    
    const session = await getServerSession(authOptions)
    console.log('Session in test:', { 
      user: session?.user?.email, 
      isAdmin: session?.user?.isAdmin,
      role: (session?.user as any)?.role
    })
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Database connected')

    // Test table access
    console.log('Testing table access...')
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
      message: 'Test completed successfully',
      count
    })
  } catch (error) {
    console.error('Test API error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'Unknown',
      meta: (error as any)?.meta || 'Unknown'
    })
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}
