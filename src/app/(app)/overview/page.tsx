"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, Download, HelpCircle, ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FadeUp, StaggerContainer, staggerItem } from "@/lib/animations"
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
import { exportBrandInfluenceToExcel, canExportExcel } from "@/lib/export-utils"
import type { OverviewData, OverviewKPI, CompetitorRanking, BrandInfluenceData } from "@/types/overview"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services/api"
import { useLanguageStore } from "@/store/language.store"
import { translate, getTooltipContent } from "@/lib/i18n"
import { useBrandUIStore } from "@/store/brand-ui.store"

// Chart colors - use brand color for all lines (OpenAI style)
import { CHART_PRIMARY_COLOR, CHART_COLORS as DESIGN_CHART_COLORS, INK_COLORS, BRAND_COLORS } from "@/lib/design-tokens"

const CHART_COLORS = [
  CHART_PRIMARY_COLOR, // brand color
  CHART_PRIMARY_COLOR, // brand color
  CHART_PRIMARY_COLOR, // brand color
  CHART_PRIMARY_COLOR, // brand color
  CHART_PRIMARY_COLOR, // brand color
  CHART_PRIMARY_COLOR, // brand color
]

// Mock data
const mockKPIs: OverviewKPI[] = [
  {
    name: "Reach",
    value: 74.3,
    delta: 2.1,
    unit: "%",
    description: "Indicates how often the brand is mentioned in AI responses — higher reach means greater exposure.",
  },
  {
    name: "Rank",
    value: 2,
    delta: -1,
    unit: "",
    description: "Shows how early the brand appears in AI answers — earlier mentions suggest higher relevance or priority.",
  },
  {
    name: "Focus",
    value: 33.5,
    delta: 3.8,
    unit: "%",
    description: "Measures how much of the AI's content focuses on the brand — representing its share of attention.",
  },
  {
    name: "Sentiment",
    value: 0.71,
    delta: 0.12,
    unit: "",
    description: "Shows AI's emotional tone toward the brand, ranging from negative to positive.",
  },
]

const mockCompetitors: CompetitorRanking[] = [
  { rank: 1, name: "Chase", score: 92.5, delta: 5, isSelf: false },
  { rank: 2, name: "Your Brand", score: 89.8, delta: 1.2, isSelf: true },
  { rank: 3, name: "American Express", score: 85.2, delta: -1, isSelf: false },
  { rank: 4, name: "Brex", score: 82.5, delta: 2, isSelf: false },
  { rank: 5, name: "Ramp", score: 78.3, delta: -2, isSelf: false },
  { rank: 6, name: "Nav", score: 75.1, delta: 0, isSelf: false },
  { rank: 7, name: "Capital One", score: 72.3, delta: 1.5, isSelf: false },
  { rank: 8, name: "Wells Fargo", score: 70.8, delta: -0.5, isSelf: false },
  { rank: 9, name: "Citi", score: 68.2, delta: 2.1, isSelf: false },
  { rank: 10, name: "Bank of America", score: 65.5, delta: -1.2, isSelf: false },
  { rank: 11, name: "Discover", score: 63.8, delta: 0.8, isSelf: false },
  { rank: 12, name: "TD Bank", score: 61.2, delta: -0.3, isSelf: false },
  { rank: 13, name: "HSBC", score: 58.5, delta: 1.2, isSelf: false },
  { rank: 14, name: "Barclays", score: 56.3, delta: -0.8, isSelf: false },
  { rank: 15, name: "Santander", score: 54.1, delta: 0.5, isSelf: false },
  { rank: 16, name: "UBS", score: 51.8, delta: -1.1, isSelf: false },
  { rank: 17, name: "Credit Suisse", score: 49.5, delta: 0.9, isSelf: false },
  { rank: 18, name: "Deutsche Bank", score: 47.2, delta: -0.6, isSelf: false },
  { rank: 19, name: "BNP Paribas", score: 45.0, delta: 0.3, isSelf: false },
  { rank: 20, name: "Société Générale", score: 42.8, delta: -0.4, isSelf: false },
  { rank: 21, name: "ING", score: 40.5, delta: 0.2, isSelf: false },
]

// Generate trend data for each brand
const generateTrendData = (baseValue: number, delta: number) => {
  const dates = [
    "2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04",
    "2024-01-05", "2024-01-06", "2024-01-07"
  ]
  return dates.map((date, index) => ({
    date,
    brandInfluence: baseValue + (delta * index / 6) + (Math.random() - 0.5) * 2
  }))
}

