const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  console.log('🚀 Creating users...\n');

  try {
    // Define users to create
    const usersToCreate = [
      {
        firstName: 'Super',
        lastName: 'Administrator',
        username: 'super_admin',
        email: 'super_admin@gmail.com',
        password: 'Rbd@2k25',
        role: 'SUPER_ADMIN'
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        username: 'rbd_admin',
        email: 'admin@gmail.com',
        password: '@Rbd../2k23',
        role: 'ADMIN'
      },
      {
        firstName: 'Rogz',
        lastName: 'Nunez',
        username: 'rogz',
        email: 'rogz.nunez2013@gmail.com',
        password: 'rogz',
        role: 'USER'
      }
    ];

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists by email
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
          
          // Update password if user exists (useful for resetting passwords)
          const hashedPassword = await bcrypt.hash(userData.password, 12);
          const updatedUser = await prisma.user.update({
            where: { email: userData.email },
            data: {
              password: hashedPassword,
              role: userData.role,
              username: userData.username,
              firstName: userData.firstName,
              lastName: userData.lastName
            }
          });
          console.log(`   ✅ Updated existing user: ${updatedUser.email}`);
        } else {
          // Create new user
          const hashedPassword = await bcrypt.hash(userData.password, 12);
          const newUser = await prisma.user.create({
            data: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              username: userData.username,
              email: userData.email,
              password: hashedPassword,
              role: userData.role
            }
          });
          console.log(`✅ Created ${userData.role}: ${newUser.email}`);
        }
      } catch (error) {
        // Check if it's a unique constraint error (username exists)
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
          console.log(`⚠️  Username already exists: ${userData.username}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    console.log('\n📋 Final user list:');
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();

