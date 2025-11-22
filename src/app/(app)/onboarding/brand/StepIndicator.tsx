"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
}

/**
 * 步骤指示器组件
 * 显示 Brand 和 Join Waitlist 两个步骤
 * 当前步骤高亮显示（品牌蓝 #13458c）
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Step 1: Brand */}
      <div className="flex items-center gap-3">
        {/* Step Circle */}
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
        {/* Step Label */}
        <span
          className={cn(
            "text-sm font-medium",
            currentStep === 1 ? "text-primary" : currentStep > 1 ? "text-primary" : "text-ink-400"
          )}
        >
          Brand
        </span>
      </div>
      
      {/* Step 2: Join Waitlist */}
      <div className="flex items-center gap-3">
        {/* Step Circle */}
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
        {/* Step Label */}
        <span
          className={cn(
            "text-sm font-medium",
            currentStep === 2 ? "text-primary" : currentStep > 2 ? "text-primary" : "text-ink-400"
          )}
        >
          Join Waitlist
        </span>
      </div>
    </div>
  )
}

