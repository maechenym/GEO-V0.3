"use client"

import { Sparkles, Zap, Brain } from "lucide-react"

/**
 * 数据来源说明区组件
 * 
 * 固定文案列表：GPT-4o、Gemini、Perplexity
 */
export function DataSources() {
  const sources = [
    { name: "GPT-4o", icon: Sparkles },
    { name: "Gemini", icon: Brain },
    { name: "Perplexity", icon: Zap },
  ]

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Data sources</h3>
      <div className="flex items-center gap-6">
        {sources.map((source) => {
          const Icon = source.icon
          return (
            <div key={source.name} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{source.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

