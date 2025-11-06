import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * POST /api/plan/activate
 * 
 * 激活试用计划
 * 
 * 仅在 NEXT_PUBLIC_USE_MOCK=false 时执行
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  // 如果 MSW 没有拦截请求，这里作为 fallback 返回 mock 数据
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    try {
      const body = await request.json()
      const { payment_method_id } = body as { payment_method_id?: string }

      // 验证 payment_method_id
      if (!payment_method_id) {
        return NextResponse.json(
          {
            error: "payment_method_id is required",
          },
          { status: 400 }
        )
      }

      // 返回 mock 数据
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7)

      return NextResponse.json({
        trialEndsAt: trialEndsAt.toISOString(),
        plan: "trial",
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        { status: 400 }
      )
    }
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { payment_method_id } = body as { payment_method_id: string }

    if (!payment_method_id) {
      return NextResponse.json(
        { error: "payment_method_id is required" },
        { status: 400 }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia" as any,
    })

    // 获取用户信息（从 auth token 或 session）
    // 这里简化处理，实际应该从认证中间件获取用户 ID
    // TODO: 从认证中间件获取用户 ID
    const customerId = `cus_${Date.now()}`

    // 创建或获取 Customer
    let customer
    try {
      customer = await stripe.customers.create({
        email: "user@example.com", // TODO: 从认证获取
        metadata: {
          userId: customerId,
        },
      })
    } catch (error) {
      console.error("Failed to create customer:", error)
      // 如果创建失败，尝试查找现有客户
      // 这里简化处理，实际应该查询数据库获取客户 ID
    }

    // 附加支付方式到客户
    if (customer) {
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: customer.id,
      })

      // 设置为默认支付方式
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: payment_method_id,
        },
      })
    }

    // 计算试用结束时间（7 天后）
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    // 创建订阅（带试用期）
    // 注意：这里需要先有 Product 和 Price，简化处理只返回试用结束时间
    // 实际项目中应该创建订阅并保存到数据库
    // const subscription = await stripe.subscriptions.create({
    //   customer: customer.id,
    //   items: [{ price: 'price_xxx' }],
    //   trial_period_days: 7,
    // })

    return NextResponse.json({
      trialEndsAt: trialEndsAt.toISOString(),
      plan: "trial",
    })
  } catch (error) {
    console.error("Plan activation failed:", error)
    return NextResponse.json(
      {
        error:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to activate plan",
      },
      { status: 500 }
    )
  }
}

