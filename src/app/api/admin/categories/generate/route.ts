import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get all products with their category1 (filter out empty strings)
    const products = await prisma.product.findMany({
      select: {
        category1: true
      },
      where: {
        category1: {
          not: ''
        }
      }
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No categories found in products' },
        { status: 404 }
      )
    }

    // Group by category1 to get unique categories with counts
    const categoryMap = new Map<string, number>()
    for (const product of products) {
      if (product.category1) {
        const count = categoryMap.get(product.category1) || 0
        categoryMap.set(product.category1, count + 1)
      }
    }

    const generatedCategories = []
    let createdCount = 0
    let updatedCount = 0

    // Process each unique category
    const categories = Array.from(categoryMap.entries())
    console.log(`Found ${categories.length} unique categories to process`)
    
    for (const [categoryName, productCount] of categories) {
      // Check if category already exists
      const existingCategory = await prisma.categoryOne.findFirst({
        where: {
          pcstCat: categoryName
        }
      })

      if (existingCategory) {
        // Update existing category with new product count
        const updatedCategory = await prisma.categoryOne.update({
          where: {
            pcstId: existingCategory.pcstId
          },
          data: {
            totalProduct: productCount,
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
        const maxPosition = await prisma.categoryOne.aggregate({
          _max: {
            pcstPosition: true
          }
        })
        const nextPosition = (maxPosition._max.pcstPosition || 0) + 1

        const newCategory = await prisma.categoryOne.create({
          data: {
            pcstImg: 'no_image_400.webp',
            pcstSlug: slug,
            pcstCat: categoryName,
            totalProduct: productCount,
            pcstPosition: nextPosition,
            banner: null,
            imageVector: 'default-vector',
            cat2Lists: '[]',
            displayedItems: '[]',
            seoTitle: categoryName,
            seoDesc: `Products in ${categoryName} category`,
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
      message: 'Categories generated successfully',
      created: createdCount,
      updated: updatedCount,
      total: generatedCategories.length,
      details: generatedCategories
    })

  } catch (error) {
    console.error('Error generating categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

