import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    // Get total count
    const totalResult = await prisma.$queryRaw<any>`
      SELECT COUNT(*) as count FROM category_four
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
        SELECT * FROM category_four 
        ORDER BY psssst_position ASC 
        LIMIT ${limit} OFFSET ${offset}
      `

      transformedCategories = categories.map((cat: any) => ({
        psssstId: cat.psssst_id,
        psssstImg: cat.psssst_img,
        psssstCat: cat.psssst_cat,
        psssstSubcat: cat.psssst_subcat,
        psssstSubsubcat: cat.psssst_subsubcat,
        psssstSubsubsubcat: cat.psssst_subsubsubcat,
        psssstSlug: cat.psssst_slug,
        psssstTotalProduct: cat.psssst_total_product,
        psssstHighprice: cat.psssst_highprice,
        psssstPosition: cat.psssst_position,
        cat1Slug: cat.cat1_slug,
        cat2Slug: cat.cat2_slug,
        cat3Slug: cat.cat3_slug,
        totalInstock: cat.total_instock,
        totalOutstock: cat.total_outstock,
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
        SELECT * FROM category_four 
        ORDER BY psssst_position ASC
      `

      transformedCategories = categories.map((cat: any) => ({
        psssstId: cat.psssst_id,
        psssstImg: cat.psssst_img,
        psssstCat: cat.psssst_cat,
        psssstSubcat: cat.psssst_subcat,
        psssstSubsubcat: cat.psssst_subsubcat,
        psssstSubsubsubcat: cat.psssst_subsubsubcat,
        psssstSlug: cat.psssst_slug,
        psssstTotalProduct: cat.psssst_total_product,
        psssstHighprice: cat.psssst_highprice,
        psssstPosition: cat.psssst_position,
        cat1Slug: cat.cat1_slug,
        cat2Slug: cat.cat2_slug,
        cat3Slug: cat.cat3_slug,
        totalInstock: cat.total_instock,
        totalOutstock: cat.total_outstock,
        seoTitle: cat.seoTitle,
        seoDesc: cat.seoDesc,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))

      return NextResponse.json(transformedCategories)
    }
  } catch (error) {
    console.error('Error fetching category four:', error)
    // Return empty result to prevent UI crash
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create new category using raw query
    const slug = body.psssstSlug || body.psssstSubsubsubcat.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const maxPosition = await prisma.$queryRaw<any>`
      SELECT MAX(psssst_position) as max_pos FROM category_four
    `
    const nextPosition = (maxPosition[0]?.max_pos || 0) + 1

    const result = await prisma.$executeRaw`
      INSERT INTO category_four (
        psssst_img, psssst_cat, psssst_subcat, psssst_subsubcat, psssst_subsubsubcat,
        psssst_slug, psssst_total_product, psssst_highprice, psssst_position,
        cat1_slug, cat2_slug, cat3_slug, total_instock, total_outstock,
        "seoTitle", "seoDesc", "createdAt", "updatedAt"
      ) VALUES (
        ${body.psssstImg || ''}, ${body.psssstCat}, ${body.psssstSubcat}, 
        ${body.psssstSubsubcat}, ${body.psssstSubsubsubcat}, ${slug},
        ${body.psssstTotalProduct || 0}, ${body.psssstHighprice || 0}, ${nextPosition},
        ${body.cat1Slug || ''}, ${body.cat2Slug || ''}, ${body.cat3Slug || ''},
        0, 0, ${body.seoTitle || ''}, ${body.seoDesc || ''}, NOW(), NOW()
      )
    `

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating category four:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { psssstId, psssstImg, psssstSubsubsubcat, seoTitle, seoDesc, psssstSlug } = body

    if (!psssstId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Update category using raw query
    const result = await prisma.$executeRaw`
      UPDATE category_four
      SET 
        psssst_img = ${psssstImg || ''},
        psssst_subsubsubcat = ${psssstSubsubsubcat || ''},
        "seoTitle" = ${seoTitle || ''},
        "seoDesc" = ${seoDesc || ''},
        psssst_slug = ${psssstSlug || ''},
        "updatedAt" = NOW()
      WHERE psssst_id = ${psssstId}
    `

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating category four:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

