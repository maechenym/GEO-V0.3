import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * POST /api/stripe/create-portal-session
 * 
 * 创建 Stripe Customer Portal Session 用于订阅管理
 * 
 * Body: {}
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return NextResponse.json({
      portalUrl: null,
      message: "Mock portal session created",
    })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-12-18.acacia" as any,
  })

  try {
    // 获取当前域名用于构建 return URL
    const origin = request.headers.get("origin") || "http://localhost:3000"

    // TODO: 从认证中间件获取用户 ID 和 Stripe Customer ID
    // const userId = getUserIdFromRequest(request)
    // const customer = await getCustomerByUserId(userId)
    
    // 临时使用示例 customer ID（实际应从数据库获取）
    const customerId = "cus_example"

    // 创建 Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings/plan`,
    })

    return NextResponse.json({
      portalUrl: session.url,
    })
  } catch (error) {
    console.error("Stripe Portal Session creation failed:", error)
    return NextResponse.json(
      {
        error:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to create Portal Session",
      },
      { status: 500 }
    )
  }
}

