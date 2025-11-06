"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { nanoid } from "nanoid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/components/ui/form-message"

const competitorSchema = z.object({
  brandName: z.string().min(1, "竞争对手品牌名称为必填"),
  productName: z.string().min(1, "竞争对手产品名称为必填"),
})

type CompetitorForm = z.infer<typeof competitorSchema>

interface CompetitorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (competitor: { id: string; brandName: string; productName: string }) => void
}

/**
 * 添加竞争对手弹窗
 * 
 * 字段：brandName（必填）、productName（必填）
 * 行为：校验通过后生成唯一 id，插入表格首行，关闭弹窗并清空表单
 */
export function CompetitorDialog({ open, onOpenChange, onConfirm }: CompetitorDialogProps) {
  const brandNameInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompetitorForm>({
    resolver: zodResolver(competitorSchema),
    defaultValues: {
      brandName: "",
      productName: "",
    },
  })

  // Dialog 打开时聚焦第一个输入框
  useEffect(() => {
    if (open && brandNameInputRef.current) {
      setTimeout(() => {
        brandNameInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const onSubmit = (data: CompetitorForm) => {
    const competitor = {
      id: nanoid(),
      brandName: data.brandName,
      productName: data.productName,
    }
    onConfirm(competitor)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加竞争对手</DialogTitle>
          <DialogDescription>
            添加一个竞争对手，帮助我们进行竞品分析
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitor-brand-name">
              竞争对手品牌名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="competitor-brand-name"
              placeholder="例如：Competitor Inc."
              {...register("brandName")}
              ref={brandNameInputRef}
              className={errors.brandName ? "border-destructive" : ""}
              aria-invalid={!!errors.brandName}
              aria-describedby={errors.brandName ? "competitor-brand-name-error" : undefined}
            />
            <FormMessage message={errors.brandName?.message} variant="error" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitor-product-name">
              竞争对手产品名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="competitor-product-name"
              placeholder="例如：Competitor Product"
              {...register("productName")}
              className={errors.productName ? "border-destructive" : ""}
              aria-invalid={!!errors.productName}
              aria-describedby={errors.productName ? "competitor-product-name-error" : undefined}
            />
            <FormMessage message={errors.productName?.message} variant="error" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">添加新竞争对手</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

