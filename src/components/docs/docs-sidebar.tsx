"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { docsNavigation, type DocNavItem } from "@/lib/docs/navigation"
import { cn } from "@/lib/utils"

interface DocsSidebarProps {
  className?: string
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const pathname = usePathname()
  const [activeHash, setActiveHash] = useState("")

  useEffect(() => {
    // 监听 hash 变化
    const updateHash = () => {
      setActiveHash(window.location.hash)
    }
    
    updateHash()
    window.addEventListener("hashchange", updateHash)
    return () => window.removeEventListener("hashchange", updateHash)
  }, [])

  const isItemActive = (href: string): boolean => {
    if (href === pathname) return true
    if (href.includes('#')) {
      const hash = href.split('#')[1]
      if (hash && activeHash === `#${hash}`) return true
      // 如果没有 hash，检查是否是当前路径
      if (!activeHash && href.startsWith(pathname)) return true
    }
    return false
  }

  const renderNavItem = (item: DocNavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0

    // 主分类（level 0）
    if (level === 0) {
      const Icon = item.icon
      return (
        <div key={item.href} className="mb-8 first:mt-0">
          {/* 主分类标题 */}
          <div className="flex items-center gap-2 mb-3">
            {Icon && <Icon className="h-4 w-4 text-foreground" />}
            <h3 className="font-semibold text-foreground text-sm">
              {item.title}
            </h3>
          </div>
          
          {/* 子项目 */}
          {hasChildren && (
            <div className="space-y-1">
              {item.children!.map((child) => {
                const childIsActive = isItemActive(child.href)
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "block py-1.5 px-2 rounded text-sm text-foreground/80 hover:text-foreground transition-colors",
                      childIsActive && "bg-muted text-foreground font-medium"
                    )}
                  >
                    {child.title}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // 子项目（不会单独渲染，已在主分类中处理）
    return null
  }

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-border bg-background h-[calc(100vh-4rem)] sticky top-16 flex flex-col",
        className
      )}
    >
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        {docsNavigation.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  )
}

