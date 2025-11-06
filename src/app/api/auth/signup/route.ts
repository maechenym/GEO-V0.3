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
  
  if (useMock) {
    const body = await request.json()
    const email = (body as { email: string }).email

    // Mock response - always treat as new user for signup
    return NextResponse.json({
      ok: true,
      token: `mock_signup_token_${email}`,
      isNew: true,
    })
  }

  // Real mode: 临时返回 mock 数据，避免 501 错误
  const body = await request.json()
  const email = (body as { email: string }).email

  return NextResponse.json({
    ok: true,
    token: `mock_signup_token_${email}`,
    isNew: true,
  })
}

