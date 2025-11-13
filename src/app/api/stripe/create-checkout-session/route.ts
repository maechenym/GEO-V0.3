import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * POST /api/stripe/create-checkout-session
 * 
 * 创建 Stripe Checkout Session 并返回 checkout URL
 * 
 * Body: { priceId: string, planId: string }
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // 返回 null，让前端知道这是 mock 模式
    await new Promise((resolve) => setTimeout(resolve, 300))
    return NextResponse.json({
      checkoutUrl: null,
      message: "Mock checkout session created",
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
    const body = await request.json()
    const { priceId, planId, trialPeriodDays, isUpgrade, currentPlanId } = body

    if (!priceId && planId !== "free") {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      )
    }

    // Free plan doesn't need checkout
    if (planId === "free") {
      return NextResponse.json({
        checkoutUrl: null,
        message: "Free plan doesn't require payment",
      })
    }

    // 获取当前域名用于构建 success/cancel URLs
    const origin = request.headers.get("origin") || "http://localhost:3000"

    // 创建 Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: isUpgrade
        ? `${origin}/settings/plan?upgraded=true&plan=${planId}`
        : `${origin}/overview?success=true&trial=true`,
      cancel_url: isUpgrade
        ? `${origin}/settings/plan?canceled=true`
        : `${origin}/subscribe?canceled=true`,
      metadata: {
        planId: planId,
        isUpgrade: isUpgrade ? "true" : "false",
        currentPlanId: currentPlanId || "",
      },
    }

    // Add trial period if specified and not an upgrade
    if (!isUpgrade && trialPeriodDays !== undefined && trialPeriodDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialPeriodDays,
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error("Stripe Checkout Session creation failed:", error)
    return NextResponse.json(
      {
        error:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to create Checkout Session",
      },
      { status: 500 }
    )
  }
}

