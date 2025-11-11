/**
 * 日期范围预设选项
 * 统一管理所有页面使用的日期范围预设
 */
export type RangeKey = "1d" | "7d" | "14d" | "30d"

export const DATE_RANGE_OPTIONS = [
  { value: "1d", labelZh: "最近 1 天", labelEn: "Last 1 Day" },
  { value: "7d", labelZh: "最近 7 天", labelEn: "Last 7 Days" },
  { value: "14d", labelZh: "最近 14 天", labelEn: "Last 14 Days" },
  { value: "30d", labelZh: "最近 30 天", labelEn: "Last 30 Days" },
] as const

/**
 * 根据天数获取对应的RangeKey
 */
export function getRangeKeyFromDays(days: number): RangeKey {
  if (days <= 1) return "1d"
  if (days <= 7) return "7d"
  if (days <= 14) return "14d"
  return "30d"
}

