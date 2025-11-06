import { format, subDays, parseISO, isValid, differenceInDays } from "date-fns"
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"

const TIMEZONE_SHANGHAI = 'Asia/Shanghai'
const TIMEZONE_TOKYO = 'Asia/Tokyo'

/**
 * 获取今天的日期（北京时间）
 */
export function getTodayShanghai(): Date {
  const now = new Date()
  return toZonedTime(now, TIMEZONE_SHANGHAI)
}

/**
 * 获取今天的日期（东京时间，保留兼容）
 */
export function getTodayTokyo(): Date {
  const now = new Date()
  return toZonedTime(now, TIMEZONE_TOKYO)
}

/**
 * 格式化日期为 YYYY-MM-DD（北京时间）
 */
export function formatDateShanghai(date: Date): string {
  return formatInTimeZone(date, TIMEZONE_SHANGHAI, "yyyy-MM-dd")
}

/**
 * 格式化日期为 YYYY-MM-DD（东京时间，保留兼容）
 */
export function formatDateTokyo(date: Date): string {
  return formatInTimeZone(date, TIMEZONE_TOKYO, "yyyy-MM-dd")
}

/**
 * 解析日期字符串为 Date 对象（北京时间）
 */
export function parseDateShanghai(dateStr: string): Date {
  const parsed = parseISO(dateStr)
  if (!isValid(parsed)) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  // Convert date string to Date object in Shanghai timezone
  const zonedDate = new Date(`${dateStr}T00:00:00`)
  return fromZonedTime(zonedDate, TIMEZONE_SHANGHAI)
}

/**
 * 解析日期字符串为 Date 对象（东京时间，保留兼容）
 */
export function parseDateTokyo(dateStr: string): Date {
  const parsed = parseISO(dateStr)
  if (!isValid(parsed)) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  // Convert date string to Date object in Tokyo timezone
  const zonedDate = new Date(`${dateStr}T00:00:00`)
  return fromZonedTime(zonedDate, TIMEZONE_TOKYO)
}

/**
 * 获取默认日期范围（最近7天，北京时间）
 */
export function getDefaultDateRange(): { start: Date; end: Date } {
  const end = getTodayShanghai()
  const start = subDays(end, 6) // 包括今天共7天
  return { start, end }
}

/**
 * 获取用户注册日期（如果不存在则返回30天前，北京时间）
 */
export function getUserRegisteredAt(fallbackDaysAgo: number = 30): Date {
  // TODO: 从用户信息中获取 registeredAt
  // 目前使用 fallback
  return subDays(getTodayShanghai(), fallbackDaysAgo)
}

/**
 * 计算日期范围的天数
 */
export function getDateRangeDays(start: Date, end: Date): number {
  return differenceInDays(end, start) + 1
}

/**
 * 获取前一个等长周期（北京时间）
 */
export function getPreviousPeriod(start: Date, end: Date): { start: Date; end: Date } {
  const days = differenceInDays(end, start) + 1
  const prevEnd = subDays(start, 1)
  const prevStart = subDays(prevEnd, days - 1)
  return { start: prevStart, end: prevEnd }
}

/**
 * 验证日期范围是否有效
 */
export function validateDateRange(
  start: Date,
  end: Date,
  minDate?: Date,
  maxDate?: Date
): { valid: boolean; error?: string } {
  if (start > end) {
    return { valid: false, error: "Start date must be before end date" }
  }

  if (minDate && start < minDate) {
    return { valid: false, error: "Start date must be after registration date" }
  }

  if (maxDate && end > maxDate) {
    return { valid: false, error: "End date cannot be in the future" }
  }

  return { valid: true }
}

