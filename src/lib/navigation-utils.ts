import { useRouter, useSearchParams } from "next/navigation"

/**
 * 导航到 visibility 页面并触发动画
 */
export function useNavigateWithPulse() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateWithPulse = (
    metric: "reach" | "rank" | "focus",
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams()
    
    if (startDate && endDate) {
      params.set("start", startDate)
      params.set("end", endDate)
    } else {
      // 如果没有提供日期，使用当前 URL 的日期参数
      const currentStart = searchParams.get("start")
      const currentEnd = searchParams.get("end")
      if (currentStart) params.set("start", currentStart)
      if (currentEnd) params.set("end", currentEnd)
    }
    
    params.set("tab", metric)

    router.push(`/insights/visibility?${params.toString()}`)
  }

  return { navigateWithPulse }
}

/**
 * 在 visibility 页面检查是否需要执行动画
 */
export function usePulseAnimation() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")

  return {
    shouldPulse: tab === "reach" || tab === "rank" || tab === "focus",
    pulseMetric: tab as "reach" | "rank" | "focus" | null,
  }
}

