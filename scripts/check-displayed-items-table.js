const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDisplayedItemsTable() {
  try {
    console.log('Checking displayed_items table...')
    
    // Try to query the table to see if it exists
    const result = await prisma.displayedItems.findMany({
      take: 1
    })
    
    console.log('✅ displayed_items table exists and is accessible')
    console.log('Table structure:')
    console.log('- id: Int (Primary Key, Auto-increment)')
    console.log('- category: String')
    console.log('- items: Json')
    console.log('- createdAt: DateTime')
    console.log('- updatedAt: DateTime')
    
    console.log(`\nCurrent records in table: ${result.length}`)
    
    if (result.length > 0) {
      console.log('Sample record:', result[0])
    }
    
  } catch (error) {
    console.error('❌ Error accessing displayed_items table:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDisplayedItemsTable()
