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
    // 只有 test1@example.com 可以进入产品预览（有品牌数据）
    // 其他所有用户都是新用户，需要从后端获取数据
    const hasBrand = email === "test1@example.com"
    
    // test1@example.com 是waitlist结束后的用户，有订阅计划
    const subscription = email === "test1@example.com"
      ? { planId: undefined, status: undefined }
      : undefined
    
    return NextResponse.json({
      ok: true,
      profile: {
        id: `u_${email === "test1@example.com" ? "test1" : Date.now()}`,
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

  // Real mode: 从后端获取用户数据
  // 所有用户都应该从后端 API 获取数据，而不是硬编码
  // TODO: 实现从后端数据库或认证服务获取用户信息
  
  // 临时返回：新用户（没有品牌）
  return NextResponse.json({
    ok: true,
    profile: {
      id: `u_${Date.now()}`,
      email: email || "unknown@example.com",
      hasBrand: false, // 新用户默认没有品牌，需要进入 onboarding
      role: "Admin" as const,
    },
  })
}

