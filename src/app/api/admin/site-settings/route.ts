import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch site settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Only super admins can access site settings
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 401 }
      )
    }

    // @ts-ignore - SiteSettings will be available after prisma generate
    const settings = await prisma.siteSettings.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update site settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only super admins can modify site settings
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only super admins can modify site settings' },
        { status: 403 }
      )
    }

    const { key, value, location, description } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Validate location
    const validLocation = location && ['head', 'body'].includes(location) ? location : 'body'

    // @ts-ignore - SiteSettings will be available after prisma generate
    // Upsert: create if doesn't exist, update if it does
    const setting = await prisma.siteSettings.upsert({
      where: { key: String(key) },
      update: {
        value: String(value),
        location: String(validLocation),
        description: description ? String(description) : null,
        updatedAt: new Date()
      },
      create: {
        key: String(key),
        value: String(value),
        location: String(validLocation),
        description: description ? String(description) : null
      }
    })

    return NextResponse.json({ setting, message: 'Setting saved successfully' })
  } catch (error) {
    console.error('Error saving site settings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to save site settings: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE - Delete site settings
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only super admins can delete site settings
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    // @ts-ignore - SiteSettings will be available after prisma generate
    await prisma.siteSettings.delete({
      where: { key }
    })

    return NextResponse.json({ message: 'Setting deleted successfully' })
  } catch (error) {
    console.error('Error deleting site settings:', error)
    return NextResponse.json(
      { error: 'Failed to delete site settings' },
      { status: 500 }
    )
  }
}

