"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import apiClient from "@/services/api"
import { MagicLinkVerifyResponseSchema } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { FormMessage } from "@/components/ui/form-message"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken, loadProfile, setIsNew } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setError("缺少验证令牌")
      setIsLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient.get(`/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`)
        const result = MagicLinkVerifyResponseSchema.parse(response.data)

        if (result.ok) {
          await loginWithToken(result.token)
          setIsNew(result.isNew)
          const profile = await loadProfile()

          // 根据 isNew 和 hasBrand 决定跳转
          if (result.isNew || !profile.hasBrand) {
            router.push("/onboarding/brand")
          } else {
            router.push("/overview")
          }
        }
      } catch (error: unknown) {
        const message = error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "验证失败，请重试"
        setError(message)
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [searchParams, router, loginWithToken, loadProfile, setIsNew])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-spin">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
            <p className="text-muted-foreground">验证中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">验证失败</h1>
          {error && <FormMessage message={error} variant="error" />}
        </div>

        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Resend magic link
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Go back to login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Magic Link Callback 页面
 * 
 * 功能：
 * - 从 URL searchParams 获取 token
 * - 调用 GET /api/auth/magic-link/verify?token=...
 * - 验证成功后写入 token → loadProfile() → 根据 isNew/hasBrand 跳转
 * - 失败时显示错误和"Resend magic link"按钮
 */
export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white p-6">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-spin">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
