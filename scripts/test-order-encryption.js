require('dotenv').config()
const { encryptOrderData, decryptOrderData } = require('../src/lib/encryption')

function testOrderEncryption() {
  console.log('🧪 Testing Order Data Encryption')
  console.log('=' .repeat(50))
  
  const testOrderData = {
    coOrderId: 'TEST-ORDER-123',
    coUserId: 1,
    coType: 'guest',
    coNotes: 'Test order',
    coSubtotal: 29.99,
    coTotalDiscount: 0,
    coTotalPrice: 32.99,
    coPaymentType: 'PayPal',
    coStatus: 'Processing',
    coCreated: new Date().toISOString(),
    orderItems: JSON.stringify([
      { id: 'prod1', name: 'Test Product', price: 29.99, quantity: 1 }
    ]),
    shippingAddress: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      country: 'US'
    }),
    billingAddress: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      country: 'US'
    }),
    totalItems: 1,
    paypalResponse: {
      id: 'test-paypal-id',
      status: 'COMPLETED',
      payer: { email: 'test@example.com' }
    },
    coStyle: 'new'
  }
  
  try {
    console.log('Original order data:')
    console.log('- orderItems type:', typeof testOrderData.orderItems)
    console.log('- shippingAddress type:', typeof testOrderData.shippingAddress)
    console.log('- billingAddress type:', typeof testOrderData.billingAddress)
    console.log('- paypalResponse type:', typeof testOrderData.paypalResponse)
    
    // Test encryption
    const encryptedData = encryptOrderData(testOrderData)
    console.log('\nEncrypted order data:')
    console.log('- orderItems type:', typeof encryptedData.orderItems)
    console.log('- shippingAddress type:', typeof encryptedData.shippingAddress)
    console.log('- billingAddress type:', typeof encryptedData.billingAddress)
    console.log('- paypalResponse type:', typeof encryptedData.paypalResponse)
    
    // Check if encrypted fields are JSON strings
    const orderItemsParsed = JSON.parse(encryptedData.orderItems)
    const shippingParsed = JSON.parse(encryptedData.shippingAddress)
    const billingParsed = JSON.parse(encryptedData.billingAddress)
    const paypalParsed = JSON.parse(encryptedData.paypalResponse)
    
    console.log('\nEncrypted field structure:')
    console.log('- orderItems has encrypted property:', !!orderItemsParsed.encrypted)
    console.log('- shippingAddress has encrypted property:', !!shippingParsed.encrypted)
    console.log('- billingAddress has encrypted property:', !!billingParsed.encrypted)
    console.log('- paypalResponse has encrypted property:', !!paypalParsed.encrypted)
    
    // Test decryption
    const decryptedData = decryptOrderData(encryptedData)
    console.log('\nDecrypted order data:')
    console.log('- orderItems type:', typeof decryptedData.orderItems)
    console.log('- shippingAddress type:', typeof decryptedData.shippingAddress)
    console.log('- billingAddress type:', typeof decryptedData.billingAddress)
    console.log('- paypalResponse type:', typeof decryptedData.paypalResponse)
    
    // Verify data integrity
    const originalOrderItems = JSON.parse(testOrderData.orderItems)
    const decryptedOrderItems = JSON.parse(decryptedData.orderItems)
    const originalShipping = JSON.parse(testOrderData.shippingAddress)
    const decryptedShipping = JSON.parse(decryptedData.shippingAddress)
    
    console.log('\nData integrity check:')
    console.log('- orderItems match:', JSON.stringify(originalOrderItems) === JSON.stringify(decryptedOrderItems))
    console.log('- shippingAddress match:', JSON.stringify(originalShipping) === JSON.stringify(decryptedShipping))
    console.log('- paypalResponse match:', JSON.stringify(testOrderData.paypalResponse) === JSON.stringify(decryptedData.paypalResponse))
    
    console.log('\n✅ Order encryption test passed!')
    
  } catch (error) {
    console.error('❌ Order encryption test failed:', error.message)
    console.error('Error details:', error)
  }
  
  console.log('=' .repeat(50))
}

testOrderEncryption()
