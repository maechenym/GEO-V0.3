"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useBrandStore } from "@/store/brand.store"
import { useAuthStore } from "@/store/auth.store"
import { BrandBadge } from "./BrandBadge"
import { DataSources } from "./DataSources"
import { ProgressPanel } from "./ProgressPanel"
import { FooterTrust } from "./FooterTrust"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

/**
 * AI 搜索分析生成页
 * 
 * 路径：/onboarding/ai-analysis
 * 目的：展示品牌 AI 搜索分析生成过程；用户无需操作，等待完成后进入 /overview
 */
export default function AIAnalysisPage() {
  const router = useRouter()
  const { basic } = useBrandStore()
  const { profile } = useAuthStore()
  const [isComplete, setIsComplete] = useState(false)

  // 生成 brandId（优先使用 user.id，否则使用 brandName 生成）
  const brandId = useMemo(() => {
    if (profile?.id) {
      return profile.id
    }
    // 如果没有 user.id，基于 brandName 生成一个 ID
    if (basic?.brandName) {
      return `brand_${basic.brandName.toLowerCase().replace(/\s+/g, "_")}`
    }
    return "default_brand"
  }, [profile?.id, basic?.brandName])

  // 处理完成回调
  const handleComplete = () => {
    setIsComplete(true)
  }

  // 跳转到概览页
  // 注意：这里应该更新用户的 hasBrand 状态，表示已完成 onboarding
  const handleStart = async () => {
    const { setProfile, loadProfile, profile: currentProfile } = useAuthStore.getState()
    
    try {
      // 先强制更新本地状态为 hasBrand = true
      // 这样可以避免 AuthGuard 在跳转时重定向回 onboarding
      if (currentProfile) {
        setProfile({
          ...currentProfile,
          hasBrand: true,
        })
      }
      
      // 然后尝试重新加载用户资料（后端可能已经更新）
      try {
        const updatedProfile = await loadProfile()
        if (updatedProfile && updatedProfile.hasBrand) {
          // 如果后端已更新，使用后端数据
          setProfile(updatedProfile)
        } else if (updatedProfile) {
          // 如果后端没有更新，保持本地 hasBrand = true
          setProfile({
            ...updatedProfile,
            hasBrand: true,
          })
        }
      } catch (error) {
        // 如果加载失败，保持本地状态
        console.warn("Failed to reload profile, using local state:", error)
      }
    } catch (error) {
      // 即使更新失败也继续跳转
      console.error("Failed to update profile:", error)
    }
    
    // 使用 replace 而不是 push，避免用户点击返回按钮回到 onboarding
    router.replace("/overview")
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="space-y-8">
        {/* 品牌展示区 */}
        <BrandBadge />

        {/* 数据来源说明区 */}
        <DataSources />

        {/* 分析进度动画区 */}
        <ProgressPanel brandId={brandId} onComplete={handleComplete} />

        {/* CTA 按钮区（完成态时显示） */}
        {isComplete && (
          <div className="flex justify-center animate-in fade-in duration-500">
            <Button
              type="button"
              onClick={handleStart}
              size="lg"
              className="bg-[#0000D2] hover:bg-[#0000D2]/90 text-white px-8 py-6 text-base"
            >
              Start winning in AI Search <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* 页脚信任区 */}
        <FooterTrust />
      </div>
    </div>
  )
}

