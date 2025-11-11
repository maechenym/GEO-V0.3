"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  formatDateShanghai,
  validateDateRange,
  getDateRangeDays,
  getTodayShanghai,
} from "@/lib/date-utils"
import { subDays } from "date-fns"
import { DATE_RANGE_OPTIONS, getRangeKeyFromDays, type RangeKey } from "@/constants/date-ranges"
import { useLanguageStore } from "@/store/language.store"

interface DateRangeFilterProps {
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
  showPresets?: boolean // 是否显示预设选项（1d/7d/14d/30d）
  className?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
  showPresets = true,
  className,
}: DateRangeFilterProps) {
  const { language } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date } | undefined>(() => {
    return {
      from: startDate,
      to: endDate,
    }
  })

  // Update selected range when startDate/endDate change externally
  useEffect(() => {
    setSelectedRange({
      from: startDate,
      to: endDate,
    })
  }, [startDate, endDate])

  // Calculate current range key
  const periodDays = getDateRangeDays(startDate, endDate)
  const dateDiffMs = endDate.getTime() - startDate.getTime()
  const isOneDay = periodDays <= 2 && dateDiffMs <= 172800000
  const currentRangeKey = isOneDay
    ? "1d"
    : periodDays === 7
    ? "7d"
    : periodDays === 14
    ? "14d"
    : periodDays === 30
    ? "30d"
    : "custom"

  // Display text: single day => "YYYY-MM-DD", range => "YYYY-MM-DD ~ YYYY-MM-DD"
  const isSingleDay = startDate && endDate && formatDateShanghai(startDate) === formatDateShanghai(endDate)
  const displayText = isSingleDay
    ? formatDateShanghai(startDate)
    : startDate && endDate
    ? `${formatDateShanghai(startDate)} ~ ${formatDateShanghai(endDate)}`
    : "Select date range"

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return
    
    setSelectedRange(range)
    
    // If both dates are selected, validate and apply
    if (range.from && range.to) {
      const validation = validateDateRange(range.from, range.to, minDate, maxDate)
      if (validation.valid) {
        onDateChange(range.from, range.to)
        setIsOpen(false)
      }
    } else if (range.from && !range.to) {
      // Single day selection
      const validation = validateDateRange(range.from, range.from, minDate, maxDate)
      if (validation.valid) {
        onDateChange(range.from, range.from)
        setIsOpen(false)
      }
    }
  }

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setIsOpen(true)
      return
    }

    const rangeKey = value as RangeKey
    // 使用数据文件中的最后一天作为结束日期，而不是"今天"
    // 因为数据文件中的日期是固定的（2025-10-31 到 2025-11-06）
    // 如果使用"今天"，可能会超出数据文件范围
    const dataEndDate = maxDate || getTodayShanghai()
    
    // 根据需求重新计算日期范围：
    // 1d: 最后2天数据（昨天和今天）- 从倒数第2天开始到最后一天结束
    // 7d: 最近7天数据 - 从7天前开始到最后一天结束
    // 14d: 最近14天数据 - 从14天前开始到最后一天结束
    // 30d: 最近30天数据 - 从30天前开始到最后一天结束
    let start: Date
    if (rangeKey === "1d") {
      // 1天：最后2天（倒数第2天和最后一天）
      start = subDays(dataEndDate, 1)
    } else if (rangeKey === "7d") {
      // 7天：从6天前开始到最后一天（共7天，包括最后一天）
      start = subDays(dataEndDate, 6)
    } else if (rangeKey === "14d") {
      // 14天：从13天前开始到最后一天（共14天，包括最后一天）
      start = subDays(dataEndDate, 13)
    } else {
      // 30天：从29天前开始到最后一天（共30天，包括最后一天）
      start = subDays(dataEndDate, 29)
    }
    
    // 确保开始日期不早于最小日期
    const finalStart = minDate && start < minDate ? minDate : start
    const finalEnd = dataEndDate
    
    console.log(`[DateRangeFilter] ${rangeKey} selected - start: ${formatDateShanghai(finalStart)}, end: ${formatDateShanghai(finalEnd)}`)
    onDateChange(finalStart, finalEnd)
  }

  const rangeLabels = {
    "1d": language === "zh-TW" ? "最近 1 天" : "Last 1 Day",
    "7d": language === "zh-TW" ? "最近 7 天" : "Last 7 Days",
    "14d": language === "zh-TW" ? "最近 14 天" : "Last 14 Days",
    "30d": language === "zh-TW" ? "最近 30 天" : "Last 30 Days",
    custom: language === "zh-TW" ? "自訂區間" : "Custom Range",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showPresets && (
        <Select value={currentRangeKey} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs border-ink-200 hover:border-ink-300 transition-colors min-h-[44px] sm:min-h-0">
            <SelectValue>{rangeLabels[currentRangeKey]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {language === "zh-TW" ? option.labelZh : option.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 border-ink-200 hover:border-ink-300 transition-colors",
              isOpen && "bg-ink-50 border-brand-300"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Select date range</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3">
            <div className="mb-2 text-xs text-ink-500 px-2">
              {displayText}
            </div>
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={1}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

