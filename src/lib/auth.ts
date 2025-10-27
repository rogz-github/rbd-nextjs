import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// In-memory blacklist for JWT tokens (in production, use Redis or database)
const tokenBlacklist = new Set<string>()

// Function to blacklist a token
export function blacklistToken(jti: string) {
  tokenBlacklist.add(jti)
}

// Function to check if token is blacklisted
export function isTokenBlacklisted(jti: string): boolean {
  return tokenBlacklist.has(jti)
}

// Cleanup expired tokens from blacklist (run periodically)
export function cleanupBlacklist() {
  // In a real implementation, you'd check token expiration times
  // For now, we'll just return the current blacklist size
  return tokenBlacklist.size
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        usernameOrEmail: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          return null
        }

        try {
          // Check if input is email or username
          const isEmail = credentials.usernameOrEmail.includes('@')
          
          // Use Prisma ORM to find user by email or username
          let user
          if (isEmail) {
            user = await prisma.user.findUnique({
              where: {
                email: credentials.usernameOrEmail.toLowerCase()
              }
            })
          } else {
            user = await prisma.user.findUnique({
              where: {
                username: credentials.usernameOrEmail.toLowerCase()
              }
            })
          }

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          const userData = {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role,
            isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
            isSuperAdmin: user.role === 'SUPER_ADMIN',
            rememberMe: Boolean(credentials.rememberMe),
          }

          return userData
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours - reasonable session duration
    updateAge: 0, // No update age - always fresh
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours - reasonable token duration
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      console.log('🔑 JWT callback called!', { hasUser: !!user, hasToken: !!token, trigger })
      
      // Check if token is blacklisted
      if (token && token.jti && tokenBlacklist.has(token.jti as string)) {
        console.log('🔑 Token blacklisted')
        return {} as any
      }
      
      // Handle signOut by checking if token is empty or has no meaningful data
      if (!token) {
        console.log('🔑 No token')
        return {} as any
      }
      
      if (user) {
        console.log('🔑 Setting user data in token:', { id: user.id, email: user.email, role: (user as any).role })
        token.role = (user as any).role
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.username = (user as any).username
        token.rememberMe = (user as any).rememberMe
        token.isAdmin = (user as any).isAdmin
        token.isSuperAdmin = (user as any).isSuperAdmin
        
        // Only set expiration on initial login, not on every call
        if (trigger === 'signIn') {
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          token.jti = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          console.log('🔑 Set token expiration:', new Date((token.exp as number) * 1000))
          console.log('🔑 Set token JTI:', token.jti)
        }
      }
      
      console.log('🔑 Returning token:', { sub: token.sub, email: token.email, role: token.role })
      return token
    },
    async session({ session, token }) {
      console.log('🔑 Session callback called!', { hasSession: !!session, hasToken: !!token, tokenSub: token?.sub, tokenEmail: token?.email })
      
      // If no token, return empty session
      if (!token) {
        console.log('🔑 No token, returning empty session')
        return { user: null, expires: null } as any
      }
      
      // Check if token is expired
      if (token.exp && Date.now() >= (token.exp as number) * 1000) {
        console.log('🔑 Token expired, returning empty session')
        return { user: null, expires: null } as any
      }
      
      // If token has no sub or email, it might be invalid
      if (!token.sub && !token.email) {
        console.log('🔑 Token has no sub or email, returning empty session')
        return { user: null, expires: null } as any
      }
      
      if (session.user && token.sub) {
        (session.user as any).id = token.sub as string
        (session.user as any).role = token.role as string
        (session.user as any).firstName = token.firstName as string
        (session.user as any).lastName = token.lastName as string
        (session.user as any).username = token.username as string
        (session.user as any).isAdmin = token.isAdmin as boolean
        (session.user as any).isSuperAdmin = token.isSuperAdmin as boolean
        console.log('🔑 Updated session user:', { id: (session.user as any).id, role: (session.user as any).role })
      }
      console.log('🔑 Returning session:', { user: session.user?.name, email: session.user?.email })
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  events: {
    async signOut({ token }) {
      // SignOut event handled
    },
  },
  debug: false
}
