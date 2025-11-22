"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Copy, ChevronDown, ChevronUp, MoreVertical, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react"
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
import { PageHeaderFilterBar } from "@/components/filters/PageHeaderFilterBar"
import { FadeUp } from "@/lib/animations"
import { mockSourceRows, simulateLoad } from "@/mocks/sources"
import {
  formatDateShanghai,
  parseDateShanghai,
  getDefaultDateRange,
  getUserRegisteredAt,
  getDateRangeDays,
  getTodayShanghai,
} from "@/lib/date-utils"
import { subDays, differenceInDays } from "date-fns"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import { getTooltipContent, translate, getSourceTypePurpose } from "@/lib/i18n"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import type { SourceFilters } from "@/types/sources"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, LabelList } from "recharts"
import { MODEL_OPTIONS } from "@/constants/models"
import type { ModelOptionValue } from "@/constants/models"
import { useSearchParams } from "next/navigation"

type RangeKey = "1d" | "7d" | "14d" | "30d"

export default function SourcesPage() {
  const { selectedBrandId, selectedProductId } = useBrandUIStore()
  const { language } = useLanguageStore()
  const searchParams = useSearchParams()

  // Initialize model from URL or default to "all"
  const [selectedModel, setSelectedModel] = useState<ModelOptionValue>(
    (searchParams.get("model") as ModelOptionValue) || "all"
  )

  // Time range state
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [isExporting, setIsExporting] = useState(false)
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayShanghai(), [])

  // Filters state
  const [filters, setFilters] = useState<SourceFilters>({
    timeRange: { 
      start: formatDateShanghai(dateRange.start), 
      end: formatDateShanghai(dateRange.end) 
    },
    brandId: selectedBrandId || undefined,
    productId: selectedProductId || undefined,
    competitorIds: [],
    granularity: "day",
    category: undefined,
    platform: undefined,
    model: selectedModel,
  })
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    // Update filters timeRange when dateRange changes
    setFilters((prev) => ({
      ...prev,
      timeRange: {
        start: formatDateShanghai(start),
        end: formatDateShanghai(end),
      },
    }))
  }

  // Handle model change
  const handleModelChange = (model: ModelOptionValue) => {
    setSelectedModel(model)
    setFilters((prev) => ({
      ...prev,
      model: model,
    }))
  }

  // Data state
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
    simulateLoad(mockSourceRows, 600)
      .then((rows) => {
        setSourceRows(rows)
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [])

  // Export functions
  const handleExportCSV = () => {
    if (!sourceRows || isExporting) return
    setIsExporting(true)
    
    try {
      const csvData = sourceRows.map((source) => ({
        Source: source.url,
        Type: source.type,
        "Citation Rate": `${source.share.toFixed(1)}%`,
        Mentioned: source.mentioned ? "Yes" : "No",
        Mentions: source.mentions.join("; "),
      }))
      
      exportToCSV(
        csvData,
        `sources_${formatDateShanghai(dateRange.start)}_${formatDateShanghai(dateRange.end)}.csv`
      )
    } catch (error) {
      console.error("Error exporting CSV:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    if (!sourceRows || isExporting) return
    setIsExporting(true)
    
    try {
      let content = `<table>
        <tr><th>Source</th><th>Type</th><th>Citation Rate</th><th>Mentioned</th><th>Mentions</th></tr>`
      
      sourceRows.forEach((source) => {
        const mentions = source.mentions.join(", ")
        content += `<tr>
          <td>${source.url}</td>
          <td>${source.type}</td>
          <td>${source.share.toFixed(1)}%</td>
          <td>${source.mentioned ? "Yes" : "No"}</td>
          <td>${mentions || "--"}</td>
        </tr>`
      })
      
      content += `</table>`
      
      exportToPDF("Sources Analysis Report", content)
    } catch (error) {
      console.error("Error exporting PDF:", error)
    } finally {
      setIsExporting(false)
    }
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

  const sourceColorPalette = ["#2563EB", "#13458c", "#38BDF8", "#6366F1", "#22C55E", "#D946EF", "#F97316"] // Keep original palette for chart variety

  const topSourceDistribution = useMemo(() => {
    if (!sourceRows) return []
    return [...sourceRows]
      .sort((a, b) => b.share - a.share)
      .slice(0, 6)
      .map((row, index) => ({
        id: row.id,
        type: row.type,
        share: Math.max(0, Math.min(100, row.share)),
        brandShare: Math.max(0, Math.min(100, row.mentionRate ?? 0)),
        mentioned: row.mentioned,
        palette: sourceColorPalette[index % sourceColorPalette.length],
      }))
  }, [sourceRows])

  return (
    <TooltipProvider>
      <div className="bg-background -mx-6">
        <PageHeaderFilterBar
          title={language === "zh-TW" ? "來源" : "Source"}
          description={
            language === "zh-TW"
              ? "分析 AI 回答中的品牌提及頻率和來源分佈"
              : "Analyze brand mention frequency and source distribution in AI answers"
          }
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={handleDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          showModelSelector={false}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-pageX py-3 sm:py-4 max-w-[1600px]">
          <div className="space-y-4 sm:space-y-6">
            {/* Top Source Table */}
            <FadeUp delay={0.12}>
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
                          <tr className="border-b border-ink-200 bg-ink-50/50">
                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-700">
                              Source
                            </th>
                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-700">
                              <div className="flex items-center gap-2">
                                <span>Type</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-ink-400 hover:text-ink-600 transition-colors">
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
                            <th className="text-center py-3 px-4 text-xs font-semibold text-ink-700">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={handleCitationRateSort}
                                  className="flex items-center justify-center gap-1 hover:text-ink-900 transition-colors group"
                                >
                                  <span>Citation Rate</span>
                                  <div className="flex flex-col">
                                    <ChevronUp 
                                      className={`h-3 w-3 transition-colors ${sortOrder === "desc" ? "text-brand-600" : "text-ink-300 group-hover:text-ink-400"}`} 
                                    />
                                    <ChevronDown 
                                      className={`h-3 w-3 -mt-1 transition-colors ${sortOrder === "asc" ? "text-brand-600" : "text-ink-300 group-hover:text-ink-400"}`} 
                                    />
                                  </div>
                                </button>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-ink-400 hover:text-ink-600 transition-colors">
                                      <HelpCircle className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getTooltipContent("Citation rate", language)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-ink-700">
                              <div className="flex items-center justify-center gap-2">
                                <span>Mentioned</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-ink-400 hover:text-ink-600 transition-colors">
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
                            <th className="text-right py-3 px-4 text-xs font-semibold text-ink-700">
                              <div className="flex items-center justify-end gap-2">
                                <span>Mentions</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="text-ink-400 hover:text-ink-600 transition-colors">
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
                        <tbody className="divide-y divide-ink-100">
                          {paginatedRows?.map((source) => {
                            const isExpanded = expandedMentions.has(source.id)
                            const firstMention = source.mentions[0] || ""
                            const remainingMentions = source.mentions.slice(1)
                            
                            return (
                              <tr
                                key={source.id}
                                className="border-b border-ink-100 hover:bg-ink-50 transition-colors"
                              >
                                <td className="py-2.5 px-3 text-sm text-ink-900">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{source.url}</span>
                                    <button
                                      onClick={() => handleCopyUrl(source.url)}
                                      className="text-ink-400 hover:text-ink-600 transition-colors"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                    <a
                                      href={`https://${source.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-ink-400 hover:text-ink-600 transition-colors"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-sm text-ink-900">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 cursor-help"
                                      >
                                        {translate(source.type, language)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs font-medium">{translate(source.type, language)}</p>
                                      <p className="text-xs text-ink-500 mt-1">{getSourceTypePurpose(source.type, language)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="text-sm font-medium">
                                    {source.share.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
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
                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {source.mentions.length > 0 ? (
                                      <>
                                        <span className="text-sm font-medium">{firstMention}</span>
                                        {remainingMentions.length > 0 && (
                                          <>
                                            {isExpanded ? (
                                              <div className="flex flex-col items-end gap-1">
                                                {remainingMentions.map((mention, idx) => (
                                                  <span key={idx} className="text-sm text-muted-foreground">
                                                    {mention}
                                                  </span>
                                                ))}
                                                <button
                                                  onClick={() => toggleMentionsExpansion(source.id)}
                                                  className="text-xs text-ink-500 hover:text-ink-700 transition-colors flex items-center gap-1"
                                                >
                                                  <ChevronUp className="h-3 w-3" />
                                                  Less
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => toggleMentionsExpansion(source.id)}
                                                className="text-xs text-ink-500 hover:text-ink-700 transition-colors flex items-center gap-1"
                                              >
                                                <MoreVertical className="h-3 w-3" />
                                                More ({remainingMentions.length})
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-ink-400">--</span>
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
                        <div className="mt-3 pt-3 border-t border-ink-200">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-7 w-7 p-0 border-ink-200 disabled:opacity-50"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </Button>
                              <div className="flex items-center gap-2 px-3 text-sm text-gray-700">
                                <span>{currentPage} / {totalPages}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-7 w-7 p-0 border-ink-200 disabled:opacity-50"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
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

            {/* 不同來源類別的佔比情況功能暂时隐藏，后续版本会补上 */}
            {/* Sources Distribution feature temporarily hidden, will be added in future version */}
            {/* 
            {!loading && !error && topSourceDistribution.length > 0 && (
              <FadeUp delay={0.18}>
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {translate("Sources Distribution", language)}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipContent("Sources Distribution", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {topSourceDistribution.map((source) => {
                        const primaryValue = source.share
                        const secondaryValue = source.brandShare

                        return (
                          <div key={source.id} className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-sm font-semibold text-ink-900 cursor-help">
                                    {translate(source.type, language)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs font-medium">{translate(source.type, language)}</p>
                                  <p className="text-xs text-ink-500 mt-1">{getSourceTypePurpose(source.type, language)}</p>
                                </TooltipContent>
                              </Tooltip>
                              <div className="text-xs font-medium text-ink-600 text-right">
                                <span className="text-ink-900">{primaryValue.toFixed(0)}%</span>
                                <span className="mx-1 text-ink-400">vs</span>
                                <span className="text-ink-500">{secondaryValue.toFixed(0)}%</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-2xs text-ink-500">
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="inline-flex h-2 w-2 rounded-full"
                                    style={{ backgroundColor: source.palette }}
                                  />
                                  {language === "zh-TW" ? "所有引用" : "Total mentions"}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  {language === "zh-TW" ? "提及品牌" : "Mentions brand"}
                                  <span className="inline-flex h-2 w-2 rounded-full bg-ink-400/60" />
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 items-center">
                                <div className="relative h-2 rounded-full bg-ink-200 overflow-hidden">
                                  <div
                                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                                    style={{ width: `${primaryValue}%`, backgroundColor: source.palette }}
                                  />
                                </div>
                                <div className="relative h-2 rounded-full bg-ink-100 overflow-hidden">
                                  <div
                                    className="absolute right-0 top-0 h-full rounded-full bg-ink-400/60 transition-all"
                                    style={{ width: `${Math.min(secondaryValue, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            )}
            */}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
