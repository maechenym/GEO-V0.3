import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

/**
 * 品牌Logo组件
 * 带圆角的蓝色正方形，内部有X形状
 */
export function Logo({ className, size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    >
      {/* 带圆角的蓝色正方形 */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="4"
        ry="4"
        fill="#0000D2"
        className="text-brand-600"
      />
      {/* X形状 - 两条对角线 */}
      <path
        d="M7 7L17 17M17 7L7 17"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

