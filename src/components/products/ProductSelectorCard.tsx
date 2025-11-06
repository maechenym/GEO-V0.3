"use client"

import { useMemo, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface ProductSelectorCardProps {
  brandId: string
}

export function ProductSelectorCard({ brandId }: ProductSelectorCardProps) {
  const { selectedProductId, setSelectedProduct } = useBrandUIStore()
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

  // 如果没有选中产品且数据已加载，默认选择第一个产品（机架解决方案）
  useEffect(() => {
    if (!isLoading && activeProducts.length > 0 && !initialized) {
      if (!selectedProductId && defaultProduct?.id) {
        console.log("[ProductSelector] Setting default product:", defaultProduct.id, defaultProduct.name)
        setSelectedProduct(defaultProduct.id)
        setInitialized(true)
      } else if (selectedProductId) {
        console.log("[ProductSelector] Product already selected:", selectedProductId)
        setInitialized(true)
      }
    }
  }, [isLoading, selectedProductId, defaultProduct?.id, setSelectedProduct, activeProducts.length, initialized])

  // 确保有有效的产品ID用于Select组件
  const currentProductId = selectedProductId || (defaultProduct?.id ?? "")
  
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
  }

  // 如果还在加载或没有产品，显示加载状态
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{translate("Product", language)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {translate("Loading products...", language)}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activeProducts.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{translate("Product", language)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {translate("No active products available", language)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">{translate("Product", language)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={currentProductId}
          onValueChange={handleProductChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={translate("Select a product", language)} />
          </SelectTrigger>
          <SelectContent>
            {activeProducts.map((product: Product) => (
              <SelectItem key={product.id} value={product.id}>
                {translate(product.name, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

