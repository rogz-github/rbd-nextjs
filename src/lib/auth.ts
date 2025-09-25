import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        usernameOrEmail: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        console.log('Auth authorize called with:', credentials?.usernameOrEmail)
        
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // Check if input is email or username
        const isEmail = credentials.usernameOrEmail.includes('@')
        console.log('Is email:', isEmail)
        
        // Use raw SQL to find user by email or username
        let users: any[]
        if (isEmail) {
          users = await prisma.$queryRaw`
            SELECT * FROM "User" 
            WHERE email = ${credentials.usernameOrEmail.toLowerCase()}
            LIMIT 1
          ` as any[]
        } else {
          users = await prisma.$queryRaw`
            SELECT * FROM "User" 
            WHERE username = ${credentials.usernameOrEmail.toLowerCase()}
            LIMIT 1
          ` as any[]
        }

        console.log('Found users:', users?.length || 0)
        console.log('User data:', users?.[0] ? { id: users[0].id, email: users[0].email, username: users[0].username } : 'No user')

        if (!users || users.length === 0 || !users[0].password) {
          console.log('No user found or no password')
          return null
        }

        const user = users[0]

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('Invalid password')
          return null
        }

        console.log('Login successful, returning user data')
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
          rememberMe: Boolean(credentials.rememberMe),
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.username = (user as any).username
        token.rememberMe = (user as any).rememberMe
      }
      
      // Set token expiration based on remember me
      if (token.rememberMe) {
        token.exp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
      } else {
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user && token.sub) {
        (session.user as any).id = token.sub as string
        (session.user as any).role = token.role as string
        (session.user as any).firstName = token.firstName as string
        (session.user as any).lastName = token.lastName as string
        (session.user as any).username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}
