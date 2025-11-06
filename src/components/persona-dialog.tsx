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
import { Textarea } from "@/components/ui/textarea"

const personaSchema = z.object({
  name: z.string().min(1, "名称是必填项"),
  region: z.string().min(1, "地区是必填项"),
  description: z.string().optional(),
})

type PersonaForm = z.infer<typeof personaSchema>

interface PersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: PersonaForm) => void
}

/**
 * 添加 Persona 弹窗
 * 必填：名称、地区
 * 可选：描述
 */
export function PersonaDialog({ open, onOpenChange, onConfirm }: PersonaDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonaForm>({
    resolver: zodResolver(personaSchema),
  })

  const onSubmit = (data: PersonaForm) => {
    onConfirm(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加角色</DialogTitle>
          <DialogDescription>
            添加一个用户角色，帮助我们更好地理解你的目标受众
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">
              名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="persona-name"
              placeholder="例如：企业决策者"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-region">
              地区 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="persona-region"
              placeholder="例如：北美、欧洲、亚洲"
              {...register("region")}
              className={errors.region ? "border-destructive" : ""}
            />
            {errors.region && (
              <p className="text-sm text-destructive">{errors.region.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-description">描述（可选）</Label>
            <Textarea
              id="persona-description"
              placeholder="描述这个角色的特征..."
              {...register("description")}
            />
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

