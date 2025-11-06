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

