import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith('/~admin')) {
      // Allow access to admin login page
      if (pathname === '/~admin') {
        return NextResponse.next()
      }

      // Check if user is admin (both property and role-based)
      const isAdmin = !!token?.isAdmin
      const isAdminByRole = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
      
      if (!token || (!isAdmin && !isAdminByRole)) {
        console.log('🔒 Middleware redirecting - not admin:', {
          hasToken: !!token,
          isAdmin,
          isAdminByRole,
          role: token?.role
        })
        return NextResponse.redirect(new URL('/~admin', req.url))
      }
    }

    // Regular admin routes (legacy) - redirect to new admin portal
    if (pathname.startsWith('/admin') && pathname !== '/admin') {
      const newPath = pathname.replace('/admin', '/~admin')
      return NextResponse.redirect(new URL(newPath, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        console.log('🔒 Middleware check:', {
          pathname,
          hasToken: !!token,
          isAdmin: token?.isAdmin,
          role: token?.role,
          username: token?.username,
          tokenKeys: token ? Object.keys(token) : []
        })
        
        // Allow access to admin login page
        if (pathname === '/~admin') {
          return true
        }

        // For admin routes, check if user is admin
        if (pathname.startsWith('/~admin')) {
          const isAdmin = !!token?.isAdmin
          const isAdminByRole = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
          
          console.log('🔒 Middleware admin check:', {
            pathname,
            isAdmin,
            isAdminByRole,
            shouldAllow: isAdmin || isAdminByRole,
            tokenRole: token?.role
          })
          
          // Use role-based check as fallback
          return isAdmin || isAdminByRole
        }

        // For other routes, use default behavior
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/~admin/:path*',
    '/admin/:path*'
  ]
}
