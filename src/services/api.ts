import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: "/", // Use relative path for Next.js API routes (API routes handle /api prefix)
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    // Skip redirect for brand-related endpoints in development
    const url = error.config?.url || ""
    const isBrandEndpoint = url.includes("/brands") || url.includes("/products") || url.includes("/personas") || url.includes("/competitors")
    
    if (error.response?.status === 401) {
      // Don't redirect if it's a brand endpoint (for development/testing)
      if (isBrandEndpoint) {
        console.warn("[API] 401 on brand endpoint, but continuing (development mode)")
        return Promise.reject(error)
      }
      
      // Clear token and redirect to login (only once, avoid infinite redirects)
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("token")
        localStorage.removeItem("auth-storage")
        // 使用 replace 避免历史记录堆积
        window.location.replace("/login")
      }
    }
    
    // Log other errors but don't cause infinite loops
    if (error.response?.status && error.response.status >= 500) {
      console.error("[API] Server error:", error.response.status, url)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient


