import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BrandBasic, Persona, Competitor, Prompt } from "@/types/brand"

/**
 * Brand Store
 * 
 * 管理新手引导的品牌信息状态（包含 Step1 和 Step2）
 */
interface BrandState {
  basic: BrandBasic | null
  personas: Persona[]
  competitors: Competitor[]
  prompts: Prompt[]
  completed: boolean
  setBasic: (v: BrandBasic) => void
  addPersona: (p: Persona) => void
  removePersona: (id: string) => void
  addCompetitor: (c: Competitor) => void
  removeCompetitor: (id: string) => void
  addPrompt: (p: Prompt) => void
  updatePrompt: (id: string, p: Prompt) => void
  removePrompt: (id: string) => void
  setPrompts: (prompts: Prompt[]) => void
  setCompleted: (v: boolean) => void
  reset: () => void
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      basic: null,
      personas: [],
      competitors: [],
      prompts: [],
      completed: false,

      setBasic: (v) => set({ basic: v }),

      addPersona: (p) => set((s) => ({ personas: [p, ...s.personas] })),

      removePersona: (id) =>
        set((s) => ({ personas: s.personas.filter((x) => x.id !== id) })),

      addCompetitor: (c) => set((s) => ({ competitors: [c, ...s.competitors] })),

      removeCompetitor: (id) =>
        set((s) => ({ competitors: s.competitors.filter((x) => x.id !== id) })),

      addPrompt: (p) => set((s) => ({ prompts: [p, ...s.prompts] })),

      updatePrompt: (id, p) =>
        set((s) => ({
          prompts: s.prompts.map((prompt) => (prompt.id === id ? p : prompt)),
        })),

      removePrompt: (id) =>
        set((s) => ({ prompts: s.prompts.filter((x) => x.id !== id) })),

      setPrompts: (prompts) => set({ prompts }),

      setCompleted: (v) => set({ completed: v }),

      reset: () => set({ basic: null, personas: [], competitors: [], prompts: [], completed: false }),
    }),
    { name: "onboarding-brand" }
  )
)

