import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    // Get total count
    const totalResult = await prisma.$queryRaw<any>`
      SELECT COUNT(*) as count FROM category_three
    `
    const total = Number(totalResult[0].count)

    let categories
    let transformedCategories

    // If pagination params are provided, use pagination
    if (pageParam && limitParam) {
      const page = parseInt(pageParam)
      const limit = parseInt(limitParam)
      const offset = (page - 1) * limit

      categories = await prisma.$queryRaw<any>`
        SELECT * FROM category_three 
        ORDER BY pssst_position ASC 
        LIMIT ${limit} OFFSET ${offset}
      `

      transformedCategories = categories.map((cat: any) => ({
        pssstId: cat.pssst_id,
        pssstImg: cat.pssst_img,
        pssstCat: cat.pssst_cat,
        pssstSubcat: cat.pssst_subcat,
        pssstSubsubcat: cat.pssst_subsubcat,
        pssstSlug: cat.pssst_slug,
        pssstTotalProduct: cat.pssst_total_product,
        pssstHighprice: cat.pssst_highprice,
        pssstPosition: cat.pssst_position,
        cat1Slug: cat.cat1_slug,
        cat2Slug: cat.cat2_slug,
        totalInstock: cat.total_instock,
        totalOutstock: cat.total_outstock,
        cat4Slug: cat.cat4_slug,
        cat2TotalInstock: cat.cat2_total_instock,
        seoTitle: cat.seoTitle,
        seoDesc: cat.seoDesc,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))

      return NextResponse.json({
        categories: transformedCategories,
        pagination: {
          page: parseInt(pageParam),
          limit: parseInt(limitParam),
          total,
          totalPages: Math.ceil(total / parseInt(limitParam))
        }
      })
    } else {
      // Return all categories for client-side filtering and pagination
      categories = await prisma.$queryRaw<any>`
        SELECT * FROM category_three 
        ORDER BY pssst_position ASC
      `

      transformedCategories = categories.map((cat: any) => ({
        pssstId: cat.pssst_id,
        pssstImg: cat.pssst_img,
        pssstCat: cat.pssst_cat,
        pssstSubcat: cat.pssst_subcat,
        pssstSubsubcat: cat.pssst_subsubcat,
        pssstSlug: cat.pssst_slug,
        pssstTotalProduct: cat.pssst_total_product,
        pssstHighprice: cat.pssst_highprice,
        pssstPosition: cat.pssst_position,
        cat1Slug: cat.cat1_slug,
        cat2Slug: cat.cat2_slug,
        totalInstock: cat.total_instock,
        totalOutstock: cat.total_outstock,
        cat4Slug: cat.cat4_slug,
        cat2TotalInstock: cat.cat2_total_instock,
        seoTitle: cat.seoTitle,
        seoDesc: cat.seoDesc,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))

      return NextResponse.json(transformedCategories)
    }
  } catch (error) {
    console.error('Error fetching category three:', error)
    // Return empty result to prevent UI crash
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create new category
    const newCategory = await (prisma as any).categoryThree.create({
      data: {
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating category three:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

