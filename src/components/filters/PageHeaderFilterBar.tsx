"use client"

import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRangeFilter } from "./DateRangeFilter"
import { ModelSelector } from "./ModelSelector"
import type { ModelOptionValue } from "@/constants/models"

interface PageHeaderFilterBarProps {
  // 标题
  title: string
  description?: string
  
  // 日期范围
  startDate: Date
  endDate: Date
  onDateChange: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
  showDatePresets?: boolean
  
  // 模型选择
  selectedModel?: ModelOptionValue | string
  onModelChange?: (model: ModelOptionValue) => void
  showModelSelector?: boolean
  
  // 导出功能
  onExport?: () => void
  onExportCSV?: () => void
  onExportPDF?: () => void
  isExporting?: boolean
  showExport?: boolean
  
  // 其他操作按钮
  extraActions?: React.ReactNode
  
  className?: string
}

export function PageHeaderFilterBar({
  title,
  description,
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
  showDatePresets = true,
  selectedModel,
  onModelChange,
  showModelSelector = true,
  onExport,
  onExportCSV,
  onExportPDF,
  isExporting = false,
  showExport = true,
  extraActions,
  className,
}: PageHeaderFilterBarProps) {
  const hasExportMenu = onExportCSV || onExportPDF

  return (
    <div className={`sticky top-0 z-50 bg-white border-b border-ink-200 px-4 sm:px-6 py-2 ${className || ""}`}>
      <div className="container mx-auto max-w-[1600px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          {/* Left: Title */}
          <div className="sm:-ml-6">
            <h1 className="text-lg sm:text-xl font-semibold text-ink-900">{title}</h1>
            {description && (
              <p className="text-xs text-ink-500 mt-0.5 hidden sm:block">{description}</p>
            )}
          </div>

          {/* Right: Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {showModelSelector && selectedModel !== undefined && onModelChange && (
              <ModelSelector value={selectedModel} onValueChange={onModelChange} />
            )}

            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onDateChange={onDateChange}
              minDate={minDate}
              maxDate={maxDate}
              showPresets={showDatePresets}
            />

            {showExport && (
              <>
                {hasExportMenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs border-gray-200"
                        disabled={isExporting}
                      >
                        <Download className="h-3 w-3 mr-1.5" />
                        {isExporting ? "Exporting..." : "Export"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onExportCSV && (
                        <DropdownMenuItem onClick={onExportCSV}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                      )}
                      {onExportPDF && (
                        <DropdownMenuItem onClick={onExportPDF}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : onExport ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs border-gray-200"
                    onClick={onExport}
                    disabled={isExporting}
                  >
                    <Download className="h-3 w-3 mr-1.5" />
                    {isExporting ? "Exporting..." : "Export"}
                  </Button>
                ) : null}
              </>
            )}

            {extraActions}
          </div>
        </div>
      </div>
    </div>
  )
}

