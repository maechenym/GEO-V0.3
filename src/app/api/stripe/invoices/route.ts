import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * GET /api/stripe/invoices
 * 
 * 获取用户的账单历史
 * 
 * Query params:
 * - limit: 返回的账单数量（默认 10）
 * - starting_after: 分页游标（可选）
 */
export async function GET(request: NextRequest) {
  // 检查是否为 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // Mock 数据：返回模拟的账单列表
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const now = new Date()
    const mockInvoices = [
      {
        id: "inv_mock_1",
        number: "INV-2025-001",
        amount_paid: 29900, // $299.00 in cents
        amount_due: 0,
        currency: "usd",
        status: "paid",
        created: Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000), // 7天前
        period_start: Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000),
        period_end: Math.floor((now.getTime() + 23 * 24 * 60 * 60 * 1000) / 1000), // 23天后
        hosted_invoice_url: null,
        invoice_pdf: null,
        description: "Basic Plan - Monthly Subscription",
      },
      {
        id: "inv_mock_2",
        number: "INV-2024-012",
        amount_paid: 29900,
        amount_due: 0,
        currency: "usd",
        status: "paid",
        created: Math.floor((now.getTime() - 37 * 24 * 60 * 60 * 1000) / 1000), // 37天前
        period_start: Math.floor((now.getTime() - 37 * 24 * 60 * 60 * 1000) / 1000),
        period_end: Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000),
        hosted_invoice_url: null,
        invoice_pdf: null,
        description: "Basic Plan - Monthly Subscription",
      },
      {
        id: "inv_mock_3",
        number: "INV-2024-011",
        amount_paid: 29900,
        amount_due: 0,
        currency: "usd",
        status: "paid",
        created: Math.floor((now.getTime() - 67 * 24 * 60 * 60 * 1000) / 1000), // 67天前
        period_start: Math.floor((now.getTime() - 67 * 24 * 60 * 60 * 1000) / 1000),
        period_end: Math.floor((now.getTime() - 37 * 24 * 60 * 60 * 1000) / 1000),
        hosted_invoice_url: null,
        invoice_pdf: null,
        description: "Basic Plan - Monthly Subscription",
      },
    ]
    
    return NextResponse.json({
      invoices: mockInvoices,
      has_more: false,
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const startingAfter = searchParams.get("starting_after")

    // TODO: 从认证中间件获取用户 ID 和 Stripe Customer ID
    // const userId = getUserIdFromRequest(request)
    // const customer = await getCustomerByUserId(userId)
    
    // 临时使用示例 customer ID（实际应从数据库获取）
    const customerId = "cus_example"

    // 获取账单列表
    const params: Stripe.InvoiceListParams = {
      customer: customerId,
      limit: limit,
    }

    if (startingAfter) {
      params.starting_after = startingAfter
    }

    const invoices = await stripe.invoices.list(params)

    // 格式化返回数据
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      description: invoice.description || invoice.lines.data[0]?.description || "Subscription",
    }))

    return NextResponse.json({
      invoices: formattedInvoices,
      has_more: invoices.has_more,
    })
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return NextResponse.json(
      {
        error:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to fetch invoices",
      },
      { status: 500 }
    )
  }
}

