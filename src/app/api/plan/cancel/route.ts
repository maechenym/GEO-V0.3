import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/plan/cancel
 * 
 * 取消订阅（Mock 模式用于测试）
 * 
 * 在真实场景中，这应该通过 Stripe webhook 处理
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // Mock 模式：模拟取消订阅
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    return NextResponse.json({
      ok: true,
      message: "Subscription canceled successfully",
      // 取消后可以继续使用7天
      cancelEffectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  // 真实模式：应该通过 Stripe webhook 处理
  return NextResponse.json(
    {
      error: "Not implemented",
      message: "Subscription cancellation should be handled via Stripe webhook",
    },
    { status: 501 }
  )
}

