const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  console.log('🗄️ Testing Database Connection')
  console.log('=' .repeat(50))
  
  const prisma = new PrismaClient()
  
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log('✅ User count query successful:', userCount)
    
    // Test order creation with minimal data
    const testOrder = await prisma.order.create({
      data: {
        coOrderId: `TEST-${Date.now()}`,
        coUserId: 1,
        coType: 'test',
        coNotes: 'Test order',
        coSubtotal: 10.00,
        coTotalDiscount: 0,
        coTotalPrice: 10.00,
        coPaymentType: 'Test',
        coStatus: 'Pending',
        coCreated: new Date().toISOString(),
        orderItems: '[]',
        shippingAddress: '{}',
        billingAddress: '{}',
        totalItems: 0,
        paypalResponse: { test: 'data' },
        coStyle: 'new'
      }
    })
    
    console.log('✅ Test order created successfully:', testOrder.coId)
    
    // Clean up test order
    await prisma.order.delete({
      where: { coId: testOrder.coId }
    })
    console.log('✅ Test order cleaned up')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.error('Error details:', error)
  } finally {
    await prisma.$disconnect()
  }
  
  console.log('=' .repeat(50))
}

testDatabase()
