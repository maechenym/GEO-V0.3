"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlanCard } from "./PlanCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth.store"

/**
 * Onboarding Step 2: Plan
 * 
 * 路径：/onboarding/plan
 * 目的：选择计划并加入等待列表
 */
export default function PlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setProfile } = useAuthStore()
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 处理加入等待列表
  const handleJoinWaitlist = async () => {
    if (!name.trim()) {
      toast({
        title: "请输入姓名",
        description: "姓名为必填项",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 更新用户资料，标记为已完成 onboarding
      const currentProfile = useAuthStore.getState().profile
      if (currentProfile) {
        setProfile({
          ...currentProfile,
          hasBrand: true,
        })
      }

      toast({
        title: "已加入等待列表",
        description: `感谢 ${name}，我们会在产品上线时通知您！`,
      })

      // 跳转到 overview
      router.push("/overview")
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="space-y-8">
        {/* 顶部标题 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            开始您的 7 天免费试用
          </h1>
          <p className="text-lg text-muted-foreground">
            选择适合您的计划
          </p>
        </div>

        {/* 内容网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：试用清单 */}
          <div>
            <PlanCard />
          </div>

          {/* 右侧：等待列表表单 */}
          <div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">加入等待列表</h2>
              
              <div className="space-y-6">
                {/* 姓名输入 */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    姓名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                    disabled={isLoading}
                  />
                </div>

                {/* 提交按钮 */}
                <Button
                  type="button"
                  onClick={handleJoinWaitlist}
                  className="w-full bg-[#0000D2] hover:bg-[#0000D2]/90 text-white"
                  size="lg"
                  disabled={isLoading || !name.trim()}
                >
                  {isLoading ? "处理中..." : "加入等待列表"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 页脚合规文案 */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground">
            Data secured by GEO
          </p>
        </div>
      </div>
    </div>
  )
}

