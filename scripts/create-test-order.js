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

function encryptJson(data) {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: ''
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

function encryptOrderData(orderData) {
  const encrypted = { ...orderData }
  
  if (orderData.orderItems) {
    try {
      const itemsData = typeof orderData.orderItems === 'string' 
        ? JSON.parse(orderData.orderItems) 
        : orderData.orderItems
      encrypted.orderItems = JSON.stringify(encryptJson(itemsData))
    } catch (error) {
      console.error('Error encrypting orderItems:', error)
      encrypted.orderItems = orderData.orderItems
    }
  }
  
  return encrypted
}

async function createTestOrder() {
  try {
    console.log('=== CREATING TEST ORDER ===')
    
    // Create test cart items
    const testCartItems = [
      {
        cart_id: 'test-cart-1',
        user_type: 'authenticated',
        user_id: 2,
        prod_id: 'test-product-1',
        prod_quantity: 2,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product_id: 'test-product-1',
        spu_no: 'test-spu-1',
        name: 'Test Product 1',
        slug: 'test-product-1',
        sale_price: '50.00',
        msrp: '60.00',
        discounted_price: '45.00',
        main_image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300'],
        brand: 'Test Brand',
        category_1: 'Test Category',
        inventory: '10',
        itemTotal: 100
      },
      {
        cart_id: 'test-cart-2',
        user_type: 'authenticated',
        user_id: 2,
        prod_id: 'test-product-2',
        prod_quantity: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product_id: 'test-product-2',
        spu_no: 'test-spu-2',
        name: 'Test Product 2',
        slug: 'test-product-2',
        sale_price: '75.00',
        msrp: '90.00',
        discounted_price: '70.00',
        main_image: 'https://via.placeholder.com/300',
        images: ['https://via.placeholder.com/300'],
        brand: 'Test Brand 2',
        category_1: 'Test Category 2',
        inventory: '5',
        itemTotal: 75
      }
    ]
    
    // Create test order data
    const orderData = {
      coOrderId: `TEST-ORDER-${Date.now()}`,
      coUserId: 2,
      coType: 'authenticated',
      coNotes: 'Test Order',
      coSubtotal: 175.00,
      coTax: 14.00,
      coShipping: 0.00,
      coTotalDiscount: 0,
      coTotalPrice: 189.00,
      coPaymentType: 'Test',
      coStatus: 'Processing',
      coCreated: new Date().toISOString(),
      orderItems: JSON.stringify(testCartItems),
      shippingAddress: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
        phone: '555-1234'
      }),
      billingAddress: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
        phone: '555-1234'
      }),
      totalItems: 2,
      paypalResponse: null,
      coStyle: 'new',
      coPendingDate: null,
      coProcessingDate: new Date().toISOString()
    }
    
    console.log('Test order data:', orderData)
    
    // Encrypt the data
    const encryptedData = encryptOrderData(orderData)
    console.log('Encrypted order items type:', typeof encryptedData.orderItems)
    
    // Create the order
    const order = await prisma.order.create({
      data: encryptedData
    })
    
    console.log('Test order created with ID:', order.coId)
    console.log('Order items in database:', order.orderItems.substring(0, 100) + '...')
    
  } catch (error) {
    console.error('Error creating test order:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder()
