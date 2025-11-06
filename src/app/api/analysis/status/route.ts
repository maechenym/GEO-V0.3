import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/analysis/status
 * 
 * 获取分析任务状态
 * 
 * 如果 MSW 没有拦截请求，这里作为 fallback 返回 mock 数据
 */
export async function GET(request: NextRequest) {
  // 检查是否为 Mock 模式
  // 如果 MSW 没有拦截请求，这里作为 fallback 返回 mock 数据
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json(
        {
          error: "jobId is required",
        },
        { status: 400 }
      )
    }

    // 模拟进度（基于 jobId 的时间戳计算进度）
    const jobTimestamp = parseInt(jobId.split("_")[1] || "0")
    const elapsed = Date.now() - jobTimestamp
    const duration = 15000 // 15 秒完成整个分析

    // 计算进度（0-100）
    let progress = Math.min(Math.floor((elapsed / duration) * 100), 100)

    // 根据进度确定阶段
    let stage: "Analyzing" | "Mapping" | "Ranking" | "Preparing" | "Completed"
    if (progress < 25) {
      stage = "Analyzing"
    } else if (progress < 50) {
      stage = "Mapping"
    } else if (progress < 75) {
      stage = "Ranking"
    } else if (progress < 100) {
      stage = "Preparing"
    } else {
      stage = "Completed"
      progress = 100
    }

    return NextResponse.json({
      jobId,
      progress,
      stage,
      status: progress === 100 ? "completed" : "in_progress",
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

