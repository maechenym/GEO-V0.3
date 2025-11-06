"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBrandStore } from "@/store/brand.store"
import { usePromptStore } from "@/store/prompt.store"
import { PromptsToolbar } from "./PromptsToolbar"
import { PromptsTable } from "./PromptsTable"
import { PromptDialog } from "./PromptDialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import apiClient from "@/services/api"
import type { PromptItem, PromptSuggestRequest } from "@/types/prompt"
import { PromptSuggestResponseSchema } from "@/types/prompt"
import { Loader2 } from "lucide-react"

/**
 * Onboarding Step 2: Prompt
 * 
 * 路径：/onboarding/prompt
 * 目的：展示根据 Step1 生成的提示词；支持查看、编辑、新增、删除；点击 CTA 进入 /onboarding/plan
 */
export default function PromptOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { basic, completed } = useBrandStore()
  const { list: prompts, setList, addPrompt, updatePrompt, removePrompt } = usePromptStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedPrompts, setHasLoadedPrompts] = useState(false)

  // 检查是否完成了 brand 步骤
  const isBrandIncomplete = !completed || !basic?.brandName || !basic?.productName

  // 页面加载时请求生成 prompts
  useEffect(() => {
    // 如果已有 prompts，跳过自动加载
    if (prompts.length > 0) {
      setHasLoadedPrompts(true)
      return
    }

    // 若 list 为空且品牌 basic 存在 → 调 suggest 并 setList
    if (!basic || (!basic.brandName && !basic.productName)) {
      setHasLoadedPrompts(true)
      return
    }

    // 如果已经加载过，不再重复加载
    if (hasLoadedPrompts) return

    setIsLoading(true)
    const requestData: PromptSuggestRequest = {
      brandName: basic.brandName,
      productName: basic.productName,
      brandDescription: basic.brandDescription,
    }

    apiClient
      .post("/onboarding/prompt/suggest", requestData)
      .then((response) => {
        const result = PromptSuggestResponseSchema.parse(response.data)
        if (result.prompts && result.prompts.length > 0) {
          // 只在本地列表为空时才设置
          if (prompts.length === 0) {
            setList(result.prompts)
          }
        }
        setHasLoadedPrompts(true)
      })
      .catch((error) => {
        console.error("Failed to load prompts:", error)
        toast({
          title: "加载失败",
          description: "无法自动生成提示词，您可以手动添加",
          variant: "destructive",
        })
        // 失败不影响继续使用页面
        setHasLoadedPrompts(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [basic, prompts.length, hasLoadedPrompts, setList, toast])

  // 添加提示词
  const handleAdd = () => {
    setEditingPrompt(null)
    setDialogOpen(true)
  }

  // 编辑提示词
  const handleEdit = (prompt: PromptItem) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  // 保存提示词（新增或更新）
  const handleConfirm = async (prompt: PromptItem) => {
    if (editingPrompt) {
      // 更新现有提示词（先调 API 再更新 store）
      try {
        const response = await apiClient.patch(`/prompts/${editingPrompt.id}`, {
          text: prompt.text,
          country: prompt.country,
        })
        updatePrompt(editingPrompt.id, prompt)
        toast({
          title: "Prompt updated",
          description: "提示词已更新",
        })
      } catch (error) {
        // API 失败时仍更新本地 store
        updatePrompt(editingPrompt.id, prompt)
        toast({
          title: "提示词已更新（本地）",
          description: "网络请求失败，已保存到本地",
          variant: "default",
        })
      }
    } else {
      // 添加新提示词（先调 API 再更新 store）
      try {
        const response = await apiClient.post("/prompts", {
          text: prompt.text,
          country: prompt.country,
        })
        // API 返回的 prompt 可能有不同的 id，使用本地生成的 id
        addPrompt(prompt)
        toast({
          title: "Prompt added",
          description: "提示词已添加",
        })
      } catch (error) {
        // API 失败时仍添加到本地 store
        addPrompt(prompt)
        toast({
          title: "提示词已添加（本地）",
          description: "网络请求失败，已保存到本地",
          variant: "default",
        })
      }
    }
    setDialogOpen(false)
    setEditingPrompt(null)
  }

  // 删除提示词
  const handleRemove = async (id: string) => {
    try {
      await apiClient.delete(`/prompts/${id}`)
      removePrompt(id)
      toast({
        title: "Prompt removed",
        description: "提示词已删除",
      })
    } catch (error) {
      // API 失败时仍删除本地 store
      removePrompt(id)
      toast({
        title: "提示词已删除（本地）",
        description: "网络请求失败，已从本地删除",
        variant: "default",
      })
    }
  }

  // 跳转到下一步
  const handleNext = () => {
    router.push("/onboarding/plan")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      {isBrandIncomplete && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>请先完成品牌信息录入</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>您需要先完成品牌信息录入才能继续下一步。</span>
            <Button asChild variant="outline" size="sm" className="ml-4">
              <Link href="/onboarding/brand">前往品牌信息页</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* 顶部工具栏 */}
        <PromptsToolbar onAdd={handleAdd} />

        {/* 提示词表格 */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">加载提示词中...</span>
          </div>
        ) : (
          <PromptsTable prompts={prompts} onEdit={handleEdit} onRemove={handleRemove} />
        )}

        {/* 底部操作区 */}
        <div className="flex items-center justify-end pt-6 border-t border-border">
          <Button
            type="button"
            onClick={handleNext}
            className="bg-[#0000D2] hover:bg-[#0000D2]/90 text-white px-8"
          >
            Win your edge in AI search
          </Button>
        </div>
      </div>

      {/* 添加/编辑提示词弹窗 */}
      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editingPrompt}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
