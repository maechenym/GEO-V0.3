"use client"

import { cn } from "@/lib/utils"

interface Step {
  label: string
  step: number
}

const steps: Step[] = [
  { label: "Brand", step: 1 },
  { label: "Prompt", step: 2 },
  { label: "Plan", step: 3 },
]

interface OnboardingStepsProps {
  currentStep: number
}

/**
 * Onboarding 步骤指示器
 * 显示 Brand → Prompt → Plan 三个步骤
 * 当前步骤高亮显示（品牌蓝 #13458c）
 */
export function OnboardingSteps({ currentStep }: OnboardingStepsProps) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => {
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

