import { NextRequest, NextResponse } from "next/server"
import { SignupResponseSchema } from "@/types/auth"

/**
 * POST /api/auth/signup
 * 
 * Fallback API route for signup (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function POST(request: NextRequest) {
  // Check if mock mode
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const body = await request.json()
    const email = (body as { email: string }).email

    // Mock response - always treat as new user for signup
    return NextResponse.json({
      ok: true,
      token: `mock_signup_token_${email}`,
      isNew: true,
    })
  }

  // Real mode: implement actual signup logic here
  return NextResponse.json(
    { error: "Signup endpoint not implemented" },
    { status: 501 }
  )
}

