"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

/**
 * AuthGuard 组件
 * 
 * 路由守卫规则：
 * 1. 未登录访问 (app) 区域 → 重定向 /login
 * 2. 新用户登录但无品牌 → 强制进入 /onboarding/brand
 *    （除非已经在 onboarding 流程中）
 * 3. 已登录访问 /login 或 /signup → 自动跳转 /overview
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, profile, isLoading, loadProfile } = useAuthStore()
  const loadProfileAttempted = useRef(false) // 防止重复加载
  const redirectingRef = useRef(false) // 防止重复重定向

  // 初始化时加载 profile（如果有 token）
  useEffect(() => {
    // 防止重复加载
    if (loadProfileAttempted.current) return
    if (!token || profile || isLoading) return

    loadProfileAttempted.current = true
    loadProfile()
      .then(() => {
        // 成功加载，保持标志为 true
      })
      .catch((error) => {
        console.error("Failed to load profile:", error)
        // 失败后重置标志，允许下次重试（但不会立即重试，因为 profile 已设置）
        loadProfileAttempted.current = false
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, profile, isLoading]) // 移除 loadProfile 依赖，避免无限循环

  useEffect(() => {
    // 防止重复重定向
    if (redirectingRef.current) return
    
    // 等待认证状态加载完成
    if (isLoading) {
      return
    }

    // 公共路径（包括 auth 回调路径）
    const publicPaths = [
      "/",
      "/login",
      "/signup",
      "/public",
      "/auth/check-inbox",
      "/auth/callback",
      "/auth/google",
      "/auth/google/callback",
    ]
    const isPublicPath = publicPaths.includes(pathname || "") || pathname?.startsWith("/auth/")
    
    // 允许访问分析结果和订阅页面（需要登录）
    const isAnalysisOrSubscribePath = pathname === "/analysis-results" || pathname === "/subscribe"
    
    // Onboarding 路径
    const isOnboardingPath = pathname?.startsWith("/onboarding") ?? false

    // 如果已登录且有品牌，访问登录/注册页或首页时重定向到 overview
    if (token && profile && profile.hasBrand) {
      if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
        redirectingRef.current = true
        router.replace("/overview")
        return
      }
    }

    // 如果访问的是公共路径，直接允许
    if (isPublicPath) {
      return
    }

    // 如果未登录，重定向到登录页（保护所有非公共路径，除了分析结果和订阅页面需要特殊处理）
    if (!token || !profile) {
      // 分析结果和订阅页面需要登录
      if (isAnalysisOrSubscribePath) {
        redirectingRef.current = true
        router.replace("/login")
        return
      }
      redirectingRef.current = true
      router.replace("/login")
      return
    }
    
    // 已登录用户可以访问分析结果和订阅页面
    if (isAnalysisOrSubscribePath) {
      return
    }

    // 如果已登录但无品牌，且不在 onboarding 流程中
    // 强制跳转到 onboarding/brand
    if (token && profile && !profile.hasBrand && !isOnboardingPath) {
      redirectingRef.current = true
      router.replace("/onboarding/brand")
      return
    }

    // 如果已完成 onboarding（有品牌），不允许访问 onboarding 页面
    // 跳转到 overview
    if (token && profile?.hasBrand && isOnboardingPath) {
      redirectingRef.current = true
      router.replace("/overview")
      return
    }
    
    // 重置重定向标志
    redirectingRef.current = false
  }, [token, profile, pathname, router, isLoading])

  // 在加载认证状态时显示加载提示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}

