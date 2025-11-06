"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { PlanCard } from "./PlanCard"
import { PaymentForm } from "./PaymentForm"

/**
 * Onboarding Step 3: Plan
 * 
 * 路径：/onboarding/plan
 * 目的：选择计划并绑定支付方式，激活 7 天免费试用
 */
export default function PlanPage() {
  const router = useRouter()

  // 计算试用结束日期（今天 +7 天）
  const trialEndsAt = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString()
  }, [])

  // 格式化日期显示
  const trialEndDate = useMemo(() => {
    const date = new Date(trialEndsAt)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }, [trialEndsAt])

  // 处理支付成功
  const handleSuccess = () => {
    // 跳转到 AI 分析页
    router.push("/onboarding/ai-analysis")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="space-y-8">
        {/* 顶部标题 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            开始您的 7 天免费试用
          </h1>
          <p className="text-lg text-muted-foreground">
            试用期至 {trialEndDate}
          </p>
        </div>

        {/* 内容网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：试用清单 */}
          <div>
            <PlanCard />
          </div>

          {/* 右侧：支付表单 */}
          <div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">支付信息</h2>
              <PaymentForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>

        {/* 页脚合规文案 */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground">
            Data secured by GEO · Powered by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}

