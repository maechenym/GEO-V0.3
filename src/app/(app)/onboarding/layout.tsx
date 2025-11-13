"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
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
  
  // 根据路径确定当前步骤（现在只有一个步骤）
  const getCurrentStep = () => {
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
              className="mb-6 block px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md transition-colors -mt-1"
            >
              <Logo size={28} showText={true} textSize="3xl" />
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
                className="inline-flex items-center px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md transition-colors -mt-1"
              >
                <Logo size={28} showText={true} textSize="3xl" />
              </Link>
            </div>
            
            {/* 移动端横向步骤指示器 */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors border-primary bg-primary text-white">
                    1
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap text-primary">
                    Brand
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
