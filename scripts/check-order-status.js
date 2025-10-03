const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOrderStatus() {
  try {
    console.log('Checking order status in database...')
    
    // Get the most recent order
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!order) {
      console.log('No orders found in database')
      return
    }
    
    console.log('Order ID:', order.coId)
    console.log('coStatus in database:', order.coStatus)
    console.log('coStatus type:', typeof order.coStatus)
    console.log('coStatus length:', order.coStatus?.length)
    
    // Check if there are any orders with PROCESSING status
    const processingOrders = await prisma.order.findMany({
      where: { coStatus: 'PROCESSING' }
    })
    
    console.log(`Found ${processingOrders.length} orders with PROCESSING status`)
    
    // Check if there are any orders with PENDING status
    const pendingOrders = await prisma.order.findMany({
      where: { coStatus: 'PENDING' }
    })
    
    console.log(`Found ${pendingOrders.length} orders with PENDING status`)
    
    // List all unique statuses
    const allOrders = await prisma.order.findMany({
      select: { coStatus: true },
      distinct: ['coStatus']
    })
    
    console.log('All unique statuses in database:', allOrders.map(o => o.coStatus))
    
  } catch (error) {
    console.error('Error checking order status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrderStatus()

