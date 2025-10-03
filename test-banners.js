const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBanners() {
  try {
    console.log('Checking banners in database...')
    
    // Try both lowercase and uppercase
    try {
      const banners = await prisma.banner.findMany()
      console.log('Found banners (lowercase):', banners.length)
      console.log(JSON.stringify(banners, null, 2))
    } catch (err) {
      console.log('Lowercase failed:', err.message)
    }
    
    try {
      const banners = await prisma.Banner.findMany()
      console.log('Found banners (uppercase):', banners.length)
      console.log(JSON.stringify(banners, null, 2))
    } catch (err) {
      console.log('Uppercase failed:', err.message)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBanners()