// Mock trend data for all brands
const mockBrandTrends: Record<string, { trend: Array<{ date: string; brandInfluence: number }>, current: number, changeRate: number }> = {}
mockCompetitors.forEach((competitor) => {
  mockBrandTrends[competitor.name] = {
    trend: generateTrendData(competitor.score - competitor.delta, competitor.delta),
    current: competitor.score,
    changeRate: competitor.delta,
  }
})

const mockTrendData = mockBrandTrends["Your Brand"]?.trend || [
  { date: "2024-01-01", brandInfluence: 87.5 },
  { date: "2024-01-02", brandInfluence: 88.2 },
  { date: "2024-01-03", brandInfluence: 89.1 },
  { date: "2024-01-04", brandInfluence: 88.8 },
  { date: "2024-01-05", brandInfluence: 89.5 },
  { date: "2024-01-06", brandInfluence: 90.1 },
  { date: "2024-01-07", brandInfluence: 89.8 },
]

import { MODEL_OPTIONS } from "@/constants/models"

type OverviewPrimaryCard = {
  key: string
  label: string
  tooltipKey: string
  value: number | null | undefined
  unit?: string
  delta?: number | null | undefined
  onClick?: () => void
  formatValue?: (value: number) => string
  deltaFormatter?: (delta: number) => string
}

