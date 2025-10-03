const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrderItems() {
  try {
    console.log('=== Testing Order Items ===')
    
    // Get the most recent order
    const recentOrder = await prisma.order.findFirst({
      orderBy: { coCreated: 'desc' }
    })
    
    if (!recentOrder) {
      console.log('No orders found')
      return
    }
    
    console.log('Recent order ID:', recentOrder.coId)
    console.log('Order items type:', typeof recentOrder.orderItems)
    console.log('Order items length:', recentOrder.orderItems?.length || 0)
    
    // Try to parse the order items
    let parsedItems
    try {
      if (typeof recentOrder.orderItems === 'string') {
        parsedItems = JSON.parse(recentOrder.orderItems)
      } else {
        parsedItems = recentOrder.orderItems
      }
      
      console.log('Parsed items:', parsedItems)
      console.log('Number of parsed items:', parsedItems.length)
      
      if (parsedItems.length > 0) {
        console.log('First item:', parsedItems[0])
        console.log('First item keys:', Object.keys(parsedItems[0]))
        
        // Check for price fields
        const firstItem = parsedItems[0]
        console.log('Price fields in first item:')
        console.log('- sale_price:', firstItem.sale_price)
        console.log('- price:', firstItem.price)
        console.log('- unitPrice:', firstItem.unitPrice)
        console.log('- msrp:', firstItem.msrp)
        console.log('- discounted_price:', firstItem.discounted_price)
      }
    } catch (error) {
      console.error('Error parsing order items:', error)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrderItems()
