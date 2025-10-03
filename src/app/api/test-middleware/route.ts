import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing middleware token access')
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    console.log('🧪 Token from getToken:', token)
    
    const isAdmin = !!token?.isAdmin
    const isAdminByRole = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
    
    return NextResponse.json({
      success: true,
      hasToken: !!token,
      token: token,
      isAdmin,
      isAdminByRole,
      shouldHaveAccess: isAdmin || isAdminByRole,
      tokenKeys: token ? Object.keys(token) : []
    })
  } catch (error) {
    console.error('🧪 Middleware test error:', error)
    return NextResponse.json(
      { 
        error: 'Middleware test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
