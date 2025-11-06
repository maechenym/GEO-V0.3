"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({ message, onRetry, retryLabel = "重试" }: ErrorStateProps) {
  const { toast } = useToast()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      toast({
        title: "重试中...",
        description: "正在重新加载数据",
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">加载失败</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
        {message || "无法加载数据，请稍后重试"}
      </p>
      {onRetry && (
        <Button onClick={handleRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

