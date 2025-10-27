import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Find category by slug using raw query
    const categoryResult = await prisma.$queryRaw<any>`
      SELECT * FROM category_four WHERE psssst_slug = ${slug} LIMIT 1
    `
    const category = categoryResult[0]

    if (!category) {
      return NextResponse.json(
        { error: 'Category four not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category four:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    // First, find the category by slug to get its ID
    const categoryResult = await prisma.$queryRaw<any>`
      SELECT * FROM category_four WHERE psssst_slug = ${slug} LIMIT 1
    `
    const category = categoryResult[0]

    if (!category) {
      return NextResponse.json(
        { error: 'Category four not found' },
        { status: 404 }
      )
    }

    // Note: Raw queries for update would be complex, so we'll skip full implementation for now
    // This endpoint would need manual SQL updates for each field
    return NextResponse.json(
      { error: 'Update not fully implemented with raw queries yet' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error updating category four:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // First, find the category by slug to get its ID
    const categoryResult = await prisma.$queryRaw<any>`
      SELECT * FROM category_four WHERE psssst_slug = ${slug} LIMIT 1
    `
    const category = categoryResult[0]

    if (!category) {
      return NextResponse.json(
        { error: 'Category four not found' },
        { status: 404 }
      )
    }

    // Delete using raw query
    await prisma.$executeRaw`
      DELETE FROM category_four WHERE psssst_id = ${category.psssst_id}
    `

    return NextResponse.json({ message: 'Category four deleted successfully' })
  } catch (error) {
    console.error('Error deleting category four:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

