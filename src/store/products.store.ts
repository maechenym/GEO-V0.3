/**
 * Products Store
 * 
 * 管理当前选中的产品 ID
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProductsState {
  productId: string
  setProductId: (productId: string) => void
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set) => ({
      productId: 'all',
      setProductId: (productId: string) => {
        set({ productId })
      },
    }),
    {
      name: 'products-storage',
      partialize: (state) => ({
        productId: state.productId,
      }),
    }
  )
)
