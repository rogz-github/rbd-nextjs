import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const banners = await prisma.bannerBottomImages.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        created: 'desc'
      }
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching bottom banner images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bottom banner images' },
      { status: 500 }
    )
  }
}
