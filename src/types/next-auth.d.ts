import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    firstName: string
    lastName: string
    username: string
    role: string
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
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    firstName: string
    lastName: string
    username: string
  }
}
