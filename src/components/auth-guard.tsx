"use client"

import { useEffect } from "react"
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

  // 初始化时加载 profile（如果有 token）
  useEffect(() => {
    if (token && !profile && !isLoading) {
      loadProfile().catch((error) => {
        console.error("Failed to load profile:", error)
      })
    }
  }, [token, profile, isLoading, loadProfile])

  useEffect(() => {
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
    
    // Onboarding 路径
    const isOnboardingPath = pathname?.startsWith("/onboarding") ?? false

    // 如果已登录且有品牌，访问登录/注册页或首页时重定向到 overview
    if (token && profile && profile.hasBrand) {
      if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
        router.replace("/overview")
        return
      }
    }

    // 如果访问的是公共路径，直接允许
    if (isPublicPath) {
      return
    }

    // 如果未登录，重定向到登录页（保护所有非公共路径）
    if (!token || !profile) {
      router.replace("/login")
      return
    }

    // 如果已登录但无品牌，且不在 onboarding 流程中
    // 强制跳转到 onboarding/brand
    if (token && profile && !profile.hasBrand && !isOnboardingPath) {
      router.replace("/onboarding/brand")
      return
    }

    // 如果已完成 onboarding（有品牌），不允许访问 onboarding 页面
    // 跳转到 overview
    if (token && profile?.hasBrand && isOnboardingPath) {
      router.replace("/overview")
      return
    }
  }, [token, profile, pathname, router, isLoading])

  // 在加载认证状态时显示加载提示或空白
  if (isLoading) {
    return null
  }

  return <>{children}</>
}

