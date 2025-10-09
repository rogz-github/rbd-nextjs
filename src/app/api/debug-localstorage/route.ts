import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This is a server-side endpoint, so we can't access localStorage directly
    // But we can return instructions for the client to check
    return NextResponse.json({
      success: true,
      message: 'Check browser console for localStorage debug info',
      instructions: [
        '1. Open browser console (F12)',
        '2. Run: console.log("localStorage guestUserId:", localStorage.getItem("guestUserId"))',
        '3. Run: console.log("All localStorage:", localStorage)',
        '4. Check what guest user ID is being used in the cart context'
      ]
    })
  } catch (error) {
    console.error('Error in debug localStorage:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to debug localStorage', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
