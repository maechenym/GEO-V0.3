import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/onboarding/waitlist
 * 
 * 加入等待列表
 * 
 * 仅在 NEXT_PUBLIC_USE_MOCK=false 时执行
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    // 返回 mock 数据
    return NextResponse.json({
      ok: true,
      message: "Successfully joined waitlist",
    })
  }

  try {
    const body = await request.json()
    const { brandName, productName } = body as {
      brandName?: string
      productName?: string
    }

    // 验证必填字段
    if (!brandName || !productName) {
      return NextResponse.json(
        {
          error: "brandName and productName are required",
        },
        { status: 400 }
      )
    }

    // TODO: 实现后端逻辑
    // 1. 获取当前用户（从 token）
    // 2. 创建品牌记录
    // 3. 创建产品记录
    // 4. 将用户添加到等待列表
    // 5. 更新用户状态（hasBrand: true）
    // 6. 发送确认邮件

    return NextResponse.json({
      ok: true,
      message: "Successfully joined waitlist",
    })
  } catch (error) {
    console.error("Waitlist join failed:", error)
    return NextResponse.json(
      {
        error:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to join waitlist",
      },
      { status: 500 }
    )
  }
}

