import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, username, email, password } = body

    // --- Validate required fields ---
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }

    // --- Normalize input ---
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.toLowerCase().trim()

    // --- Validate email format ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 })
    }

    // --- Validate password strength ---
    const passwordErrors = []
    if (password.length < 8) passwordErrors.push('at least 8 characters')
    if (!/[A-Z]/.test(password)) passwordErrors.push('one uppercase letter')
    if (!/[a-z]/.test(password)) passwordErrors.push('one lowercase letter')
    if (!/[0-9]/.test(password)) passwordErrors.push('one number')
    if (!/[^A-Za-z0-9]/.test(password)) passwordErrors.push('one special character')
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { message: `Password must include ${passwordErrors.join(', ')}.` },
        { status: 400 }
      )
    }

    // --- Check duplicates in parallel (better performance) ---
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
      prisma.user.findUnique({ where: { username: normalizedUsername } }),
    ])

    if (existingEmail) {
      return NextResponse.json({ message: 'Email is already registered.' }, { status: 400 })
    }

    if (existingUsername) {
      return NextResponse.json({ message: 'Username is already taken.' }, { status: 400 })
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 12) // 12 is secure & performant

    // --- Create user ---
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Account already exists with these credentials.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
