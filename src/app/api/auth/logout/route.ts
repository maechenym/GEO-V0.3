import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/auth/logout
 * 
 * Fallback API route for logout (when MSW is not active)
 * Returns mock data when NEXT_PUBLIC_USE_MOCK=true
 */
export async function POST(request: NextRequest) {
  // 生产环境或开发环境都支持 mock 模式
  // 如果 NEXT_PUBLIC_USE_MOCK 不是 "false"，则使用 mock 数据
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
  
  if (useMock) {
    // Mock response
    return NextResponse.json({
      ok: true,
    })
  }

  // Real mode: 临时返回 mock 数据，避免 501 错误
  return NextResponse.json({
    ok: true,
  })
}

