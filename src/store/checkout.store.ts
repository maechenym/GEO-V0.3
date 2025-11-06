import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Checkout Plan Type
 */
export type CheckoutPlan = {
  planId: "free" | "basic" | "advanced" | "enterprise"
  priceId: string | null // free → null
  name: string // "Free Trial", "Basic", "Advanced", "Enterprise"
  priceText: string // "$0", "$99 / month", etc.
  perks: string[] // concise bullet points only
  badge?: string // optional: "Most Popular"
}

/**
 * Checkout State
 */
interface CheckoutState {
  selectedPlan: CheckoutPlan | null
  setSelectedPlan: (plan: CheckoutPlan) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      selectedPlan: null,
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      reset: () => set({ selectedPlan: null }),
    }),
    { name: "checkout-plan" }
  )
)

