import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BrandBasic } from "@/types/brand"

/**
 * Brand Store
 * 
 * 管理新手引导的品牌信息状态
 */
interface BrandState {
  basic: BrandBasic | null
  completed: boolean
  setBasic: (v: BrandBasic) => void
  setCompleted: (v: boolean) => void
  reset: () => void
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      basic: null,
      completed: false,

      setBasic: (v) => set({ basic: v }),

      setCompleted: (v) => set({ completed: v }),

      reset: () => set({ basic: null, completed: false }),
    }),
    { name: "onboarding-brand" }
  )
)

