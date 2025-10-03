const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedBanners() {
  try {
    console.log('🌱 Seeding banners...')

    // Clear existing banners
    await prisma.banner.deleteMany({})
    console.log('🗑️  Cleared existing banners')

    // Create sample banners
    const banners = [
      {
        title: "Hero Video",
        description: "Welcome to our store",
        imageUrl: "/images/banners/boys-warches-deal-20250507.webp",
        videoUrl: "/images/banners/102265-659832378_small.mp4",
        type: "VIDEO",
        position: 1,
        isActive: true,
        link: "/products"
      },
      {
        title: "Boys Watches Deal",
        description: "Amazing deals on boys watches",
        imageUrl: "/images/banners/boys-warches-deal-20250507.webp",
        type: "IMAGE",
        position: 2,
        isActive: true,
        link: "/products?category=watches"
      },
      {
        title: "Fall Into Savings",
        description: "Limited time deals - Up to 50% off",
        imageUrl: "/images/banners/fall-into-savings-limited-time-deals-20250917.webp",
        type: "IMAGE",
        position: 3,
        isActive: true,
        link: "/products?sale=true"
      },
      {
        title: "Patio Seating Deal",
        description: "Outdoor furniture special offers",
        imageUrl: "/images/banners/patio-seating-deal-20250507.webp",
        type: "IMAGE",
        position: 4,
        isActive: true,
        link: "/products?category=furniture"
      }
    ]

    // Insert banners
    for (const banner of banners) {
      await prisma.banner.create({
        data: banner
      })
      console.log(`✅ Created banner: ${banner.title}`)
    }

    console.log('🎉 Banner seeding completed!')
    
    // Display created banners
    const createdBanners = await prisma.banner.findMany({
      orderBy: { position: 'asc' }
    })
    
    console.log('\n📋 Created banners:')
    createdBanners.forEach(banner => {
      console.log(`- ${banner.position}. ${banner.title} (${banner.type}) - ${banner.isActive ? 'Active' : 'Inactive'}`)
    })

  } catch (error) {
    console.error('❌ Error seeding banners:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedBanners()
