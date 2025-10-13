const { PrismaClient } = require('@prisma/client')

// Import encryption functions
const crypto = require('crypto')

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'

// Ensure we use only the first 32 bytes (256 bits) for AES-256
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
  
  return decrypted
}

const prisma = new PrismaClient()

async function debugOrderAddresses() {
  try {
    console.log('🔍 Debugging order addresses...\n')
    
    // Get order ID from command line argument
    const orderId = process.argv[2]
    if (!orderId) {
      console.log('Usage: node scripts/debug-order-addresses.js <orderId>')
      console.log('Example: node scripts/debug-order-addresses.js 2')
      process.exit(1)
    }
    
    console.log(`📋 Fetching order ${orderId}...`)
    
    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { coId: parseInt(orderId) }
    })
    
    if (!order) {
      console.log('❌ Order not found')
      return
    }
    
    console.log('✅ Order found')
    console.log('📊 Order details:')
    console.log(`  - ID: ${order.coId}`)
    console.log(`  - Order ID: ${order.coOrderId}`)
    console.log(`  - Status: ${order.coStatus}`)
    console.log(`  - User ID: ${order.coUserId}`)
    console.log(`  - Created: ${order.createdAt}`)
    console.log(`  - Total Price: ${order.coTotalPrice}`)
    
    console.log('\n🔐 Raw encrypted data:')
    console.log('  - shippingAddress (raw):', order.shippingAddress)
    console.log('  - billingAddress (raw):', order.billingAddress)
    console.log('  - orderItems (raw):', order.orderItems ? order.orderItems.substring(0, 100) + '...' : 'null')
    
    console.log('\n🔓 Decrypting data...')
    const decryptedOrder = decryptOrderData(order)
    
    console.log('  - shippingAddress (decrypted):', decryptedOrder.shippingAddress)
    console.log('  - billingAddress (decrypted):', decryptedOrder.billingAddress)
    
    // Try to parse addresses
    console.log('\n📝 Parsing addresses...')
    let shippingAddress = {}
    let billingAddress = {}
    
    try {
      if (decryptedOrder.shippingAddress) {
        if (typeof decryptedOrder.shippingAddress === 'string') {
          shippingAddress = JSON.parse(decryptedOrder.shippingAddress)
        } else {
          shippingAddress = decryptedOrder.shippingAddress
        }
      }
      
      if (decryptedOrder.billingAddress) {
        if (typeof decryptedOrder.billingAddress === 'string') {
          billingAddress = JSON.parse(decryptedOrder.billingAddress)
        } else {
          billingAddress = decryptedOrder.billingAddress
        }
      }
      
      console.log('✅ Addresses parsed successfully')
      console.log('  - shippingAddress (parsed):', shippingAddress)
      console.log('  - billingAddress (parsed):', billingAddress)
      
    } catch (error) {
      console.log('❌ Error parsing addresses:', error.message)
    }
    
    // Check if addresses have required fields
    console.log('\n🔍 Address validation:')
    console.log('  - Shipping address has firstName:', !!shippingAddress.firstName)
    console.log('  - Shipping address has lastName:', !!shippingAddress.lastName)
    console.log('  - Shipping address has address:', !!(shippingAddress.address || shippingAddress.address1))
    console.log('  - Shipping address has city:', !!shippingAddress.city)
    console.log('  - Shipping address has state:', !!shippingAddress.state)
    console.log('  - Shipping address has country:', !!shippingAddress.country)
    
    console.log('  - Billing address has firstName:', !!billingAddress.firstName)
    console.log('  - Billing address has lastName:', !!billingAddress.lastName)
    console.log('  - Billing address has address:', !!(billingAddress.address || billingAddress.address1))
    console.log('  - Billing address has city:', !!billingAddress.city)
    console.log('  - Billing address has state:', !!billingAddress.state)
    console.log('  - Billing address has country:', !!billingAddress.country)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugOrderAddresses()
