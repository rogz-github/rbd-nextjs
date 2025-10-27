import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check if categoryTwo exists in Prisma client
    if (!prisma.categoryTwo) {
      console.error('CategoryTwo model not found in Prisma client')
      return NextResponse.json(
        { error: 'CategoryTwo model not available. Please restart your dev server.' },
        { status: 503 }
      )
    }

    // Get all products with their category2 (filter out empty strings and null)
    const products = await prisma.product.findMany({
      select: {
        category1: true,
        category2: true
      },
      where: {
        category2: {
          not: ''
        },
        NOT: {
          category2: null
        }
      }
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No category_2 found in products' },
        { status: 404 }
      )
    }

    // Group by category2 to get unique categories with counts
    const categoryMap = new Map<string, { count: number; parentCategory: string }>()
    for (const product of products) {
      if (product.category2 && product.category1) {
        const existing = categoryMap.get(product.category2) || { count: 0, parentCategory: product.category1 }
        categoryMap.set(product.category2, {
          count: existing.count + 1,
          parentCategory: product.category1
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
      // Get or create parent category slug from CategoryOne
      const parentCategory = await prisma.categoryOne.findFirst({
        where: {
          pcstCat: data.parentCategory
        }
      })

      const parentSlug = parentCategory?.pcstSlug || data.parentCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // Check if category already exists
      const existingCategory = await prisma.categoryTwo.findFirst({
        where: {
          psstSubcat: categoryName
        }
      })

      if (existingCategory) {
        // Update existing category with new product count
        const updatedCategory = await prisma.categoryTwo.update({
          where: {
            psstId: existingCategory.psstId
          },
          data: {
            psstTotalProduct: data.count,
            updatedAt: new Date()
          }
        })

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

        // Get the next position
        const maxPosition = await prisma.categoryTwo.aggregate({
          _max: {
            psstPosition: true
          }
        })
        const nextPosition = (maxPosition._max.psstPosition || 0) + 1

        const newCategory = await prisma.categoryTwo.create({
          data: {
            psstImg: 'no_image_400.webp',
            psstPcstCat: data.parentCategory,
            psstSlug: slug,
            psstSubcat: categoryName,
            psstTotalProduct: data.count,
            psstProdHighprice: '0.00',
            psstPosition: nextPosition,
            cat1Slug: parentSlug,
            totalInstock: 0,
            totalOutstock: 0,
            totalCat3: 0,
            toShow: 1,
            seoTitle: categoryName,
            seoDesc: `Products in ${categoryName} subcategory`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        generatedCategories.push({
          action: 'created',
          category: newCategory
        })
        createdCount++
      }
    }

    return NextResponse.json({
      message: 'Category two generated successfully',
      created: createdCount,
      updated: updatedCount,
      total: generatedCategories.length,
      details: generatedCategories
    })

  } catch (error) {
    console.error('Error generating category two:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

