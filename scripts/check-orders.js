const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({ take: 1 })
    console.log('Orders found:', orders.length)
    
    if (orders.length > 0) {
      const order = orders[0]
      console.log('First order ID:', order.coId)
      console.log('Raw shipping address:', order.shippingAddress)
      console.log('Raw billing address:', order.billingAddress)
      console.log('Raw order items:', order.orderItems)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrders()
