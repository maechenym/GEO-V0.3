"use client"

import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * useAuth Hook
 * 
 * 提供认证相关的功能：
 * - logout 方法
 * - token/profile 访问
 * - loading 状态
 * 
 * 注意：login/signup 现在由页面组件直接处理（Magic Link / Google OAuth）
 */
export function useAuth() {
  const router = useRouter()
  const {
    profile,
    token,
    isLoading,
    logout: storeLogout,
  } = useAuthStore()

  /**
   * 登出函数
   * 清空状态并跳转到登录页
   */
  const logout = useCallback(async () => {
    await storeLogout()
    router.push("/login")
  }, [storeLogout, router])

  return {
    // 状态
    user: profile, // 保持向后兼容，使用 profile 作为 user
    profile,
    token,
    isAuthenticated: !!token && !!profile,
    isLoading,
    // 方法
    logout,
  }
}

