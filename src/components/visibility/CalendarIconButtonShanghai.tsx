"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
} from "@/lib/date-utils"

interface CalendarIconButtonShanghaiProps {
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
}

export function CalendarIconButtonShanghai({
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
}: CalendarIconButtonShanghaiProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ from: Date; to?: Date } | undefined>(() => {
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

  // Display text: single day => "YYYY-MM-DD", range => "YYYY-MM-DD ~ YYYY-MM-DD"
  const isSingleDay = startDate && endDate && formatDateShanghai(startDate) === formatDateShanghai(endDate)
  const displayText = isSingleDay
    ? formatDateShanghai(startDate)
    : startDate && endDate
    ? `${formatDateShanghai(startDate)} ~ ${formatDateShanghai(endDate)}`
    : "Select date range"

  const handleSelect = (range: { from: Date; to?: Date } | undefined) => {
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isOpen && "bg-accent"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="sr-only">Select date range</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="mb-2 text-xs text-muted-foreground px-2">
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
  )
}

