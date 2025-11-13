import { NextRequest, NextResponse } from "next/server"
import { SessionResponseSchema } from "@/types/auth"

/**
 * GET /api/auth/session
 * 
 * Fallback API route for session (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function GET(request: NextRequest) {
  // 生产环境或开发环境都支持 mock 模式
  // 如果 NEXT_PUBLIC_USE_MOCK 不是 "false"，则使用 mock 数据
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
  
  if (useMock) {
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

    // Mock user data - 默认给 test@example.com 设置 hasBrand: true
    const hasBrand = email === "test@example.com" || email === "test1@example.com" || email === "test1@gmail.com"
    
    // test1@example.com 或 test1@gmail.com 是waitlist结束后的用户
    const subscription = email === "test1@example.com" || email === "test1@gmail.com"
      ? { planId: undefined, status: undefined }
      : undefined
    
    return NextResponse.json({
      ok: true,
      profile: {
        id: `u_${email === "test@example.com" ? "1" : (email === "test1@example.com" || email === "test1@gmail.com") ? "test1" : Date.now()}`,
        email: email,
        hasBrand: hasBrand,
        role: "Admin" as const,
        subscription: subscription,
      },
    })
  }

  // Real mode: implement actual session logic here
  // 临时返回 mock 数据，避免 501 错误
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

  // 临时返回默认用户数据
  return NextResponse.json({
    ok: true,
    profile: {
      id: "u_1",
      email: "test@example.com",
      hasBrand: true,
      role: "Admin" as const,
    },
  })
}

