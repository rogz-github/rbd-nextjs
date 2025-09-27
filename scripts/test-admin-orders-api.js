const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdminOrdersAPI() {
  console.log('🧪 Testing Admin Orders API');
  console.log('=' .repeat(50));
  
  try {
    console.log('Making request to /api/admin/orders...');
    const response = await fetch('http://localhost:3000/api/admin/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Admin Orders API test passed!');
      console.log('Number of orders:', data.length);
    } else {
      console.log('❌ Admin Orders API test failed!');
      console.log('Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Admin Orders API test error:', error.message);
  }
  
  console.log('=' .repeat(50));
}

testAdminOrdersAPI();
