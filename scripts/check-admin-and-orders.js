const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  const prisma = new PrismaClient();
  
  try {
    // Check existing users
    const users = await prisma.user.findMany();
    console.log('Existing users:');
    users.forEach(user => {
      console.log('- ID:', user.id, 'Email:', user.email, 'Role:', user.role);
    });
    
    // Check if admin exists
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('Admin created:', newAdmin.email);
    } else {
      console.log('Admin exists:', admin.email);
    }
    
    // Check orders
    const orders = await prisma.order.findMany();
    console.log('Total orders in database:', orders.length);
    
    if (orders.length > 0) {
      console.log('Sample order:');
      console.log('- ID:', orders[0].coId);
      console.log('- Order ID:', orders[0].coOrderId);
      console.log('- Status:', orders[0].coStatus);
      console.log('- Total:', orders[0].coTotalPrice);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();
