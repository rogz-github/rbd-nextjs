import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for reorder request
const reorderSchema = z.object({
  categories: z.array(z.object({
    id: z.number(),
    position: z.number()
  }))
})

// POST - Reorder category two
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || (session.user as any)?.isAdmin
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin permissions required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = reorderSchema.parse(body)

    // Update category two positions in a transaction
    await prisma.$transaction(
      validatedData.categories.map(category => 
        prisma.categoryTwo.update({
          where: { psstId: category.id },
          data: { psstPosition: category.position }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Category two positions updated successfully' 
    })
  } catch (error) {
    console.error('Error reordering category two:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to reorder category two' },
      { status: 500 }
    )
  }
}

