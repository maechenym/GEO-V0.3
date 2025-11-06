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

