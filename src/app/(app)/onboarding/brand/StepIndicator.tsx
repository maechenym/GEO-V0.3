"use client"

import { cn } from "@/lib/utils"

interface Step {
  label: string
  step: number
}

const steps: Step[] = [
  { label: "Brand", step: 1 },
  { label: "Plan", step: 2 },
]

interface StepIndicatorProps {
  currentStep: number
}

/**
 * 步骤指示器组件
 * 显示 Brand → Plan 两个步骤
 * 当前步骤高亮显示（品牌蓝 #0000D2）
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step) => {
        const isActive = step.step === currentStep
        const isCompleted = step.step < currentStep

        return (
          <div key={step.step} className="flex items-center gap-3">
            {/* Step Circle */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                isActive && "border-primary bg-primary text-white",
                isCompleted && "border-primary bg-primary text-white",
                !isActive && !isCompleted && "border-muted bg-background text-muted-foreground"
              )}
            >
              {isCompleted ? "✓" : step.step}
            </div>
            {/* Step Label */}
            <span
              className={cn(
                "text-sm font-medium",
                isActive && "text-primary",
                !isActive && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

