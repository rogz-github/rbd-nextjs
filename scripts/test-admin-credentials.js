const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAdminCredentials() {
  try {
    console.log('🔍 Testing admin credentials...')
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@gmail.com' }
        ]
      }
    })
    
    if (!adminUser) {
      console.log('❌ No admin user found!')
      return
    }
    
    console.log('✅ Admin user found:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      hasPassword: !!adminUser.password
    })
    
    // Test password
    const testPasswords = ['admin123', 'admin', 'password', '123456']
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, adminUser.password)
      console.log(`🔑 Testing password "${password}": ${isValid ? '✅ VALID' : '❌ Invalid'}`)
      
      if (isValid) {
        console.log(`🎉 Correct password found: "${password}"`)
        break
      }
    }
    
    // Test the auth logic
    const mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      username: adminUser.username,
      role: adminUser.role,
      isAdmin: adminUser.role === 'ADMIN' || adminUser.role === 'SUPER_ADMIN',
      isSuperAdmin: adminUser.role === 'SUPER_ADMIN',
    }
    
    console.log('\n🔑 Mock user object for auth:')
    console.log(JSON.stringify(mockUser, null, 2))
    
  } catch (error) {
    console.error('❌ Error testing admin credentials:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminCredentials()
