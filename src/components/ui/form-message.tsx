import { cn } from "@/lib/utils"

interface FormMessageProps {
  message?: string
  className?: string
  variant?: "error" | "success" | "info"
}

/**
 * FormMessage 组件
 * 用于显示表单验证错误或其他消息
 */
export function FormMessage({ message, className, variant = "error" }: FormMessageProps) {
  if (!message) return null

  return (
    <p
      className={cn(
        "text-sm mt-1.5",
        variant === "error" && "text-destructive",
        variant === "success" && "text-green-600",
        variant === "info" && "text-muted-foreground",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  )
}

