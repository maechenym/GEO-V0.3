import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/plan/current
 * 
 * 获取当前用户的订阅计划信息
 * 
 * 返回：订阅计划名称、订阅开始时间、订阅结束时间、剩余使用时长
 */
export async function GET(request: NextRequest) {
  // 检查是否为 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // Mock 数据：返回一个试用计划
    const now = new Date()
    const trialStartDate = new Date(now)
    trialStartDate.setDate(trialStartDate.getDate() - 3) // 3天前开始
    
    const trialEndDate = new Date(now)
    trialEndDate.setDate(trialEndDate.getDate() + 4) // 4天后结束
    
    const remainingDays = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return NextResponse.json({
      plan: {
        id: "trial",
        name: "Free Trial",
        status: "active",
        startDate: trialStartDate.toISOString(),
        endDate: trialEndDate.toISOString(),
        remainingDays: remainingDays,
        isTrial: true,
      },
    })
  }

  // 真实模式：从数据库或 Stripe 获取订阅信息
  try {
    // TODO: 从认证中间件获取用户 ID
    // const userId = getUserIdFromRequest(request)
    
    // TODO: 从数据库或 Stripe 获取用户的订阅信息
    // const subscription = await getSubscriptionByUserId(userId)
    
    // 示例：从 Stripe 获取订阅信息
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const customer = await getCustomerByUserId(userId)
    // const subscriptions = await stripe.subscriptions.list({
    //   customer: customer.stripeCustomerId,
    //   status: 'active',
    //   limit: 1,
    // })
    
    // 如果用户没有订阅，返回 null
    // if (subscriptions.data.length === 0) {
    //   return NextResponse.json({
    //     plan: null,
    //   })
    // }
    
    // const subscription = subscriptions.data[0]
    // const planId = subscription.items.data[0].price.id
    // const plan = await getPlanById(planId)
    
    // 计算剩余天数
    // const now = new Date()
    // const endDate = new Date(subscription.current_period_end * 1000)
    // const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // return NextResponse.json({
    //   plan: {
    //     id: plan.id,
    //     name: plan.name,
    //     status: subscription.status,
    //     startDate: new Date(subscription.current_period_start * 1000).toISOString(),
    //     endDate: endDate.toISOString(),
    //     remainingDays: remainingDays,
    //     isTrial: subscription.status === 'trialing',
    //   },
    // })
    
    // 临时返回：表示未实现
    return NextResponse.json(
      {
        error: "Not implemented yet",
        message: "Subscription API not implemented",
      },
      { status: 501 }
    )
  } catch (error: any) {
    console.error("Failed to get current plan:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get current plan",
      },
      { status: 500 }
    )
  }
}

