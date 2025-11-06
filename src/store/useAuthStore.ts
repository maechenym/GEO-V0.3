import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
  hasBrand?: boolean // 用户是否已有品牌
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ hasBrand: boolean }>
  signup: (email: string, password: string, name: string) => Promise<{ hasBrand: boolean }>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // TODO: Replace with actual API call
          // const response = await apiClient.post('/auth/login', { email, password })
          // Mock API response
          await new Promise((resolve) => setTimeout(resolve, 500))
          
          const mockUser: User = {
            id: "1",
            email,
            name: "User",
            hasBrand: false, // 首次登录假设无品牌，需要走 onboarding
          }

          set({
            user: mockUser,
            token: "mock-token",
            isAuthenticated: true,
            isLoading: false,
          })

          if (typeof window !== "undefined") {
            localStorage.setItem("token", "mock-token")
          }

          return { hasBrand: mockUser.hasBrand ?? false }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        try {
          // TODO: Replace with actual API call
          // const response = await apiClient.post('/auth/signup', { email, password, name })
          // Mock API response
          await new Promise((resolve) => setTimeout(resolve, 500))
          
          const mockUser: User = {
            id: "1",
            email,
            name,
            hasBrand: false, // 新注册用户默认无品牌
          }

          set({
            user: mockUser,
            token: "mock-token",
            isAuthenticated: true,
            isLoading: false,
          })

          if (typeof window !== "undefined") {
            localStorage.setItem("token", "mock-token")
          }

          return { hasBrand: false }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          localStorage.removeItem("auth-storage")
        }
      },
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token, isAuthenticated: true })
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token)
        }
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

