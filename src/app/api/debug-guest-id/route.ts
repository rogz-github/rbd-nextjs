import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This is a server-side endpoint, so we can't access localStorage directly
    // But we can return instructions for the client to check
    return NextResponse.json({
      success: true,
      message: 'Check browser console for guest ID debug info',
      instructions: [
        '1. Open browser console (F12)',
        '2. Run: console.log("localStorage guestUserId:", localStorage.getItem("guestUserId"))',
        '3. Run: console.log("All localStorage keys:", Object.keys(localStorage))',
        '4. Check what guest user ID is being used in the cart context',
        '5. Look for "GUEST USER ID INITIALIZATION" logs in console'
      ],
      currentTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in debug guest ID:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to debug guest ID', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
