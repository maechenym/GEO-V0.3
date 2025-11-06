import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/analysis/initiate
 * 
 * 初始化 AI 分析任务
 * 
 * 如果 MSW 没有拦截请求，这里作为 fallback 返回 mock 数据
 */
export async function POST(request: NextRequest) {
  // 检查是否为 Mock 模式
  // 如果 MSW 没有拦截请求，这里作为 fallback 返回 mock 数据
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get("brandId")

    if (!brandId) {
      return NextResponse.json(
        {
          error: "brandId is required",
        },
        { status: 400 }
      )
    }

    // 生成 jobId
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // 返回 mock 数据
    return NextResponse.json({
      jobId,
      message: "Analysis initiated",
    })
  }

  // 真实模式下的处理（如果后端已实现）
  return NextResponse.json(
    {
      error: "Analysis API not implemented yet",
    },
    { status: 501 }
  )
}

