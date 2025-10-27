import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/displayed-items - Get all displayed items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const displayedItems = await prisma.displayedItems.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ displayedItems })
  } catch (error) {
    console.error('Error fetching displayed items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch displayed items' },
      { status: 500 }
    )
  }
}

// POST /api/admin/displayed-items - Create new displayed items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, items } = await request.json()

    if (!category || !items) {
      return NextResponse.json(
        { error: 'Category and items are required' },
        { status: 400 }
      )
    }

    const displayedItem = await prisma.displayedItems.create({
      data: {
        category,
        items: Array.isArray(items) ? items : []
      }
    })

    return NextResponse.json({ displayedItem })
  } catch (error) {
    console.error('Error creating displayed items:', error)
    return NextResponse.json(
      { error: 'Failed to create displayed items' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/displayed-items - Update displayed items
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, category, items } = await request.json()

    if (!id || !category || !items) {
      return NextResponse.json(
        { error: 'ID, category and items are required' },
        { status: 400 }
      )
    }

    const displayedItem = await prisma.displayedItems.update({
      where: { id: parseInt(id) },
      data: {
        category,
        items: Array.isArray(items) ? items : []
      }
    })

    return NextResponse.json({ displayedItem })
  } catch (error) {
    console.error('Error updating displayed items:', error)
    return NextResponse.json(
      { error: 'Failed to update displayed items' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/displayed-items - Delete displayed items
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.displayedItems.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Displayed items deleted successfully' })
  } catch (error) {
    console.error('Error deleting displayed items:', error)
    return NextResponse.json(
      { error: 'Failed to delete displayed items' },
      { status: 500 }
    )
  }
}
