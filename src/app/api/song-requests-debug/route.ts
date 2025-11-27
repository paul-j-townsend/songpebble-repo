import { NextRequest, NextResponse } from "next/server"

/**
 * Debug endpoint for testing song request data without payment
 * ONLY available in development environment
 */
export async function POST(req: NextRequest) {
  // Security: Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const data = await req.json()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🐛 DEBUG SONG REQUEST (NO PAYMENT)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(JSON.stringify(data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return NextResponse.json({
      ok: true,
      message: 'Debug request logged',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
