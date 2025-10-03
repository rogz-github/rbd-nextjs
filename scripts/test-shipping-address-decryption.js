const { PrismaClient } = require('@prisma/client')

// Import the encryption module using dynamic import
async function loadEncryption() {
  const { decryptOrderData } = await import('../src/lib/encryption.ts')
  return { decryptOrderData }
}

const prisma = new PrismaClient()

async function testShippingAddressDecryption() {
  try {
    console.log('Testing shipping address decryption...')
    
    // Load encryption module
    const { decryptOrderData } = await loadEncryption()
    
    // Get the most recent order
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!order) {
      console.log('No orders found in database')
      return
    }
    
    console.log('Found order:', order.coId)
    console.log('Raw shipping address from DB:', order.shippingAddress)
    
    // Decrypt the order data
    const decryptedOrder = decryptOrderData(order)
    console.log('Decrypted shipping address:', decryptedOrder.shippingAddress)
    
    // Try to parse the decrypted address
    let shippingAddress = {}
    try {
      shippingAddress = decryptedOrder.shippingAddress || {}
      console.log('Parsed shipping address:', shippingAddress)
      
      if (shippingAddress.firstName) {
        console.log('✅ Shipping address decryption working!')
        console.log('Name:', shippingAddress.firstName, shippingAddress.lastName)
        console.log('Address:', shippingAddress.address)
        console.log('City:', shippingAddress.city)
        console.log('State:', shippingAddress.state)
        console.log('Zip:', shippingAddress.zipCode)
        console.log('Country:', shippingAddress.country)
      } else {
        console.log('❌ Shipping address is empty or not properly decrypted')
      }
    } catch (error) {
      console.error('Error parsing shipping address:', error)
    }
    
  } catch (error) {
    console.error('Error testing decryption:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testShippingAddressDecryption()
