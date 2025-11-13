"use client"

import { Fragment, useEffect, useMemo, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, Download, ArrowUp, ArrowDown, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FadeUp, StaggerContainer, StaggerItem } from "@/lib/animations"
import { useToast } from "@/hooks/use-toast"
import { PageHeaderFilterBar } from "@/components/filters/PageHeaderFilterBar"
import { DelayedTooltip } from "@/components/overview/DelayedTooltip"
import {
  formatDateShanghai,
  parseDateShanghai,
  getDefaultDateRange,
  getUserRegisteredAt,
  getDateRangeDays,
  getTodayShanghai,
} from "@/lib/date-utils"
import { subDays, format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { useLanguageStore } from "@/store/language.store"
import { translate, getTooltipContent } from "@/lib/i18n"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { MODEL_OPTIONS } from "@/constants/models"
import { CHART_PRIMARY_COLOR, INK_COLORS } from "@/lib/design-tokens"

const RANKING_SECTION_ID = "visibility-ranking-section"

const RANKING_METRIC_OPTIONS: Array<{ value: RankingMetric; label: string }> = [
  { value: "visibility", label: "Visibility" },
  { value: "reach", label: "Reach" },
  { value: "rank", label: "Rank" },
  { value: "focus", label: "Focus" },
]

interface VisibilityHeatmap {
  sources: HeatmapSource[]
  topics: HeatmapTopic[]
  cells: HeatmapCell[]
}

interface HeatmapSource {
  name: string
  slug: string
}

interface HeatmapTopic {
  name: string
  slug: string
}

interface HeatmapCell {
  source: string
  topic: string
  mentionRate: number
  sampleCount: number
  example: string
}

interface VisibilityAPIResponse {
  visibility: {
    ranking: RankingItem[]
    trends: Array<{ date: string; [brandName: string]: string | number }>
  }
  reach: {
    ranking: RankingItem[]
    trends: Array<{ date: string; [brandName: string]: string | number }>
  }
  rank: {
    ranking: RankingItem[]
    trends: Array<{ date: string; [brandName: string]: string | number }>
  }
  focus: {
    ranking: RankingItem[]
    trends: Array<{ date: string; [brandName: string]: string | number }>
  }
  heatmap: VisibilityHeatmap
  actualDateRange?: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
}

type RankingMetric = "visibility" | "reach" | "rank" | "focus"
type VisibilitySummaryMetric = Exclude<RankingMetric, "visibility">

interface RankingItem {
  brand: string
  value: number
  delta: number
  rank: number
  isSelf: boolean
  unit: string
}

export default function VisibilityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { language } = useLanguageStore()
  const { selectedProductId, selectedBrandId } = useBrandUIStore()

  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [displayDateRange, setDisplayDateRange] = useState(getDefaultDateRange())
  const [selectedModel, setSelectedModel] = useState<string>("all")

  const tabParam = searchParams.get("tab") as RankingMetric | null
  const [tab, setTab] = useState<RankingMetric>(tabParam || "visibility")

  const pulseParam = searchParams.get("pulse") as RankingMetric | null
  const [pulsingCard, setPulsingCard] = useState<string | null>(null)

  const [visibilityPage, setVisibilityPage] = useState(1)
  const [reachPage, setReachPage] = useState(1)
  const [rankPage, setRankPage] = useState(1)
  const [focusPage, setFocusPage] = useState(1)

  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  // Use data file's last date (2025-11-06) as maxDate instead of "today"
  // This ensures date range selections don't exceed available data
  const maxDate = useMemo(() => {
    // Data file contains dates from 2025-10-31 to 2025-11-06
    // Use 2025-11-06 as the maximum date
    return parseDateShanghai("2025-11-06")
  }, [])

  useEffect(() => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")

    if (startParam && endParam) {
      try {
        const parsedStart = parseDateShanghai(startParam)
        const parsedEnd = parseDateShanghai(endParam)
        // Ensure dates are within data file bounds
        const dataMinDate = parseDateShanghai("2025-10-31")
        const dataMaxDate = parseDateShanghai("2025-11-06")
        const validatedStart = parsedStart < dataMinDate ? dataMinDate : parsedStart > dataMaxDate ? dataMaxDate : parsedStart
        const validatedEnd = parsedEnd > dataMaxDate ? dataMaxDate : parsedEnd < dataMinDate ? dataMinDate : parsedEnd
        setDateRange({ start: validatedStart, end: validatedEnd })
      } catch {
        // Default: last 7 days within data file (2025-10-31 to 2025-11-06)
        setDateRange({
          start: parseDateShanghai("2025-10-31"),
          end: parseDateShanghai("2025-11-06"),
        })
      }
    } else {
      // Default: last 7 days within data file (2025-10-31 to 2025-11-06)
      setDateRange({
        start: parseDateShanghai("2025-10-31"),
        end: parseDateShanghai("2025-11-06"),
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (pulseParam) {
      setTab(pulseParam)
    } else if (tabParam) {
      setTab(tabParam)
    }
  }, [pulseParam, tabParam])

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString())
    urlParams.set("start", formatDateShanghai(dateRange.start))
    urlParams.set("end", formatDateShanghai(dateRange.end))
    urlParams.set("tz", "Asia/Shanghai")
    urlParams.set("productId", "all")
    urlParams.set("tab", tab)
    urlParams.set("model", selectedModel)

    if (pulseParam) {
      urlParams.delete("pulse")
    }

    router.replace(`/insights/visibility?${urlParams.toString()}`, { scroll: false })
  }, [dateRange, tab, router, searchParams, pulseParam, selectedModel])

  const { data: apiData, isLoading, error } = useQuery<VisibilityAPIResponse>({
    queryKey: [
      "visibility",
      formatDateShanghai(dateRange.start),
      formatDateShanghai(dateRange.end),
      selectedProductId,
      selectedBrandId,
      selectedModel,
    ],
    queryFn: async () => {
      try {
        const startDateStr = formatDateShanghai(dateRange.start)
        const endDateStr = formatDateShanghai(dateRange.end)
        console.log('[Visibility] Fetching data - startDate:', startDateStr, 'endDate:', endDateStr)
        
        const response = await apiClient.get<VisibilityAPIResponse>("/api/visibility", {
          params: {
            startDate: startDateStr,
            endDate: endDateStr,
            productId: selectedProductId || undefined,
            brandId: selectedBrandId || undefined,
            model: selectedModel,
          },
        })
        
        console.log('[Visibility] API response received')
        return response.data
      } catch (error: any) {
        console.error('[Visibility] API error:', error)
        console.error('[Visibility] Error details:', error?.response?.data || error?.message)
        throw error
      }
    },
    staleTime: 0,
  })

  // Update display date range when API returns actual date range
  useEffect(() => {
    if (apiData?.actualDateRange) {
      const actualStart = parseDateShanghai(apiData.actualDateRange.start)
      const actualEnd = parseDateShanghai(apiData.actualDateRange.end)
      setDisplayDateRange({ start: actualStart, end: actualEnd })
      console.log('[Visibility] Updated display date range from API:', apiData.actualDateRange)
    }
  }, [apiData?.actualDateRange])

  const visibilityRankingData = useMemo(() => apiData?.visibility.ranking || [], [apiData])
  const reachRankingData = useMemo(() => apiData?.reach.ranking || [], [apiData])
  const rankRankingData = useMemo(() => apiData?.rank.ranking || [], [apiData])
  const focusRankingData = useMemo(() => apiData?.focus.ranking || [], [apiData])

  const visibilityTrendData = useMemo(() => {
    if (!apiData) return []
    const trend = apiData.visibility.trends
    const selfBrand = apiData.visibility.ranking.find((item) => item.isSelf)?.brand
    if (!selfBrand) return []

    return trend.map((point) => {
      const rawValue = point[selfBrand]
      const value = typeof rawValue === "number" ? rawValue : parseFloat(rawValue as string) || 0
      return {
        date: format(new Date(point.date), "MM/dd"),
        fullDate: point.date,
        value,
      }
    })
  }, [apiData])

  const metricsData = useMemo(() => {
    if (!apiData) {
      return {
        visibility: { value: 0, growth: 0, unit: "" },
        reach: { value: 0, growth: 0, unit: "" },
        rank: { value: 0, growth: 0, unit: "" },
        focus: { value: 0, growth: 0, unit: "" },
      }
    }

    const visibilityItem = apiData.visibility.ranking.find((item) => item.isSelf)
    const reachItem = apiData.reach.ranking.find((item) => item.isSelf)
    const rankItem = apiData.rank.ranking.find((item) => item.isSelf)
    const focusItem = apiData.focus.ranking.find((item) => item.isSelf)

    return {
      visibility: {
        value: visibilityItem?.value || 0,
        growth: visibilityItem?.delta || 0,
        unit: visibilityItem?.unit || "",
      },
      reach: {
        value: reachItem?.value || 0,
        growth: reachItem?.delta || 0,
        unit: reachItem?.unit || "",
      },
      rank: {
        value: rankItem?.value || 0,
        growth: rankItem?.delta || 0,
        unit: rankItem?.unit || "",
      },
      focus: {
        value: focusItem?.value || 0,
        growth: focusItem?.delta || 0,
        unit: focusItem?.unit || "",
      },
    }
  }, [apiData])

  const summaryCards = useMemo(() => {
    const labelMap: Record<VisibilitySummaryMetric, { zh: string; en: string }> = {
      reach: { zh: "Reach", en: "Reach" },
      rank: { zh: "Rank", en: "Rank" },
      focus: { zh: "Focus", en: "Focus" },
    }

    return [
      {
        key: "reach" as const,
        label: language === "zh-TW" ? labelMap.reach.zh : labelMap.reach.en,
        value: metricsData.reach.value,
        unit: metricsData.reach.unit,
        delta: metricsData.reach.growth,
      },
      {
        key: "rank" as const,
        label: language === "zh-TW" ? labelMap.rank.zh : labelMap.rank.en,
        value: metricsData.rank.value,
        unit: metricsData.rank.unit,
        delta: metricsData.rank.growth,
      },
      {
        key: "focus" as const,
        label: language === "zh-TW" ? labelMap.focus.zh : labelMap.focus.en,
        value: metricsData.focus.value,
        unit: metricsData.focus.unit,
        delta: metricsData.focus.growth,
      },
    ]
  }, [language, metricsData])

  const heatmapData = useMemo(() => apiData?.heatmap ?? null, [apiData])

  const heatmapCellsMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    heatmapData?.cells.forEach((cell) => {
      map.set(`${cell.source}__${cell.topic}`, cell)
    })
    return map
  }, [heatmapData])

  const heatmapMaxRate = useMemo(() => {
    if (!heatmapData || heatmapData.cells.length === 0) return 0
    return Math.max(...heatmapData.cells.map((cell) => cell.mentionRate))
  }, [heatmapData])

  const [heatmapDialogOpen, setHeatmapDialogOpen] = useState(false)
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<HeatmapCell | null>(null)

  const handleMetricCardClick = useCallback(
    (metric: VisibilitySummaryMetric) => {
      setTab(metric)
      setPulsingCard(metric)

      requestAnimationFrame(() => {
        const container = document.getElementById(RANKING_SECTION_ID)
        if (container) {
          container.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      })

      setTimeout(() => {
        setPulsingCard(null)
      }, 1500)
    },
    []
  )

  const buildNavigationQuery = useCallback(
    (path: string, extra: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        start: formatDateShanghai(dateRange.start),
        end: formatDateShanghai(dateRange.end),
      })
      if (selectedModel && selectedModel !== "all") {
        params.set("model", selectedModel)
      }
      Object.entries(extra).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })
      router.push(`${path}?${params.toString()}`)
    },
    [dateRange.end, dateRange.start, selectedModel, router]
  )

  const handleTopicNavigate = useCallback(
    (topic: HeatmapTopic) => {
      buildNavigationQuery("/insights/intent", { topic: topic.slug })
    },
    [buildNavigationQuery]
  )

  const handleSourceNavigate = useCallback(
    (source: HeatmapSource) => {
      buildNavigationQuery("/insights/sources", { source: source.slug })
    },
    [buildNavigationQuery]
  )

  const handleHeatmapCellClick = useCallback((cell: HeatmapCell | null) => {
    if (!cell) return
    setSelectedHeatmapCell(cell)
    setHeatmapDialogOpen(true)
  }, [])

  const handleHeatmapDialogChange = useCallback((open: boolean) => {
    setHeatmapDialogOpen(open)
    if (!open) {
      setSelectedHeatmapCell(null)
    }
  }, [])

  useEffect(() => {
    if (pulseParam) {
      setPulsingCard(pulseParam)
      setTimeout(() => {
        const container = document.getElementById(RANKING_SECTION_ID)
        if (container) {
          container.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)

      const timer = setTimeout(() => {
        setPulsingCard(null)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [pulseParam])

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    setVisibilityPage(1)
    setReachPage(1)
    setRankPage(1)
    setFocusPage(1)
  }

  const handleQuickRange = (days: number) => {
    const end = getTodayShanghai()
    const start = days === 1 ? end : subDays(end, days - 1)
    handleDateRangeChange(start, end)
  }

  const handleOneDay = () => {
    const endDate = new Date("2025-11-05")
    const startDate = new Date("2025-11-04")
    handleDateRangeChange(startDate, endDate)
  }

  const handleTabChange = (newTab: RankingMetric) => {
    setTab(newTab)
    setPulsingCard(newTab)
    requestAnimationFrame(() => {
      const container = document.getElementById(RANKING_SECTION_ID)
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    })
    setTimeout(() => setPulsingCard(null), 1200)
  }

  const periodDays = getDateRangeDays(dateRange.start, dateRange.end)
  const dateDiffMs = dateRange.end.getTime() - dateRange.start.getTime()
  const isOneDay = periodDays <= 2 && dateDiffMs <= 172800000


  const selectedRankingLabel = useMemo(() => {
    const option = RANKING_METRIC_OPTIONS.find((item) => item.value === tab)
    return option ? option.label : "Visibility"
  }, [tab])

  const handleExport = () => {
    toast({ title: language === "zh-TW" ? "導出功能" : "Export", description: language === "zh-TW" ? "導出功能開發中" : "Export is under development." })
  }

  const getMetricLabel = (metric: RankingMetric) => {
    switch (metric) {
      case "visibility":
        return "Visibility"
      case "reach":
        return "Reach"
      case "rank":
        return "Rank"
      case "focus":
        return "Focus"
    }
  }

  const getRankingData = (metric: RankingMetric): RankingItem[] => {
    switch (metric) {
      case "visibility":
        return visibilityRankingData
      case "reach":
        return reachRankingData
      case "rank":
        return rankRankingData
      case "focus":
        return focusRankingData
    }
  }

  const renderRankingContent = (
    metric: RankingMetric,
    currentPage: number,
    setCurrentPage: (page: number) => void
  ) => {
    const rankingItems = getRankingData(metric)
    const selfBrand = rankingItems.find((item) => item.isSelf)
    const brandsPerPage = 7
    const totalBrands = rankingItems.length
    const totalPages = Math.max(1, Math.ceil(totalBrands / brandsPerPage))

    const startIndex = (currentPage - 1) * brandsPerPage
    const endIndex = startIndex + brandsPerPage
    const paginatedBrands = rankingItems.slice(startIndex, endIndex)

    const formatDeltaValue = (delta: number, unit?: string) => {
      if (!Number.isFinite(delta) || delta === 0) return "—"
      if (metric === "rank") {
        return Math.abs(Math.round(delta)).toString()
      }
      const suffix = unit || "%"
      return `${Math.abs(delta).toFixed(1)}${suffix}`
    }

    const formatValue = (value: number, unit: string) => {
      if (!Number.isFinite(value)) return "--"
      const suffix = unit || (metric === "rank" ? "" : "%")
      return `${value.toFixed(metric === "rank" ? 1 : 1)}${suffix}`
    }

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }

    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1)
      }
    }

    const handlePageClick = (page: number) => {
      setCurrentPage(page)
    }

    return (
      <div className="flex-1 flex flex-col gap-1">
        {selfBrand && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-md border border-brand-600 bg-brand-50 px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 bg-brand-600 text-white">
                {selfBrand.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <DelayedTooltip content={selfBrand.brand}>
                                    <span className="font-medium text-xs truncate text-ink-900">
                                      {translate(selfBrand.brand, language)}
                                    </span>
                                  </DelayedTooltip>
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 border-ink-200 text-ink-600">
                                    You
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 ml-4">
                              {selfBrand.delta && selfBrand.delta !== 0 ? (
                                <>
                                  {selfBrand.delta > 0 ? (
                                    <div className="flex items-center gap-1 text-ink-600">
                                      <ArrowUp className="h-3 w-3" />
                                      <span className="text-xs font-medium">{formatDeltaValue(selfBrand.delta, selfBrand.unit)}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-ink-600">
                                      <ArrowDown className="h-3 w-3" />
                                      <span className="text-xs font-medium">{formatDeltaValue(selfBrand.delta, selfBrand.unit)}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-ink-500">
                                  <span className="text-xs font-medium">—</span>
                                </div>
                              )}
                              <span className="text-xs font-medium text-ink-900">
                                {formatValue(selfBrand.value, selfBrand.unit)}
                              </span>
                            </div>
                          </motion.div>
                        )}
        
                        {selfBrand && <div className="border-t border-ink-200 my-0.5" />}

        <div className="flex-1 flex flex-col gap-1">
          {paginatedBrands.map((item, index) => (
            <motion.div
              key={`${metric}-${item.brand}-${item.rank}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
                            className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 transition-colors ${
                              item.isSelf ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white hover:bg-ink-50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${
                                  item.isSelf ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600"
                                }`}
                              >
                                {item.rank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <DelayedTooltip content={item.brand}>
                                    <span className="font-medium text-xs truncate text-ink-900">
                                      {translate(item.brand, language)}
                                    </span>
                                  </DelayedTooltip>
                                  {item.isSelf && (
                                    <Badge variant="outline" className="text-2xs px-1.5 py-0 border-brand-600 text-brand-600">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 ml-4">
                              {item.delta && item.delta !== 0 ? (
                                <>
                                  {item.delta > 0 ? (
                                    <div className="flex items-center gap-1 text-ink-600">
                                      <ArrowUp className="h-3 w-3" />
                                      <span className="text-xs font-medium">{formatDeltaValue(item.delta, item.unit)}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-ink-600">
                                      <ArrowDown className="h-3 w-3" />
                                      <span className="text-xs font-medium">{formatDeltaValue(item.delta, item.unit)}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-ink-500">
                                  <span className="text-xs font-medium">—</span>
                                </div>
                              )}
                              <span className="text-xs font-medium text-ink-900">
                                {formatValue(item.value, item.unit)}
                              </span>
                            </div>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-3 pt-3 border-t border-ink-200">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0 border-ink-200 disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className={`h-7 w-7 p-0 text-xs transition-colors ${
                      currentPage === page ? "bg-brand-600 text-white border-brand-600" : "border-ink-200 hover:bg-ink-50"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0 border-ink-200 disabled:opacity-50"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Loading visibility data...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait</div>
        </div>
      </div>
    )
  }

  if (error || !apiData) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Failed to load visibility data</div>
          <div className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Please try again later"}
          </div>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="text-xs text-muted-foreground mt-4 max-w-md">
              {JSON.stringify(error, null, 2)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="bg-background -mx-6">
        <PageHeaderFilterBar
          title={language === "zh-TW" ? "可見度分析" : "Visibility Insights"}
          description={
            language === "zh-TW"
              ? "分析品牌可見度指標：Reach、Rank 和 Focus"
              : "Analyze brand visibility metrics: Reach, Rank, and Focus"
          }
          startDate={displayDateRange.start}
          endDate={displayDateRange.end}
          onDateChange={handleDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onExport={handleExport}
          showExport={true}
        />

        <div className="container mx-auto px-4 sm:px-pageX py-3 sm:py-4 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4 items-stretch">
            <div className="lg:col-span-5 space-y-4">
              <StaggerContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {summaryCards.map((card) => {
                    const hasValue = Number.isFinite(card.value) && typeof card.value === "number"
                    const displayValue = hasValue ? card.value.toFixed(card.unit === "%" ? 1 : 1) : "--"
                    const hasDelta = Number.isFinite(card.delta) && typeof card.delta === "number"
                    const deltaValue = hasDelta ? Math.abs(card.delta as number).toFixed(1) : "--"
                    const delta = (card.delta as number) || 0

                    return (
                      <StaggerItem key={card.key}>
                        <div
                          className="rounded-lg border border-ink-200 bg-white p-4 h-full cursor-pointer shadow-subtle transition-all hover:bg-ink-50 hover:shadow-md hover:border-brand-300"
                          onClick={() => handleMetricCardClick(card.key)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-ink-500">{card.label}</div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-ink-400 hover:text-ink-600 transition-colors">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{getTooltipContent(card.label, language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <span className="text-2xl font-semibold text-ink-900">
                              {displayValue}
                              {card.unit && (
                                <span className="text-xs font-medium ml-1 text-ink-500">{card.unit}</span>
                              )}
                            </span>
                            {hasDelta && delta !== 0 ? (
                              <div className="flex items-center gap-1 text-xs font-medium text-ink-600">
                                {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                <span>{deltaValue}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-ink-400">—</span>
                            )}
                          </div>
                        </div>
                      </StaggerItem>
                    )
                  })}
                </div>
              </StaggerContainer>

              <FadeUp delay={0.1}>
                <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink-900">
                        {language === "zh-TW" ? "Visibility 趨勢" : "Visibility Trend"}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-ink-400 hover:text-ink-600 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{getTooltipContent("Trend", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-2xs text-ink-500">
                      {language === "zh-TW"
                        ? "指標：Visibility（combined_score%）"
                        : "Metric: Visibility (combined_score%)"}
                    </span>
                  </div>
                  <div className="mb-3 flex items-baseline gap-4">
                    <span className="text-2xl font-semibold text-ink-900">
                      {metricsData.visibility.value?.toFixed(1)}
                      {metricsData.visibility.unit && (
                        <span className="text-xs font-medium ml-1 text-ink-500">
                          {metricsData.visibility.unit}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-ink-600">
                      {metricsData.visibility.growth > 0 ? (
                        <>
                          <ArrowUp className="h-3.5 w-3.5" />
                          <span>{Math.abs(metricsData.visibility.growth).toFixed(1)}</span>
                        </>
                      ) : metricsData.visibility.growth < 0 ? (
                        <>
                          <ArrowDown className="h-3.5 w-3.5" />
                          <span>{Math.abs(metricsData.visibility.growth).toFixed(1)}</span>
                        </>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                      <span className="text-xs text-ink-500 ml-1">
                        {isOneDay ? "vs previous day" : `vs previous ${periodDays} days`}
                      </span>
                    </div>
                  </div>
                  {!visibilityTrendData || visibilityTrendData.length === 0 ? (
                    <div className="h-[300px] w-full bg-ink-50 rounded-md flex items-center justify-center border border-dashed border-ink-200">
                      <div className="text-center">
                        <div className="text-sm text-ink-500 mb-1">
                          {language === "zh-TW" ? "無可用的 Visibility 趨勢資料" : "No visibility trend data"}
                        </div>
                        <div className="text-xs text-ink-400">
                          {language === "zh-TW" ? "請調整篩選條件後再試" : "Try adjusting your filters"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={visibilityTrendData} margin={{ top: 10, right: 16, left: 12, bottom: 8 }}>
                          <CartesianGrid stroke="#EEF2F7" vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke={INK_COLORS[500]}
                            style={{ fontSize: "11px" }}
                            tick={{ fill: INK_COLORS[500] }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            stroke={INK_COLORS[500]}
                            style={{ fontSize: "11px" }}
                            tick={{ fill: INK_COLORS[500] }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value.toFixed(1)}`}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: `1px solid ${INK_COLORS[200]}`,
                              borderRadius: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                            }}
                            labelStyle={{ color: INK_COLORS[900], marginBottom: "4px" }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, language === "zh-TW" ? "Visibility" : "Visibility"]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={CHART_PRIMARY_COLOR}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: CHART_PRIMARY_COLOR, stroke: "white", strokeWidth: 2 }}
                            name={language === "zh-TW" ? "本品牌" : "Self brand"}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </FadeUp>

            </div>

            <div className="lg:col-span-2 flex flex-col">
              <FadeUp delay={0.2}>
                <div
                  id={RANKING_SECTION_ID}
                  className={`rounded-lg border border-ink-200 bg-white p-4 flex-1 flex flex-col shadow-subtle hover:shadow-md transition-all ${
                    pulsingCard === tab ? "animate-pulse" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-ink-900">
                        {language === "zh-TW" ? "排名" : "Ranking"}
                      </h2>
                    </div>
                    <Select value={tab} onValueChange={(value) => handleTabChange(value as RankingMetric)}>
                      <SelectTrigger
                        className={`w-[140px] h-9 text-xs border-ink-200 transition-colors ${
                          tab === "visibility" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-700 hover:bg-ink-50"
                        }`}
                      >
                        <SelectValue>{selectedRankingLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {RANKING_METRIC_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    {(() => {
                      const pagination = (() => {
                        switch (tab) {
                          case "visibility":
                            return { page: visibilityPage, setPage: setVisibilityPage }
                          case "reach":
                            return { page: reachPage, setPage: setReachPage }
                          case "rank":
                            return { page: rankPage, setPage: setRankPage }
                          case "focus":
                          default:
                            return { page: focusPage, setPage: setFocusPage }
                        }
                      })()
                      return renderRankingContent(tab, pagination.page, pagination.setPage)
                    })()}
                  </div>
                </div>
              </FadeUp>
            </div>

            <div className="lg:col-span-7">
              <FadeUp delay={0.18}>
                <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink-900">
                        {language === "zh-TW" ? "Visibility 熱力圖" : "Visibility Heatmap"}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-ink-400 hover:text-ink-600 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs text-ink-900">{getTooltipContent("Visibility Heatmap", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                      <span className="text-2xs text-ink-500">
                        {language === "zh-TW" ? "來源 × 主題的提及強度" : "Source × Topic mention intensity"}
                      </span>
                  </div>

                  {heatmapData && heatmapData.sources.length > 0 && heatmapData.topics.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div
                        className="w-full grid border border-ink-100 rounded-lg text-xs text-ink-600"
                        style={{ gridTemplateColumns: `minmax(140px, 1fr) repeat(${heatmapData.topics.length}, 1fr)` }}
                      >
                        <div className="sticky left-0 top-0 z-10 bg-white px-4 py-2 border-b border-r border-ink-100 font-medium text-ink-500">
                          {language === "zh-TW" ? "來源 / 主題" : "Source / Topic"}
                        </div>
                        {heatmapData.topics.map((topic) => (
                          <div
                            key={topic.slug}
                            className="px-4 py-2 border-b border-ink-100 text-left font-medium text-ink-700"
                          >
                            {topic.name}
                          </div>
                        ))}

                        {heatmapData.sources.map((source) => (
                          <Fragment key={source.slug}>
                            <button
                              type="button"
                              onClick={() => handleSourceNavigate(source)}
                              className="sticky left-0 z-10 bg-white px-4 py-3 border-t border-r border-ink-100 text-left font-medium text-ink-700 transition-colors hover:text-brand-600"
                            >
                              {source.name}
                            </button>
                            {heatmapData.topics.map((topic) => {
                              const key = `${source.name}__${topic.name}`
                              const cell = heatmapCellsMap.get(key)
                              const value = cell?.mentionRate ?? 0
                              const intensity = heatmapMaxRate > 0 ? value / heatmapMaxRate : 0
                              const background =
                                value > 0 ? `rgba(19, 69, 140, ${(0.15 + intensity * 0.65).toFixed(2)})` : INK_COLORS[100]

                              return (
                                <Tooltip key={key}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => handleHeatmapCellClick(cell ?? null)}
                                      className="px-4 py-3 border-t border-ink-100 text-left transition-colors"
                                      style={{ backgroundColor: background }}
                                    >
                                      <div className="text-sm font-semibold text-ink-900">
                                        {value.toFixed(1)}%
                                      </div>
                                      <div className="text-2xs text-ink-600">
                                        {language === "zh-TW" ? "樣本" : "Samples"}: {cell?.sampleCount ?? 0}
                                      </div>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs text-ink-900">
                                      {language === "zh-TW" ? "提及率" : "Mention rate"}: {value.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-ink-500 mt-1">
                                      {language === "zh-TW" ? "樣本數" : "Samples"}: {cell?.sampleCount ?? 0}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-md border border-dashed border-ink-200 py-12">
                      <span className="text-xs text-ink-500">
                        {language === "zh-TW" ? "此篩選條件下暫無熱力圖資料" : "No heatmap data for the selected filters."}
                      </span>
                    </div>
                  )}
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={heatmapDialogOpen} onOpenChange={handleHeatmapDialogChange}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {language === "zh-TW" ? "來源 × 主題詳情" : "Source × Topic Insight"}
            </DialogTitle>
            <DialogDescription>
              {language === "zh-TW"
                ? "查看模型在特定來源與主題下提到品牌的情境"
                : "Understand how models mention the brand for this source/topic pair."}
            </DialogDescription>
          </DialogHeader>
          {selectedHeatmapCell ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{selectedHeatmapCell.source}</p>
                  <p className="text-xs text-ink-500">{selectedHeatmapCell.topic}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-ink-900">
                    {selectedHeatmapCell.mentionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-ink-500">
                    {language === "zh-TW" ? "提及率" : "Mention rate"}
                  </p>
                </div>
              </div>
              <div className="rounded-md bg-ink-50 px-3 py-2">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                  {language === "zh-TW" ? "模型示例" : "Model example"}
                </p>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                  {selectedHeatmapCell.example}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>{language === "zh-TW" ? "樣本數" : "Sample size"}</span>
                <span>{selectedHeatmapCell.sampleCount}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-500">
              {language === "zh-TW"
                ? "選擇任意來源 × 主題單元格以查看詳情"
                : "Select a heatmap cell to see detailed context."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
