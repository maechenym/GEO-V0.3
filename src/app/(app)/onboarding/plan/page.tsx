"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Onboarding Plan 页面（已移除）
 * 
 * 路径：/onboarding/plan
 * 重定向到 /overview
 */
export default function PlanPage() {
  const router = useRouter()

  useEffect(() => {
    // 直接重定向到 overview
    router.replace("/overview")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  )
}

