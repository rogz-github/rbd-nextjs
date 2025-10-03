const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBottomBannerAPI() {
  try {
    console.log('Testing bottom banner API...')
    
    // Test database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test table exists and is accessible
    console.log('2. Testing banner_bottom_images table...')
    const count = await prisma.bannerBottomImages.count()
    console.log(`✅ Table accessible, current count: ${count}`)
    
    // Test creating a record
    console.log('3. Testing record creation...')
    const testRecord = await prisma.bannerBottomImages.create({
      data: {
        bgColor: '#FF0000',
        linkUrl: 'https://example.com',
        image: '/test-image.jpg'
      }
    })
    console.log('✅ Record created successfully:', testRecord)
    
    // Test reading the record
    console.log('4. Testing record retrieval...')
    const retrievedRecord = await prisma.bannerBottomImages.findUnique({
      where: { id: testRecord.id }
    })
    console.log('✅ Record retrieved successfully:', retrievedRecord)
    
    // Clean up test record
    console.log('5. Cleaning up test record...')
    await prisma.bannerBottomImages.delete({
      where: { id: testRecord.id }
    })
    console.log('✅ Test record deleted')
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

testBottomBannerAPI()
