"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const competitorSchema = z.object({
  brandName: z.string().min(1, "品牌名称是必填项"),
  productName: z.string().min(1, "产品名称是必填项"),
})

type CompetitorForm = z.infer<typeof competitorSchema>

interface CompetitorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: CompetitorForm) => void
}

/**
 * 添加 Competitor 弹窗
 * 必填：品牌名称、产品名称
 */
export function CompetitorDialog({ open, onOpenChange, onConfirm }: CompetitorDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompetitorForm>({
    resolver: zodResolver(competitorSchema),
  })

  const onSubmit = (data: CompetitorForm) => {
    onConfirm(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加竞争对手</DialogTitle>
          <DialogDescription>
            添加一个竞争对手，帮助我们进行竞品分析
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitor-brand-name">
              品牌名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="competitor-brand-name"
              placeholder="例如：Competitor Inc."
              {...register("brandName")}
              className={errors.brandName ? "border-destructive" : ""}
            />
            {errors.brandName && (
              <p className="text-sm text-destructive">{errors.brandName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="competitor-product-name">
              产品名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="competitor-product-name"
              placeholder="例如：Competitor Product"
              {...register("productName")}
              className={errors.productName ? "border-destructive" : ""}
            />
            {errors.productName && (
              <p className="text-sm text-destructive">{errors.productName.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">确认</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

