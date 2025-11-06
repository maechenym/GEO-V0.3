"use client"

import { usePathname } from "next/navigation"
import { AppShell } from "@/components/app-shell"

/**
 * 应用主布局
 * 
 * 包含：
 * - AppShell（顶部导航栏 + 左侧边栏 + 主内容区）
 * - 路由守卫由根 layout 的 AuthGuard 处理
 * 
 * 注意：onboarding 页面有自己的 layout，不使用 AppShell
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 如果是 onboarding 路径，直接返回 children（不使用 AppShell）
  // onboarding 有自己的 layout 处理布局
  if (pathname?.startsWith("/onboarding")) {
    return <>{children}</>
  }

  // 其他页面使用 AppShell（包含工作栏）
  return <AppShell>{children}</AppShell>
}

