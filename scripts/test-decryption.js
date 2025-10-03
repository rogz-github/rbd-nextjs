const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Copy the encryption logic from the lib file
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'

function getKey() {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  if (key.length >= 32) {
    return key.slice(0, 32)
  } else {
    const paddedKey = Buffer.alloc(32)
    key.copy(paddedKey)
    return paddedKey
  }
}

function decryptJson(encryptedData) {
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(encryptedData.iv, 'hex'))
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

function decryptOrderData(orderData) {
  const decrypted = { ...orderData }
  
  // Decrypt sensitive JSON fields
  if (orderData.shippingAddress) {
    try {
      const encryptedData = JSON.parse(orderData.shippingAddress)
      if (encryptedData.encrypted) {
        decrypted.shippingAddress = decryptJson(encryptedData)
      } else {
        decrypted.shippingAddress = orderData.shippingAddress
      }
    } catch (error) {
      decrypted.shippingAddress = orderData.shippingAddress
    }
  }
  
  if (orderData.billingAddress) {
    try {
      const encryptedData = JSON.parse(orderData.billingAddress)
      if (encryptedData.encrypted) {
        decrypted.billingAddress = decryptJson(encryptedData)
      } else {
        decrypted.billingAddress = orderData.billingAddress
      }
    } catch (error) {
      decrypted.billingAddress = orderData.billingAddress
    }
  }
  
  if (orderData.orderItems) {
    try {
      const encryptedData = JSON.parse(orderData.orderItems)
      if (encryptedData.encrypted) {
        decrypted.orderItems = decryptJson(encryptedData)
      } else {
        decrypted.orderItems = orderData.orderItems
      }
    } catch (error) {
      decrypted.orderItems = orderData.orderItems
    }
  }
  
  return decrypted
}

async function testDecryption() {
  try {
    console.log('Testing decryption...')
    console.log('ENCRYPTION_KEY exists:', !!process.env.ENCRYPTION_KEY)
    
    const orders = await prisma.order.findMany({ take: 1 })
    
    if (orders.length === 0) {
      console.log('No orders found')
      return
    }
    
    const order = orders[0]
    console.log('Order ID:', order.coId)
    
    // Test decryption
    const decryptedOrder = decryptOrderData(order)
    
    console.log('\n=== DECRYPTION RESULTS ===')
    console.log('Shipping Address Type:', typeof decryptedOrder.shippingAddress)
    console.log('Shipping Address:', JSON.stringify(decryptedOrder.shippingAddress, null, 2))
    
    console.log('\nBilling Address Type:', typeof decryptedOrder.billingAddress)
    console.log('Billing Address:', JSON.stringify(decryptedOrder.billingAddress, null, 2))
    
    console.log('\nOrder Items Type:', typeof decryptedOrder.orderItems)
    console.log('Order Items Length:', Array.isArray(decryptedOrder.orderItems) ? decryptedOrder.orderItems.length : 'Not an array')
    
    if (decryptedOrder.shippingAddress && decryptedOrder.shippingAddress.firstName) {
      console.log('\n✅ SUCCESS: Shipping address decrypted properly!')
      console.log('Name:', decryptedOrder.shippingAddress.firstName, decryptedOrder.shippingAddress.lastName)
      console.log('Address:', decryptedOrder.shippingAddress.address)
    } else {
      console.log('\n❌ FAILED: Shipping address not decrypted properly')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDecryption()
