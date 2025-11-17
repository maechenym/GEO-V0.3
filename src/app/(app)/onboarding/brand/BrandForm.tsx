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
 * - productName（必填）
 */
export function BrandForm({ defaultValues, onValuesChange }: BrandFormProps) {

  const [competitorInput, setCompetitorInput] = useState("")
  const [competitors, setCompetitors] = useState<string[]>(defaultValues?.competitors || [])

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BrandBasic>({
    resolver: zodResolver(BrandBasicSchema),
    defaultValues: defaultValues || {
      brandName: "",
      productName: "",
      category: null,
      competitors: [],
    },
    mode: "onChange",
  })

  // 使用 useRef 跟踪是否正在重置，避免在重置时触发 onValuesChange
  const isResettingRef = useRef(false)
  const prevDefaultValuesStrRef = useRef<string>("")
  
  // 只在 defaultValues 真正变化时重置表单（初次进入回填数据）
  useEffect(() => {
    if (!defaultValues) return
    
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
    
    // 防抖：延迟 300ms 后再调用 onValuesChange
    debounceTimerRef.current = setTimeout(() => {
      // 再次检查是否正在重置
      if (isResettingRef.current) return
      
      const validated = BrandBasicSchema.safeParse(formValues)
      if (validated.success) {
        onValuesChange(validated.data)
      }
    }, 300)
    
    // 清理定时器
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [formValues, onValuesChange])

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="space-y-6">
        {/* Brand Name 和 Product Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandName">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brandName"
              placeholder="Enter brand name"
              {...register("brandName")}
              className={errors.brandName ? "border-destructive" : ""}
              aria-invalid={!!errors.brandName}
              aria-describedby={errors.brandName ? "brandName-error" : undefined}
            />
            <FormMessage message={errors.brandName?.message} variant="error" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="productName"
              placeholder="Enter product name"
              {...register("productName")}
              className={errors.productName ? "border-destructive" : ""}
              aria-invalid={!!errors.productName}
              aria-describedby={errors.productName ? "productName-error" : undefined}
            />
            <FormMessage message={errors.productName?.message} variant="error" />
          </div>
        </div>

        {/* Product Category (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Product Category <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <Input
            id="category"
            placeholder="Enter product category (e.g., Software, Hardware, Service)"
            {...register("category")}
          />
        </div>

        {/* Competitor Brands (Optional) */}
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="competitors">
              Competitor Brands <span className="text-muted-foreground text-xs">(Optional - Add multiple)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Add one or more competitor brands to track. Press Enter or click the + button to add each competitor.
            </p>
          </div>
          <div className="space-y-3">
            {/* Input for adding competitors */}
            <div className="flex gap-2">
              <Input
                id="competitor-input"
                placeholder="Enter competitor brand name, then press Enter or click +"
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

            {/* List of added competitors */}
            {competitors.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {competitors.length} competitor{competitors.length > 1 ? "s" : ""} added:
                </p>
                <div className="flex flex-wrap gap-2">
                  {competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 bg-ink-50 border border-ink-200 rounded-md text-sm"
                    >
                      <span className="text-ink-900">{competitor}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(index)}
                        className="text-ink-400 hover:text-ink-600 transition-colors"
                        aria-label={`Remove ${competitor}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No competitors added yet. Add your first competitor above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

