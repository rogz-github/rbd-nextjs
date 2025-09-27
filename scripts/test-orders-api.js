const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testOrdersAPI() {
  console.log('🧪 Testing Orders API')
  console.log('=' .repeat(50))
  
  const testOrderData = {
    status: 'captured',
    amount: 29.99,
    currency: 'USD',
    userId: 1,
    userType: 'guest',
    cartItems: [
      {
        id: 'test-product-1',
        name: 'Test Product',
        price: 29.99,
        quantity: 1
      }
    ],
    paypalResponse: {
      id: 'test-paypal-id',
      status: 'COMPLETED'
    },
    captureId: 'test-capture-id',
    capturedAt: new Date().toISOString(),
    orderDetails: {
      orderNumber: `TEST-${Date.now()}`,
      subtotal: 29.99,
      tax: 2.40,
      shipping: 0,
      email: 'test@example.com',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
        phone: '555-123-4567'
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
        phone: '555-123-4567'
      }
    }
  }
  
  try {
    console.log('Sending test order data...')
    console.log('Order data:', JSON.stringify(testOrderData, null, 2))
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseData = await response.json()
    console.log('Response data:', JSON.stringify(responseData, null, 2))
    
    if (response.ok) {
      console.log('✅ Orders API test passed!')
    } else {
      console.log('❌ Orders API test failed!')
    }
    
  } catch (error) {
    console.error('❌ Orders API test error:', error.message)
    console.error('Error details:', error)
  }
  
  console.log('=' .repeat(50))
}

testOrdersAPI()
