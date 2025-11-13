import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean // 是否显示文字（保留此 prop 以兼容现有代码）
  textSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" // 文字大小
}

/**
 * 品牌Logo组件 - 仅显示文字
 */
export function Logo({ 
  className, 
  size, // 保留但不使用
  showText = true, // 默认显示文字
  textSize = "3xl" // 默认更大的文字
}: LogoProps) {
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl"
  }

  return (
    <span className={cn("font-bold text-brand-600 flex items-center justify-center", textSizeClasses[textSize], className)}>
      ximu
    </span>
  )
}

