import { NextRequest, NextResponse } from 'next/server'

// Temporary redirect route to handle cached requests
export async function POST(request: NextRequest) {
  try {
    // Forward the request to the correct upload endpoint
    const formData = await request.formData()
    
    const response = await fetch(`${request.nextUrl.origin}/api/upload/image`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Upload redirect error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
