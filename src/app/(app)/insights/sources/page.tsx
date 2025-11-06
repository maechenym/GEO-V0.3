"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Download, Calendar, ExternalLink, Copy, ChevronDown, ChevronUp, MoreVertical, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FadeUp } from "@/lib/animations"
import {
  mockSourceKpis,
  mockSourceRows,
  simulateLoad,
} from "@/mocks/sources"
import { CalendarIconButton } from "@/components/overview/CalendarIconButton"
import {
  formatDateTokyo,
  parseDateTokyo,
  getDefaultDateRange,
  getUserRegisteredAt,
  getDateRangeDays,
  getTodayTokyo,
} from "@/lib/date-utils"
import { subDays } from "date-fns"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import { getTooltipContent } from "@/lib/i18n"
import type { SourceFilters } from "@/types/sources"

export default function SourcesPage() {
  const { selectedBrandId, selectedProductId } = useBrandUIStore()
  const { language } = useLanguageStore()

  // Time range state
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayTokyo(), [])

  // Filters state
  const [filters, setFilters] = useState<SourceFilters>({
    timeRange: { 
      start: formatDateTokyo(dateRange.start), 
      end: formatDateTokyo(dateRange.end) 
    },
    brandId: selectedBrandId || undefined,
    productId: selectedProductId || undefined,
    competitorIds: [],
    granularity: "day",
    category: undefined,
    platform: undefined,
  })
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    // Update filters timeRange when dateRange changes
    setFilters((prev) => ({
      ...prev,
      timeRange: {
        start: formatDateTokyo(start),
        end: formatDateTokyo(end),
      },
    }))
  }
  
  // Handle quick date range selection
  const handleQuickRange = (days: number) => {
    const end = getTodayTokyo()
    const start = days === 1 ? end : subDays(end, days - 1)
    handleDateRangeChange(start, end)
  }
  
  // Handle 1 day selection (yesterday)
  const handleOneDay = () => {
    const yesterday = subDays(getTodayTokyo(), 1)
    handleDateRangeChange(yesterday, yesterday)
  }
  
  // Get period days
  const periodDays = getDateRangeDays(dateRange.start, dateRange.end)
  
  // Time range button state (derived from dateRange)
  const timeRange = useMemo(() => {
    if (periodDays === 1) return "1d"
    if (periodDays === 7) return "7d"
    if (periodDays === 14) return "14d"
    if (periodDays === 30) return "30d"
    return "custom"
  }, [periodDays])

  // Data state
  const [kpis, setKpis] = useState<typeof mockSourceKpis | null>(null)
  const [sourceRows, setSourceRows] = useState<typeof mockSourceRows | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Filter and sort state
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedMentioned, setSelectedMentioned] = useState<string>("all") // "all", "yes", "no"
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null) // null = no sort, "asc" = low to high, "desc" = high to low
  const [expandedMentions, setExpandedMentions] = useState<Set<string>>(new Set()) // Track which rows have expanded mentions
  const [currentPage, setCurrentPage] = useState(1)
  const sourcesPerPage = 7

  // Get unique types from sourceRows
  const availableTypes = useMemo(() => {
    if (!sourceRows) return []
    const types = new Set(sourceRows.map((row) => row.type))
    return Array.from(types).sort()
  }, [sourceRows])

  // Filtered and sorted data
  const filteredAndSortedRows = useMemo(() => {
    if (!sourceRows) return []
    
    // Filter by type
    let filtered = sourceRows
    if (selectedType !== "all") {
      filtered = filtered.filter((row) => row.type === selectedType)
    }
    
    // Filter by mentioned
    if (selectedMentioned !== "all") {
      const mentionedValue = selectedMentioned === "yes"
      filtered = filtered.filter((row) => row.mentioned === mentionedValue)
    }
    
    // Sort by Citation Rate (share)
    if (sortOrder !== null) {
      filtered = [...filtered].sort((a, b) => {
        if (sortOrder === "asc") {
          return a.share - b.share
        } else {
          return b.share - a.share
        }
      })
    }
    
    return filtered
  }, [sourceRows, selectedType, selectedMentioned, sortOrder])

  // Pagination
  const totalSources = filteredAndSortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalSources / sourcesPerPage))
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * sourcesPerPage
    const endIndex = startIndex + sourcesPerPage
    return filteredAndSortedRows.slice(startIndex, endIndex)
  }, [filteredAndSortedRows, currentPage, sourcesPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedType, selectedMentioned, sortOrder])

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Load data
  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      simulateLoad(mockSourceKpis, 400),
      simulateLoad(mockSourceRows, 600),
    ])
      .then(([k, s]) => {
        setKpis(k)
        setSourceRows(s)
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [])

  const handleReset = () => {
    const defaultRange = getDefaultDateRange()
    setDateRange(defaultRange)
    setFilters({
      timeRange: { 
        start: formatDateTokyo(defaultRange.start), 
        end: formatDateTokyo(defaultRange.end) 
      },
      brandId: selectedBrandId || undefined,
      productId: selectedProductId || undefined,
      competitorIds: [],
      granularity: "day",
      category: undefined,
      platform: undefined,
    })
  }

  const handleExport = () => {
    console.log("Export", sourceRows?.length || 0)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const handleTypeFilterChange = (value: string) => {
    setSelectedType(value)
  }

  const handleMentionedFilterChange = (value: string) => {
    setSelectedMentioned(value)
  }

  const handleCitationRateSort = () => {
    if (sortOrder === null) {
      setSortOrder("desc") // High to low
    } else if (sortOrder === "desc") {
      setSortOrder("asc") // Low to high
    } else {
      setSortOrder(null) // No sort
    }
  }

  const toggleMentionsExpansion = (sourceId: string) => {
    setExpandedMentions((prev) => {
      const next = new Set(prev)
      if (next.has(sourceId)) {
        next.delete(sourceId)
      } else {
        next.add(sourceId)
      }
      return next
    })
  }

  return (
    <TooltipProvider>
      <div className="bg-background -mx-6">
        {/* Top Filter Bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-2">
          <div className="container mx-auto max-w-[1600px]">
            <div className="flex items-center justify-between">
              {/* Left: Title */}
              <div className="-ml-6">
                <h1 className="text-xl font-semibold text-foreground">Source Analysis</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Analyze brand mention frequency and source distribution in AI answers
                </p>
              </div>

              {/* Right: Filters */}
              <div className="flex items-center gap-3">
                {/* Time Range Selector */}
                <div className="flex items-center gap-2 border-r border-border pr-3">
                  <Button
                    variant={timeRange === "1d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleOneDay()}
                    className="h-8 text-xs"
                  >
                    1 day
                  </Button>
                  <Button
                    variant={timeRange === "7d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickRange(7)}
                    className="h-8 text-xs"
                  >
                    7 days
                  </Button>
                  <Button
                    variant={timeRange === "14d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickRange(14)}
                    className="h-8 text-xs"
                  >
                    14 days
                  </Button>
                  <Button
                    variant={timeRange === "30d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickRange(30)}
                    className="h-8 text-xs"
                  >
                    30 days
                  </Button>
                  <CalendarIconButton
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onDateChange={handleDateRangeChange}
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>

                {/* Export Button */}
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleExport}>
                  <Download className="h-3 w-3 mr-1.5" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto pl-4 pr-4 pt-4 pb-10 max-w-[1600px]">
          <div className="space-y-6">
            {/* Top Source Table */}
            <FadeUp delay={0.1}>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Sources
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getTooltipContent("Sources", language)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-sm text-destructive">Error loading data</div>
                    </div>
                  ) : sourceRows && sourceRows.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-sm text-muted-foreground">
                        No data available. Try adjusting filters.
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col className="w-[30%]" />
                          <col className="w-[15%]" />
                          <col className="w-[15%]" />
                          <col className="w-[20%]" />
                          <col className="w-[20%]" />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                              Source
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span>Type</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                      <HelpCircle className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTooltipContent("Type", language)}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Select value={selectedType} onValueChange={handleTypeFilterChange}>
                                  <SelectTrigger className="h-7 w-[140px] text-xs border-muted-foreground/30 hover:border-muted-foreground/50">
                                    <SelectValue placeholder="ALL" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">ALL</SelectItem>
                                    {availableTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={handleCitationRateSort}
                                  className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                                >
                                  <span>Citation Rate</span>
                                  <div className="flex flex-col">
                                    <ChevronUp 
                                      className={`h-3 w-3 transition-colors ${sortOrder === "desc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                    />
                                    <ChevronDown 
                                      className={`h-3 w-3 -mt-1 transition-colors ${sortOrder === "asc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                    />
                                  </div>
                                </button>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                      <HelpCircle className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTooltipContent("Citation rate", language)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">
                              <div className="flex items-center justify-center gap-2">
                                <span>Mentioned</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                      <HelpCircle className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTooltipContent("Mentioned", language)}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Select value={selectedMentioned} onValueChange={handleMentionedFilterChange}>
                                  <SelectTrigger className="h-7 w-[100px] text-xs border-muted-foreground/30 hover:border-muted-foreground/50">
                                    <SelectValue placeholder="All" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                              <div className="flex items-center justify-end gap-2">
                                <span>Mentions</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                      <HelpCircle className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTooltipContent("Mentions", language)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRows?.map((source) => {
                            const isExpanded = expandedMentions.has(source.id)
                            const firstMention = source.mentions[0] || ""
                            const remainingMentions = source.mentions.slice(1)
                            
                            return (
                              <tr
                                key={source.id}
                                className="border-b border-border hover:bg-accent/50 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{source.url}</span>
                                    <button
                                      onClick={() => handleCopyUrl(source.url)}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                    <a
                                      href={`https://${source.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400"
                                  >
                                    {source.type}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-sm font-medium">
                                    {source.share.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge
                                    className={`text-xs font-medium ${
                                      source.mentioned
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    }`}
                                  >
                                    {source.mentioned ? "Yes" : "No"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex flex-col items-end gap-1">
                                    {source.mentions.length > 0 ? (
                                      <>
                                        <div className="text-sm font-medium">{firstMention}</div>
                                        {remainingMentions.length > 0 && (
                                          <>
                                            {isExpanded ? (
                                              <div className="flex flex-col items-end gap-1 mt-1">
                                                {remainingMentions.map((mention, idx) => (
                                                  <div key={idx} className="text-sm text-muted-foreground">
                                                    {mention}
                                                  </div>
                                                ))}
                                                <button
                                                  onClick={() => toggleMentionsExpansion(source.id)}
                                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-1"
                                                >
                                                  <ChevronUp className="h-3 w-3" />
                                                  Less
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => toggleMentionsExpansion(source.id)}
                                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                              >
                                                <MoreVertical className="h-3 w-3" />
                                                More ({remainingMentions.length})
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">--</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="h-8 w-8 p-0 text-xs"
                                  >
                                    {page}
                                  </Button>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeUp>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
