const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProductCreation() {
  try {
    console.log('🧪 Testing product creation...')
    
    // Test data with minimal required fields
    const testProduct = {
      spuNo: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slug: 'test-product',
      name: 'Test Product',
      description: 'This is a test product description',
      shortDescription: 'Test product',
      sku: `TEST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      category1: 'Test Category',
      category2: null,
      category3: null,
      category4: null,
      fullCategory: 'Test Category',
      brand: 'Test Brand',
      supplier: 'Test Supplier',
      salePrice: 99.99,
      discountedPrice: null,
      msrp: 99.99,
      inventory: '10',
      mainImage: '/images/placeholder-product.jpg', // Using the default placeholder
      images: null,
      status: 'draft',
      metaTitle: 'Test Product Meta Title',
      metaDescription: 'Test product meta description',
      metaKeywords: 'test, product, example'
    }

    console.log('📝 Creating test product with data:', {
      name: testProduct.name,
      sku: testProduct.sku,
      category1: testProduct.category1,
      mainImage: testProduct.mainImage
    })

    const product = await prisma.product.create({
      data: testProduct
    })

    console.log('✅ Product created successfully!')
    console.log('📊 Product details:', {
      id: product.id,
      spuNo: product.spuNo,
      name: product.name,
      slug: product.slug,
      mainImage: product.mainImage
    })

    // Clean up - delete the test product
    await prisma.product.delete({
      where: { id: product.id }
    })

    console.log('🧹 Test product cleaned up successfully!')
    
  } catch (error) {
    console.error('❌ Error testing product creation:', error)
    
    if (error.code) {
      console.error('Prisma error code:', error.code)
      console.error('Prisma error meta:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testProductCreation()
