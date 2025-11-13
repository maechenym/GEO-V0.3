"use client"

import { useState } from "react"
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
  } = useBrandStore()
  const { setProfile } = useAuthStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)

  // 处理表单值变化
  const handleFormChange = (values: BrandBasic) => {
    setBasic(values)
  }

  // 加入等待列表
  const handleJoinWaitlist = async () => {
    // 验证必填字段
    if (!basic?.brandName || !basic?.productName) {
      toast({
        title: "Please fill in required fields",
        description: "Brand name and product name are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // 先更新本地状态，标记为已完成 onboarding
    setCompleted(true)
    const currentProfile = useAuthStore.getState().profile
    if (currentProfile) {
      setProfile({
        ...currentProfile,
        hasBrand: true,
      })
    }

    // 尝试调用 API 加入等待列表（即使失败也显示对话框）
    try {
      await apiClient.post("/api/onboarding/waitlist", {
        brandName: basic.brandName,
        productName: basic.productName,
      })
    } catch (error) {
      // API 调用失败时记录错误，但不阻止用户继续流程
      console.error("Failed to join waitlist (API error):", error)
      // 不显示错误 toast，直接显示对话框
    }

    // 无论 API 调用成功与否，都显示欢迎对话框
    setShowWelcomeDialog(true)
    setIsSubmitting(false)
  }

  // 处理对话框确认，跳转到 waitlist
  const handleGotIt = () => {
    setShowWelcomeDialog(false)
    router.push("/onboarding/waitlist")
  }

  // 处理对话框关闭（无论是点击按钮还是点击外部区域）
  const handleDialogChange = (open: boolean) => {
    if (!open && showWelcomeDialog) {
      // 对话框被关闭，跳转到 waitlist
      router.push("/onboarding/waitlist")
    }
    setShowWelcomeDialog(open)
  }

  return (
    <>
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
          <div className="flex items-center justify-end pt-6 border-t border-border">
            <Button
              type="button"
              onClick={handleJoinWaitlist}
              disabled={isSubmitting || !basic?.brandName || !basic?.productName}
              className="bg-[#13458c] hover:bg-[#13458c]/90 text-white px-8"
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
                onClick={handleGotIt}
                className="bg-[#13458c] hover:bg-[#13458c]/90 text-white px-8"
              >
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
