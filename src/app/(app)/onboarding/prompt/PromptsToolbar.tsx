"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PromptsToolbarProps {
  onAdd: () => void
}

/**
 * 提示词工具栏组件
 * 
 * 包含：标题、副标题、添加按钮
 */
export function PromptsToolbar({ onAdd }: PromptsToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-3 text-foreground">
          Suggested prompts for your brand
        </h1>
        <p className="text-lg text-muted-foreground">
          You can edit them now or manage them later inside the product.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add Prompt
      </Button>
    </div>
  )
}

