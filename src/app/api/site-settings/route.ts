import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 0 // Don't cache - always fetch fresh data

// GET - Fetch site settings (public endpoint for layout)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Convert to key-value object for easier access
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    const response = NextResponse.json({ settings: settingsObj })
    
    // Prevent caching so we always get fresh data
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    
    return response
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ settings: {} })
  }
}

