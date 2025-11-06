import { NextRequest, NextResponse } from "next/server"
import { MagicLinkVerifyResponseSchema } from "@/types/auth"

/**
 * GET /api/auth/magic-link/verify
 * 
 * Fallback API route for magic link verification (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function GET(request: NextRequest) {
  // Check if mock mode
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token || token === "invalid") {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid token",
        },
        { status: 400 }
      )
    }

    // Extract email from token
    const emailMatch = token.match(/email:(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // Mock response
    return NextResponse.json({
      ok: true,
      token: `mock_magic_token_${email}`,
      isNew: false,
    })
  }

  // Real mode: implement actual verification logic here
  return NextResponse.json(
    { error: "Magic link verification endpoint not implemented" },
    { status: 501 }
  )
}

