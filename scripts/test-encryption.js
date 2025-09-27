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
    console.log('Please run: node scripts/generate-encryption-key.js')
    return
  }
  
  // Test basic encryption
  try {
    const testData = { test: 'Hello World', number: 123 }
    const iv = crypto.randomBytes(16)
    const key = Buffer.from(encryptionKey, 'hex').slice(0, 32) // Use first 32 bytes
    const cipher = crypto.createCipherGCM('aes-256-gcm', key, iv)
    
    let encrypted = cipher.update(JSON.stringify(testData), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()
    
    console.log('✅ Basic encryption test passed')
    console.log('Encrypted length:', encrypted.length)
    
    // Test decryption
    const decipher = crypto.createDecipherGCM('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    
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
