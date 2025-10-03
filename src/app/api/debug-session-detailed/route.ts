import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Detailed session debug API called')
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Full session object:', JSON.stringify(session, null, 2))
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'No session found',
        session: null
      })
    }

    const user = session.user as any
    const isAdminByRole = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
    const isAdminByProperty = user?.isAdmin
    
    console.log('🔍 User details:', {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role,
      isAdmin: user?.isAdmin,
      isSuperAdmin: user?.isSuperAdmin,
      firstName: user?.firstName,
      lastName: user?.lastName,
      username: user?.username
    })
    
    console.log('🔍 Admin checks:', {
      isAdminByRole,
      isAdminByProperty,
      shouldHaveAccess: isAdminByRole || isAdminByProperty
    })
    
    return NextResponse.json({
      success: true,
      session: session,
      user: user,
      adminChecks: {
        isAdminByRole,
        isAdminByProperty,
        shouldHaveAccess: isAdminByRole || isAdminByProperty
      },
      hasUser: !!session?.user,
      isAdmin: isAdminByRole || isAdminByProperty,
      userRole: user?.role
    })
  } catch (error) {
    console.error('🔍 Detailed session debug error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
