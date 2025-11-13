"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Mail } from "lucide-react"

/**
 * Waiting List 等待页
 * 
 * 路径：/onboarding/waitlist
 * 目的：确认用户已进入等待队列，告知用户数据正在收集，并说明后续联系时间
 * 
 * 显示信息：
 * - 您已进入 Waiting List
 * - 我们将在 7 天后联系您
 * - 届时可登录查看分析结果
 */
export default function WaitlistPage() {
  const router = useRouter()
  const { profile, token } = useAuthStore()

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!token || !profile) {
      router.push("/login")
    }
  }, [token, profile, router])

  // 注意：用户刚完成 onboarding，hasBrand 可能已经被设置为 true
  // 但用户应该在 waitlist 页面，所以不重定向

  if (!token || !profile) {
    return null
  }

  // 计算 7 天后的日期
  const getDateIn7Days = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-6">
          {/* 成功图标 */}
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          {/* 标题 */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">
              You're on the waiting list!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for joining us. We're excited to have you on board.
            </p>
          </div>

          {/* 信息卡片 */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm space-y-6">
            {/* 等待列表确认 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Data Collection in Progress
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We're currently collecting and analyzing data for your brand and product. 
                  This process takes time to ensure we provide you with the most accurate insights.
                </p>
              </div>
            </div>

            {/* 联系时间 */}
            <div className="flex items-start gap-4 pt-4 border-t border-border">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  We'll Contact You Soon
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We will contact you by email on <span className="font-semibold text-foreground">{getDateIn7Days()}</span> (7 days from now). 
                  At that time, you can log in to view your analysis results.
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={async () => {
                const { logout } = useAuthStore.getState()
                await logout()
                router.push("/login")
              }}
              className="bg-[#13458c] hover:bg-[#13458c]/90 text-white px-8"
            >
              Logout
            </Button>
          </div>

          {/* 提示信息 */}
          <p className="text-sm text-muted-foreground pt-4">
            You can log in anytime to check your status. We'll notify you via email when your analysis is ready.
          </p>
        </div>
      </div>
    </div>
  )
}

