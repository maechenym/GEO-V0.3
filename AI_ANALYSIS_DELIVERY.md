# AI 搜索分析生成页 - 交付文档

## 1. 文件结构树

```
src/
├── app/(app)/onboarding/ai-analysis/
│   ├── page.tsx                    # 主页面
│   ├── BrandBadge.tsx             # 品牌展示区组件
│   ├── DataSources.tsx            # 数据来源说明区组件
│   ├── ProgressPanel.tsx          # 分析进度动画区组件（含轮询逻辑）
│   └── FooterTrust.tsx            # 页脚信任区组件
├── app/(app)/onboarding/brand/
│   └── StepIndicator.tsx          # 步骤指示器（已更新支持 4 个步骤）
└── mocks/
    └── handlers.ts                # MSW 处理器（含 analysis endpoints）
```

## 2. 关键文件完整代码

### 2.1 主页面 (`src/app/(app)/onboarding/ai-analysis/page.tsx`)

```typescript
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useBrandStore } from "@/store/brand.store"
import { useAuthStore } from "@/store/auth.store"
import { StepIndicator } from "../brand/StepIndicator"
import { BrandBadge } from "./BrandBadge"
import { DataSources } from "./DataSources"
import { ProgressPanel } from "./ProgressPanel"
import { FooterTrust } from "./FooterTrust"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

/**
 * AI 搜索分析生成页
 * 
 * 路径：/onboarding/ai-analysis
 * 目的：展示品牌 AI 搜索分析生成过程；用户无需操作，等待完成后进入 /overview
 */
export default function AIAnalysisPage() {
  const router = useRouter()
  const { basic } = useBrandStore()
  const { profile } = useAuthStore()
  const [isComplete, setIsComplete] = useState(false)

  // 生成 brandId（优先使用 user.id，否则使用 brandName 生成）
  const brandId = useMemo(() => {
    if (profile?.id) {
      return profile.id
    }
    // 如果没有 user.id，基于 brandName 生成一个 ID
    if (basic?.brandName) {
      return `brand_${basic.brandName.toLowerCase().replace(/\s+/g, "_")}`
    }
    return "default_brand"
  }, [profile?.id, basic?.brandName])

  // 处理完成回调
  const handleComplete = () => {
    setIsComplete(true)
  }

  // 跳转到概览页
  const handleStart = () => {
    router.push("/overview")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左侧：步骤指示器 */}
          <div className="lg:col-span-3">
            <StepIndicator currentStep={4} />
          </div>

          {/* 右侧：主要内容区 */}
          <div className="lg:col-span-9 space-y-8">
            {/* 品牌展示区 */}
            <BrandBadge />

            {/* 数据来源说明区 */}
            <DataSources />

            {/* 分析进度动画区 */}
            <ProgressPanel brandId={brandId} onComplete={handleComplete} />

            {/* CTA 按钮区（完成态时显示） */}
            {isComplete && (
              <div className="flex justify-center animate-in fade-in duration-500">
                <Button
                  type="button"
                  onClick={handleStart}
                  size="lg"
                  className="bg-[#0000D2] hover:bg-[#0000D2]/90 text-white px-8 py-6 text-base"
                >
                  Start winning in AI Search <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* 页脚信任区 */}
            <FooterTrust />
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2.2 BrandBadge 组件 (`src/app/(app)/onboarding/ai-analysis/BrandBadge.tsx`)

```typescript
"use client"

import { useBrandStore } from "@/store/brand.store"

/**
 * 品牌展示区组件
 * 
 * 显示：Logo（无则首字母占位）+ 品牌名 + 产品名
 * 居中显示
 */
