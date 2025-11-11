"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
}

/**
 * 步骤指示器组件
 * 显示 Brand 步骤（现在只有一个步骤）
 * 当前步骤高亮显示（品牌蓝 #0000D2）
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {/* Step Circle */}
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
            "border-primary bg-primary text-white"
          )}
        >
          1
        </div>
        {/* Step Label */}
        <span className="text-sm font-medium text-primary">
          Brand
        </span>
      </div>
    </div>
  )
}

