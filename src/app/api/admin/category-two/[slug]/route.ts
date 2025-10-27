import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Find category by slug
    const category = await prisma.categoryTwo.findFirst({
      where: {
        psstSlug: slug
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category two not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category two:', error)
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
    const category = await prisma.categoryTwo.findFirst({
      where: {
        psstSlug: slug
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category two not found' },
        { status: 404 }
      )
    }

    // Update category using the ID
    const updatedCategory = await prisma.categoryTwo.update({
      where: {
        psstId: category.psstId
      },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category two:', error)
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
    const category = await prisma.categoryTwo.findFirst({
      where: {
        psstSlug: slug
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category two not found' },
        { status: 404 }
      )
    }

    // Delete using the ID (which is the unique key)
    await prisma.categoryTwo.delete({
      where: {
        psstId: category.psstId
      }
    })

    return NextResponse.json({ message: 'Category two deleted successfully' })
  } catch (error) {
    console.error('Error deleting category two:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