export function BrandBadge() {
  const { basic } = useBrandStore()

  // 获取品牌名称首字母作为占位符
  const getInitials = (name: string | undefined) => {
    if (!name) return "B"
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = getInitials(basic?.brandName)
  const brandName = basic?.brandName || "Brand"
  const productName = basic?.productName || "Product"

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Logo 占位符 */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
        {initials}
      </div>

      {/* 品牌信息 */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">{brandName}</h2>
        <p className="text-lg text-muted-foreground">{productName}</p>
      </div>

      {/* 说明文案 */}
      <p className="text-sm text-muted-foreground max-w-md text-center">
        We're analyzing your brand across multiple AI search platforms to help you understand your digital presence.
      </p>
    </div>
  )
}
```

### 2.3 ProgressPanel 组件 (`src/app/(app)/onboarding/ai-analysis/ProgressPanel.tsx`)

```typescript
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import apiClient from "@/services/api"
import { useToast } from "@/hooks/use-toast"

interface AnalysisStatus {
  progress: number
  stage: "Analyzing" | "Mapping" | "Ranking" | "Preparing" | "Completed"
  jobId: string
}

interface ProgressPanelProps {
  brandId: string
  onComplete: () => void
}

/**
 * 分析进度面板组件
 * 
 * 功能：
 * - 调用 POST /api/analysis/initiate 获取 jobId
 * - 轮询 GET /api/analysis/status 每 1s
 * - 显示进度动画和当前阶段
 * - 错误时显示重试按钮
 */
export function ProgressPanel({ brandId, onComplete }: ProgressPanelProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<AnalysisStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 检查状态
  const checkStatus = useCallback(async (jobId: string) => {
    try {
      const response = await apiClient.get(`/analysis/status?jobId=${jobId}`)
      const data = response.data

      setStatus({
        progress: data.progress || 0,
        stage: data.stage || "Analyzing",
        jobId,
      })

      // 如果进度达到 100%，停止轮询并触发完成回调
      if (data.progress >= 100) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        onComplete()
      }
    } catch (err) {
      // 轮询失败不立即显示错误，避免频繁提示
      console.error("Status check failed:", err)
    }
  }, [onComplete])

  // 开始轮询状态
  const startPolling = useCallback((jobId: string) => {
    // 清除之前的轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // 立即查询一次
    checkStatus(jobId)

    // 设置定时轮询（每 1 秒）
    pollingIntervalRef.current = setInterval(() => {
      checkStatus(jobId)
    }, 1000)
  }, [checkStatus])

  // 初始化分析任务
  const initiateAnalysis = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.post(`/analysis/initiate?brandId=${brandId}`)
      const jobId = response.data.jobId

      if (!jobId) {
        throw new Error("Failed to get job ID")
      }

      setStatus({
        progress: 0,
        stage: "Analyzing",
        jobId,
      })

      // 开始轮询
      startPolling(jobId)
    } catch (err) {
      const message = err && typeof err === "object" && "message" in err
        ? String(err.message)
        : "Failed to start analysis"
      setError(message)
      toast({
        title: "初始化失败",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [brandId, startPolling, toast])

  // 重试
  const handleRetry = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    initiateAnalysis()
  }

  // 组件挂载时初始化
  useEffect(() => {
    initiateAnalysis()

    // 清理函数
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [initiateAnalysis])

  // 阶段文案映射
  const stageMessages: Record<string, string> = {
    Analyzing: "Analyzing your brand across AI platforms...",
    Mapping: "Mapping your digital presence...",
    Ranking: "Ranking your search visibility...",
    Preparing: "Preparing your analysis report...",
    Completed: "Analysis complete!",
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      {error ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="text-destructive text-center space-y-2">
            <p className="font-medium">Analysis failed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {status?.stage || "Initializing..."}
              </span>
              <span className="text-muted-foreground">
                {status?.progress || 0}%
              </span>
            </div>
            <Progress value={status?.progress || 0} className="h-2" />
          </div>

          {/* 当前阶段文案 */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Starting analysis...</span>
              </>
            ) : (
              <span>{stageMessages[status?.stage || "Analyzing"]}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2.4 Mock Handlers (`src/mocks/handlers.ts` - 相关部分)

```typescript
// POST /api/analysis/initiate
http.post("*/api/analysis/initiate", async ({ request }) => {
  const url = new URL(request.url)
  const brandId = url.searchParams.get("brandId")

  if (!brandId) {
    return HttpResponse.json(
      {
        error: "brandId is required",
      },
      { status: 400 }
    )
  }

  // 生成 jobId
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  return HttpResponse.json({
    jobId,
    message: "Analysis initiated",
  })
}),

// GET /api/analysis/status
http.get("*/api/analysis/status", async ({ request }) => {
  const url = new URL(request.url)
  const jobId = url.searchParams.get("jobId")

  if (!jobId) {
    return HttpResponse.json(
      {
        error: "jobId is required",
      },
      { status: 400 }
    )
  }

  // 模拟进度（基于 jobId 的时间戳计算进度）
  const jobTimestamp = parseInt(jobId.split("_")[1] || "0")
  const elapsed = Date.now() - jobTimestamp
  const duration = 15000 // 15 秒完成整个分析

  // 计算进度（0-100）
  let progress = Math.min(Math.floor((elapsed / duration) * 100), 100)

  // 根据进度确定阶段
  let stage: "Analyzing" | "Mapping" | "Ranking" | "Preparing" | "Completed"
  if (progress < 25) {
    stage = "Analyzing"
  } else if (progress < 50) {
    stage = "Mapping"
  } else if (progress < 75) {
    stage = "Ranking"
  } else if (progress < 100) {
    stage = "Preparing"
  } else {
    stage = "Completed"
    progress = 100
  }

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200))

  return HttpResponse.json({
    jobId,
    progress,
    stage,
    status: progress === 100 ? "completed" : "in_progress",
  })
}),
```

## 3. 自测清单

### ✅ 基础布局

- [ ] **左侧步骤指示器**
  - 显示：`Brand → Prompt → Plan → AI-Analysis`
  - `AI-Analysis` 步骤高亮显示（品牌蓝 `#0000D2`）
  - 前三个步骤显示完成标记（✓）

- [ ] **页面结构**
  - 品牌展示区居中显示
  - 数据来源说明区显示 GPT-4o、Gemini、Perplexity
  - 分析进度动画区显示进度条和阶段文案
  - 页脚信任区显示固定文案

### ✅ 品牌展示

- [ ] **Brand Badge 显示**
  - 显示品牌 Logo（首字母占位符，圆形背景）
  - 显示品牌名称和产品名称
  - 显示说明文案："We're analyzing your brand..."

### ✅ 进度分析

- [ ] **自动初始化**
  - 页面加载时自动调用 `POST /api/analysis/initiate?brandId=xxx`
  - 成功获取 jobId

- [ ] **轮询状态**
  - 每 1 秒轮询 `GET /api/analysis/status?jobId=xxx`
  - 进度条正确显示进度（0-100%）
  - 阶段文案正确更新：
    - 0-25%: "Analyzing..."
    - 25-50%: "Mapping..."
    - 50-75%: "Ranking..."
    - 75-100%: "Preparing..."
    - 100%: "Analysis complete!"

- [ ] **进度完成**
  - 当 progress=100 时，停止轮询
  - CTA 按钮淡入显示（动画效果）
  - 按钮文案："Start winning in AI Search →"
  - 按钮颜色：品牌主色 `#0000D2`

### ✅ 错误处理

- [ ] **初始化失败**
  - 显示错误信息
  - 显示 "Retry" 按钮
  - 点击 Retry 重新发起初始化

- [ ] **轮询失败**
  - 轮询失败时不中断流程（静默处理）
  - 不影响用户体验

### ✅ 导航功能

- [ ] **完成跳转**
  - 点击 "Start winning in AI Search →" 按钮
  - 验证跳转到 `/overview` 页面

### ✅ brandId 获取

- [ ] **brandId 生成逻辑**
  - 优先使用 `profile.id`（如果存在）
  - 否则基于 `brandName` 生成：`brand_${brandName}`
  - 兜底使用 `"default_brand"`

## 4. 运行说明

### 启动开发服务器

```bash
npm run dev
```

### 环境变量配置

确保 `.env.local` 中包含：

```bash
NEXT_PUBLIC_USE_MOCK=true
```

### 访问页面

1. **完成 onboarding 流程后跳转**：完成前面的步骤后，可以手动访问 `/onboarding/ai-analysis`
2. **直接访问**：`http://localhost:3000/onboarding/ai-analysis`

### API Endpoints

所有 API endpoints 都有对应的 Mock handlers：

- `POST /api/analysis/initiate?brandId=xxx` - 初始化分析任务，返回 jobId
- `GET /api/analysis/status?jobId=xxx` - 获取分析状态，返回 progress 和 stage

## 5. 技术要点

1. **自动启动**：页面加载时自动调用 `initiateAnalysis`，无需用户操作
2. **轮询逻辑**：使用 `setInterval` 每 1 秒轮询一次状态，直到 progress=100
3. **进度计算**：Mock handler 基于时间戳计算进度（15 秒完成整个分析）
4. **阶段映射**：根据进度自动切换阶段文案（Analyzing → Mapping → Ranking → Preparing）
5. **错误恢复**：提供 Retry 按钮，支持重新初始化分析任务
6. **完成动画**：使用 Tailwind 的 `animate-in fade-in` 实现 CTA 按钮淡入效果
7. **清理机制**：组件卸载时自动清理轮询定时器，避免内存泄漏

## 6. 注意事项

1. **brandId 获取**：优先使用 `profile.id`，如果没有则基于品牌名称生成
2. **轮询间隔**：设置为 1 秒，避免过于频繁的请求
3. **进度模拟**：Mock handler 使用 15 秒完成整个分析，实际项目中可能需要调整
4. **错误处理**：初始化失败时显示错误和重试按钮，轮询失败时静默处理
5. **完成回调**：当 progress=100 时，触发 `onComplete` 回调，显示 CTA 按钮

