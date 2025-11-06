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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormMessage } from "@/components/ui/form-message"
import type { PromptItem } from "@/types/prompt"

const promptSchema = z.object({
  text: z.string().min(1, "提示词内容为必填"),
  country: z.string().min(1, "提示词国家为必选"),
})

type PromptForm = z.infer<typeof promptSchema>

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt?: PromptItem | null
  onConfirm: (prompt: PromptItem) => void
}

/**
 * 添加/编辑提示词弹窗
 * 
 * 字段：text（必填，Textarea）、country（必填，Select）
 * 行为：新增时生成 id，编辑时更新现有项
 */
export function PromptDialog({ open, onOpenChange, prompt, onConfirm }: PromptDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isEditMode = !!prompt

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PromptForm>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      text: prompt?.text || "",
      country: prompt?.country || undefined,
    },
  })

  const countryValue = watch("country")

  // Dialog 打开时聚焦第一个输入框
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [open])

  // 当 prompt 变化时，更新表单
  useEffect(() => {
    if (open) {
      reset({
        text: prompt?.text || "",
        country: prompt?.country || undefined,
      })
    }
  }, [prompt, open, reset])

  const onSubmit = (data: PromptForm) => {
    const promptData: PromptItem = {
      id: prompt?.id || nanoid(),
      text: data.text,
      country: data.country,
    }
    onConfirm(promptData)
    reset()
    onOpenChange(false)
  }

  // 国家选项
  const countries = [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "JP", label: "Japan" },
    { value: "CN", label: "China" },
    { value: "TW", label: "Taiwan" },
    { value: "HK", label: "Hong Kong" },
    { value: "SG", label: "Singapore" },
    { value: "AU", label: "Australia" },
    { value: "IN", label: "India" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "编辑提示词" : "添加提示词"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "编辑提示词内容和国家设置"
              : "添加一个新的提示词，用于生成搜索结果"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-text">
              提示词文本 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt-text"
              placeholder="输入提示词内容..."
              rows={6}
              {...register("text")}
              ref={textareaRef}
              className={errors.text ? "border-destructive" : ""}
              aria-invalid={!!errors.text}
              aria-describedby={errors.text ? "prompt-text-error" : undefined}
            />
            <FormMessage message={errors.text?.message} variant="error" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-country">
              国家 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={countryValue}
              onValueChange={(value) => setValue("country", value as PromptForm["country"])}
            >
              <SelectTrigger
                id="prompt-country"
                className={errors.country ? "border-destructive" : ""}
                aria-invalid={!!errors.country}
                aria-describedby={errors.country ? "prompt-country-error" : undefined}
              >
                <SelectValue placeholder="选择国家" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage message={errors.country?.message} variant="error" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{isEditMode ? "保存" : "添加新提示词"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

