import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Plan Store
 * 
 * 管理订阅计划状态
 */
export type PlanType = "trial" | "pro" | "enterprise" | null

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
          case "pro":
            return 10
          case "enterprise":
            return 100
          default:
            return 3 // basic
        }
      },
    }),
    { name: "plan-store" }
  )
)