export default function OverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { language } = useLanguageStore()
  const { selectedProductId, selectedBrandId } = useBrandUIStore()

  // Initialize date range from URL or default
  // Ensure the initial range is within data file bounds (2025-10-31 to 2025-11-06)
  const initialDateRange = useMemo(() => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")
    
    if (startParam && endParam) {
      try {
        const parsedStart = parseDateShanghai(startParam)
        const parsedEnd = parseDateShanghai(endParam)
        // Ensure dates are within data file bounds
        const dataMinDate = parseDateShanghai("2025-10-31")
        const dataMaxDate = parseDateShanghai("2025-11-06")
        return {
          start: parsedStart < dataMinDate ? dataMinDate : parsedStart > dataMaxDate ? dataMaxDate : parsedStart,
          end: parsedEnd > dataMaxDate ? dataMaxDate : parsedEnd < dataMinDate ? dataMinDate : parsedEnd,
        }
      } catch {
        // Default: last 7 days within data file (2025-10-31 to 2025-11-06)
        return {
          start: parseDateShanghai("2025-10-31"),
          end: parseDateShanghai("2025-11-06"),
        }
      }
    }
    // Default: last 7 days within data file (2025-10-31 to 2025-11-06)
    return {
      start: parseDateShanghai("2025-10-31"),
      end: parseDateShanghai("2025-11-06"),
    }
  }, [searchParams])

  // Use actual date range from API if available, otherwise use selected range
  const [dateRange, setDateRange] = useState(initialDateRange)
  const [displayDateRange, setDisplayDateRange] = useState(initialDateRange)
  const [currentPage, setCurrentPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("all")
  const MAX_VISIBLE_BRANDS = 6
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(new Set())
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([])
  const [addCompetitorDialogOpen, setAddCompetitorDialogOpen] = useState(false)

  // Get user registered date (fallback to 30 days ago)
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  // Use data file's last date (2025-11-06) as maxDate instead of "today"
  // This ensures date range selections don't exceed available data
  const maxDate = useMemo(() => {
    // Data file contains dates from 2025-10-31 to 2025-11-06
    // Use 2025-11-06 as the maximum date
    return parseDateShanghai("2025-11-06")
  }, [])

  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery<OverviewData>({
    queryKey: [
      "overview",
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
        console.log('[Overview] Fetching data - startDate:', startDateStr, 'endDate:', endDateStr)
        
        const response = await apiClient.get<OverviewData>("/api/overview", {
          params: {
            startDate: startDateStr,
            endDate: endDateStr,
            productId: selectedProductId || undefined,
            brandId: selectedBrandId || undefined,
            model: selectedModel,
          },
        })
        
        console.log('[Overview] API response received - trend count:', response.data?.brandInfluence?.trend?.length)
        return response.data
      } catch (error: any) {
        console.error('[Overview] API error:', error)
        console.error('[Overview] Error details:', error?.response?.data || error?.message)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存，减少不必要的请求
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收时间
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 如果数据在缓存中且未过期，不重新获取
  })

  // Update display date range when API returns actual date range
  useEffect(() => {
    if (apiData?.actualDateRange) {
      const actualStart = parseDateShanghai(apiData.actualDateRange.start)
      const actualEnd = parseDateShanghai(apiData.actualDateRange.end)
      setDisplayDateRange({ start: actualStart, end: actualEnd })
      console.log('[Overview] Updated display date range from API:', apiData.actualDateRange)
    }
  }, [apiData?.actualDateRange])

  // Get brands list from API data
  const brands = useMemo(() => {
    if (!apiData?.ranking) return []
    return apiData.ranking.map((c) => c.name)
  }, [apiData])

  // Initialize visible brands
  useEffect(() => {
    if (brands.length > 0 && visibleBrands.size === 0) {
      const selfBrand = brands.find((b) => b === "英业达" || b === "Your Brand")
      const otherBrands = brands.filter((b) => b !== "英业达" && b !== "Your Brand")
      const initialBrands = selfBrand
        ? [selfBrand, ...otherBrands.slice(0, MAX_VISIBLE_BRANDS - 1)]
        : otherBrands.slice(0, MAX_VISIBLE_BRANDS)
      setVisibleBrands(new Set(initialBrands))
    }
  }, [brands, visibleBrands.size, MAX_VISIBLE_BRANDS])

  const isSelfBrand = (brand: string) => {
    return brand === "Your Brand" || brand === "英业达"
  }

  const canAddBrand = visibleBrands.size < MAX_VISIBLE_BRANDS
  const availableBrands = brands.filter((b) => !visibleBrands.has(b))

  // Get brand icon (first letter or initial)
  const getBrandIcon = (brand: string) => {
    return brand.charAt(0).toUpperCase()
  }

  // Get self brand name from API data
  const selfBrandName = useMemo(() => {
    if (!apiData?.ranking) return null
    const selfBrand = apiData.ranking.find((c) => c.isSelf)
    return selfBrand?.name || null
  }, [apiData])

  // Use API data - prepare chart data for self brand and selected competitors
  const chartData = useMemo(() => {
    if (!apiData?.brandInfluence?.trend) return []
    
    // Get self brand trend data
    const selfTrend = apiData.brandInfluence.trend
    
    // Get competitor trends if available (from apiData directly)
    const competitorTrends = (apiData as any)?.competitorTrends || {}
    
    // Create a map of dates to combine all trends
    const dateMap = new Map<string, { date: string; fullDate: string; brandInfluence: number; [key: string]: any }>()
    
    // Add self brand data
    selfTrend.forEach((item) => {
      const dateKey = format(new Date(item.date), "MM/dd")
      dateMap.set(dateKey, {
        date: dateKey,
        fullDate: item.date,
        brandInfluence: item.brandInfluence || 0,
      })
    })
    
    // Add selected competitor data
    selectedCompetitors.forEach((competitorName) => {
      const competitorTrend = competitorTrends[competitorName]
      if (competitorTrend) {
        competitorTrend.forEach((item) => {
          const dateKey = format(new Date(item.date), "MM/dd")
          const existing = dateMap.get(dateKey)
          if (existing) {
            existing[competitorName] = item.brandInfluence || 0
          } else {
            dateMap.set(dateKey, {
              date: dateKey,
              fullDate: item.date,
              brandInfluence: 0,
              [competitorName]: item.brandInfluence || 0,
            })
          }
        })
      }
    })
    
    // Convert map to array and sort by date
    const chartDataResult = Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    })
    
    return chartDataResult
  }, [apiData, dateRange, selectedCompetitors])
  
  // Get available competitors (excluding self brand)
  const availableCompetitors = useMemo(() => {
    if (!apiData?.ranking || !selfBrandName) return []
    return apiData.ranking
      .filter((c) => !c.isSelf && c.name !== selfBrandName)
      .map((c) => c.name)
      .filter((name) => !selectedCompetitors.includes(name))
  }, [apiData?.ranking, selfBrandName, selectedCompetitors])

  const data: OverviewData | null = useMemo(() => {
    if (!apiData) return null
    console.log('[Overview] Updating data from apiData, ranking length:', apiData.ranking?.length)
    
    return {
      kpis: apiData.kpis,
      brandInfluence: apiData.brandInfluence,
      ranking: apiData.ranking,
      sources: apiData.sources ?? [],
      topics: apiData.topics ?? [],
      competitorTrends: (apiData as any).competitorTrends,
    }
  }, [apiData])

  // Update URL when date range changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("start", formatDateShanghai(dateRange.start))
    params.set("end", formatDateShanghai(dateRange.end))
    router.replace(`/overview?${params.toString()}`, { scroll: false })
  }, [dateRange, router, searchParams])

  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    setCurrentPage(1) // Reset pagination
  }

  // Handle quick date range selection
  const handleQuickRange = (days: number) => {
    const end = getTodayShanghai()
    const start = new Date(end)
    start.setDate(start.getDate() - days + 1) // Include today
    handleDateRangeChange(start, end)
  }

  // Handle 1 day selection (显示最后两天数据：11.4和11.5)
  const handleOneDay = () => {
    // 固定使用数据文件的11.4和11.5两天：2025-11-04 到 2025-11-05
    // 这样会显示为11.4和11.5（因为日期减1）
    const endDate = new Date("2025-11-05")
    const startDate = new Date("2025-11-04")
    handleDateRangeChange(startDate, endDate)
  }

  // Handle export
  const handleExport = useCallback(async () => {
    if (!data || exporting) return

    if (!canExportExcel()) {
      toast({
        title: "不支持导出",
        description: "您的浏览器不支持 Excel 导出功能",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    try {
      // Prepare export data
      const exportData = data.ranking.map((brand) => ({
        brandName: brand.name,
        dates: data.brandInfluence.trend.map((t) => t.date),
        values: data.brandInfluence.trend.map((t) => t.brandInfluence),
      }))

      await exportBrandInfluenceToExcel(
        exportData,
        formatDateShanghai(dateRange.start),
        formatDateShanghai(dateRange.end)
      )

      toast({
        title: "导出成功",
        description: "品牌影响力数据已导出",
      })
    } catch (err) {
      toast({
        title: "导出失败",
        description: err instanceof Error ? err.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }, [data, dateRange, exporting, toast])

  // Sort brands and calculate pagination (must be before conditional returns)
  const sortedBrands = useMemo(() => {
    if (!apiData?.ranking) return []
    console.log('[Overview] Updating sortedBrands, apiData.ranking length:', apiData.ranking.length, 'dateRange:', formatDateShanghai(dateRange.start), '-', formatDateShanghai(dateRange.end))
    return [...apiData.ranking].sort((a, b) => b.score - a.score).map((brand, index) => ({
      ...brand,
      rank: index + 1,
    }))
  }, [apiData?.ranking, dateRange.start, dateRange.end])

  const selfBrand = useMemo(() => sortedBrands.find((c) => c.isSelf), [sortedBrands])

  const brandsPerPage = 7
  const totalBrands = sortedBrands.length
  const totalPages = Math.ceil(totalBrands / brandsPerPage)

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * brandsPerPage
    const endIndex = startIndex + brandsPerPage
    return sortedBrands.slice(startIndex, endIndex)
  }, [sortedBrands, currentPage])

  const periodDays = getDateRangeDays(dateRange.start, dateRange.end)
  // 判断是否为1day模式：periodDays为1或2且日期范围不超过2天
  const dateDiffMs = dateRange.end.getTime() - dateRange.start.getTime()
  const isOneDay = periodDays <= 2 && dateDiffMs <= 172800000 // 2天的毫秒数

  const selectedModelOption =
    MODEL_OPTIONS.find((option) => option.value === selectedModel) ?? MODEL_OPTIONS[0]
  const selectedModelLabel =
    language === "zh-TW" ? selectedModelOption.labelZh : selectedModelOption.labelEn

  const navigateWithDateParams = useCallback(
    (path: string, extraParams?: Record<string, string>) => {
      const params = new URLSearchParams()
      if (dateRange.start) {
        params.set("start", formatDateShanghai(dateRange.start))
      }
      if (dateRange.end) {
        params.set("end", formatDateShanghai(dateRange.end))
      }
      if (extraParams) {
        Object.entries(extraParams).forEach(([key, value]) => {
          params.set(key, value)
        })
      }
      const queryString = params.toString()
      const href = queryString ? `${path}?${queryString}` : path
      router.push(href as Parameters<typeof router.push>[0])
    },
    [router, dateRange.start, dateRange.end]
  )

  const visibilityMetric = useMemo(
    () => data?.kpis.find((kpi) => kpi.name === "Visibility"),
    [data?.kpis]
  )

  const sentimentMetric = useMemo(
    () => data?.kpis.find((kpi) => kpi.name === "Sentiment"),
    [data?.kpis]
  )

  const handleVisibilityNavigate = useCallback(() => {
    navigateWithDateParams("/insights/visibility", { tab: "visibility", model: selectedModel })
  }, [navigateWithDateParams, selectedModel])

  const handleSentimentNavigate = useCallback(() => {
    navigateWithDateParams("/insights/sentiment", { model: selectedModel })
  }, [navigateWithDateParams, selectedModel])

  const handleSourcesNavigate = useCallback(() => {
    navigateWithDateParams("/insights/sources", { model: selectedModel })
  }, [navigateWithDateParams, selectedModel])

  const handleTopicsNavigate = useCallback(() => {
    navigateWithDateParams("/insights/intent", { model: selectedModel })
  }, [navigateWithDateParams, selectedModel])

  const primaryKpiCards = useMemo<OverviewPrimaryCard[]>(() => {
    if (!data) return []

    const cards: (OverviewPrimaryCard | null)[] = [
      {
        key: "brand-influence",
        label: language === "zh-TW" ? "品牌影響力" : "Brand Influence",
        tooltipKey: "Brand influence",
        value: data.brandInfluence?.current ?? null,
        delta: data.brandInfluence?.changeRate ?? null,
        unit: "",
        formatValue: (value) => Math.round(value).toString(),
        deltaFormatter: (delta) => Math.abs(delta).toFixed(1),
      },
      visibilityMetric
        ? {
            key: "visibility",
            label: language === "zh-TW" ? "可見度" : "Visibility",
            tooltipKey: "Visibility",
            value: visibilityMetric.value,
            unit: visibilityMetric.unit,
            delta: visibilityMetric.delta,
            onClick: handleVisibilityNavigate,
            formatValue: (value) => value.toFixed(1),
            deltaFormatter: (delta) => Math.abs(delta).toFixed(1),
          }
        : null,
      sentimentMetric
        ? {
            key: "sentiment",
            label: language === "zh-TW" ? "情緒" : "Sentiment",
            tooltipKey: "Sentiment",
            value: sentimentMetric.value,
            unit: sentimentMetric.unit,
            delta: sentimentMetric.delta,
            onClick: handleSentimentNavigate,
            formatValue: (value) => value.toFixed(2),
            deltaFormatter: (delta) => Math.abs(delta).toFixed(1),
          }
        : null,
    ]

    return cards.filter((card): card is OverviewPrimaryCard => Boolean(card))
  }, [data, language, visibilityMetric, sentimentMetric, handleVisibilityNavigate, handleSentimentNavigate])

  const topSources = useMemo(() => data?.sources ?? [], [data?.sources])
  const topTopics = useMemo(() => data?.topics ?? [], [data?.topics])

  const addBrand = (brand: string) => {
    if (visibleBrands.size < MAX_VISIBLE_BRANDS && !visibleBrands.has(brand)) {
      setVisibleBrands((prev) => new Set([...prev, brand]))
    }
  }

  const removeBrand = (brand: string) => {
    setVisibleBrands((prev) => {
      const next = new Set(prev)
      next.delete(brand)
      return next
    })
  }

  // Loading and error states (must be after all hooks)
  if (isLoading) {
    return (
      <div className="bg-background -mx-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
          <div className="text-sm font-medium text-ink-900">Loading overview data...</div>
          <div className="text-xs text-ink-500 mt-2">Please wait</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="bg-background -mx-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
          <div className="text-sm font-medium text-ink-900">Failed to load overview data</div>
          <div className="text-xs text-ink-500 mt-2">Please try again later</div>
          </div>
        </div>
      </div>
    )
  }

  return (
      <TooltipProvider>
      <div className="bg-background -mx-6">
        {/* Top Filter Bar */}
        <PageHeaderFilterBar
          title="Overview"
          description={
            language === "zh-TW" 
              ? "根據品牌在 AI 檢索中的可見度與情緒傾向，綜合衡量其整體影響力"
              : "Measure your brand's overall influence through its visibility and sentiment in AI search"
          }
          startDate={displayDateRange.start}
          endDate={displayDateRange.end}
          onDateChange={handleDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onExport={handleExport}
          isExporting={exporting}
          showExport={true}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-pageX py-3 sm:py-4 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4 items-stretch">
            {/* Left Column - Overview Metrics */}
            <div className="lg:col-span-5 space-y-4">
              {/* KPI Cards Row */}
              <StaggerContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {primaryKpiCards.map((kpi) => {
                    const hasValue = typeof kpi.value === "number" && Number.isFinite(kpi.value)
                    const displayValue = hasValue
                      ? kpi.formatValue
                        ? kpi.formatValue(kpi.value as number)
                        : (kpi.value as number).toFixed(1)
                      : "--"
                    const hasDelta = typeof kpi.delta === "number" && Number.isFinite(kpi.delta)
                    const deltaValue = hasDelta
                      ? kpi.deltaFormatter
                        ? kpi.deltaFormatter(kpi.delta as number)
                        : Math.abs(kpi.delta as number).toFixed(1)
                      : "--"
                    const delta = (kpi.delta as number) || 0
                    const clickable = typeof kpi.onClick === "function"

                    return (
                      <motion.div key={kpi.key} variants={staggerItem} initial="hidden" animate="visible">
                        <div
                          className={`rounded-lg border border-ink-200 bg-white p-4 h-full shadow-subtle ${
                            clickable ? "cursor-pointer transition-all hover:bg-ink-50 hover:shadow-md hover:border-brand-300" : ""
                          }`}
                          onClick={kpi.onClick}
                          onKeyDown={(e) => {
                            if (clickable && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault()
                              kpi.onClick?.()
                            }
                          }}
                          role={clickable ? "button" : undefined}
                          tabIndex={clickable ? 0 : undefined}
                          aria-label={clickable ? `${kpi.label}: ${displayValue}${kpi.unit || ""}` : undefined}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-ink-500">{kpi.label}</div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  className="text-ink-400 hover:text-ink-600 transition-colors"
                                  aria-label={`Learn more about ${kpi.label}`}
                                >
                                  <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{getTooltipContent(kpi.tooltipKey, language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <span className="text-2xl font-semibold text-ink-900">
                              {displayValue}
                              {kpi.unit && (
                                <span className="text-xs font-medium ml-1 text-ink-500">{kpi.unit}</span>
                              )}
                            </span>
                            {hasDelta && delta !== 0 ? (
                              <div className="flex items-center gap-1 text-xs font-medium text-ink-600">
                                {delta > 0 ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                )}
                                <span>{deltaValue}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-ink-400">—</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </StaggerContainer>

              {/* Brand Influence Card */}
              <FadeUp delay={0.1}>
                <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink-900">Brand influence</h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-ink-400 hover:text-ink-600 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{getTooltipContent("Brand influence", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div>
                    {/* Add Competitor Button and Selected Competitors */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        {/* Self Brand - Always shown first, no delete button */}
                        {selfBrandName && (
                          <Badge
                            variant="secondary"
                            className="bg-brand-600 text-white border-brand-600 flex items-center gap-1.5"
                          >
                            <span className="text-xs font-medium">{selfBrandName}</span>
                          </Badge>
                        )}
                        {/* Selected Competitors - Can be removed */}
                        {selectedCompetitors.map((competitor) => (
                          <Badge
                            key={competitor}
                            variant="secondary"
                            className="bg-brand-50 text-brand-700 border-brand-200 flex items-center gap-1.5"
                          >
                            <span className="text-xs">{competitor}</span>
                            <button
                              onClick={() => {
                                setSelectedCompetitors(selectedCompetitors.filter((c) => c !== competitor))
                              }}
                              className="hover:bg-brand-100 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddCompetitorDialogOpen(true)}
                        className="h-8 px-3 text-xs border-brand-300 text-brand-700 hover:bg-brand-50 flex-shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        {language === "zh-TW" ? "添加競品" : "Add Competitor"}
                      </Button>
                    </div>
                    {/* Brand Influence Chart */}
                    <div className="h-[265px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke={INK_COLORS[500]}
                            style={{ fontSize: "11px" }}
                            tick={{ fill: INK_COLORS[500] }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            angle={chartData.length > 7 ? -45 : 0}
                            textAnchor={chartData.length > 7 ? "end" : "middle"}
                            height={chartData.length > 7 ? 60 : 30}
                          />
                          <YAxis
                            stroke={INK_COLORS[500]}
                            style={{ fontSize: "11px" }}
                            tick={{ fill: INK_COLORS[500] }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => value.toFixed(1)}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: `1px solid ${INK_COLORS[200]}`,
                              borderRadius: "8px",
                              fontSize: "12px",
                              padding: "8px 12px",
                            }}
                            labelStyle={{ color: INK_COLORS[900], marginBottom: "4px", fontSize: "11px" }}
                            formatter={(value: number) => `${value.toFixed(1)}`}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Line
                            type="linear"
                            dataKey="brandInfluence"
                            stroke={BRAND_COLORS[600]}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: BRAND_COLORS[600], stroke: "white", strokeWidth: 2 }}
                            name={selfBrandName || "Your Brand"}
                          />
                          {/* Competitor trend lines */}
                          {selectedCompetitors.map((competitor, index) => {
                            // Use distinct colors for competitors - different from brand color
                            const competitorColors = [
                              "#3B82F6",  // Blue
                              "#16A34A", // Green
                              "#F59E0B", // Orange/Amber
                              "#EF4444", // Red
                              "#8B5CF6", // Purple
                              "#EC4899", // Pink
                              "#14B8A6", // Teal
                              "#F97316", // Orange
                            ]
                            const color = competitorColors[index % competitorColors.length]
                            return (
                              <Line
                                key={competitor}
                                type="linear"
                                dataKey={competitor}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: color, stroke: "white", strokeWidth: 2 }}
                                strokeDasharray={index > 3 ? "5 5" : undefined}
                                name={competitor}
                              />
                            )
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </FadeUp>

              {/* Add Competitor Dialog */}
              <Dialog open={addCompetitorDialogOpen} onOpenChange={setAddCompetitorDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {language === "zh-TW" ? "添加競品品牌" : "Add Competitor Brand"}
                    </DialogTitle>
                    <DialogDescription>
                      {language === "zh-TW"
                        ? "選擇要添加到趨勢圖中的競品品牌"
                        : "Select competitor brands to add to the trend chart"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {availableCompetitors.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {language === "zh-TW"
                          ? "沒有可用的競品品牌"
                          : "No available competitor brands"}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {availableCompetitors.map((competitor) => (
                          <button
                            key={competitor}
                            onClick={() => {
                              setSelectedCompetitors([...selectedCompetitors, competitor])
                              setAddCompetitorDialogOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 rounded-lg border border-ink-200 hover:bg-brand-50 hover:border-brand-300 transition-colors"
                          >
                            <span className="text-sm font-medium text-ink-900">{competitor}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddCompetitorDialogOpen(false)}
                    >
                      {language === "zh-TW" ? "取消" : "Cancel"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Right Column - Competitor Ranking */}
            <div className="lg:col-span-2 flex flex-col">
              <FadeUp delay={0.2}>
                <div className="rounded-lg border border-ink-200 bg-white p-4 flex-1 flex flex-col shadow-subtle hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink-900">Influence ranking</h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-ink-400 hover:text-ink-600 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{getTooltipContent("Influence ranking", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-1">
                      {/* Pinned Self Brand */}
                      {selfBrand && (
                        <motion.div
                          key={`self-brand-${selfBrand.name}-${selfBrand.rank}-${selfBrand.score}-${formatDateShanghai(dateRange.start)}-${formatDateShanghai(dateRange.end)}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-md border border-brand-600 bg-brand-50"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 bg-brand-600 text-white">
                              {selfBrand.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <DelayedTooltip content={selfBrand.name}>
                                  <span className="font-medium text-xs truncate text-ink-900">{translate(selfBrand.name, language)}</span>
                                </DelayedTooltip>
                                <Badge variant="outline" className="text-xs px-1.5 py-0 border-ink-200 text-ink-600">
                                  You
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 ml-4">
                            {selfBrand.delta > 0 ? (
                              <div className="flex items-center gap-1 text-ink-600">
                                <ArrowUp className="h-3 w-3" />
                                <span className="text-xs font-medium">{Math.round(selfBrand.delta)}</span>
                              </div>
                            ) : selfBrand.delta < 0 ? (
                              <div className="flex items-center gap-1 text-ink-600">
                                <ArrowDown className="h-3 w-3" />
                                <span className="text-xs font-medium">{Math.abs(Math.round(selfBrand.delta))}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-ink-500">
                                <span className="text-xs font-medium">0</span>
                              </div>
                            )}
                            <span className="text-xs font-medium text-ink-900">{Math.round(selfBrand.score)}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Divider */}
                      {selfBrand && <div className="border-t border-ink-200 my-0.5" />}

                      {/* Paginated Brand List */}
                      <div className="flex flex-col gap-1">
                        {paginatedBrands.map((competitor, index) => (
                          <motion.div
                            key={`${competitor.name}-${competitor.rank}-${competitor.score}-${formatDateShanghai(dateRange.start)}-${formatDateShanghai(dateRange.end)}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-md border cursor-pointer transition-colors hover:bg-ink-50 ${
                              competitor.isSelf
                                ? "bg-brand-50 border-brand-600"
                                : "bg-white border-ink-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 ${
                                  competitor.isSelf
                                    ? "bg-brand-600 text-white"
                                    : "bg-ink-100 text-ink-600"
                                }`}
                              >
                                {competitor.rank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <DelayedTooltip content={competitor.name}>
                                    <span className="font-medium text-xs truncate text-ink-900">{translate(competitor.name, language)}</span>
                                  </DelayedTooltip>
                                  {competitor.isSelf && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-ink-200 text-ink-600">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 ml-4">
                              {competitor.delta > 0 ? (
                                <div className="flex items-center gap-1 text-ink-600">
                                  <ArrowUp className="h-3 w-3" />
                                  <span className="text-xs font-medium">{Math.round(competitor.delta)}</span>
                                </div>
                              ) : competitor.delta < 0 ? (
                                <div className="flex items-center gap-1 text-ink-600">
                                  <ArrowDown className="h-3 w-3" />
                                  <span className="text-xs font-medium">{Math.abs(Math.round(competitor.delta))}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-ink-500">
                                  <span className="text-xs font-medium">0</span>
                                </div>
                              )}
                              <span className="text-xs font-medium text-ink-900">{Math.round(competitor.score)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

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
                              <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <Button
                                    key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={`h-7 w-7 p-0 text-xs border-ink-200 transition-colors ${
                                  currentPage === page
                                    ? "bg-brand-600 text-white border-brand-600"
                                    : "bg-white hover:bg-ink-50"
                                }`}
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
                                className="h-7 w-7 p-0 border-ink-200 disabled:opacity-50"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Sources & Topics Row */}
            <div className="lg:col-span-7">
              <FadeUp delay={0.25}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink-900">
                      {language === "zh-TW" ? "引用來源" : "Sources"}
                    </h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-ink-400 hover:text-ink-600 transition-colors"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{getTooltipContent("Sources overview", language)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <button
                    type="button"
                    onClick={handleSourcesNavigate}
                    className="text-2xs font-medium text-brand-600 transition-colors hover:text-brand-700"
                  >
                    {language === "zh-TW" ? "查看詳情" : "View detail"}
                  </button>
                </div>
                <div className="space-y-2">
                  {topSources.length > 0 ? (
                    topSources.map((source, index) => {
                      const percentage = Math.min(100, Math.max(source.mentionShare * 100, 0))
                      return (
                        <Tooltip key={`${source.domain}-${index}`}>
                          <TooltipTrigger asChild>
                            <div className="group flex items-center justify-between gap-4 rounded-md border border-transparent px-3 py-2 transition-colors hover:bg-ink-50">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-ink-400">
                                    {(index + 1).toString().padStart(2, "0")}
                                  </span>
                                  <span className="text-sm font-medium text-ink-900 truncate">
                                    {source.domain}
                                  </span>
                                </div>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                                  <div
                                    className="h-full rounded-full bg-brand-600"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant="outline"
                                  className={`text-2xs px-2 py-0 border ${
                                    source.mentionsSelf
                                      ? "border-brand-600 text-brand-600"
                                      : "border-ink-300 text-ink-500"
                                  }`}
                                >
                                  {source.mentionsSelf
                                    ? language === "zh-TW"
                                      ? "有提及"
                                      : "Mentioned"
                                    : language === "zh-TW"
                                    ? "未提及"
                                    : "Not mentioned"}
                                </Badge>
                                <span className="text-xs font-medium text-ink-500">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {`${source.mentionCount} ${
                                language === "zh-TW" ? "次提及" : "mentions"
                              } • ${percentage.toFixed(1)}%`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center rounded-md border border-dashed border-ink-200 py-8">
                      <span className="text-xs text-ink-500">
                        {language === "zh-TW"
                          ? "此篩選下暫無來源資料"
                          : "No source data for the selected filters."}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink-900">
                      {language === "zh-TW" ? "熱門主題" : "Topics"}
                    </h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-ink-400 hover:text-ink-600 transition-colors"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{getTooltipContent("Topics overview", language)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <button
                    type="button"
                    onClick={handleTopicsNavigate}
                    className="text-2xs font-medium text-brand-600 transition-colors hover:text-brand-700"
                  >
                    {language === "zh-TW" ? "查看詳情" : "View detail"}
                  </button>
                </div>
                <div className="space-y-2">
                  {topTopics.length > 0 ? (
                    topTopics.map((topic, index) => {
                      const percentage = Math.min(100, Math.max(topic.mentionShare * 100, 0))
                      return (
                        <Tooltip key={`${topic.topic}-${index}`}>
                          <TooltipTrigger asChild>
                            <div className="group rounded-md border border-transparent px-3 py-2 transition-colors hover:bg-ink-50">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-ink-400">
                                      {(index + 1).toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-sm font-medium text-ink-900 truncate">
                                      {topic.topic}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                                    <div
                                      className="h-full rounded-full bg-brand-600"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-ink-500">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {`${topic.mentionCount} ${
                                language === "zh-TW" ? "次出現" : "occurrences"
                              } • ${percentage.toFixed(1)}%`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center rounded-md border border-dashed border-ink-200 py-8">
                      <span className="text-xs text-ink-500">
                        {language === "zh-TW"
                          ? "此篩選下暫無主題資料"
                          : "No topic data for the selected filters."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
