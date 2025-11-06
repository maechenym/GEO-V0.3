import { NextRequest, NextResponse } from "next/server"
import { LoginResponseSchema } from "@/types/auth"

/**
 * POST /api/auth/login
 * 
 * Fallback API route for login (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function POST(request: NextRequest) {
  // Check if mock mode
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const body = await request.json()
    const email = (body as { email: string }).email

    // Mock response
    return NextResponse.json({
      ok: true,
      token: `mock_login_token_${email}`,
      isNew: false,
    })
  }

  // Real mode: implement actual login logic here
  return NextResponse.json(
    { error: "Login endpoint not implemented" },
    { status: 501 }
  )
}

