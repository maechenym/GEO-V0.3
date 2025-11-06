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
      isDirty: false,
      lastSavedAt: null,
      setSelectedBrand: (id) => set({ selectedBrandId: id, selectedProductId: null }), // Reset product when brand changes
      setSelectedProduct: (id) => set({ selectedProductId: id }),
      setDirty: (b) => set({ isDirty: b }),
      markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),
      reset: () =>
        set({
          selectedBrandId: null,
          selectedProductId: null,
          isDirty: false,
          lastSavedAt: null,
        }),
    }),
    { name: "brand-ui" }
  )
)

