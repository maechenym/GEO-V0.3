import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Plan Store
 * 
 * 管理订阅计划状态
 */
export type PlanType = "trial" | "basic" | "pro" | "enterprise" | null

interface PlanState {
  planType: PlanType
  trialEndsAt: string | null
  setPlan: (payload: { planType: PlanType; trialEndsAt: string | null }) => void
  reset: () => void
  getMaxProducts: () => number
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      planType: null,
      trialEndsAt: null,
      setPlan: (payload) => set(payload),
      reset: () => set({ planType: null, trialEndsAt: null }),
      getMaxProducts: () => {
        const planType = get().planType
        switch (planType) {
          case "trial":
            return 1
          case "basic":
            return 3
          case "pro":
            return 9
          case "enterprise":
            return 20
          default:
            return 3 // 默认 Basic 限制
        }
      },
    }),
    { name: "plan-store" }
  )
)

export const mapPlanIdToPlanType = (planId?: string | null): PlanType => {
  switch (planId) {
    case "free":
      return "trial"
    case "basic":
      return "basic"
    case "advanced":
    case "pro":
      return "pro"
    case "enterprise":
      return "enterprise"
    default:
      return null
  }
}

export const derivePlanTypeFromSubscription = (
  planId?: string | null,
  status?: string | null
): PlanType => {
  const mapped = mapPlanIdToPlanType(planId)
  if (mapped) return mapped
  if (status === "trial") {
    return "trial"
  }
  return null
}

