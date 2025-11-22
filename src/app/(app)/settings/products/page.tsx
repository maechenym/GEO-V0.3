"use client"

import { motion } from "framer-motion"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import { ProductListCard } from "@/components/products/ProductListCard"
import { CompetitorsCard } from "@/components/products/CompetitorsCard"
import { ProductSelectorCard } from "@/components/products/ProductSelectorCard"
import { UnsavedChangesGuard } from "@/components/common/UnsavedChangesGuard"
import { useBrand, useProducts, useCompetitors, useCompetitorsByProduct, useUpdateBrand } from "@/hooks/use-products"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { translate } from "@/lib/i18n"
import { useState } from "react"

// 固定使用英业达品牌ID
const INVENTEC_BRAND_ID = "brand_inventec"

export default function ProductsSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { language } = useLanguageStore()
  const {
    isDirty,
    markSaved,
  } = useBrandUIStore()

  // 固定使用英业达品牌
  const selectedBrandId = INVENTEC_BRAND_ID

  // Fetch brand data
  const { data: brandData, isLoading: brandLoading, error: brandError } = useBrand(selectedBrandId)
  const selectedBrand = brandData?.brand || null
  const updateBrandMutation = useUpdateBrand()

  // Fetch related data
  const { data: productsData, isLoading: productsLoading } = useProducts(selectedBrandId)
  const products = productsData?.products || []

  // Get selected product ID from store
  const { selectedProductId } = useBrandUIStore()
  
  // Always fetch both product-level and brand-level competitors
  const { data: competitorsByProductData, isLoading: competitorsByProductLoading } = useCompetitorsByProduct(selectedProductId)
  const { data: competitorsByBrandData, isLoading: competitorsByBrandLoading } = useCompetitors(selectedBrandId)
  
  // Use product-level competitors if product is selected and has competitors, otherwise use brand-level competitors
  const productCompetitors = competitorsByProductData?.competitors || []
  const brandCompetitors = competitorsByBrandData?.competitors || []
  
  const competitors = selectedProductId && productCompetitors.length > 0
    ? productCompetitors
    : brandCompetitors
  const competitorsLoading = selectedProductId 
    ? (competitorsByProductLoading || competitorsByBrandLoading)
    : competitorsByBrandLoading

  // Debug logging
  console.log("[Products Settings] Competitors data:", {
    selectedProductId,
    selectedBrandId,
    competitorsByProduct: productCompetitors.length,
    competitorsByBrand: brandCompetitors.length,
    finalCompetitors: competitors.length,
    competitorsLoading,
    usingProductLevel: selectedProductId && productCompetitors.length > 0,
  })
  
  // Check if target banks are in the list
  const targetBanks = ["国泰世华银行", "玉山银行", "台新银行", "國泰世華銀行", "玉山銀行", "台新銀行"]
  const foundBanks = competitors.filter(c => targetBanks.includes(c.name))
  if (foundBanks.length > 0) {
    console.log("[Products Settings] Target banks found:", foundBanks.map(c => c.name))
  } else {
    console.log("[Products Settings] Target banks NOT found in competitors list")
    console.log("[Products Settings] First 20 competitors:", competitors.slice(0, 20).map(c => c.name))
  }

  const handleSaveAllChanges = async () => {
    if (!selectedBrandId || !isDirty) return

    try {
      // Invalidate all queries to refetch latest data
      await queryClient.invalidateQueries()
      markSaved()
      toast({
        title: translate("Changes Saved", language),
        description: translate("All changes have been saved successfully", language),
      })
    } catch (error: any) {
      toast({
        title: translate("Save Failed", language),
        description: error?.response?.data?.error || error?.message || translate("Failed to save changes", language),
        variant: "destructive",
      })
    }
  }

  // Show loading state
  if (brandLoading || productsLoading || competitorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{translate("Loading products...", language)}</div>
      </div>
    )
  }

  // Show error state if brand loading failed
  if (brandError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">
          {translate("Failed to load brand information. Please try again.", language)}
        </div>
      </div>
    )
  }

  return (
    <>
      <UnsavedChangesGuard onSave={handleSaveAllChanges} />
      <div className="bg-background -mx-6">
        {/* Top Filter Bar */}
        <div className="sticky top-0 z-50 bg-white dark:bg-background border-b border-border px-6 py-2">
          <div className="container mx-auto max-w-[1600px]">
            <div className="flex items-center justify-between">
              {/* Left: Title */}
              <div className="-ml-6">
                <h1 className="text-xl font-semibold text-foreground">{translate("Products", language)}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {translate("Manage your products and competitors.", language)}
                </p>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSaveAllChanges}
                  disabled={!isDirty}
                  aria-label="Save all changes"
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Save className="mr-2 h-3 w-3" />
                  {translate("Save changes", language)}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto pl-4 pr-4 pt-4 pb-10 max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {selectedBrand ? (
              <>
                {/* Brand and Product Selector Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 卡片1: 品牌信息 */}
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">{translate("Brand Information", language)}</h2>
                    <div className="space-y-4">
                      {/* 品牌 */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500">
                          {translate("Brand", language)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {translate(selectedBrand.name || "英业达", language)}
                        </div>
                      </div>
                      {/* 产业 */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500">
                          {translate("Industry", language)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {(() => {
                            const industry = (selectedBrand as any)?.brandCategory || (selectedBrand as any)?.industry || ""
                            if (!industry) return "—"
                            // 产业选项映射
                            const industryLabels: Record<string, { zh: string; en: string }> = {
                              technology: { zh: "科技", en: "Technology" },
                              finance: { zh: "金融", en: "Finance" },
                              manufacturing: { zh: "制造业", en: "Manufacturing" },
                              retail: { zh: "零售", en: "Retail" },
                              healthcare: { zh: "医疗健康", en: "Healthcare" },
                              education: { zh: "教育", en: "Education" },
                              other: { zh: "其他", en: "Other" },
                            }
                            const label = industryLabels[industry]
                            if (label) {
                              return language === "zh-TW" ? label.zh : label.en
                            }
                            return industry
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 卡片2: 产品信息 */}
                  <ProductSelectorCard brandId={selectedBrand.id} />
                </div>

                {/* Products */}
                <ProductListCard products={products} brandId={selectedBrand.id} />

                {/* Competitors */}
                <CompetitorsCard competitors={competitors} brandId={selectedBrand.id} productId={selectedProductId} />
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="text-gray-500 text-center py-12">
                  {translate("Loading products...", language)}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
