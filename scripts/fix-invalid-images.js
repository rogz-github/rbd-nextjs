const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Helper function to validate image URLs
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    // If URL constructor fails, check if it starts with http/https
    return url.startsWith('http://') || url.startsWith('https://')
  }
}

// Helper function to sanitize image URL
function sanitizeImageUrl(url) {
  if (!url) return '/images/placeholder-product.jpg'
  
  // If it's already a valid URL, return it
  if (isValidImageUrl(url)) {
    return url
  }
  
  // If it starts with a slash, it's a relative path - make sure it starts with /
  if (url.startsWith('/')) {
    return url
  }
  
  // If it's just text or invalid data, return placeholder
  return '/images/placeholder-product.jpg'
}

async function fixInvalidImages() {
  try {
    console.log('🔍 Checking for products with invalid image URLs...')
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        mainImage: true,
        images: true
      }
    })
    
    console.log(`📊 Found ${products.length} products to check`)
    
    let fixedCount = 0
    let invalidMainImages = 0
    let invalidImageArrays = 0
    
    for (const product of products) {
      let needsUpdate = false
      const updateData = {}
      
      // Check main image
      if (!isValidImageUrl(product.mainImage)) {
        const sanitizedMainImage = sanitizeImageUrl(product.mainImage)
        updateData.mainImage = sanitizedMainImage
        needsUpdate = true
        invalidMainImages++
        console.log(`❌ Invalid main image for product ${product.id}: "${product.mainImage}" -> "${sanitizedMainImage}"`)
      }
      
      // Check images array
      if (product.images && Array.isArray(product.images)) {
        const sanitizedImages = product.images
          .filter(img => img && typeof img === 'object' && img.img)
          .map(img => ({
            ...img,
            img: sanitizeImageUrl(img.img)
          }))
          .filter(img => img.img !== '/images/placeholder-product.jpg' || product.images.length === 1)
        
        // Check if any images were changed
        const originalImages = JSON.stringify(product.images)
        const newImages = JSON.stringify(sanitizedImages)
        
        if (originalImages !== newImages) {
          updateData.images = sanitizedImages
          needsUpdate = true
          invalidImageArrays++
          console.log(`❌ Invalid images array for product ${product.id}`)
        }
      }
      
      // Update product if needed
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        })
        fixedCount++
      }
    }
    
    console.log('\n✅ Image cleanup completed!')
    console.log(`📈 Statistics:`)
    console.log(`   - Products checked: ${products.length}`)
    console.log(`   - Products updated: ${fixedCount}`)
    console.log(`   - Invalid main images: ${invalidMainImages}`)
    console.log(`   - Invalid image arrays: ${invalidImageArrays}`)
    
  } catch (error) {
    console.error('❌ Error fixing invalid images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixInvalidImages()













