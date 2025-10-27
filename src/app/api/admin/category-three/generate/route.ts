import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // First check if category_three table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM category_three LIMIT 1`
    } catch (error) {
      return NextResponse.json(
        { error: 'CategoryThree table does not exist. Please run: npx prisma migrate deploy' },
        { status: 503 }
      )
    }

    // Get all products with their category3 (filter out empty strings and null)
    const products = await prisma.product.findMany({
      select: {
        category1: true,
        category2: true,
        category3: true,
        category4: true
      },
      where: {
        category3: {
          not: ''
        },
        NOT: {
          category3: null
        }
      }
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No category_3 found in products' },
        { status: 404 }
      )
    }

    // Group by category3 to get unique categories with counts
    const categoryMap = new Map<string, { count: number; parentCategory: string; parentSubcat: string; cat4?: string }>()
    for (const product of products) {
      if (product.category3) {
        const existing = categoryMap.get(product.category3) || { 
          count: 0, 
          parentCategory: product.category1 || '', 
          parentSubcat: product.category2 || '',
          cat4: product.category4 || ''
        }
        categoryMap.set(product.category3, {
          count: existing.count + 1,
          parentCategory: product.category1 || existing.parentCategory,
          parentSubcat: product.category2 || existing.parentSubcat,
          cat4: product.category4 || existing.cat4
        })
      }
    }

    const generatedCategories = []
    let createdCount = 0
    let updatedCount = 0

    // Process each unique category
    const categories = Array.from(categoryMap.entries())
    console.log(`Found ${categories.length} unique categories to process`)
    
    for (const [categoryName, data] of categories) {
      // Get or create parent category slugs
      const parentCategory = await prisma.categoryOne.findFirst({
        where: {
          pcstCat: data.parentCategory
        }
      })

      const parentSlug = parentCategory?.pcstSlug || data.parentCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // Get category2 slug using raw query
      const category2Result = await prisma.$queryRaw<any>`
        SELECT * FROM category_two WHERE psst_subcat = ${data.parentSubcat} LIMIT 1
      `
      const category2Item = category2Result[0]

      const category2Slug = category2Item?.psstSlug || data.parentSubcat.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // Check if category already exists using raw query
      const existingCategory = await prisma.$queryRaw<any>`
        SELECT * FROM category_three WHERE pssst_subsubcat = ${categoryName} LIMIT 1
      `

      if (existingCategory && existingCategory.length > 0) {
        // Update existing category with new product count
        await prisma.$executeRaw`
          UPDATE category_three 
          SET pssst_total_product = ${data.count}, "updatedAt" = NOW()
          WHERE pssst_id = ${existingCategory[0].pssst_id}
        `
        
        const updatedCategory = existingCategory[0]

        generatedCategories.push({
          action: 'updated',
          category: updatedCategory
        })
        updatedCount++
      } else {
        // Create new category
        // Generate slug from category name
        const slug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        // Get the next position using raw query
        const maxPosition = await prisma.$queryRaw<any>`
          SELECT MAX(pssst_position) as max_pos FROM category_three
        `
        const nextPosition = (maxPosition[0]?.max_pos || 0) + 1

        // Insert new category using raw query
        const result = await prisma.$executeRaw`
          INSERT INTO category_three (
            pssst_img, pssst_cat, pssst_subcat, pssst_subsubcat, pssst_slug,
            pssst_total_product, pssst_highprice, pssst_position,
            cat1_slug, cat2_slug, total_instock, total_outstock,
            cat4_slug, cat2_total_instock, "seoTitle", "seoDesc", "createdAt", "updatedAt"
          ) VALUES (
            '', ${data.parentCategory}, ${data.parentSubcat}, ${categoryName}, ${slug},
            ${data.count}, '', ${nextPosition},
            ${parentSlug}, ${category2Slug}, 0, 0,
            ${data.cat4 || ''}, 0, ${categoryName}, ${`Products in ${categoryName} subcategory`}, NOW(), NOW()
          )
        `
        
        // Fetch the newly created category
        const newCategoryResult = await prisma.$queryRaw<any>`
          SELECT * FROM category_three WHERE pssst_subsubcat = ${categoryName} LIMIT 1
        `
        const newCategory = newCategoryResult[0]

        generatedCategories.push({
          action: 'created',
          category: newCategory
        })
        createdCount++
      }
    }

    return NextResponse.json({
      message: 'Category three generated successfully',
      created: createdCount,
      updated: updatedCount,
      total: generatedCategories.length,
      details: generatedCategories
    })

  } catch (error) {
    console.error('Error generating category three:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

