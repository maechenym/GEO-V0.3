import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Persona {
  id: string
  name: string
  region: string
  description?: string
}

export interface Competitor {
  id: string
  brandName: string
  productName: string
}

export interface BrandData {
  brandName: string
  productName: string
  website?: string
  brandDescription?: string
  personas: Persona[]
  competitors: Competitor[]
}

interface BrandState {
  brand: BrandData | null
  setBrand: (brand: BrandData) => void
  updateBrand: (updates: Partial<BrandData>) => void
  addPersona: (persona: Persona) => void
  removePersona: (id: string) => void
  addCompetitor: (competitor: Competitor) => void
  removeCompetitor: (id: string) => void
  reset: () => void
}

const defaultBrand: BrandData = {
  brandName: "",
  productName: "",
  website: "",
  brandDescription: "",
  personas: [],
  competitors: [],
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      brand: null,
      setBrand: (brand) => set({ brand }),
      updateBrand: (updates) =>
        set((state) => ({
          brand: state.brand
            ? { ...state.brand, ...updates }
            : { ...defaultBrand, ...updates },
        })),
      addPersona: (persona) =>
        set((state) => ({
          brand: state.brand
            ? { ...state.brand, personas: [...state.brand.personas, persona] }
            : { ...defaultBrand, personas: [persona] },
        })),
      removePersona: (id) =>
        set((state) => ({
          brand: state.brand
            ? {
                ...state.brand,
                personas: state.brand.personas.filter((p) => p.id !== id),
              }
            : null,
        })),
      addCompetitor: (competitor) =>
        set((state) => ({
          brand: state.brand
            ? {
                ...state.brand,
                competitors: [...state.brand.competitors, competitor],
              }
            : { ...defaultBrand, competitors: [competitor] },
        })),
      removeCompetitor: (id) =>
        set((state) => ({
          brand: state.brand
            ? {
                ...state.brand,
                competitors: state.brand.competitors.filter((c) => c.id !== id),
              }
            : null,
        })),
      reset: () => set({ brand: null }),
    }),
    {
      name: "brand-storage",
    }
  )
)

