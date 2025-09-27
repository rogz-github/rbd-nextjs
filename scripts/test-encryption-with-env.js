require('dotenv').config()
const crypto = require('crypto')

// Test encryption functionality
function testEncryption() {
  console.log('🔐 Testing Encryption Functionality')
  console.log('=' .repeat(50))
  
  // Check if ENCRYPTION_KEY is set
  const encryptionKey = process.env.ENCRYPTION_KEY
  console.log('ENCRYPTION_KEY set:', !!encryptionKey)
  console.log('Key length:', encryptionKey ? encryptionKey.length : 0)
  
  if (!encryptionKey) {
    console.log('❌ No ENCRYPTION_KEY found in environment variables')
    console.log('Please add ENCRYPTION_KEY to your .env file')
    return
  }
  
  // Test basic encryption
  try {
    const testData = { test: 'Hello World', number: 123 }
    const iv = crypto.randomBytes(16)
    // Ensure we have exactly 32 bytes for AES-256
    const keyBuffer = Buffer.from(encryptionKey, 'hex')
    const key = keyBuffer.length >= 32 ? keyBuffer.slice(0, 32) : Buffer.concat([keyBuffer, Buffer.alloc(32 - keyBuffer.length)])
    console.log('Key length:', key.length, 'bytes')
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    
    let encrypted = cipher.update(JSON.stringify(testData), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    console.log('✅ Basic encryption test passed')
    console.log('Encrypted length:', encrypted.length)
    
    // Test decryption
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    const parsed = JSON.parse(decrypted)
    
    console.log('✅ Basic decryption test passed')
    console.log('Original data:', testData)
    console.log('Decrypted data:', parsed)
    console.log('Data matches:', JSON.stringify(testData) === JSON.stringify(parsed))
    
  } catch (error) {
    console.log('❌ Encryption test failed:', error.message)
  }
  
  console.log('=' .repeat(50))
}

testEncryption()
