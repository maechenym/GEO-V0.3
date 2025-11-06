"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  // 生产环境：立即渲染，完全不等待 MSW
  // 开发环境：快速初始化 MSW，最多等待 1 秒
  const isProduction = typeof window !== "undefined" && process.env.NODE_ENV === "production"
  const [mswReady, setMswReady] = useState(isProduction) // 生产环境立即 ready
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1, // 减少重试次数，避免错误累积
          },
        },
      })
  )

  // 只在开发环境初始化 MSW
  useEffect(() => {
    if (isProduction) {
      // 生产环境：什么都不做，直接使用 API 路由
      return
    }

    if (typeof window === "undefined") {
      setMswReady(true)
      return
    }

    // 开发环境：快速初始化 MSW
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
    
    if (!useMock) {
      setMswReady(true)
      return
    }

    // 设置 1 秒超时，快速失败
    const timeout = setTimeout(() => {
      console.warn("[MSW] Initialization timeout, continuing")
      setMswReady(true)
    }, 1000)

    import("../mocks/browser")
      .then((module) => module.initMSW())
      .then((worker) => {
        clearTimeout(timeout)
        setMswReady(true) // 无论成功失败都继续
        if (worker) {
          console.log("[MSW] ✅ Initialized")
        }
      })
      .catch((error) => {
        clearTimeout(timeout)
        console.error("[MSW] ❌ Failed:", error)
        setMswReady(true) // 失败也继续
      })
  }, [isProduction])

  // 生产环境或 MSW 已就绪：立即渲染
  if (mswReady) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    )
  }

  // 开发环境等待 MSW（最多 1 秒）
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Initializing...</div>
    </div>
  )
}
