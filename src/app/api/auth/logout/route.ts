import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, blacklistToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token to blacklist it
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (token && token.jti) {
      // Blacklist the JWT token
      blacklistToken(token.jti as string)
    }

    const session = await getServerSession(authOptions)

    // --- Handle if no session ---
    if (!session) {
      return NextResponse.json({ success: true, message: 'Already logged out' })
    }

    // --- If using database sessions, optionally revoke it ---
    // Note: JWT strategy doesn't use database sessions, so this is not needed
    // but keeping for compatibility with database strategy
    if ((session as any).sessionToken) {
      try {
        await (prisma as any).session.deleteMany({
          where: { sessionToken: (session as any).sessionToken },
        })
      } catch (e) {
        // Session already removed or not found
      }
    }

    // --- Clear NextAuth cookies ---
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
    ]

    cookieNames.forEach((name) => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}
