const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDisplayedItems() {
  try {
    console.log('Seeding displayed_items table...')
    
    // Sample data for different categories
    const sampleData = [
      {
        category: 'Sale',
        items: [
          { id: 1, title: 'Unisex Jogger Sweatpant - BLACK - XS', itemNumber: 'D0102H7WY96', price: 29.84, originalPrice: 34.16 },
          { id: 2, title: 'Cayla - Sofa Table - Dark Oak', itemNumber: 'D0102HEGL5X', price: 518.30, originalPrice: 609.76 },
          { id: 3, title: 'Wonder Nation Girls Kid Tough Ribbed Tank Top', itemNumber: 'D010275P748', price: 37.87, originalPrice: 47.34 }
        ]
      },
      {
        category: 'Featured',
        items: [
          { id: 4, title: 'VEVOR Low Profile Floor Jack 3 Ton', itemNumber: 'D0102HPCNKI', price: 89.99, originalPrice: 89.99 },
          { id: 5, title: 'Premium Wireless Headphones', itemNumber: 'D0102AUDIO1', price: 199.99, originalPrice: 249.99 }
        ]
      },
      {
        category: 'Powell Items',
        items: [
          { id: 6, title: 'Powell Office Chair - Black', itemNumber: 'POW001', price: 299.99, originalPrice: 299.99 },
          { id: 7, title: 'Powell Desk Lamp - Silver', itemNumber: 'POW002', price: 49.99, originalPrice: 69.99 }
        ]
      }
    ]

    // Clear existing data
    await prisma.displayedItems.deleteMany()
    console.log('Cleared existing displayed items')

    // Insert sample data
    for (const data of sampleData) {
      const result = await prisma.displayedItems.create({
        data: {
          category: data.category,
          items: data.items
        }
      })
      console.log(`✅ Created ${data.category} category with ${data.items.length} items (ID: ${result.id})`)
    }

    console.log('\n🎉 Successfully seeded displayed_items table!')
    
    // Show final count
    const totalItems = await prisma.displayedItems.count()
    console.log(`Total categories in database: ${totalItems}`)

  } catch (error) {
    console.error('❌ Error seeding displayed items:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDisplayedItems()
