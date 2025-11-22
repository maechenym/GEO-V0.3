"use client"

import { useMemo, useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import { useProducts } from "@/hooks/use-products"
import { translate } from "@/lib/i18n"
import type { Product } from "@/types/products"

// 从产品名称中移除品牌名称
const sanitizeProductName = (name: string) => {
  if (!name) return ""
  const trimmed = name.trim()

  if (trimmed.includes("|")) {
    const parts = trimmed.split("|").map((part) => part.trim())
    return parts[parts.length - 1] || trimmed
  }

  if (trimmed.includes("-")) {
    const parts = trimmed.split("-").map((part) => part.trim())
    if (parts.length > 1) {
      return parts[parts.length - 1]
    }
  }

  const withoutBrand = trimmed.replace(/^英业达\s*\(Inventec\)\s*/i, "").trim()
  if (withoutBrand && withoutBrand !== trimmed) {
    return withoutBrand
  }

  return trimmed
}

interface ProductSelectorCardProps {
  brandId: string
}

export function ProductSelectorCard({ brandId }: ProductSelectorCardProps) {
  const { selectedProductId, savedProductId, setSelectedProduct, setDirty } = useBrandUIStore()
  const { language } = useLanguageStore()
  const { data: productsData, isLoading } = useProducts(brandId)
  const products = productsData?.products || []

  // Filter active products only
  const activeProducts = products.filter((p: Product) => p.active)

  // 找到默认产品（机架解决方案，第一个产品）
  const defaultProduct = useMemo(() => {
    if (activeProducts.length === 0) return null
    return activeProducts.find((p: Product) => 
      p.name.includes("机架解决方案") || p.name.includes("機架解決方案")
    ) || activeProducts[0]
  }, [activeProducts])

  // 使用本地状态来确保默认值被设置
  const [initialized, setInitialized] = useState(false)

  // 进入页面时，优先使用已保存的产品ID（savedProductId），这样显示的是用户当前查看的产品
  // 如果没有保存的产品，则使用默认产品
  useEffect(() => {
    if (!isLoading && activeProducts.length > 0 && !initialized) {
      // 优先使用已保存的产品ID（savedProductId）
      if (savedProductId && activeProducts.some((p: Product) => p.id === savedProductId)) {
        console.log("[ProductSelector] Initializing with saved product:", savedProductId)
        setSelectedProduct(savedProductId)
        setInitialized(true)
        return
      }
      // 如果没有保存的产品，使用默认产品
      if (!selectedProductId && defaultProduct?.id) {
        console.log("[ProductSelector] Setting default product:", defaultProduct.id, defaultProduct.name)
        setSelectedProduct(defaultProduct.id)
        setInitialized(true)
      } else if (selectedProductId) {
        console.log("[ProductSelector] Product already selected:", selectedProductId)
        setInitialized(true)
      }
    }
  }, [
    isLoading,
    selectedProductId,
    defaultProduct?.id,
    setSelectedProduct,
    activeProducts.length,
    initialized,
    savedProductId,
  ])

  // 确保有有效的产品ID用于Select组件
  // 优先使用 selectedProductId（用户当前选择，可能未保存）
  // 如果没有，使用 savedProductId（已保存的产品，用户当前查看的产品）
  // 最后使用默认产品
  const currentProductId = selectedProductId || savedProductId || defaultProduct?.id || ""
  
  console.log("[ProductSelector] Render:", {
    isLoading,
    activeProductsCount: activeProducts.length,
    selectedProductId,
    defaultProductId: defaultProduct?.id,
    currentProductId,
    initialized
  })

  // 获取当前选中产品的显示名称
  const currentProduct = useMemo(() => {
    return activeProducts.find((p: Product) => p.id === currentProductId)
  }, [activeProducts, currentProductId])

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId)
    setDirty(true)
  }

  // 如果还在加载或没有产品，显示加载状态
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{translate("Product", language)}</h2>
        </div>
        <div className="text-sm text-gray-500">
          {translate("Loading products...", language)}
        </div>
      </div>
    )
  }

  if (activeProducts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{translate("Product", language)}</h2>
        </div>
        <div className="text-sm text-gray-500">
          {translate("No active products available", language)}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">{translate("Product Information", language)}</h2>
      </div>
      <div className="space-y-4">
        {/* 产品选择器 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500">
            {translate("Product", language)}
          </div>
          <Select value={currentProductId} onValueChange={handleProductChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={translate("Select a product", language)} />
            </SelectTrigger>
            <SelectContent>
              {activeProducts.map((product: Product) => (
                <SelectItem key={product.id} value={product.id}>
                  {translate(sanitizeProductName(product.name), language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* 产品类别 */}
        {currentProduct && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500">
              {translate("Product Category", language)}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {currentProduct.category || "—"}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

