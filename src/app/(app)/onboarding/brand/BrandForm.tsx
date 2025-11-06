"use client"

import React, { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BrandBasicSchema, type BrandBasic } from "@/types/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormMessage } from "@/components/ui/form-message"

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
 * - brandDescription（可选）
 */
export function BrandForm({ defaultValues, onValuesChange }: BrandFormProps) {

  const {
    register,
    watch,
    formState: { errors },
    reset,
  } = useForm<BrandBasic>({
    resolver: zodResolver(BrandBasicSchema),
    defaultValues: defaultValues || {
      brandName: "",
      productName: "",
      brandDescription: "",
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
      prevDefaultValuesStrRef.current = currentValuesStr
      
      // 重置标志在下一个 tick 清除
      setTimeout(() => {
        isResettingRef.current = false
      }, 0)
    }
  }, [defaultValues, reset])

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
      <div className="space-y-4">
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

        {/* Brand Description */}
        <div className="space-y-2">
          <Label htmlFor="brandDescription">Brand Description (Optional)</Label>
            <Textarea
              id="brandDescription"
              placeholder="Describe your brand..."
              rows={4}
              {...register("brandDescription")}
            />
          </div>
      </div>
    </div>
  )
}

