"use client"

/**
 * 独立页面布局
 * 
 * 不包含 AppShell（顶部导航栏和侧边栏）
 * 用于分析结果和订阅页面
 */
export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

