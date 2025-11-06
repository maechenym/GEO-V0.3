"use client"

import { AuthGuard } from "./auth-guard"

/**
 * AuthGuard 包装组件
 * 用于在服务端布局中安全地使用客户端组件
 */
export function AuthGuardWrapper({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}

