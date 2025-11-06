"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  formatDateTokyo,
  validateDateRange,
} from "@/lib/date-utils"

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const displayText =
    startDate && endDate
      ? `${formatDateTokyo(startDate)} ~ ${formatDateTokyo(endDate)}`
      : "Select date range"

  const handleChange = (dates: [Date | null, Date | null] | null) => {
    if (!dates) return
    
    const [start, end] = dates
    
    if (start && end) {
      const validation = validateDateRange(start, end, minDate, maxDate)
      if (validation.valid) {
        onDateChange(start, end)
        setIsOpen(false)
      }
    } else if (start && !end) {
      // User is selecting start date - keep it open
      onDateChange(start, start)
    }
  }

  return (
    <div className="relative">
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        minDate={minDate}
        maxDate={maxDate}
        monthsShown={1}
        open={isOpen}
        onInputClick={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        customInput={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs justify-start text-left font-normal w-full",
              !startDate && !endDate && "text-muted-foreground"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <CalendarIcon className="h-3 w-3 mr-1.5" />
            {displayText}
          </Button>
        }
        disabled={(date) => {
          if (minDate && date < minDate) return true
          if (maxDate && date > maxDate) return true
          return false
        }}
        popperClassName="z-[100]"
        popperModifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ]}
      />
    </div>
  )
}


