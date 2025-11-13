"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

/**
 * 首页 - 公共展示页
 * 
 * 页面跳转逻辑：
 * - "Start Free Trial" 按钮 → /signup
 * - 已有账户 → /login
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary -mt-1">
            <Logo size={24} showText={true} textSize="3xl" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Welcome to GEO App
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            Your AI-powered visibility tracking and competitor analysis platform
          </p>
        </div>
      </main>
    </div>
  )
}


