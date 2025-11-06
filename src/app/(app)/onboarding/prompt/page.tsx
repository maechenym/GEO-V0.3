"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Prompt 页面（已移除）
 * 
 * 路径：/onboarding/prompt
 * 重定向到 /onboarding/plan
 */
export default function PromptOnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // 直接重定向到 plan
    router.replace("/onboarding/plan")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">正在跳转...</div>
    </div>
  )
}
