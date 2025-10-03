const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login setup...')
    
    // Check if there are any admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    })
    
    console.log('👥 Admin users found:', adminUsers.length)
    adminUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Role: ${user.role}`)
    })
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found! You need to create an admin user first.')
      console.log('💡 Run: node scripts/create-super-admin.js')
      return
    }
    
    // Test with the first admin user
    const testUser = adminUsers[0]
    console.log(`\n🧪 Testing with user: ${testUser.username}`)
    
    // Test the auth logic
    const isAdmin = testUser.role === 'ADMIN' || testUser.role === 'SUPER_ADMIN'
    console.log(`✅ Is admin by role: ${isAdmin}`)
    
    // Simulate what happens in the JWT callback
    const mockUser = {
      id: testUser.id,
      email: testUser.email,
      name: `${testUser.firstName} ${testUser.lastName}`,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      username: testUser.username,
      role: testUser.role,
      isAdmin: testUser.role === 'ADMIN' || testUser.role === 'SUPER_ADMIN',
      isSuperAdmin: testUser.role === 'SUPER_ADMIN',
    }
    
    console.log('🔑 Mock user object:', mockUser)
    console.log(`✅ isAdmin property: ${mockUser.isAdmin}`)
    console.log(`✅ isSuperAdmin property: ${mockUser.isSuperAdmin}`)
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()
