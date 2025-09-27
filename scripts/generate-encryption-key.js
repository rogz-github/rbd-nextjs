const crypto = require('crypto')

// Generate a more secure 64-byte (512-bit) key using multiple entropy sources
const randomBytes1 = crypto.randomBytes(32)
const randomBytes2 = crypto.randomBytes(32)
const timestamp = Buffer.from(Date.now().toString())
const processId = Buffer.from(process.pid.toString())

// Combine multiple entropy sources for maximum randomness
const combinedEntropy = Buffer.concat([randomBytes1, randomBytes2, timestamp, processId])

// Create a more complex key using PBKDF2 with additional salt
const salt = crypto.randomBytes(16)
const derivedKey = crypto.pbkdf2Sync(combinedEntropy, salt, 100000, 64, 'sha512')

// Convert to hex and add some additional complexity
const encryptionKey = derivedKey.toString('hex') + crypto.randomBytes(8).toString('hex')

console.log('🔐 Generated Ultra-Secure Encryption Key:')
console.log('=' .repeat(80))
console.log(encryptionKey)
console.log('=' .repeat(80))
console.log('\n📝 Add this to your .env file:')
console.log(`ENCRYPTION_KEY="${encryptionKey}"`)
console.log('\n⚠️  SECURITY WARNINGS:')
console.log('• Keep this key secure and never commit it to version control!')
console.log('• Store it in a secure password manager')
console.log('• Use different keys for different environments')
console.log('• If compromised, generate a new key and re-encrypt all data')
console.log('\n🔒 Key Strength: 512-bit + PBKDF2 + Multiple Entropy Sources')
console.log('📊 Key Length:', encryptionKey.length, 'characters')
