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
import { Textarea } from "@/components/ui/textarea"
import { FormMessage } from "@/components/ui/form-message"

const personaSchema = z.object({
  name: z.string().min(1, "角色名称为必填"),
  region: z.string().min(1, "角色地区为必填"),
  description: z.string().optional(),
})

type PersonaForm = z.infer<typeof personaSchema>

interface PersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (persona: { id: string; name: string; region: string; description?: string }) => void
}

/**
 * 添加角色弹窗
 * 
 * 字段：name（必填）、region（必填）、description（可选）
 * 行为：校验通过后生成唯一 id，插入表格首行，关闭弹窗并清空表单
 */
export function PersonaDialog({ open, onOpenChange, onConfirm }: PersonaDialogProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<PersonaForm>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      name: "",
      region: "",
      description: "",
    },
  })

  // Dialog 打开时聚焦第一个输入框
  useEffect(() => {
    if (open && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const onSubmit = (data: PersonaForm) => {
    const persona = {
      id: nanoid(),
      name: data.name,
      region: data.region,
      description: data.description,
    }
    onConfirm(persona)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加角色</DialogTitle>
          <DialogDescription>
            添加一个目标用户角色，帮助我们更好地理解你的目标受众
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">
              角色名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="persona-name"
              placeholder="例如：企业决策者"
              {...register("name")}
              ref={nameInputRef}
              className={errors.name ? "border-destructive" : ""}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "persona-name-error" : undefined}
            />
            <FormMessage message={errors.name?.message} variant="error" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-region">
              角色地区 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="persona-region"
              placeholder="例如：北美、欧洲、亚洲"
              {...register("region")}
              className={errors.region ? "border-destructive" : ""}
              aria-invalid={!!errors.region}
              aria-describedby={errors.region ? "persona-region-error" : undefined}
            />
            <FormMessage message={errors.region?.message} variant="error" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-description">角色描述（可选）</Label>
            <Textarea
              id="persona-description"
              placeholder="描述这个角色的特征..."
              rows={3}
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">添加新角色</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

