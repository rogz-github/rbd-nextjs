const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * DANGER: This script completely destroys the Neon database
 * Only run this if you want to start fresh!
 */

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from Neon database!')
  console.log('📋 Dropping all tables and types...\n')
  
  try {
    // Drop all tables in public schema
    const tables = [
      'site_settings',
      'category_four', 
      'category_three',
      'category_two',
      'category_one',
      'displayed_items',
      'banner_bottom_images',
      'Banner',
      'Order',
      'Cart',
      'Product',
      'User'
    ]
    
    // Drop all foreign key constraints first
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "Cart" DROP CONSTRAINT IF EXISTS "Cart_prod_id_fkey"`
    
    // Drop all tables
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "public"."${table}" CASCADE`)
        console.log(`✅ Dropped table: ${table}`)
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table}:`, error.message)
      }
    }
    
    // Drop enums
    try {
      await prisma.$executeRaw`DROP TYPE IF EXISTS "public"."BannerType" CASCADE`
      console.log('✅ Dropped enum: BannerType')
    } catch (error) {
      console.log('⚠️  Could not drop BannerType:', error.message)
    }
    
    try {
      await prisma.$executeRaw`DROP TYPE IF EXISTS "public"."Role" CASCADE`
      console.log('✅ Dropped enum: Role')
    } catch (error) {
      console.log('⚠️  Could not drop Role:', error.message)
    }
    
    console.log('\n✅ Database reset complete!')
    console.log('🔄 You can now run: npx prisma migrate deploy')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the reset
resetDatabase()

