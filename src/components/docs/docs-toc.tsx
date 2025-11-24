"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TocItem } from "@/lib/docs/toc"
import Link from "next/link"

interface DocsTocProps {
  toc: TocItem[]
  className?: string
}

export function DocsToc({ toc, className }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (toc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0px -66%",
        threshold: 0,
      }
    )

    const headings = toc.map((item) => document.getElementById(item.id)).filter(Boolean)
    headings.forEach((heading) => {
      if (heading) observer.observe(heading)
    })

    return () => {
      headings.forEach((heading) => {
        if (heading) observer.unobserve(heading)
      })
    }
  }, [toc])

  if (toc.length === 0) return null

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-l border-border p-6 overflow-y-auto",
        className
      )}
    >
      <div className="sticky top-24">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          On this page
        </h2>
        <nav className="space-y-1.5">
          {toc.map((item) => {
            const isActive = activeId === item.id
            return (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "block text-sm transition-colors hover:text-foreground",
                  item.level === 1 && "font-medium pl-0",
                  item.level === 2 && "pl-4 text-foreground/80",
                  item.level >= 3 && "pl-8 text-foreground/70",
                  isActive && "text-brand-600"
                )}
              >
                {item.text}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

