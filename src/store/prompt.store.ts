import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PromptItem } from "@/types/prompt"

/**
 * Prompt Store
 * 
 * 管理新手引导 Step2 的提示词状态
 */
type PromptState = {
  list: PromptItem[]
  setList: (arr: PromptItem[]) => void
  addPrompt: (p: PromptItem) => void // 新增插入首行
  updatePrompt: (id: string, patch: Partial<PromptItem>) => void
  removePrompt: (id: string) => void
  reset: () => void
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set) => ({
      list: [],

      setList: (arr) => set({ list: arr }),

      addPrompt: (p) => set((s) => ({ list: [p, ...s.list] })),

      updatePrompt: (id, patch) =>
        set((s) => ({
          list: s.list.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      removePrompt: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),

      reset: () => set({ list: [] }),
    }),
    { name: "onboarding-prompts" }
  )
)

