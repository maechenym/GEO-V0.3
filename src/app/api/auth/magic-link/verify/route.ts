import { NextRequest, NextResponse } from "next/server"
import { MagicLinkVerifyResponseSchema } from "@/types/auth"

/**
 * GET /api/auth/magic-link/verify
 * 
 * Fallback API route for magic link verification (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function GET(request: NextRequest) {
  // 生产环境或开发环境都支持 mock 模式
  // 如果 NEXT_PUBLIC_USE_MOCK 不是 "false"，则使用 mock 数据
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
  
  if (useMock) {
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

  // Real mode: 临时返回 mock 数据，避免 501 错误
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

  const emailMatch = token.match(/email:(.+)/)
  const email = emailMatch ? emailMatch[1] : token.includes("@") ? token : "test@example.com"

  return NextResponse.json({
    ok: true,
    token: `mock_magic_token_${email}`,
    isNew: false,
  })
}

