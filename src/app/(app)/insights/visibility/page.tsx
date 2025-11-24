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
import { exportToCSV } from "@/lib/export-utils"
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

// RANKING_METRIC_OPTIONS will be created dynamically with translations

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

  // Trend metric selector state
  const [trendMetric, setTrendMetric] = useState<RankingMetric>("visibility")

  const minDate = useMemo(() => parseDateShanghai("2025-11-13"), [])
  // Use data file's last date (2025-11-20) as maxDate instead of "today"
  // This ensures date range selections don't exceed available data
  const maxDate = useMemo(() => {
    // Data file contains dates from 2025-11-13 to 2025-11-20
    // Use 2025-11-20 as the maximum date
    return parseDateShanghai("2025-11-20")
  }, [])

  useEffect(() => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")

    if (startParam && endParam) {
      try {
        const parsedStart = parseDateShanghai(startParam)
        const parsedEnd = parseDateShanghai(endParam)
        // Ensure dates are within data file bounds
        const dataMinDate = parseDateShanghai("2025-11-13")
        const dataMaxDate = parseDateShanghai("2025-11-20")
        const validatedStart = parsedStart < dataMinDate ? dataMinDate : parsedStart > dataMaxDate ? dataMaxDate : parsedStart
        const validatedEnd = parsedEnd > dataMaxDate ? dataMaxDate : parsedEnd < dataMinDate ? dataMinDate : parsedEnd
        setDateRange({ start: validatedStart, end: validatedEnd })
      } catch {
        // Default: last 7 days within data file (2025-11-14 to 2025-11-20)
        setDateRange({
          start: parseDateShanghai("2025-11-14"),
          end: parseDateShanghai("2025-11-20"),
        })
      }
    } else {
      // Default: last 7 days within data file (2025-11-14 to 2025-11-20)
      setDateRange({
        start: parseDateShanghai("2025-11-14"),
        end: parseDateShanghai("2025-11-20"),
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
      language,
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
            language: language,
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

  // 生成基于品牌名的伪随机排名变化（确保每次渲染结果一致）
  const getRandomRankDelta = useCallback((brandName: string): number => {
    // 使用品牌名作为种子生成伪随机数
    let hash = 0
    for (let i = 0; i < brandName.length; i++) {
      const char = brandName.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    // 生成 -3 到 +3 之间的随机排名变化
    const random = Math.abs(hash) % 7 // 0-6
    return random - 3 // -3 to +3
  }, [])

  // 为排名数据保留 API 返回的 delta 值
  const processRankingData = useCallback((ranking: RankingItem[]): RankingItem[] => {
    // 保留 API 返回的 delta 值
    return ranking.map((item) => {
      return {
        ...item,
        // 使用 API 返回的 delta 值，如果没有则保持为0
        delta: item.delta ?? 0,
        // value 和 unit 保持不变（Visibility 的原有逻辑）
      }
    })
  }, [])

  const visibilityRankingData = useMemo(() => {
    const raw = apiData?.visibility.ranking || []
    return processRankingData(raw)
  }, [apiData, processRankingData])
  
  const reachRankingData = useMemo(() => {
    const raw = apiData?.reach.ranking || []
    return processRankingData(raw)
  }, [apiData, processRankingData])
  
  const rankRankingData = useMemo(() => {
    const raw = apiData?.rank.ranking || []
    return processRankingData(raw)
  }, [apiData, processRankingData])
  
  const focusRankingData = useMemo(() => {
    const raw = apiData?.focus.ranking || []
    return processRankingData(raw)
  }, [apiData, processRankingData])

  // Dynamic trend data based on selected metric
  const trendData = useMemo(() => {
    if (!apiData) return []
    
    let trend: Array<{ date: string; [brandName: string]: string | number }> = []
    let ranking: RankingItem[] = []
    
    switch (trendMetric) {
      case "visibility":
        trend = apiData.visibility.trends
        ranking = apiData.visibility.ranking
        break
      case "reach":
        trend = apiData.reach.trends
        ranking = apiData.reach.ranking
        break
      case "rank":
        trend = apiData.rank.trends
        ranking = apiData.rank.ranking
        break
      case "focus":
        trend = apiData.focus.trends
        ranking = apiData.focus.ranking
        break
    }
    
    const selfBrand = ranking.find((item) => item.isSelf)?.brand
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
  }, [apiData, trendMetric])

  // Keep visibilityTrendData for backward compatibility (used in display)
  const visibilityTrendData = trendData

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
    
    console.log('[Visibility] metricsData - reachItem:', reachItem)
    console.log('[Visibility] metricsData - reach ranking items with isSelf:', apiData.reach.ranking.filter(item => item.isSelf))
    console.log('[Visibility] metricsData - reach ranking total items:', apiData.reach.ranking.length)
    console.log('[Visibility] metricsData - first 5 reach ranking items:', apiData.reach.ranking.slice(0, 5).map(item => ({ brand: item.brand, value: item.value, isSelf: item.isSelf })))
    if (!reachItem) {
      console.warn('[Visibility] metricsData - No reachItem found with isSelf=true!')
      console.log('[Visibility] metricsData - All reach items:', apiData.reach.ranking.map(item => ({ brand: item.brand, value: item.value, isSelf: item.isSelf })))
    }

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
    return [
      {
        key: "reach" as const,
        label: translate("Reach", language),
        value: metricsData.reach.value,
        unit: metricsData.reach.unit,
        delta: metricsData.reach.growth, // 使用API返回的delta
      },
      {
        key: "rank" as const,
        label: language === "en" ? "Position" : translate("Rank", language),
        value: metricsData.rank.value,
        unit: metricsData.rank.unit,
        delta: metricsData.rank.growth, // 使用API返回的delta
      },
      {
        key: "focus" as const,
        label: translate("Focus", language),
        value: metricsData.focus.value,
        unit: metricsData.focus.unit,
        delta: metricsData.focus.growth, // 使用API返回的delta
      },
    ]
  }, [language, metricsData])

  // 热力图数据，保持后端返回的 sources 和 topics 的顺序
  // Heatmap data, preserving the order of sources and topics as returned by the backend
  const heatmapData = useMemo(() => {
    const data = apiData?.heatmap ?? null
    if (data) {
      console.log("[Visibility] Heatmap data received:", {
        sourcesCount: data.sources?.length ?? 0,
        topicsCount: data.topics?.length ?? 0,
        cellsCount: data.cells?.length ?? 0,
        sources: data.sources?.map(s => s.name) ?? [],
        topics: data.topics?.map(t => t.name) ?? [],
      })
    } else {
      console.log("[Visibility] No heatmap data in API response")
    }
    return data
  }, [apiData])

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
    console.log('[Visibility] Tab changed from', tab, 'to', newTab)
    setTab(newTab)
    setPulsingCard(newTab)
    // Reset page to 1 when switching tabs
    switch (newTab) {
      case "visibility":
        setVisibilityPage(1)
        break
      case "reach":
        setReachPage(1)
        break
      case "rank":
        setRankPage(1)
        break
      case "focus":
        setFocusPage(1)
        break
    }
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
    switch (tab) {
      case "visibility":
        return translate("Visibility", language)
      case "reach":
        return translate("Reach", language)
      case "rank":
        return language === "en" ? "Position" : translate("Rank", language)
      case "focus":
        return translate("Focus", language)
      default:
        return translate("Visibility", language)
    }
  }, [tab, language])

  const getMetricLabel = useCallback((metric: RankingMetric) => {
    switch (metric) {
      case "visibility":
        return translate("Visibility", language)
      case "reach":
        return translate("Reach", language)
      case "rank":
        return language === "en" ? "Position" : translate("Rank", language)
      case "focus":
        return translate("Focus", language)
    }
  }, [language, translate])

  const handleExport = useCallback(() => {
    if (!apiData || isLoading) return
    
    try {
      // Prepare CSV data for the current selected date range
      const csvData: Array<Record<string, any>> = []
      
      // Get the metric data based on current tab
      const currentMetric = tab
      let rankingData: RankingItem[] = []
      
      switch (currentMetric) {
        case "visibility":
          rankingData = visibilityRankingData
          break
        case "reach":
          rankingData = reachRankingData
          break
        case "rank":
          rankingData = rankRankingData
          break
        case "focus":
          rankingData = focusRankingData
          break
      }
      
      // Add header row
      const headers = [
        language === "zh-TW" ? "统计时间" : "Date",
        language === "zh-TW" ? "品牌" : "Brand",
        language === "zh-TW" ? "产品" : "Product",
        language === "zh-TW" ? "模型平台" : "Model Platform",
        translate(getMetricLabel(currentMetric), language),
        language === "zh-TW" ? "排名" : "Rank",
        language === "zh-TW" ? "变化" : "Change",
      ]
      
      // Add data rows - export all visible brands for the selected date range
      rankingData.forEach((item) => {
        csvData.push({
          [headers[0]]: `${formatDateShanghai(dateRange.start)} ~ ${formatDateShanghai(dateRange.end)}`,
          [headers[1]]: item.brand,
          [headers[2]]: selectedProductId || "All",
          [headers[3]]: selectedModel || "All",
          [headers[4]]: typeof item.value === "number" ? item.value.toFixed(2) : item.value,
          [headers[5]]: item.rank,
          [headers[6]]: typeof item.delta === "number" ? (item.delta > 0 ? `+${item.delta.toFixed(2)}` : item.delta.toFixed(2)) : item.delta || "0",
        })
      })
      
      // Export to CSV
      const filename = `visibility_${getMetricLabel(currentMetric)}_${formatDateShanghai(dateRange.start)}_${formatDateShanghai(dateRange.end)}.csv`
      exportToCSV(csvData, filename, headers)
      
      toast({
        title: language === "zh-TW" ? "导出成功" : "Export Successful",
        description: language === "zh-TW" ? "可见度数据已导出" : "Visibility data exported",
      })
    } catch (error) {
      console.error("Error exporting visibility data:", error)
      toast({
        title: language === "zh-TW" ? "导出失败" : "Export Failed",
        description: language === "zh-TW" ? "导出过程中发生错误" : "An error occurred during export",
        variant: "destructive",
      })
    }
  }, [apiData, isLoading, tab, dateRange, visibilityRankingData, reachRankingData, rankRankingData, focusRankingData, selectedProductId, selectedModel, language, toast, translate, getMetricLabel])

  const getRankingData = (metric: RankingMetric): RankingItem[] => {
    console.log('[Visibility] getRankingData called for metric:', metric)
    let data: RankingItem[] = []
    switch (metric) {
      case "visibility":
        data = visibilityRankingData
        break
      case "reach":
        data = reachRankingData
        break
      case "rank":
        data = rankRankingData
        break
      case "focus":
        data = focusRankingData
        break
    }
    console.log('[Visibility] getRankingData returning', data.length, 'items for', metric)
    return data
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

    // Reset to page 1 if current page is out of range (use valid page for calculation)
    const validPage = currentPage > totalPages && totalPages > 0 ? 1 : currentPage
    if (currentPage > totalPages && totalPages > 0 && currentPage > 1) {
      console.log('[Visibility] Resetting currentPage from', currentPage, 'to 1 (totalPages:', totalPages, ')')
      setCurrentPage(1)
    }
    
    const startIndex = (validPage - 1) * brandsPerPage
    const endIndex = startIndex + brandsPerPage
    const paginatedBrands = rankingItems.slice(startIndex, endIndex)
    
    // Debug: Log pagination info
    console.log('[Visibility] Pagination:', {
      metric,
      totalBrands,
      brandsPerPage,
      totalPages,
      currentPage,
      validPage,
      startIndex,
      endIndex,
      paginatedCount: paginatedBrands.length,
      showingBrands: paginatedBrands.map(b => b.brand).slice(0, 5),
    })

    const formatDeltaValue = (delta: number, unit?: string) => {
      if (!Number.isFinite(delta) || delta === 0) return "—"
      // 所有排名表格中的 delta 都只显示排名变化（上升/下降的名次），不显示百分比
      return Math.abs(Math.round(delta)).toString()
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
                              {(!selfBrand.delta || Math.abs(selfBrand.delta) < 0.001) ? (
                                <div className="flex items-center gap-1 text-ink-400">
                                  <span className="text-xs font-medium">0</span>
                                </div>
                              ) : selfBrand.delta > 0 ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <ArrowUp className="h-3 w-3" />
                                  <span className="text-xs font-medium">{formatDeltaValue(selfBrand.delta, selfBrand.unit)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <ArrowDown className="h-3 w-3" />
                                  <span className="text-xs font-medium">{formatDeltaValue(selfBrand.delta, selfBrand.unit)}</span>
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-md border cursor-pointer transition-colors hover:bg-ink-50 ${
                item.isSelf
                  ? "bg-brand-50 border-brand-600"
                  : "bg-white border-ink-200"
              }`}
            >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 ${
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
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-ink-200 text-ink-600">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 ml-4">
                              {(!item.delta || Math.abs(item.delta) < 0.001) ? (
                                <div className="flex items-center gap-1 text-ink-400">
                                  <span className="text-xs font-medium">0</span>
                                </div>
                              ) : item.delta > 0 ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <ArrowUp className="h-3 w-3" />
                                  <span className="text-xs font-medium">{formatDeltaValue(item.delta, item.unit)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <ArrowDown className="h-3 w-3" />
                                  <span className="text-xs font-medium">{formatDeltaValue(item.delta, item.unit)}</span>
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
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
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
                  onClick={handleNextPage}
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
          title={translate("Visibility Insights", language)}
          description={translate("Measure your brand visibility by analyzing brand mention rate, mention order, and content proportion in AI searches.", language)}
          startDate={displayDateRange.start}
          endDate={displayDateRange.end}
          onDateChange={handleDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          showModelSelector={false}
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
                    const delta = (card.delta as number) || 0
                    // 判断是否为0：严格等于0，或者格式化后为"0.0"的情况
                    const roundedDelta = Math.abs(delta).toFixed(1)
                    const isDeltaZero = delta === 0 || roundedDelta === "0.0" || Math.abs(delta) < 0.05
                    const deltaValue = hasDelta
                      ? isDeltaZero
                        ? "0.0%"  // 0值显示为0.0%
                        : `${Math.abs(delta).toFixed(1)}%`
                      : "--"

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
                              <span className="text-xs font-medium ml-1 text-ink-500">
                                {card.unit || (card.key !== "rank" ? "%" : "")}
                              </span>
                            </span>
                            {hasDelta ? (
                              isDeltaZero ? (
                                <div className="flex items-center gap-1 text-xs font-medium text-ink-400">
                                  <span>{deltaValue}</span>
                                </div>
                              ) : (
                                <div className={`flex items-center gap-1 text-xs font-medium ${delta > 0 ? "text-green-600" : "text-red-600"}`}>
                                  {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                  <span>{deltaValue}</span>
                                </div>
                              )
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
                        {translate("Visibility Trend", language)}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-ink-400 hover:text-ink-600 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{getTooltipContent("Visibility Trend_tooltip", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={trendMetric} onValueChange={(value) => setTrendMetric(value as RankingMetric)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {([
                          { value: "visibility" as const, label: translate("Visibility", language) },
                          { value: "reach" as const, label: translate("Reach", language) },
                          { value: "rank" as const, label: language === "en" ? "Position" : translate("Rank", language) },
                          { value: "focus" as const, label: translate("Focus", language) },
                        ] as Array<{ value: RankingMetric; label: string }>).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-3 flex items-baseline gap-4">
                    <span className="text-2xl font-semibold text-ink-900">
                      {(() => {
                        const metric = metricsData[trendMetric]
                        return metric.value?.toFixed(1)
                      })()}
                      <span className="text-xs font-medium ml-1 text-ink-500">
                        {(() => {
                          const metric = metricsData[trendMetric]
                          return metric.unit || "%"
                        })()}
                      </span>
                    </span>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${(() => {
                      const delta = metricsData[trendMetric]?.growth || 0
                      return delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-ink-400"
                    })()}`}>
                      {(() => {
                        const delta = metricsData[trendMetric]?.growth || 0
                        const isDeltaZero = Math.abs(delta) < 0.001
                        if (isDeltaZero) {
                          return <span className="text-xs text-ink-400">0</span>
                        } else if (delta > 0) {
                          return (
                            <>
                              <ArrowUp className="h-3.5 w-3.5" />
                              <span>{Math.abs(delta).toFixed(1)}%</span>
                            </>
                          )
                        } else {
                          return (
                            <>
                              <ArrowDown className="h-3.5 w-3.5" />
                              <span>{Math.abs(delta).toFixed(1)}%</span>
                            </>
                          )
                        }
                      })()}
                      <span className="text-xs text-ink-500 ml-1">
                        {isOneDay 
                          ? translate("vs previous day", language)
                          : `${translate("vs previous", language)}${periodDays}${translate("days", language)}`
                        }
                      </span>
                    </div>
                  </div>
                  {!trendData || trendData.length === 0 ? (
                    <div className="h-[282px] w-full bg-ink-50 rounded-md flex items-center justify-center border border-dashed border-ink-200">
                      <div className="text-center">
                        <div className="text-sm text-ink-500 mb-1">
                          {translate("No visibility trend data", language)}
                        </div>
                        <div className="text-xs text-ink-400">
                          {translate("Try adjusting your filters", language)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[282px] w-full min-h-[282px] min-w-0" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                            tickFormatter={(value) => `${value.toFixed(1)}%`}
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
                            formatter={(value: number) => {
                              const metricLabel = getMetricLabel(trendMetric)
                              return [`${value.toFixed(1)}%`, metricLabel]
                            }}
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
                        {translate("Ranking", language)}
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
                        {([
                          { value: "visibility" as const, label: translate("Visibility", language) },
                          { value: "reach" as const, label: translate("Reach", language) },
                          { value: "rank" as const, label: language === "en" ? "Position" : translate("Rank", language) },
                          { value: "focus" as const, label: translate("Focus", language) },
                        ] as Array<{ value: RankingMetric; label: string }>).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0" key={`ranking-${tab}`}>
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
                      console.log('[Visibility] Rendering ranking content for tab:', tab, 'page:', pagination.page)
                      return renderRankingContent(tab, pagination.page, pagination.setPage)
                    })()}
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* 热力图功能暂时隐藏，后续版本会补上 */}
            {/* Heatmap feature temporarily hidden, will be added in future version */}
            {/* 
            <div className="lg:col-span-7">
              <FadeUp delay={0.18}>
                <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink-900">
                        {translate("Visibility Heatmap", language)}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-ink-400 hover:text-ink-600 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs text-ink-900">{getTooltipContent("Visibility Heatmap_tooltip", language)}</p>
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
                        style={{ 
                          gridTemplateColumns: `minmax(140px, 1fr) repeat(${heatmapData.topics.length}, minmax(100px, 1fr))`,
                          gridTemplateRows: `auto repeat(${heatmapData.sources.length}, minmax(60px, auto))`
                        }}
                      >
                        <div className="sticky left-0 top-0 z-10 bg-white px-4 py-2 border-b border-r border-ink-100 font-medium text-ink-500">
                          {translate("Source / Topic", language)}
                        </div>
                        {heatmapData.topics.map((topic) => (
                          <div
                            key={topic.slug}
                            className="px-4 py-2 border-b border-ink-100 text-left font-medium text-ink-700"
                          >
                            {translate(topic.name, language)}
                          </div>
                        ))}

                        {heatmapData.sources.map((source) => (
                          <Fragment key={source.slug}>
                            <button
                              type="button"
                              onClick={() => handleSourceNavigate(source)}
                              className="sticky left-0 z-10 bg-white px-4 py-3 border-t border-r border-ink-100 text-left font-medium text-ink-700 transition-colors hover:text-brand-600"
                            >
                              {translate(source.name, language)}
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
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs text-ink-900">
                                      {language === "zh-TW" ? "提及率" : "Mention rate"}: {value.toFixed(1)}%
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
            */}
          </div>
        </div>
      </div>

      {/* 热力图对话框暂时隐藏，后续版本会补上 */}
      {/* Heatmap dialog temporarily hidden, will be added in future version */}
      {/* 
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
                  <p className="text-xs text-ink-500">{translate(selectedHeatmapCell.topic, language)}</p>
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
                  {translate(selectedHeatmapCell.example, language)}
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
      */}
    </TooltipProvider>
  )
}
