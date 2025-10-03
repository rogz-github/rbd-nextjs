const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Import the encryption functions
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

async function debugOrderItems() {
  try {
    console.log('=== DEBUGGING ORDER ITEMS ===')
    
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
    
    // Try to decrypt the order data
    console.log('\n=== DECRYPTING ORDER DATA ===')
    const decryptedOrder = decryptOrderData(recentOrder)
    console.log('Decrypted order items type:', typeof decryptedOrder.orderItems)
    console.log('Decrypted order items:', decryptedOrder.orderItems)
    
    if (Array.isArray(decryptedOrder.orderItems)) {
      console.log('Number of decrypted items:', decryptedOrder.orderItems.length)
      
      if (decryptedOrder.orderItems.length > 0) {
        console.log('\n=== FIRST ITEM ANALYSIS ===')
        const firstItem = decryptedOrder.orderItems[0]
        console.log('First item:', firstItem)
        console.log('First item keys:', Object.keys(firstItem))
        
        // Check all possible price fields
        console.log('\n=== PRICE FIELD ANALYSIS ===')
        console.log('- sale_price:', firstItem.sale_price, typeof firstItem.sale_price)
        console.log('- price:', firstItem.price, typeof firstItem.price)
        console.log('- unitPrice:', firstItem.unitPrice, typeof firstItem.unitPrice)
        console.log('- msrp:', firstItem.msrp, typeof firstItem.msrp)
        console.log('- discounted_price:', firstItem.discounted_price, typeof firstItem.discounted_price)
        
        // Check quantity fields
        console.log('\n=== QUANTITY FIELD ANALYSIS ===')
        console.log('- prod_quantity:', firstItem.prod_quantity, typeof firstItem.prod_quantity)
        console.log('- quantity:', firstItem.quantity, typeof firstItem.quantity)
        console.log('- qty:', firstItem.qty, typeof firstItem.qty)
        
        // Test the parsing logic
        console.log('\n=== PARSING LOGIC TEST ===')
        const price = parseFloat((firstItem.sale_price || firstItem.price || firstItem.unitPrice || 0).toString()) || 0
        const quantity = firstItem.prod_quantity || firstItem.quantity || firstItem.qty || 1
        console.log('Parsed price:', price)
        console.log('Parsed quantity:', quantity)
        console.log('Total:', price * quantity)
      }
    } else {
      console.log('Decrypted order items is not an array:', decryptedOrder.orderItems)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugOrderItems()
