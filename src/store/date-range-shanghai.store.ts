/**
 * Date Range Store (Shanghai Timezone)
 * 
 * 管理全局日期范围状态，与 URL 同步，使用北京时间
 */
import { create } from 'zustand'
import { getTodayShanghai, getDefaultDateRange, getUserRegisteredAt, formatDateShanghai } from '@/lib/date-utils'

export interface DateRange {
  start: Date
  end: Date
}

interface DateRangeState {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  getDateRangeParams: () => { start: string; end: string; tz: string }
  resetToDefault: () => void
}

const TIMEZONE = 'Asia/Shanghai'

export const useDateRangeShanghaiStore = create<DateRangeState>((set, get) => ({
  dateRange: getDefaultDateRange(),
  
  setDateRange: (range) => {
    // Validate: start should be >= user registered date
    const minDate = getUserRegisteredAt(30)
    const validatedStart = range.start < minDate ? minDate : range.start
    
    // Validate: end should be <= today
    const maxDate = getTodayShanghai()
    const validatedEnd = range.end > maxDate ? maxDate : range.end
    
    // Ensure start <= end
    if (validatedStart > validatedEnd) {
      set({ dateRange: { start: validatedEnd, end: validatedEnd } })
      return
    }
    
    set({ dateRange: { start: validatedStart, end: validatedEnd } })
  },
  
  getDateRangeParams: () => {
    const { dateRange } = get()
    return {
      start: formatDateShanghai(dateRange.start),
      end: formatDateShanghai(dateRange.end),
      tz: TIMEZONE,
    }
  },
  
  resetToDefault: () => {
    const defaultRange = getDefaultDateRange()
    // If user registered date is after today - 7 days, use registration date to today
    const minDate = getUserRegisteredAt(30)
    const today = getTodayShanghai()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    if (minDate > sevenDaysAgo) {
      set({ dateRange: { start: minDate, end: today } })
    } else {
      set({ dateRange: defaultRange })
    }
  },
}))

