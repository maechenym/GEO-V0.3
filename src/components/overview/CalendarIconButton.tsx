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
  formatDateTokyo,
  validateDateRange,
} from "@/lib/date-utils"

interface CalendarIconButtonProps {
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
}

export function CalendarIconButton({
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
}: CalendarIconButtonProps) {
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

  const displayText =
    startDate && endDate
      ? `${formatDateTokyo(startDate)} ~ ${formatDateTokyo(endDate)}`
      : "Select date range"

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range || !range.from) return
    
    setSelectedRange({
      from: range.from,
      to: range.to,
    })
    
    // If both dates are selected, validate and apply
    if (range.from && range.to) {
      const validation = validateDateRange(range.from, range.to, minDate, maxDate)
      if (validation.valid) {
        onDateChange(range.from, range.to)
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
            selected={selectedRange as any}
            onSelect={handleSelect as any}
            numberOfMonths={1}
            disabled={((date: Date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }) as any}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

