"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import apiClient from "@/services/api"
import { GoogleCallbackResponseSchema } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { FormMessage } from "@/components/ui/form-message"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken, loadProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")

    if (!code) {
      setError("缺少授权码")
      setIsLoading(false)
      return
    }

    const handleCallback = async () => {
      try {
        const response = await apiClient.get(`/auth/google/callback?code=${encodeURIComponent(code)}`)
        const result = GoogleCallbackResponseSchema.parse(response.data)

        if (result.ok) {
          await loginWithToken(result.token)
          const profile = await loadProfile()

          // 根据 hasBrand 决定跳转
          if (!profile.hasBrand) {
            router.push("/onboarding/brand")
          } else {
            router.push("/overview")
          }
        }
      } catch (error: unknown) {
        const message = error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Google 登录失败，请重试"
        setError(message)
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router, loginWithToken, loadProfile])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-spin">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
            <p className="text-muted-foreground">正在登录...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">登录失败</h1>
          {error && <FormMessage message={error} variant="error" />}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/auth/google")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Go back to login
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Google 登录回调页面
 * 
 * 功能：
 * - 从 URL searchParams 读取 code
 * - 调用 GET /api/auth/google/callback?code=mock
 * - 成功写入 token → loadProfile() → 根据 isNew/hasBrand 跳转
 */
export default function GoogleCallbackPage() {
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
      <GoogleCallbackContent />
    </Suspense>
  )
}

