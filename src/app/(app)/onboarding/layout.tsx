"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { StepIndicator } from "./brand/StepIndicator"
import { Logo } from "@/components/logo"

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
    if (pathname === "/onboarding/brand") {
      return 1
    } else if (pathname === "/onboarding/waitlist") {
      return 2
    }
    return 1 // 默认返回第1步
  }

  const currentStep = getCurrentStep()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 主要内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧固定步骤进度条 */}
        <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:flex md:w-[220px] md:border-r md:border-border md:bg-card md:overflow-y-auto">
          <div className="w-full p-4">
            {/* Logo - 点击跳转到首页 */}
            <Link
              href="/"
              className="mb-6 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-lg transition-colors duration-200 -mt-1"
            >
              <Logo size={36} showText={true} textSize="3xl" />
            </Link>
            
            {/* 步骤指示器 */}
            <div className="mt-6">
              <StepIndicator currentStep={currentStep} />
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto md:ml-[220px]">
          {/* 移动端：Logo + 顶部横向步骤指示器 */}
          <div className="md:hidden border-b border-border bg-card">
            {/* 移动端 Logo */}
            <div className="px-4 pt-4 pb-2">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-lg transition-colors duration-200 -mt-1"
              >
                <Logo size={36} showText={true} textSize="3xl" />
              </Link>
            </div>
            
            {/* 移动端横向步骤指示器 */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {/* Step 1: Brand */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                      currentStep === 1
                        ? "border-primary bg-primary text-white"
                        : currentStep > 1
                        ? "border-primary bg-primary text-white"
                        : "border-ink-300 bg-transparent text-ink-400"
                    )}
                  >
                    1
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      currentStep === 1 ? "text-primary" : currentStep > 1 ? "text-primary" : "text-ink-400"
                    )}
                  >
                    Brand
                  </span>
                </div>
                {/* Step 2: Join Waitlist */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                      currentStep === 2
                        ? "border-primary bg-primary text-white"
                        : currentStep > 2
                        ? "border-primary bg-primary text-white"
                        : "border-ink-300 bg-transparent text-ink-400"
                    )}
                  >
                    2
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      currentStep === 2 ? "text-primary" : currentStep > 2 ? "text-primary" : "text-ink-400"
                    )}
                  >
                    Join Waitlist
                  </span>
                </div>
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
