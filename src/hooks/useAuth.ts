"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * useAuth Hook
 * 
 * 提供认证相关的功能：
 * - login/logout 方法
 * - token/profile 访问
 * - loading 状态
 * - 自动跳转逻辑
 */
export function useAuth() {
  const router = useRouter()
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    signup: storeSignup,
    logout: storeLogout,
    setUser,
  } = useAuthStore()

  /**
   * 登录函数
   * 登录成功后根据用户状态跳转：
   * - 首次用户无品牌 → /onboarding/brand
   * - 已有品牌 → /overview
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await storeLogin(email, password)
        
        // 根据是否有品牌决定跳转路径
        if (!result.hasBrand) {
          router.push("/onboarding/brand")
        } else {
          router.push("/overview")
        }
      } catch (error) {
        console.error("Login failed:", error)
        throw error
      }
    },
    [storeLogin, router]
  )

  /**
   * 注册函数
   * 注册成功后跳转到 onboarding（新用户默认无品牌）
   */
  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const result = await storeSignup(email, password, name)
        
        // 新注册用户默认无品牌，跳转到 onboarding
        router.push("/onboarding/brand")
      } catch (error) {
        console.error("Signup failed:", error)
        throw error
      }
    },
    [storeSignup, router]
  )

  /**
   * 登出函数
   * 清空状态并跳转到登录页
   */
  const logout = useCallback(() => {
    storeLogout()
    router.push("/login")
  }, [storeLogout, router])

  return {
    // 状态
    user,
    token,
    isAuthenticated,
    isLoading,
    // 方法
    login,
    signup,
    logout,
    setUser,
  }
}

