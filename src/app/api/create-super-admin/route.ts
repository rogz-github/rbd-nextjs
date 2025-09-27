import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (existingSuperAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Super admin already exists',
        user: {
          email: existingSuperAdmin.email,
          username: existingSuperAdmin.username
        }
      })
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@rbd.com',
        username: 'admin',
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Super admin created successfully',
      user: {
        email: superAdmin.email,
        username: superAdmin.username,
        password: 'admin123' // Only for initial setup
      }
    })

  } catch (error) {
    console.error('Error creating super admin:', error)
    return NextResponse.json(
      { error: 'Failed to create super admin' },
      { status: 500 }
    )
  }
}
