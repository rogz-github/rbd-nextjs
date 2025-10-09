import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug Product Creation - Starting...')
    
    // Check session
    const session = await getServerSession(authOptions)
    console.log('🔍 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      role: (session?.user as any)?.role,
      isAdmin: (session?.user as any)?.isAdmin
    })
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        debug: 'No session found'
      }, { status: 401 })
    }
    
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        debug: `User role: ${userRole}, Required: ADMIN or SUPER_ADMIN`
      }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    console.log('🔍 Request body:', body)

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ 
        error: 'Product name is required',
        debug: 'Missing or empty name field'
      }, { status: 422 })
    }
    
    if (!body.category1 || !body.category1.trim()) {
      return NextResponse.json({ 
        error: 'Primary category is required',
        debug: 'Missing or empty category1 field'
      }, { status: 422 })
    }

    return NextResponse.json({
      success: true,
      debug: 'All validations passed',
      user: {
        id: (session.user as any).id,
        role: userRole,
        isAdmin: (session.user as any).isAdmin
      },
      productData: {
        name: body.name,
        category1: body.category1,
        sku: body.sku || 'AUTO-GENERATED',
        status: body.status || 'active'
      }
    })

  } catch (error) {
    console.error('🔍 Debug Product Creation Error:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
