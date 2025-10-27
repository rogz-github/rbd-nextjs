const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCategoryGeneration() {
  try {
    console.log('Testing category generation...')
    
    // First, let's see what categories exist in products
    const productCategories = await prisma.product.findMany({
      select: {
        category1: true
      },
      distinct: ['category1'],
      where: {
        category1: {
          not: null
        }
      },
      take: 10
    })

    console.log('Found product categories:', productCategories)

    // Count products for each category
    for (const cat of productCategories) {
      if (cat.category1) {
        const count = await prisma.product.count({
          where: {
            category1: cat.category1
          }
        })
        console.log(`Category: ${cat.category1} - Products: ${count}`)
      }
    }

    // Check existing CategoryOne records
    const existingCategories = await prisma.categoryOne.findMany({
      take: 5
    })
    console.log('Existing CategoryOne records:', existingCategories.length)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCategoryGeneration()

