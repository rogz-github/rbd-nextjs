import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if categoryTwo exists in Prisma client (handle case where Prisma hasn't been regenerated)
    if (!prisma.categoryTwo) {
      console.error('CategoryTwo model not found in Prisma client. Please run: npx prisma generate')
      return NextResponse.json([])
    }

    // Get all categories from CategoryTwo table
    const categories = await prisma.categoryTwo.findMany({
      orderBy: {
        psstPosition: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching category two:', error)
    // Return empty array instead of error to prevent UI crash
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if categoryTwo exists in Prisma client
    if (!prisma.categoryTwo) {
      console.error('CategoryTwo model not found in Prisma client. Please run: npx prisma generate')
      return NextResponse.json(
        { error: 'CategoryTwo model not available. Please restart your dev server.' },
        { status: 503 }
      )
    }

    const body = await request.json()

    // Create new category
    const newCategory = await prisma.categoryTwo.create({
      data: {
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating category two:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!prisma.categoryTwo) {
      console.error('CategoryTwo model not found in Prisma client. Please run: npx prisma generate')
      return NextResponse.json(
        { error: 'CategoryTwo model not available. Please restart your dev server.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { psstId, psstImg, psstSubcat, seoTitle, seoDesc, psstSlug } = body

    if (!psstId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Update category
    const updatedCategory = await prisma.categoryTwo.update({
      where: { psstId },
      data: {
        ...(psstImg && { psstImg }),
        ...(psstSubcat && { psstSubcat }),
        ...(seoTitle && { seoTitle }),
        ...(seoDesc && { seoDesc }),
        ...(psstSlug && { psstSlug }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedCategory, { status: 200 })
  } catch (error) {
    console.error('Error updating category two:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

