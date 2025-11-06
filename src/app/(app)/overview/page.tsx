"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, Download, HelpCircle, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { FadeUp, StaggerContainer, staggerItem } from "@/lib/animations"
import { CalendarIconButton } from "@/components/overview/CalendarIconButton"
import { DelayedTooltip } from "@/components/overview/DelayedTooltip"
import {
  formatDateTokyo,
  parseDateTokyo,
  getDefaultDateRange,
  getUserRegisteredAt,
  getDateRangeDays,
  getTodayTokyo,
} from "@/lib/date-utils"
import { exportBrandInfluenceToExcel, canExportExcel } from "@/lib/export-utils"
import { useNavigateWithPulse } from "@/lib/navigation-utils"
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

// Chart colors for brands
const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
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

export default function OverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { navigateWithPulse } = useNavigateWithPulse()
  const { language } = useLanguageStore()
  const { selectedProductId } = useBrandUIStore()

  // Initialize date range from URL or default
  const initialDateRange = useMemo(() => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")
    
    if (startParam && endParam) {
      try {
        return {
          start: parseDateTokyo(startParam),
          end: parseDateTokyo(endParam),
        }
      } catch {
        return getDefaultDateRange()
      }
    }
    return getDefaultDateRange()
  }, [searchParams])

  const [dateRange, setDateRange] = useState(initialDateRange)
  const [currentPage, setCurrentPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const MAX_VISIBLE_BRANDS = 6
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(new Set())

  // Get user registered date (fallback to 30 days ago)
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayTokyo(), [])

  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery<OverviewData>({
    queryKey: ["overview", formatDateTokyo(dateRange.start), formatDateTokyo(dateRange.end), selectedProductId],
    queryFn: async () => {
      const response = await apiClient.get<OverviewData>("/api/overview", {
        params: {
          startDate: formatDateTokyo(dateRange.start),
          endDate: formatDateTokyo(dateRange.end),
          productId: selectedProductId || undefined,
        },
      })
      return response.data
    },
    staleTime: 0, // 禁用缓存，立即重新获取数据
  })

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

  // Use API data - prepare chart data for multiple brands
  const selectedBrandsArray = Array.from(visibleBrands)
  const chartData = useMemo(() => {
    if (!apiData?.brandInfluence?.trend || selectedBrandsArray.length === 0) return []
    
    // Get all dates from the brand influence trend
    const dates = apiData.brandInfluence.trend.map((t) => t.date)
    
    console.log('[Overview Frontend] brandInfluence.trend:', apiData.brandInfluence.trend)
    console.log('[Overview Frontend] dates from trend:', dates)
    console.log('[Overview Frontend] trend length:', apiData.brandInfluence.trend.length)
    
    // Get competitor trends from API response
    const competitorTrends = (apiData as any).competitorTrends || {}
    
    // Create chart data structure
    const chartDataResult = dates.map((date, index) => {
      const dataPoint: Record<string, string | number> = {
        date: format(new Date(date), "MM/dd"),
        fullDate: date,
      }
      
      // Add influence value for each selected brand
      selectedBrandsArray.forEach((brandName) => {
        if (brandName === "Your Brand" || brandName === "英业达") {
          // Use brandInfluence trend for self brand
          dataPoint[brandName] = apiData.brandInfluence.trend[index]?.brandInfluence || 0
        } else {
          // Use competitor trend if available
          const competitorTrend = competitorTrends[brandName]
          if (competitorTrend && competitorTrend[index]) {
            dataPoint[brandName] = competitorTrend[index].brandInfluence || 0
          } else {
            // Fallback to competitor score from ranking
            const competitor = apiData.ranking.find((c) => c.name === brandName)
            dataPoint[brandName] = competitor?.score || 0
          }
        }
      })
      
      return dataPoint
    })
    
    console.log('[Overview Frontend] chartData result:', chartDataResult)
    return chartDataResult
  }, [selectedBrandsArray, apiData])

  const data: OverviewData | null = useMemo(() => {
    if (!apiData) return null
    console.log('[Overview] Updating data from apiData, ranking length:', apiData.ranking?.length)
    
    return {
      kpis: apiData.kpis,
      brandInfluence: apiData.brandInfluence,
      ranking: apiData.ranking,
    }
  }, [apiData])

  // Update URL when date range changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("start", formatDateTokyo(dateRange.start))
    params.set("end", formatDateTokyo(dateRange.end))
    router.replace(`/overview?${params.toString()}`, { scroll: false })
  }, [dateRange, router, searchParams])

  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    setCurrentPage(1) // Reset pagination
  }

  // Handle quick date range selection
  const handleQuickRange = (days: number) => {
    const end = getTodayTokyo()
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
        formatDateTokyo(dateRange.start),
        formatDateTokyo(dateRange.end)
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

  // Handle KPI click navigation
  const handleKPIClick = (metric: "Reach" | "Rank" | "Focus") => {
    const metricMap: Record<string, "reach" | "rank" | "focus"> = {
      Reach: "reach",
      Rank: "rank",
      Focus: "focus",
    }
    navigateWithPulse(
      metricMap[metric],
      formatDateTokyo(dateRange.start),
      formatDateTokyo(dateRange.end)
    )
  }

  // Sort brands and calculate pagination (must be before conditional returns)
  const sortedBrands = useMemo(() => {
    if (!apiData?.ranking) return []
    console.log('[Overview] Updating sortedBrands, apiData.ranking length:', apiData.ranking.length, 'dateRange:', formatDateTokyo(dateRange.start), '-', formatDateTokyo(dateRange.end))
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
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Loading overview data...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait</div>
        </div>
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Failed to load overview data</div>
          <div className="text-sm text-muted-foreground mt-2">Please try again later</div>
        </div>
      </div>
    )
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
                <h1 className="text-xl font-semibold text-foreground">Overview</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Brand AI visibility, sentiment & competitive landscape
                </p>
              </div>

              {/* Right: Filters */}
              <div className="flex items-center gap-3">
                {/* Time Range Selector */}
                <div className="flex items-center gap-2 border-r border-border pr-3">
                  <Button
                    variant={isOneDay ? "default" : "outline"}
                    size="sm"
                    onClick={handleOneDay}
                    className={`h-8 text-xs ${isOneDay ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  >
                    1 day
                  </Button>
                  <Button
                    variant={periodDays === 7 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickRange(7)}
                    className="h-8 text-xs"
                  >
                    7 days
                  </Button>
                  <Button
                    variant={periodDays === 14 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickRange(14)}
                    className="h-8 text-xs"
                  >
                    14 days
                  </Button>
                  <Button
                    variant={periodDays === 30 ? "default" : "outline"}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleExport}
                  disabled={exporting || !data}
                >
                  <Download className="h-3 w-3 mr-1.5" />
                  {exporting ? "导出中..." : "Export"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto pl-4 pr-4 pt-4 pb-10 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-stretch">
            {/* Left Column - Brand Influence & KPIs */}
            <div className="lg:col-span-5 space-y-4">
              {/* Brand Influence Card */}
              <FadeUp delay={0.1}>
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold">Brand influence</CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getTooltipContent("Brand influence", language)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    {/* Brand Filter */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {Array.from(visibleBrands).map((brand, idx) => {
                        const color = CHART_COLORS[idx % CHART_COLORS.length]
                        return (
                          <div
                            key={brand}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                              isSelfBrand(brand)
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                                isSelfBrand(brand)
                                  ? "bg-white text-primary"
                                  : "text-white"
                              }`}
                              style={!isSelfBrand(brand) ? { backgroundColor: color } : {}}
                            >
                              {getBrandIcon(brand)}
                            </div>
                            <span className="text-sm">{translate(brand, language)}</span>
                            {!isSelfBrand(brand) && (
                              <button
                                onClick={() => removeBrand(brand)}
                                className="opacity-70 hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                      {canAddBrand && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {availableBrands.map((brand) => (
                              <DropdownMenuItem key={brand} onClick={() => addBrand(brand)}>
                                {translate(brand, language)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {!canAddBrand && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-sm opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Current Score with Change Rate */}
                    <div className="mb-4 flex items-baseline gap-4">
                      <span className="text-3xl font-bold">{Math.round(data.brandInfluence.current)}</span>
                      {/* Change Rate Section - Small inline */}
                      <div className="flex items-center gap-1.5">
                        {data.brandInfluence.changeRate > 0 ? (
                          <>
                            <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-base font-semibold text-green-600 dark:text-green-400">
                              {Math.abs(data.brandInfluence.changeRate).toFixed(1)}
                            </span>
                          </>
                        ) : data.brandInfluence.changeRate < 0 ? (
                          <>
                            <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-base font-semibold text-red-600 dark:text-red-400">
                              {Math.abs(data.brandInfluence.changeRate).toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-semibold text-gray-600 dark:text-gray-400">0</span>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">
                          {isOneDay ? "vs previous day" : `vs previous ${periodDays} days`}
                        </span>
                      </div>
                    </div>
                    {/* Brand Influence Chart */}
                    <div className="h-[300px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => value.toFixed(1)}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              padding: "8px 12px",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "4px" }}
                            formatter={(value: number, name: string) => [`${value.toFixed(1)}`, translate(name, language)]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          {selectedBrandsArray.map((brandName, idx) => {
                            const color = CHART_COLORS[idx % CHART_COLORS.length]
                            return (
                              <Line
                                key={brandName}
                                type="monotone"
                                dataKey={brandName}
                                stroke={color}
                                strokeWidth={2}
                                dot={{ r: 4, fill: color }}
                                activeDot={{ r: 6 }}
                                name={brandName}
                              />
                            )
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>

              {/* KPI Cards Row */}
              <StaggerContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.kpis
                    .filter((kpi) => kpi.name !== "Visibility")
                    .map((kpi, index) => (
                    <motion.div
                      key={kpi.name}
                      variants={staggerItem}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card
                        className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full ${
                          kpi.name === "Reach" || kpi.name === "Rank" || kpi.name === "Focus"
                            ? "cursor-pointer"
                            : ""
                        }`}
                        onClick={() => {
                          if (kpi.name === "Reach" || kpi.name === "Rank" || kpi.name === "Focus") {
                            handleKPIClick(kpi.name)
                          }
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-black dark:text-white">
                              {kpi.name}
                            </CardTitle>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getTooltipContent(kpi.name, language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 pt-0" style={{ paddingBottom: "30px" }}>
                          <div className="flex items-end justify-between -mb-[10px]">
                            <span className="text-3xl font-bold">
                              {kpi.value}
                              <span className="text-sm font-medium ml-1">{kpi.unit}</span>
                            </span>
                            {kpi.delta > 0 ? (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <ArrowUp className="h-4 w-4" />
                                <span className="text-sm font-medium">{kpi.delta}%</span>
                              </div>
                            ) : kpi.delta < 0 ? (
                              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <ArrowDown className="h-4 w-4" />
                                <span className="text-sm font-medium">{Math.abs(kpi.delta)}%</span>
                              </div>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </StaggerContainer>
            </div>

            {/* Right Column - Competitor Ranking */}
            <div className="lg:col-span-2 flex flex-col">
              <FadeUp delay={0.2}>
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold">Influence ranking</CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getTooltipContent("Influence ranking", language)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Pinned Self Brand */}
                      {selfBrand && (
                        <motion.div
                          key={`self-brand-${selfBrand.name}-${selfBrand.rank}-${selfBrand.score}-${formatDateTokyo(dateRange.start)}-${formatDateTokyo(dateRange.end)}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg border bg-primary/5 border-primary/20 mb-1.5"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 bg-primary text-primary-foreground">
                              {selfBrand.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <DelayedTooltip content={selfBrand.name}>
                                  <span className="font-medium text-sm truncate">{translate(selfBrand.name, language)}</span>
                                </DelayedTooltip>
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  You
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 ml-4">
                            {selfBrand.delta > 0 ? (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <ArrowUp className="h-4 w-4" />
                                <span className="text-sm font-medium">{Math.round(selfBrand.delta)}</span>
                              </div>
                            ) : selfBrand.delta < 0 ? (
                              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <ArrowDown className="h-4 w-4" />
                                <span className="text-sm font-medium">{Math.abs(Math.round(selfBrand.delta))}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <span className="text-sm font-medium">0</span>
                              </div>
                            )}
                            <span className="text-sm font-medium">{Math.round(selfBrand.score)}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Divider */}
                      {selfBrand && <div className="border-t border-border my-1 mb-2" />}

                      {/* Paginated Brand List */}
                      <div className="flex-1 flex flex-col gap-2">
                        {paginatedBrands.map((competitor, index) => (
                          <motion.div
                            key={`${competitor.name}-${competitor.rank}-${competitor.score}-${formatDateTokyo(dateRange.start)}-${formatDateTokyo(dateRange.end)}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between py-1.5 px-2 rounded-lg border transition-colors cursor-pointer ${
                              competitor.isSelf
                                ? "bg-primary/5 border-primary/20"
                                : "bg-card border-border hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${
                                  competitor.isSelf
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {competitor.rank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <DelayedTooltip content={competitor.name}>
                                    <span className="font-medium text-sm truncate">{translate(competitor.name, language)}</span>
                                  </DelayedTooltip>
                                  {competitor.isSelf && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 ml-4">
                              {competitor.delta > 0 ? (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <ArrowUp className="h-4 w-4" />
                                  <span className="text-sm font-medium">{Math.round(competitor.delta)}</span>
                                </div>
                              ) : competitor.delta < 0 ? (
                                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                  <ArrowDown className="h-4 w-4" />
                                  <span className="text-sm font-medium">{Math.abs(Math.round(competitor.delta))}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <span className="text-sm font-medium">0</span>
                                </div>
                              )}
                              <span className="text-sm font-medium">{Math.round(competitor.score)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

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
                  </CardContent>
                </Card>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
