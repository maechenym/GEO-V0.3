import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Profile } from "@/types/auth"
import apiClient from "@/services/api"
import { SessionResponseSchema } from "@/types/auth"

interface AuthState {
  token: string | null
  profile: Profile | null
  isNew: boolean
  isLoading: boolean
  loginWithToken: (token: string) => Promise<void>
  loadProfile: () => Promise<Profile>
  logout: () => Promise<void>
  setToken: (token: string | null) => void
  setProfile: (profile: Profile | null) => void
  setIsNew: (isNew: boolean) => void
}

/**
 * Auth Store
 * 
 * 提供认证相关的状态和方法：
 * - token: JWT token
 * - profile: 用户资料（包含 id, email, hasBrand）
 * - isNew: 是否为新用户
 * - loginWithToken: 使用 token 登录
 * - loadProfile: 加载用户资料
 * - logout: 登出
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      profile: null,
      isNew: false,
      isLoading: false,

      loginWithToken: async (token: string) => {
        set({ token, isLoading: true })
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token)
        }
        // 加载用户资料
        await get().loadProfile()
      },

      loadProfile: async () => {
        set({ isLoading: true })
        try {
          const response = await apiClient.get("/auth/session")
          const data = SessionResponseSchema.parse(response.data)
          
          if (data.ok && data.profile) {
            set({
              profile: data.profile,
              isLoading: false,
            })
            return data.profile
          }
          throw new Error("Failed to load profile")
        } catch (error) {
          set({ isLoading: false })
          // 如果 token 无效，清除状态
          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as { response?: { status?: number } }
            if (axiosError.response?.status === 401) {
              get().logout()
            }
          }
          throw error
        }
      },

      logout: async () => {
        try {
          // 调用登出 API
          await apiClient.post("/auth/logout")
        } catch (error) {
          // 即使 API 失败也清除本地状态
          console.error("Logout error:", error)
        } finally {
          set({
            token: null,
            profile: null,
            isNew: false,
          })
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("auth-storage")
          }
        }
      },

      setToken: (token: string | null) => {
        set({ token })
        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("token", token)
          } else {
            localStorage.removeItem("token")
          }
        }
      },

      setProfile: (profile: Profile | null) => {
        set({ profile })
      },

      setIsNew: (isNew: boolean) => {
        set({ isNew })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        profile: state.profile,
        isNew: state.isNew,
      }),
    }
  )
)

