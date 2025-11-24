"use client"

import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BrandBasicSchema, type BrandBasic } from "@/types/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/components/ui/form-message"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface BrandFormProps {
  defaultValues?: Partial<BrandBasic>
  onValuesChange?: (values: BrandBasic) => void
}

/**
 * 品牌信息表单组件
 * 
 * 字段：
 * - brandName（必填）
 * - productCategory（必填）
 * - specificProduct（选填）
 * - industry（选填）
 * - competitors（选填）
 */
export function BrandForm({ defaultValues, onValuesChange }: BrandFormProps) {

  const [competitorInput, setCompetitorInput] = useState("")
  const [competitors, setCompetitors] = useState<string[]>(defaultValues?.competitors || [])

  const {
    register,
    watch,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BrandBasic>({
    resolver: zodResolver(BrandBasicSchema),
    defaultValues: defaultValues || {
      brandName: "",
      productCategory: "",
      specificProduct: null,
      industry: null,
      competitors: [],
    },
    mode: "onChange",
  })

  // 使用 useRef 跟踪是否正在重置，避免在重置时触发 onValuesChange
  const isResettingRef = useRef(false)
  const prevDefaultValuesStrRef = useRef<string>("")
  
  // 只在 defaultValues 真正变化时重置表单（初次进入回填数据）
  useEffect(() => {
    if (!defaultValues) {
      // 如果没有默认值，确保表单为空
      reset({
        brandName: "",
        productCategory: "",
        specificProduct: null,
        industry: null,
        competitors: [],
      })
      setCompetitors([])
      return
    }
    
    const currentValuesStr = JSON.stringify(defaultValues)
    
    // 只在值真正变化时重置，避免无限循环
    if (prevDefaultValuesStrRef.current !== currentValuesStr) {
      isResettingRef.current = true
      reset(defaultValues, { keepDefaultValues: true })
      setCompetitors(defaultValues.competitors || [])
      prevDefaultValuesStrRef.current = currentValuesStr
      
      // 重置标志在下一个 tick 清除
      setTimeout(() => {
        isResettingRef.current = false
      }, 0)
    }
  }, [defaultValues, reset])

  // 添加竞品
  const handleAddCompetitor = () => {
    const trimmed = competitorInput.trim()
    if (!trimmed) return
    
    // 检查是否已存在
    if (competitors.includes(trimmed)) {
      setCompetitorInput("")
      return
    }
    
    const newCompetitors = [...competitors, trimmed]
    setCompetitors(newCompetitors)
    setValue("competitors", newCompetitors, { shouldValidate: true, shouldDirty: true })
    setCompetitorInput("")
  }

  // 删除竞品
  const handleRemoveCompetitor = (index: number) => {
    const newCompetitors = competitors.filter((_, i) => i !== index)
    setCompetitors(newCompetitors)
    setValue("competitors", newCompetitors, { shouldValidate: true, shouldDirty: true })
  }

  // 监听竞品变化，同步到表单
  useEffect(() => {
    if (!isResettingRef.current) {
      setValue("competitors", competitors, { shouldValidate: true, shouldDirty: true })
    }
  }, [competitors, setValue])

  // 监听表单值变化（使用防抖，避免频繁触发）
  const formValues = watch()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // 如果正在重置，不触发 onValuesChange
    if (isResettingRef.current || !onValuesChange) return
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // 防抖：延迟 100ms 后再调用 onValuesChange
    debounceTimerRef.current = setTimeout(() => {
      // 再次检查是否正在重置
      if (isResettingRef.current) return
      
      // 直接传递当前表单值，不依赖验证，以便按钮状态能正确更新
      const valuesToPass: BrandBasic = {
        brandName: formValues.brandName || "",
        productCategory: formValues.productCategory || "",
        specificProduct: formValues.specificProduct || null,
        industry: formValues.industry || null,
        competitors: formValues.competitors || [],
      }
      
      // 确保调用 onValuesChange，即使验证失败也要更新状态
      onValuesChange(valuesToPass)
    }, 100) // 减少防抖时间到 100ms，使响应更快
    
    // 清理定时器
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [formValues, onValuesChange])

  return (
    <div className="space-y-5">
      {/* First Card: Brand Name and Product Category */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {/* Row 1: Brand Name (Required) */}
          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-sm font-medium text-foreground">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brandName"
              placeholder="e.g., ximu, Inventec"
              {...register("brandName", {
                onChange: (e) => {
                  if (onValuesChange && !isResettingRef.current) {
                    const currentValues = getValues()
                    const valuesToPass: BrandBasic = {
                      brandName: e.target.value || "",
                      productCategory: currentValues.productCategory || "",
                      specificProduct: currentValues.specificProduct || null,
                      industry: currentValues.industry || null,
                      competitors: currentValues.competitors || [],
                    }
                    onValuesChange(valuesToPass)
                  }
                }
              })}
              className={errors.brandName ? "border-destructive" : ""}
              aria-invalid={!!errors.brandName}
              aria-describedby={errors.brandName ? "brandName-error" : undefined}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              The primary identifier used to recognize and track your brand.
            </p>
            <FormMessage message={errors.brandName?.message} variant="error" />
          </div>

          {/* Row 2: Product Category (Required) */}
          <div className="space-y-2">
            <Label htmlFor="productCategory" className="text-sm font-medium text-foreground">
              Product Category <span className="text-destructive">*</span>
            </Label>
            <Input
              id="productCategory"
              placeholder="e.g., Smartwatches, Electronics manufacturing"
              {...register("productCategory", {
                onChange: (e) => {
                  if (onValuesChange && !isResettingRef.current) {
                    const currentValues = getValues()
                    const valuesToPass: BrandBasic = {
                      brandName: currentValues.brandName || "",
                      productCategory: e.target.value || "",
                      specificProduct: currentValues.specificProduct || null,
                      industry: currentValues.industry || null,
                      competitors: currentValues.competitors || [],
                    }
                    onValuesChange(valuesToPass)
                  }
                }
              })}
              className={errors.productCategory ? "border-destructive" : ""}
              aria-invalid={!!errors.productCategory}
              aria-describedby={errors.productCategory ? "productCategory-error" : undefined}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              The core product line or business area you want to track.
            </p>
            <FormMessage message={errors.productCategory?.message} variant="error" />
          </div>
          </div>
        </div>

      {/* Second Card: Product Name, Industry, and Competitor Brands */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {/* Row 3: Product Name (Optional) */}
        <div className="space-y-2">
            <Label htmlFor="specificProduct" className="text-sm font-medium text-foreground">
              Product Name
          </Label>
          <Input
              id="specificProduct"
              placeholder="e.g., Apple Watch Series 9"
              {...register("specificProduct", {
                onChange: (e) => {
                  if (onValuesChange && !isResettingRef.current) {
                    const currentValues = getValues()
                    const valuesToPass: BrandBasic = {
                      brandName: currentValues.brandName || "",
                      productCategory: currentValues.productCategory || "",
                      specificProduct: e.target.value || null,
                      industry: currentValues.industry || null,
                      competitors: currentValues.competitors || [],
                    }
                    onValuesChange(valuesToPass)
                  }
                }
              })}
          />
            <p className="text-xs text-muted-foreground leading-relaxed">
              A specific product or model for more detailed tracking. If left blank, we'll use the Product Category above.
          </p>
        </div>

          {/* Row 4: Industry (Optional) */}
        <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-medium text-foreground">
              Industry
            </Label>
            <Input
              id="industry"
              placeholder="e.g., Electronics Manufacturing, Commercial Banking"
              {...register("industry", {
                onChange: (e) => {
                  if (onValuesChange && !isResettingRef.current) {
                    const currentValues = getValues()
                    const valuesToPass: BrandBasic = {
                      brandName: currentValues.brandName || "",
                      productCategory: currentValues.productCategory || "",
                      specificProduct: currentValues.specificProduct || null,
                      industry: e.target.value || null,
                      competitors: currentValues.competitors || [],
                    }
                    onValuesChange(valuesToPass)
                  }
                }
              })}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your primary industry for contextual analysis.
            </p>
          </div>

          {/* Row 5: Competitor Brands (Optional) */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="competitors" className="text-sm font-medium text-foreground">
                Competitor Brands
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add specific competitors for targeted competitive insights. We'll also recommend competitors based on your brand information.
            </p>
          </div>
          <div className="space-y-3">
            {/* Input for adding competitors */}
            <div className="flex gap-2">
              <Input
                id="competitor-input"
                  placeholder="e.g., Samsung, Garmin"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCompetitor()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCompetitor}
                disabled={!competitorInput.trim()}
                className="flex-shrink-0"
                title="Add competitor"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

              {/* Table of added competitors */}
            {competitors.length > 0 ? (
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200">
                          Competitor Brands
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                  {competitors.map((competitor, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {competitor}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                        type="button"
                              variant="ghost"
                              size="icon"
                        onClick={() => handleRemoveCompetitor(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        aria-label={`Remove ${competitor}`}
                      >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                  ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

