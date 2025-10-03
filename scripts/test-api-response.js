const https = require('https')
const http = require('http')

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

async function testAPIResponse() {
  try {
    console.log('=== TESTING API RESPONSE ===')
    
    // Test the order API endpoint
    const response = await makeRequest('http://localhost:3000/api/orders/user/6')
    const data = response.data
    
    console.log('API Response Status:', response.status)
    console.log('API Response Success:', data.success)
    
    if (data.success && data.order) {
      console.log('\n=== ORDER DATA ===')
      console.log('Order ID:', data.order.coId)
      console.log('Order Items Count:', data.order.orderItems?.length || 0)
      
      if (data.order.orderItems && data.order.orderItems.length > 0) {
        console.log('\n=== ORDER ITEMS ===')
        data.order.orderItems.forEach((item, index) => {
          console.log(`\nItem ${index + 1}:`)
          console.log('- Name:', item.product.name)
          console.log('- Price:', item.price)
          console.log('- Quantity:', item.quantity)
          console.log('- Total:', item.price * item.quantity)
          console.log('- Product ID:', item.product.id)
        })
        
        console.log('\n=== ORDER SUMMARY ===')
        console.log('- Subtotal:', data.order.subtotal)
        console.log('- Tax:', data.order.tax)
        console.log('- Shipping:', data.order.shipping)
        console.log('- Total:', data.order.total)
      }
    } else {
      console.log('API Error:', data.error || 'Unknown error')
    }
    
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

testAPIResponse()
