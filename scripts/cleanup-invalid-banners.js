const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupInvalidBanners() {
  try {
    console.log('🧹 Starting cleanup of invalid banner references...')
    
    // Get all banners
    const banners = await prisma.banner.findMany()
    console.log(`Found ${banners.length} banners in database`)
    
    const invalidBanners = []
    
    for (const banner of banners) {
      let isInvalid = false
      
      // Check if image URL exists for IMAGE type banners
      if (banner.type === 'IMAGE' && banner.imageUrl) {
        const fs = require('fs')
        const path = require('path')
        
        // Check if it's a local file
        if (banner.imageUrl.startsWith('/images/banners/')) {
          const filePath = path.join(process.cwd(), 'public', banner.imageUrl)
          if (!fs.existsSync(filePath)) {
            console.log(`❌ Missing image file: ${banner.imageUrl}`)
            isInvalid = true
          }
        }
      }
      
      // Check if video URL exists for VIDEO type banners
      if (banner.type === 'VIDEO' && banner.videoUrl) {
        const fs = require('fs')
        const path = require('path')
        
        // Check if it's a local file
        if (banner.videoUrl.startsWith('/videos/banners/')) {
          const filePath = path.join(process.cwd(), 'public', banner.videoUrl)
          if (!fs.existsSync(filePath)) {
            console.log(`❌ Missing video file: ${banner.videoUrl}`)
            isInvalid = true
          }
        }
      }
      
      if (isInvalid) {
        invalidBanners.push(banner)
      }
    }
    
    console.log(`Found ${invalidBanners.length} invalid banners`)
    
    if (invalidBanners.length > 0) {
      console.log('\nInvalid banners:')
      invalidBanners.forEach(banner => {
        console.log(`- ID: ${banner.id}, Title: ${banner.title}`)
        console.log(`  Image: ${banner.imageUrl}`)
        console.log(`  Video: ${banner.videoUrl}`)
      })
      
      // Ask for confirmation before deleting
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      rl.question('\nDo you want to delete these invalid banners? (y/N): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('🗑️ Deleting invalid banners...')
          
          for (const banner of invalidBanners) {
            await prisma.banner.delete({
              where: { id: banner.id }
            })
            console.log(`✅ Deleted banner: ${banner.title}`)
          }
          
          console.log('✅ Cleanup completed!')
        } else {
          console.log('❌ Cleanup cancelled')
        }
        
        rl.close()
        await prisma.$disconnect()
      })
    } else {
      console.log('✅ No invalid banners found!')
      await prisma.$disconnect()
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

cleanupInvalidBanners()
