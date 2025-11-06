import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * POST /api/stripe/create-setup-intent
 * 
 * 创建 Stripe SetupIntent（用于收集支付方式，不立即扣费）
 * 
 * 仅在 NEXT_PUBLIC_USE_MOCK=false 时执行
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  // 如果 MSW 没有拦截请求，这里作为 fallback 返回 mock 数据
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // 返回 mock 数据，而不是错误
    return NextResponse.json({
      client_secret: "seti_mock_secret_test_123456789",
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
    // 创建 SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
    })

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
    })
  } catch (error) {
    console.error("Stripe SetupIntent creation failed:", error)
    return NextResponse.json(
      {
        error:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to create SetupIntent",
      },
      { status: 500 }
    )
  }
}

