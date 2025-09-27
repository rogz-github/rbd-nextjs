import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    firstName: string
    lastName: string
    username: string
    role: string
    isAdmin?: boolean
    isSuperAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName: string
      username: string
      role: string
      isAdmin?: boolean
      isSuperAdmin?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    firstName: string
    lastName: string
    username: string
    isAdmin?: boolean
    isSuperAdmin?: boolean
  }
}
