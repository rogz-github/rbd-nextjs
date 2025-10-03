const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    console.log('🔍 Resetting admin password...')
    
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
      role: adminUser.role
    })
    
    // Hash new password
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Password updated successfully!`)
    console.log(`🔑 New password: ${newPassword}`)
    console.log(`🔑 Username: admin`)
    
    // Verify the new password
    const updatedUser = await prisma.user.findUnique({
      where: { id: adminUser.id }
    })
    
    const isValid = await bcrypt.compare(newPassword, updatedUser.password)
    console.log(`🔍 Password verification: ${isValid ? '✅ VALID' : '❌ Invalid'}`)
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
