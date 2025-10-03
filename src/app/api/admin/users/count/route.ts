import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Count total users
    const count = await prisma.user.count()

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting users:', error)
    return NextResponse.json(
      { message: 'Failed to count users' },
      { status: 500 }
    )
  }
}
