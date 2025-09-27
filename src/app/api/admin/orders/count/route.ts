import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    // Build where clause for filtering
    const whereClause: any = {}
    
    // Add status filter if provided
    if (status && status !== 'ALL') {
      whereClause.coStatus = status
    }

    // Get total count
    const totalCount = await prisma.order.count({
      where: whereClause
    })

    // Get counts by status
    const statusCounts = await prisma.order.groupBy({
      by: ['coStatus'],
      _count: {
        coId: true
      }
    })

    // Format status counts
    const statusCountMap = statusCounts.reduce((acc, item) => {
      acc[item.coStatus] = item._count.coId
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      total: totalCount,
      byStatus: statusCountMap,
      pending: statusCountMap['Pending'] || 0,
      processing: statusCountMap['Processing'] || 0,
      completed: statusCountMap['Completed'] || 0,
      cancelled: statusCountMap['Cancelled'] || 0
    })
  } catch (error) {
    console.error('Orders count fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders count' },
      { status: 500 }
    )
  }
}
