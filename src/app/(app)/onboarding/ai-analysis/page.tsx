"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * AI 搜索分析生成页（已移除）
 * 
 * 路径：/onboarding/ai-analysis
 * 重定向到 /overview
 */
export default function AIAnalysisPage() {
  const router = useRouter()

  useEffect(() => {
    // 直接重定向到 overview
    router.replace("/overview")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">正在跳转...</div>
    </div>
  )
}

