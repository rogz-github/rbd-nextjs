import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug session API called')
    
    const session = await getServerSession(authOptions)
    console.log('Full session object:', JSON.stringify(session, null, 2))
    
    return NextResponse.json({
      success: true,
      session: session,
      hasUser: !!session?.user,
      isAdmin: session?.user?.isAdmin,
      userRole: (session?.user as any)?.role
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}