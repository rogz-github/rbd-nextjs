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

async function testCurrentOrder() {
  try {
    console.log('=== TESTING CURRENT ORDER ===')
    
    // Get the most recent order
    const recentOrder = await prisma.order.findFirst({
      orderBy: { coCreated: 'desc' }
    })
    
    if (!recentOrder) {
      console.log('No orders found')
      return
    }
    
    console.log('Recent order ID:', recentOrder.coId)
    
    // Decrypt the order data
    const decryptedOrder = decryptOrderData(recentOrder)
    console.log('Decrypted order items type:', typeof decryptedOrder.orderItems)
    
    if (Array.isArray(decryptedOrder.orderItems)) {
      console.log('Number of decrypted items:', decryptedOrder.orderItems.length)
      
      // Test the parsing logic exactly as in the API
      const orderItems = decryptedOrder.orderItems.map((item, index) => {
        const price = parseFloat((item.sale_price || item.price || item.unitPrice || 0).toString()) || 0
        const quantity = item.prod_quantity || item.quantity || item.qty || 1
        
        console.log(`\nItem ${index + 1}:`)
        console.log('- Name:', item.name)
        console.log('- sale_price:', item.sale_price, typeof item.sale_price)
        console.log('- Parsed price:', price)
        console.log('- Quantity:', quantity)
        console.log('- Total:', price * quantity)
        
        return {
          id: index + 1,
          quantity: quantity,
          price: price,
          product: {
            id: item.prod_id || item.productId || index + 1,
            name: item.name || item.productName || 'Unknown Product',
            price: price,
            images: item.images || (item.main_image ? [item.main_image] : []),
            description: item.description || ''
          }
        }
      })
      
      console.log('\n=== FINAL PARSED ORDER ITEMS ===')
      orderItems.forEach((item, index) => {
        console.log(`Item ${index + 1}: ${item.product.name} - $${item.price} x ${item.quantity} = $${item.price * item.quantity}`)
      })
      
      // Test totals calculation
      const subtotal = parseFloat((decryptedOrder.coSubtotal || 0).toString()) || 0
      const tax = subtotal * 0.08
      const shipping = subtotal >= 50 ? 0 : 9.99
      const total = parseFloat((decryptedOrder.coTotalPrice || 0).toString()) || 0
      
      console.log('\n=== ORDER SUMMARY ===')
      console.log('- Subtotal:', subtotal)
      console.log('- Tax (8%):', tax)
      console.log('- Shipping:', shipping)
      console.log('- Total:', total)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCurrentOrder()
