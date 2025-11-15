import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Brand UI Store
 * 
 * Manages UI state for brand/product selection and dirty state
 */
interface BrandUIState {
  selectedBrandId: string | null
  selectedProductId: string | null
  savedProductId: string | null
  isDirty: boolean
  lastSavedAt: string | null
  setSelectedBrand: (id: string | null) => void
  setSelectedProduct: (id: string | null) => void
  setDirty: (b: boolean) => void
  markSaved: () => void
  reset: () => void
}

export const useBrandUIStore = create<BrandUIState>()(
  persist(
    (set) => ({
      selectedBrandId: null,
      selectedProductId: null,
      savedProductId: null,
      isDirty: false,
      lastSavedAt: null,
      setSelectedBrand: (id) =>
        set({
          selectedBrandId: id,
          selectedProductId: null,
          savedProductId: null,
          isDirty: false,
        }), // Reset product when brand changes
      setSelectedProduct: (id) => set({ selectedProductId: id }),
      setDirty: (b) => set({ isDirty: b }),
      markSaved: () =>
        set((state) => ({
          isDirty: false,
          lastSavedAt: new Date().toISOString(),
          savedProductId: state.selectedProductId ?? state.savedProductId,
        })),
      reset: () =>
        set({
          selectedBrandId: null,
          selectedProductId: null,
          savedProductId: null,
          isDirty: false,
          lastSavedAt: null,
        }),
    }),
    { name: "brand-ui" }
  )
)

