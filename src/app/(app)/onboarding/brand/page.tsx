"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { BrandBasic } from "@/types/brand"
import { useBrandStore } from "@/store/brand.store"
import { useAuthStore } from "@/store/auth.store"
import { BrandForm } from "./BrandForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/services/api"

/**
 * 新手引导 - 品牌信息录入页
 * 
 * 路径：/onboarding/brand
 * 目的：手动录入品牌信息；点击 "Join Waitlist" → 显示欢迎对话框 → 跳转到 /overview
 */
export default function BrandOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    basic,
    setBasic,
    setCompleted,
    completed,
    reset,
  } = useBrandStore()
  const { setProfile } = useAuthStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)

  // 进入页面时，清空所有缓存数据，确保表单是空的
  useEffect(() => {
    // 无论之前是否有数据，都清空，让用户重新填写
    reset()
  }, [reset]) // 只在组件挂载时执行一次

  // 处理表单值变化
  const handleFormChange = (values: BrandBasic) => {
    console.log("[Onboarding] Form values changed:", values)
    setBasic(values)
  }
  
  // 调试：检查 basic 状态
  useEffect(() => {
    console.log("[Onboarding] Current basic state:", basic)
    console.log("[Onboarding] Brand Name:", basic?.brandName, "Product Category:", basic?.productCategory)
    console.log("[Onboarding] Button should be enabled:", !!(basic?.brandName?.trim() && basic?.productCategory?.trim()))
  }, [basic])

  // 加入等待列表
  const handleJoinWaitlist = async () => {
    // 验证必填字段
    if (!basic?.brandName || !basic?.productCategory) {
      const missingFields: string[] = []
      if (!basic?.brandName) {
        missingFields.push("Brand Name")
      }
      if (!basic?.productCategory) {
        missingFields.push("Product Category")
      }
      
      toast({
        title: "Required fields are missing",
        description: `${missingFields.join(" and ")} ${missingFields.length === 1 ? "is" : "are"} required. Please fill in ${missingFields.length === 1 ? "this field" : "these fields"} to continue.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // 尝试调用 API 加入等待列表（即使失败也显示对话框）
    try {
      await apiClient.post("/api/onboarding/waitlist", {
        brandName: basic.brandName,
        productCategory: basic.productCategory,
        specificProduct: basic.specificProduct || null,
        industry: basic.industry || null,
        competitors: basic.competitors || [],
      })
      
      // API 调用成功后，重新加载用户 profile，让后端判断账号状态
      // 后端会根据数据是否分析好来设置 hasBrand 状态
      const { loadProfile } = useAuthStore.getState()
      await loadProfile()
    } catch (error) {
      // API 调用失败时记录错误，但不阻止用户继续流程
      console.error("Failed to join waitlist (API error):", error)
      // 不显示错误 toast，直接显示对话框
    }

    // 标记为已完成 onboarding（仅用于本地状态，不影响 hasBrand）
    setCompleted(true)

    // 无论 API 调用成功与否，都显示欢迎对话框
    setShowWelcomeDialog(true)
    setIsSubmitting(false)
  }

  // 处理对话框确认，跳转到官网首页
  const handleConfirm = () => {
    setShowWelcomeDialog(false)
    // 跳转到官网首页
    window.location.href = "/"
  }

  // 处理对话框关闭（无论是点击按钮还是点击外部区域）
  const handleDialogChange = (open: boolean) => {
    if (!open && showWelcomeDialog) {
      // 对话框被关闭，跳转到官网首页
      window.location.href = "/"
    }
    setShowWelcomeDialog(open)
  }

  return (
    <>
      <div className="container mx-auto px-6 pt-8 pb-12 max-w-5xl">
        <div className="space-y-6">
          {/* 头部文案 */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2 text-foreground">
              Brand Information
            </h1>
            <p className="text-sm text-muted-foreground">
              Provide your brand details to generate accurate AI brand influence insights.
            </p>
          </div>

          {/* Tips 提醒 */}
          <div className="rounded-lg border border-brand-200 bg-brand-50/30 p-3 mb-4">
            <p className="text-sm text-foreground font-medium">
              <span className="font-semibold text-brand-700">💡 Tips:</span> You can fill in the information in any language.
            </p>
          </div>

          {/* 品牌基本信息表单 */}
          {/* 不传递 defaultValues，确保表单始终为空 */}
          <BrandForm
            defaultValues={undefined}
            onValuesChange={handleFormChange}
          />

          {/* 底部操作区 */}
          <div className="flex items-center justify-end pt-8 border-t border-border">
            <Button
              type="button"
              onClick={handleJoinWaitlist}
              disabled={isSubmitting || !basic?.brandName?.trim() || !basic?.productCategory?.trim()}
              size="lg"
              className={`px-8 ${
                isSubmitting || !basic?.brandName?.trim() || !basic?.productCategory?.trim()
                  ? "bg-[#13458c]/50 text-white/70 cursor-not-allowed hover:bg-[#13458c]/50"
                  : "bg-[#13458c] hover:bg-[#13458c]/90 text-white"
              }`}
            >
              {isSubmitting ? "Processing..." : "Join Waitlist"}
            </Button>
          </div>
        </div>
      </div>

      {/* 欢迎对话框 */}
      <Dialog open={showWelcomeDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <div className="space-y-6 py-6">
            <div className="space-y-4 text-center">
              <p className="text-base text-foreground leading-relaxed">
                Welcome! Seize the opportunity to be at the forefront of AI search. You've been added to our waiting list, and we'll notify you by email once access is available.
              </p>
              <p className="text-base text-foreground font-semibold leading-relaxed">
                Be the first to experience the future of AI-powered search!
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleConfirm}
                className="bg-[#13458c] hover:bg-[#13458c]/90 text-white px-8"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
