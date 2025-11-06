import { NextRequest, NextResponse } from "next/server"
import { SessionResponseSchema } from "@/types/auth"

/**
 * GET /api/auth/session
 * 
 * Fallback API route for session (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function GET(request: NextRequest) {
  // Check if mock mode
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    // Extract email from token
    const emailMatch = token.match(/mock_(?:login|signup|magic|google)_token_(.+)/)
    const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

    // Mock user data
    return NextResponse.json({
      ok: true,
      profile: {
        id: `u_${Date.now()}`,
        email: email,
        hasBrand: false,
        role: "Admin" as const,
      },
    })
  }

  // Real mode: implement actual session logic here
  return NextResponse.json(
    { error: "Session endpoint not implemented" },
    { status: 501 }
  )
}

