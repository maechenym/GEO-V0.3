import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/auth/magic-link
 * 
 * Fallback API route for magic link (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function POST(request: NextRequest) {
  // Check if mock mode
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const body = await request.json()
    const email = (body as { email: string }).email

    // Mock response
    console.log(`[API] Magic link sent to: ${email}`)
    return NextResponse.json({
      ok: true,
    })
  }

  // Real mode: implement actual magic link logic here
  return NextResponse.json(
    { error: "Magic link endpoint not implemented" },
    { status: 501 }
  )
}

