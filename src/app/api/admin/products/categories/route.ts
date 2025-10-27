import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products/categories - Get all unique categories from Product table
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unique categories with count from Product table
    const categories = await prisma.product.groupBy({
      by: ['category1'],
      _count: {
        category1: true
      },
      where: {
        category1: {
          not: ''
        }
      },
      orderBy: {
        category1: 'asc'
      }
    })

    // Format the response
    const formattedCategories = categories.map(cat => ({
      category: cat.category1,
      count: cat._count.category1
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error('Error fetching product categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product categories' },
      { status: 500 }
    )
  }
}
