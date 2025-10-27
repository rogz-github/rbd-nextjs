import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // First check if category_four table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM category_four LIMIT 1`
    } catch (error) {
      return NextResponse.json(
        { error: 'CategoryFour table does not exist. Please run: npx prisma migrate deploy' },
        { status: 503 }
      )
    }

    // Get all products with their category4 (filter out empty strings and null)
    const products = await prisma.product.findMany({
      select: {
        category1: true,
        category2: true,
        category3: true,
        category4: true
      },
      where: {
        category4: {
          not: ''
        },
        NOT: {
          category4: null
        }
      }
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No category_4 found in products' },
        { status: 404 }
      )
    }

    // Group by category4 to get unique categories with counts
    const categoryMap = new Map<string, { count: number; parentCategory: string; parentSubcat: string; parentSubsubcat: string }>()
    for (const product of products) {
      if (product.category4) {
        const existing = categoryMap.get(product.category4) || { 
          count: 0, 
          parentCategory: product.category1 || '', 
          parentSubcat: product.category2 || '',
          parentSubsubcat: product.category3 || ''
        }
        categoryMap.set(product.category4, {
          count: existing.count + 1,
          parentCategory: product.category1 || existing.parentCategory,
          parentSubcat: product.category2 || existing.parentSubcat,
          parentSubsubcat: product.category3 || existing.parentSubsubcat
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

      // Get category3 slug using raw query
      const category3Result = await prisma.$queryRaw<any>`
        SELECT * FROM category_three WHERE pssst_subsubcat = ${data.parentSubsubcat} LIMIT 1
      `
      const category3Item = category3Result[0]
      const category3Slug = category3Item?.pssstSlug || data.parentSubsubcat.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // Check if category already exists using raw query
      const existingCategory = await prisma.$queryRaw<any>`
        SELECT * FROM category_four WHERE psssst_subsubsubcat = ${categoryName} LIMIT 1
      `

      if (existingCategory && existingCategory.length > 0) {
        // Update existing category with new product count
        await prisma.$executeRaw`
          UPDATE category_four 
          SET psssst_total_product = ${data.count}, "updatedAt" = NOW()
          WHERE psssst_id = ${existingCategory[0].psssst_id}
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
          SELECT MAX(psssst_position) as max_pos FROM category_four
        `
        const nextPosition = (maxPosition[0]?.max_pos || 0) + 1

        // Insert new category using raw query
        await prisma.$executeRaw`
          INSERT INTO category_four (
            psssst_img, psssst_cat, psssst_subcat, psssst_subsubcat, psssst_subsubsubcat, psssst_slug,
            psssst_total_product, psssst_highprice, psssst_position,
            cat1_slug, cat2_slug, cat3_slug, total_instock, total_outstock,
            "seoTitle", "seoDesc", "createdAt", "updatedAt"
          ) VALUES (
            '', ${data.parentCategory}, ${data.parentSubcat}, ${data.parentSubsubcat}, ${categoryName}, ${slug},
            ${data.count}, 0, ${nextPosition},
            ${parentSlug}, ${category2Slug}, ${category3Slug}, 0, 0,
            ${categoryName}, ${`Products in ${categoryName} subcategory`}, NOW(), NOW()
          )
        `
        
        // Fetch the newly created category
        const newCategoryResult = await prisma.$queryRaw<any>`
          SELECT * FROM category_four WHERE psssst_subsubsubcat = ${categoryName} LIMIT 1
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
      message: 'Category four generated successfully',
      created: createdCount,
      updated: updatedCount,
      total: generatedCategories.length,
      details: generatedCategories
    })

  } catch (error) {
    console.error('Error generating category four:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

