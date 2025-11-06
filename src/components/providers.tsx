"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // 初始化 MSW（必须在React Query之前）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
      console.log("[MSW] useMock:", useMock, "NEXT_PUBLIC_USE_MOCK:", process.env.NEXT_PUBLIC_USE_MOCK)
      
      if (useMock) {
        // 设置超时，避免无限等待
        const timeout = setTimeout(() => {
          console.warn("[MSW] Initialization timeout, continuing anyway")
          setMswReady(true)
        }, 3000) // 3秒超时
        
        import("../mocks/browser")
          .then((module) => module.initMSW())
          .then((worker) => {
            clearTimeout(timeout)
            if (worker) {
              console.log("[MSW] ✅ Worker initialized successfully")
              setMswReady(true)
            } else {
              console.warn("[MSW] ⚠️ Worker initialization returned null")
              setMswReady(true) // 即使失败也继续，避免阻塞
            }
          })
          .catch((error) => {
            clearTimeout(timeout)
            console.error("[MSW] ❌ Initialization failed:", error)
            setMswReady(true) // 即使失败也继续，避免阻塞
          })
      } else {
        console.log("[MSW] Mock disabled, using real API")
        setMswReady(true)
      }
    } else {
      setMswReady(true) // 服务端渲染
    }
  }, [])

  // 等待MSW准备就绪后再渲染子组件
  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Initializing...</div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
