import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'

// Ensure we use only the first 32 bytes (256 bits) for AES-256
function getKey(): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  // If key is longer than 32 bytes, truncate it; if shorter, pad it
  if (key.length >= 32) {
    return key.slice(0, 32)
  } else {
    // Pad with zeros if key is too short (shouldn't happen with our generator)
    const paddedKey = Buffer.alloc(32)
    key.copy(paddedKey)
    return paddedKey
  }
}

interface EncryptedData {
  encrypted: string
  iv: string
  tag: string
}

/**
 * Encrypt JSON data using AES-256-CBC
 */
export function encryptJson(data: any): EncryptedData {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: '' // Not needed for CBC mode
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt JSON data using AES-256-CBC
 */
export function decryptJson(encryptedData: EncryptedData): any {
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

/**
 * Encrypt sensitive fields in order data
 */
export function encryptOrderData(orderData: any) {
  const encrypted = { ...orderData }
  
  // Encrypt sensitive JSON fields and store as JSON strings
  if (orderData.paypalResponse) {
    try {
      // Parse if it's a string, otherwise use as-is
      const paypalData = typeof orderData.paypalResponse === 'string' 
        ? JSON.parse(orderData.paypalResponse) 
        : orderData.paypalResponse
      encrypted.paypalResponse = JSON.stringify(encryptJson(paypalData))
    } catch (error) {
      console.error('Error encrypting paypalResponse:', error)
      // Keep original data if encryption fails
      encrypted.paypalResponse = orderData.paypalResponse
    }
  }
  
  if (orderData.shippingAddress) {
    try {
      // Parse if it's a string, otherwise use as-is
      const shippingData = typeof orderData.shippingAddress === 'string' 
        ? JSON.parse(orderData.shippingAddress) 
        : orderData.shippingAddress
      encrypted.shippingAddress = JSON.stringify(encryptJson(shippingData))
    } catch (error) {
      console.error('Error encrypting shippingAddress:', error)
      // Keep original data if encryption fails
      encrypted.shippingAddress = orderData.shippingAddress
    }
  }
  
  if (orderData.billingAddress) {
    try {
      // Parse if it's a string, otherwise use as-is
      const billingData = typeof orderData.billingAddress === 'string' 
        ? JSON.parse(orderData.billingAddress) 
        : orderData.billingAddress
      encrypted.billingAddress = JSON.stringify(encryptJson(billingData))
    } catch (error) {
      console.error('Error encrypting billingAddress:', error)
      // Keep original data if encryption fails
      encrypted.billingAddress = orderData.billingAddress
    }
  }
  
  if (orderData.orderItems) {
    try {
      // Parse if it's a string, otherwise use as-is
      const itemsData = typeof orderData.orderItems === 'string' 
        ? JSON.parse(orderData.orderItems) 
        : orderData.orderItems
      encrypted.orderItems = JSON.stringify(encryptJson(itemsData))
    } catch (error) {
      console.error('Error encrypting orderItems:', error)
      // Keep original data if encryption fails
      encrypted.orderItems = orderData.orderItems
    }
  }
  
  return encrypted
}

/**
 * Decrypt sensitive fields in order data
 */
export function decryptOrderData(orderData: any) {
  const decrypted = { ...orderData }
  
  // Decrypt sensitive JSON fields
  if (orderData.paypalResponse) {
    try {
      // Try to parse as encrypted JSON string first
      const encryptedData = JSON.parse(orderData.paypalResponse)
      if (encryptedData.encrypted) {
        decrypted.paypalResponse = decryptJson(encryptedData)
      } else {
        // If not encrypted, keep as is
        decrypted.paypalResponse = orderData.paypalResponse
      }
    } catch (error) {
      // If parsing fails, it might be unencrypted data
      decrypted.paypalResponse = orderData.paypalResponse
    }
  }
  
  if (orderData.shippingAddress) {
    try {
      // Try to parse as encrypted JSON string first
      const encryptedData = JSON.parse(orderData.shippingAddress)
      if (encryptedData.encrypted) {
        decrypted.shippingAddress = decryptJson(encryptedData)
      } else {
        // If not encrypted, keep as is
        decrypted.shippingAddress = orderData.shippingAddress
      }
    } catch (error) {
      // If parsing fails, it might be unencrypted data
      decrypted.shippingAddress = orderData.shippingAddress
    }
  }
  
  if (orderData.billingAddress) {
    try {
      // Try to parse as encrypted JSON string first
      const encryptedData = JSON.parse(orderData.billingAddress)
      if (encryptedData.encrypted) {
        decrypted.billingAddress = decryptJson(encryptedData)
      } else {
        // If not encrypted, keep as is
        decrypted.billingAddress = orderData.billingAddress
      }
    } catch (error) {
      // If parsing fails, it might be unencrypted data
      decrypted.billingAddress = orderData.billingAddress
    }
  }
  
  if (orderData.orderItems) {
    try {
      // Try to parse as encrypted JSON string first
      const encryptedData = JSON.parse(orderData.orderItems)
      if (encryptedData.encrypted) {
        decrypted.orderItems = decryptJson(encryptedData)
      } else {
        // If not encrypted, keep as is
        decrypted.orderItems = orderData.orderItems
      }
    } catch (error) {
      // If parsing fails, it might be unencrypted data
      decrypted.orderItems = orderData.orderItems
    }
  }
  
  return decrypted
}
