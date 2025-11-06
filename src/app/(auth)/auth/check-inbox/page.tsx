"use client"

import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Check Inbox 页面
 * 
 * 显示文案：
 * - H1: "Check your inbox"
 * - P: "We've sent a magic link to your email address."
 * - 返回按钮：Go back (链接到 /login)
 */
export default function CheckInboxPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Check your inbox</h1>
          <p className="text-muted-foreground text-lg">
            We've sent a magic link to your email address.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Go back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

