"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { BrandBasic } from "@/types/brand"
import { useBrandStore } from "@/store/brand.store"
import { BrandForm } from "./BrandForm"
import { Button } from "@/components/ui/button"
import { ArrowRight, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * 新手引导 Step1 - 品牌信息录入页
 * 
 * 路径：/onboarding/brand
 * 目的：手动录入品牌信息；点击 Next → /onboarding/prompt
 * 
 * 布局：
 * - 左侧：步骤指示器（Brand → Prompt → Plan）
 * - 右侧：表单区 + 底部操作区
 */
export default function BrandOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    basic,
    setBasic,
    setCompleted,
  } = useBrandStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 处理表单值变化
  const handleFormChange = (values: BrandBasic) => {
    setBasic(values)
  }

  // 保存草稿
  const handleSaveDraft = () => {
    // 表单数据已经通过 handleFormChange 实时保存到 store
    toast({
      title: "草稿已保存",
      description: "您的品牌信息已保存为草稿",
    })
  }

  // 提交并跳转到下一步
  const handleNext = () => {
    // 验证必填字段
    if (!basic?.brandName || !basic?.productName) {
      toast({
        title: "请填写必填字段",
        description: "品牌名称和产品名称为必填项",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // 标记为已完成
    setCompleted(true)

    // 跳转到下一步
    router.push("/onboarding/prompt")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="space-y-8">
        {/* 头部文案 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            Let's build your brand together!
          </h1>
          <p className="text-lg text-muted-foreground">
            Define your brand and audience to start your AI journey.
          </p>
        </div>

        {/* 品牌基本信息表单 */}
        <BrandForm
          defaultValues={basic || undefined}
          onValuesChange={handleFormChange}
        />

        {/* 底部操作区 */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || !basic?.brandName || !basic?.productName}
            className="bg-[#0000D2] hover:bg-[#0000D2]/90 text-white px-8"
          >
            {isSubmitting ? (
              "提交中..."
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
