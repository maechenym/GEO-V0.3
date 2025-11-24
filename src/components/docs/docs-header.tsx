"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 -mt-1">
          <Logo size={36} showText={true} textSize="3xl" />
        </Link>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 pr-3 h-9 w-full rounded-md border border-input bg-background text-sm focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors hidden sm:block"
          >
            Website
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </header>
  )
}

