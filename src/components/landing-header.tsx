"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 -mt-1">
          <Logo size={36} showText={true} textSize="3xl" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/news"
            className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors"
          >
            News
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

