import { NextRequest, NextResponse } from "next/server"
import { SignupResponseSchema } from "@/types/auth"

/**
 * POST /api/auth/signup
 * 
 * Fallback API route for signup (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function POST(request: NextRequest) {
  // 生产环境或开发环境都支持 mock 模式
  // 如果 NEXT_PUBLIC_USE_MOCK 不是 "false"，则使用 mock 数据
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
  
  const body = await request.json()
  const { email, password } = body as { email: string; password: string }

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required" },
      { status: 400 }
    )
  }

  if (useMock) {
    // Mock response - always treat as new user for signup
    // 返回 JWT token
    return NextResponse.json({
      ok: true,
      token: `mock_signup_token_${email}`,
      isNew: true,
    })
  }

  // Real mode: 实现实际的注册逻辑
  // TODO: 验证密码，创建用户，返回 JWT token
  return NextResponse.json({
    ok: true,
    token: `mock_signup_token_${email}`,
    isNew: true,
  })
}

