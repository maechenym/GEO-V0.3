/**
 * GEO Design System Tokens
 * 
 * 统一的设计系统令牌，确保整个应用使用一致的视觉语言
 * 参考: FRONTEND_DESIGN_PLAN.md
 */

// ============================================================================
// 颜色系统
// ============================================================================

/**
 * 品牌色 - 专业配色方案
 * 100%: #13458c - 深蓝色（主色）
 * 60%:  #426aa3 - 中等偏深的蓝色
 * 50%:  #718fba - 中等蓝色
 * 40%:  #a1b5d1 - 中等偏浅的蓝色
 * 20%:  #d0dae8 - 最浅的蓝色/浅灰蓝色
 */
export const BRAND_COLORS = {
  DEFAULT: "#13458c", // 100% - 深蓝色（主色）
  50: "#d0dae8",      // 20% - 最浅的蓝色/浅灰蓝色
  100: "#a1b5d1",     // 40% - 中等偏浅的蓝色
  200: "#718fba",     // 50% - 中等蓝色
  300: "#426aa3",     // 60% - 中等偏深的蓝色
  400: "#2d5a96",     // 70% - 中深蓝色（插值）
  500: "#1f4f89",     // 80% - 深蓝色（插值）
  600: "#13458c",     // 100% - 深蓝色（主色）
  700: "#0f3870",     // 更深变体
  800: "#0b2b54",     // 更深变体
  900: "#071e38",     // 最深变体
} as const

/**
 * 中性色 (Ink)
 */
export const INK_COLORS = {
  900: "#111827", // 主文本
  700: "#374151", // 次要文本
  600: "#4B5563", // 辅助文本
  500: "#6B7280", // 占位文本
  400: "#9CA3AF", // 禁用文本
  300: "#D1D5DB", // 边框
  200: "#E5E7EB", // 浅边框
  100: "#F3F4F6", // 浅背景
  50: "#F9FAFB",  // 极浅背景
} as const

/**
 * 语义色彩
 */
export const SEMANTIC_COLORS = {
  good: "#16A34A",   // 成功/正面
  bad: "#DC2626",    // 错误/负面
  info: "#3B82F6",   // 信息
  warning: "#F59E0B", // 警告
} as const

// ============================================================================
// 字体系统
// ============================================================================

/**
 * 字号
 */
export const FONT_SIZES = {
  caption: "11px",   // 说明文字
  "body-sm": "13px", // 小号正文
  body: "14px",      // 正文
  title: "16px",     // 标题
  page: "20px",      // 页面标题
} as const

/**
 * 字重
 */
export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const

// ============================================================================
// 间距系统
// ============================================================================

/**
 * 间距值
 */
export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  pageX: "40px", // 页面水平内边距
  pageY: "32px", // 页面垂直内边距
} as const

// ============================================================================
// 圆角系统
// ============================================================================

/**
 * 圆角值
 */
export const BORDER_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  full: "9999px",
} as const

// ============================================================================
// 阴影系统
// ============================================================================

/**
 * 阴影值
 */
export const SHADOWS = {
  subtle: "0 1px 2px rgba(17,24,39,0.04)",
  sm: "0 1px 3px rgba(0,0,0,0.1)",
  md: "0 4px 6px rgba(0,0,0,0.1)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
} as const

// ============================================================================
// 组件样式类名工具函数
// ============================================================================

/**
 * KPI 卡片样式
 */
export const kpiCardClass = "rounded-lg border border-ink-200 bg-white p-5 hover:border-brand-300 transition-colors"

/**
 * 标准卡片样式
 */
export const cardClass = "rounded-lg border border-ink-200 bg-white p-5 shadow-subtle hover:shadow-md transition-shadow"

/**
 * 数据卡片样式
 */
export const dataCardClass = "rounded-xl border border-ink-200 bg-white p-6 shadow-sm"

/**
 * 主要按钮样式
 */
export const primaryButtonClass = "bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"

/**
 * 次要按钮样式
 */
export const secondaryButtonClass = "bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 px-4 py-2 rounded-lg font-medium transition-colors"

/**
 * 文本按钮样式
 */
export const textButtonClass = "text-ink-600 hover:text-ink-900 hover:bg-ink-50 px-3 py-1.5 rounded-md font-medium transition-colors"

// ============================================================================
// 图表颜色方案
// ============================================================================

/**
 * 图表主色调（品牌色）
 */
export const CHART_PRIMARY_COLOR = BRAND_COLORS.DEFAULT

/**
 * 图表多数据系列颜色
 */
export const CHART_COLORS = [
  BRAND_COLORS.DEFAULT, // 品牌色
  "#3B82F6",            // 蓝色
  "#16A34A",            // 绿色
  "#F59E0B",            // 琥珀色
  "#EF4444",            // 红色
  "#8B5CF6",            // 紫色
] as const

/**
 * 图表渐变填充色
 */
export const CHART_GRADIENT = "rgba(19, 69, 140, 0.1)"

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取文本颜色类名
 */
export function getTextColorClass(variant: "primary" | "secondary" | "muted" | "disabled" = "primary") {
  const colorMap = {
    primary: "text-ink-900",
    secondary: "text-ink-700",
    muted: "text-ink-500",
    disabled: "text-ink-400",
  }
  return colorMap[variant]
}

/**
 * 获取边框颜色类名
 */
export function getBorderColorClass(variant: "default" | "light" | "brand" = "default") {
  const colorMap = {
    default: "border-ink-200",
    light: "border-ink-100",
    brand: "border-brand-600",
  }
  return colorMap[variant]
}

/**
 * 获取背景颜色类名
 */
export function getBackgroundColorClass(variant: "white" | "muted" | "brand" = "white") {
  const colorMap = {
    white: "bg-white",
    muted: "bg-ink-50",
    brand: "bg-brand-600",
  }
  return colorMap[variant]
}

