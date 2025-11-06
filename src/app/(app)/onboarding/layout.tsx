"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { StepIndicator } from "./brand/StepIndicator"

/**
 * Onboarding 流程布局
 * 
 * 布局结构：
 * - 左侧固定步骤进度条（220px），顶部有 ximu logo
 * - 右侧主内容区
 * 
 * 注意：不使用 App Shell 的工作栏，不使用顶部 header
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 根据路径确定当前步骤
  const getCurrentStep = () => {
    if (pathname?.includes("/brand")) return 1
    if (pathname?.includes("/prompt")) return 2
    if (pathname?.includes("/plan")) return 3
    if (pathname?.includes("/ai-analysis")) return 4
    return 1
  }

  const currentStep = getCurrentStep()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 主要内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧固定步骤进度条 */}
        <aside className="hidden md:flex md:flex-shrink-0 md:w-[220px] md:border-r md:border-border md:bg-card">
          <div className="w-full p-6">
            {/* Logo - 点击跳转到首页 */}
            <Link
              href="/"
              className="mb-6 block px-3 py-2 text-xl font-bold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md transition-colors"
            >
              ximu
            </Link>
            
            {/* 步骤指示器 */}
            <StepIndicator currentStep={currentStep} />
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          {/* 移动端：Logo + 顶部横向步骤指示器 */}
          <div className="md:hidden border-b border-border bg-card">
            {/* 移动端 Logo */}
            <div className="px-4 pt-4 pb-2">
              <Link
                href="/"
                className="inline-block px-3 py-2 text-xl font-bold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md transition-colors"
              >
                ximu
              </Link>
            </div>
            
            {/* 移动端横向步骤指示器 */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((step) => {
                const isActive = step === currentStep
                const isCompleted = step < currentStep
                const labels = ["Brand", "Prompt", "Plan", "AI-Analysis"]
                
                return (
                  <div key={step} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                        isActive || isCompleted
                          ? "border-primary bg-primary text-white"
                          : "border-muted bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? "✓" : step}
                    </div>
                    <span
                      className={`text-sm font-medium whitespace-nowrap ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {labels[step - 1]}
                    </span>
                    {step < 4 && (
                      <div
                        className={`h-0.5 w-8 transition-colors ${
                          step < currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* 页面内容 */}
          {children}
        </main>
      </div>
    </div>
  )
}
