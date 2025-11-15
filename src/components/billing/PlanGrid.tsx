"use client"

import { PlanCard } from "./PlanCard"
import type { CheckoutPlan } from "@/store/checkout.store"
import { usePlanStore } from "@/store/plan.store"

interface PlanGridProps {
  plans: CheckoutPlan[]
}

export function PlanGrid({ plans }: PlanGridProps) {
  const { planType } = usePlanStore()

  // Map planType to planId
  const getCurrentPlanId = (): CheckoutPlan["planId"] | null => {
    if (planType === "trial") return "free"
    if (planType === "basic") return "basic"
    if (planType === "pro") return "advanced"
    if (planType === "enterprise") return "enterprise"
    return null
  }

  const currentPlanId = getCurrentPlanId()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <PlanCard
          key={plan.planId}
          plan={plan}
          isCurrentPlan={plan.planId === currentPlanId}
        />
      ))}
    </div>
  )
}

