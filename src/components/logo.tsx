import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  className?: string
  size?: number // 高度（像素），默认根据使用场景自适应
  showText?: boolean // 保留此 prop 以兼容现有代码，但不使用
  textSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" // 保留但不使用
}

/**
 * 品牌Logo组件 - 显示 ximu logo SVG
 */
export function Logo({ 
  className, 
  size = 40, // 默认高度 40px
  showText = true, // 保留但不使用
  textSize = "3xl" // 保留但不使用
}: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/ximu-logo-horizontal-blue.svg"
        alt="ximu logo"
        width={size * 2.78} // SVG 的宽高比约为 2.78:1 (695.43 / 250.95)
        height={size}
        className="h-auto"
        priority
      />
    </div>
  )
}

