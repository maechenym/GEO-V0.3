"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Download, ExternalLink, ArrowUp, ArrowDown, HelpCircle, ChevronLeft, ChevronRight, Plus, X, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FadeUp } from "@/lib/animations"
import { DelayedTooltip } from "@/components/overview/DelayedTooltip"
import { useToast } from "@/hooks/use-toast"
import { CalendarIconButton } from "@/components/overview/CalendarIconButton"
import {
  formatDateShanghai,
  parseDateShanghai,
  getDefaultDateRange,
  getUserRegisteredAt,
  getDateRangeDays,
  getTodayShanghai,
} from "@/lib/date-utils"
import { subDays } from "date-fns"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services/api"
import type { SentimentData } from "@/types/sentiment"
import { CHART_COLORS } from "@/mocks/sentiment"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts"
import { useLanguageStore } from "@/store/language.store"
import { translate, getTooltipContent } from "@/lib/i18n"

interface SentimentFilters {
  timeRange: { start: string; end: string }
  brandId?: string
  productId?: string
  competitorIds: string[]
  platforms: string[]
  intents: string[]
  role?: string
}

export default function SentimentPage() {
  const { selectedBrandId, selectedProductId } = useBrandUIStore()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  // Time range state
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayShanghai(), [])
  
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery<SentimentData>({
    queryKey: ["sentiment", formatDateShanghai(dateRange.start), formatDateShanghai(dateRange.end), selectedProductId],
    queryFn: async () => {
      const response = await apiClient.get<SentimentData>("/api/sentiment", {
        params: {
          startDate: formatDateShanghai(dateRange.start),
          endDate: formatDateShanghai(dateRange.end),
          productId: selectedProductId || undefined,
        },
      })
      return response.data
    },
    staleTime: 0, // 禁用缓存，立即重新获取数据
  })

  // Extract data from API response
  const kpis = apiData?.kpis || null
  const sentimentIndexSeries = apiData?.trends || null
  const sentimentIndexRanking = apiData?.ranking || []
  const riskTopics = apiData?.riskTopics || []
  
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
  
  // Handle quick date range selection
  const handleQuickRange = (days: number) => {
    const end = getTodayShanghai()
    const start = days === 1 ? end : subDays(end, days - 1)
    handleDateRangeChange(start, end)
  }
  
  // Handle 1 day selection (显示最后两天数据：11.4和11.5)
  const handleOneDay = () => {
    // 固定使用数据文件的11.4和11.5两天：2025-11-04 到 2025-11-05
    const endDate = new Date("2025-11-05")
    const startDate = new Date("2025-11-04")
    handleDateRangeChange(startDate, endDate)
  }
  
  // Get period days
  const periodDays = getDateRangeDays(dateRange.start, dateRange.end)
  // 判断是否为1day模式：periodDays为1或2且日期范围不超过2天
  const dateDiffMs = dateRange.end.getTime() - dateRange.start.getTime()
  const isOneDay = periodDays <= 2 && dateDiffMs <= 172800000 // 2天的毫秒数
  
  // Time range button state (derived from dateRange)
  const timeRange = useMemo(() => {
    if (periodDays === 1) return "1d"
    if (periodDays === 7) return "7d"
    if (periodDays === 14) return "14d"
    if (periodDays === 30) return "30d"
    return "custom"
  }, [periodDays])

  // Filters state
  const [filters, setFilters] = useState<SentimentFilters>({
    timeRange: { 
      start: formatDateShanghai(dateRange.start), 
      end: formatDateShanghai(dateRange.end) 
    },
    brandId: selectedBrandId || undefined,
    productId: selectedProductId || undefined,
    competitorIds: [],
    platforms: [],
    intents: [],
    role: undefined,
  })

  // Pagination for Sentiment Score Rank
  const [rankingPage, setRankingPage] = useState(1)

  // Brand visibility toggle for Sentiment Trend chart
  const brands = useMemo(() => {
    if (!sentimentIndexSeries || sentimentIndexSeries.length === 0) return []
    // Extract brand names from sentiment index series keys
    const firstPoint = sentimentIndexSeries[0]
    const extractedBrands = Object.keys(firstPoint).filter((key) => key !== "date")
    console.log('[Sentiment] Extracted brands from series:', {
      seriesLength: sentimentIndexSeries.length,
      firstPointKeys: Object.keys(firstPoint),
      extractedBrands,
      count: extractedBrands.length,
    })
    return extractedBrands
  }, [sentimentIndexSeries])

  const MAX_COMPETITORS = 5 // Maximum number of competitors to show (excluding self brand)
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (brands.length > 0 && visibleBrands.size === 0) {
      const selfBrand = brands.find((b) => b === "英业达")
      const competitorBrands = brands.filter((b) => b !== "英业达")
      // Always include self brand, and up to MAX_COMPETITORS competitors
      const initialBrands = selfBrand
        ? [selfBrand, ...competitorBrands.slice(0, MAX_COMPETITORS)]
        : competitorBrands.slice(0, MAX_COMPETITORS)
      setVisibleBrands(new Set(initialBrands))
    }
  }, [brands, visibleBrands.size])

  const isSelfBrand = (brand: string) => brand === "英业达"

  const addBrand = (brand: string) => {
    // Don't allow adding self brand (it's always visible)
    if (isSelfBrand(brand)) return
    
    // Count only competitors (excluding self brand)
    const competitorCount = Array.from(visibleBrands).filter((b) => !isSelfBrand(b)).length
    
    // Allow adding if we haven't reached MAX_COMPETITORS
    if (competitorCount < MAX_COMPETITORS && !visibleBrands.has(brand)) {
      setVisibleBrands((prev) => new Set([...prev, brand]))
    }
  }

  const removeBrand = (brand: string) => {
    // Don't allow removing self brand
    if (isSelfBrand(brand)) return
    
    setVisibleBrands((prev) => {
      const next = new Set(prev)
      next.delete(brand)
      return next
    })
  }

  // Count only competitors ( excluding self brand)
  const competitorCount = Array.from(visibleBrands).filter((b) => !isSelfBrand(b)).length
  const canAddBrand = competitorCount < MAX_COMPETITORS
  // Filter out visible brands and self brand from available brands list
  const availableBrands = useMemo(() => {
    const result = brands.filter((b) => !visibleBrands.has(b) && !isSelfBrand(b))
    console.log('[Sentiment] Available brands calculation:', {
      totalBrands: brands.length,
      visibleBrands: Array.from(visibleBrands),
      competitorCount,
      availableBrands: result,
      canAddBrand,
    })
    return result
  }, [brands, visibleBrands, competitorCount, canAddBrand])

  const getBrandIcon = (brand: string) => {
    return brand.charAt(0).toUpperCase()
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "已复制",
        description: "网址已复制到剪贴板",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "无法复制网址",
        variant: "destructive",
      })
    }
  }

  // Debug: Log sentiment index series data when it changes
  useEffect(() => {
    if (sentimentIndexSeries && sentimentIndexSeries.length > 0) {
      const firstPoint = sentimentIndexSeries[0]
      const brandKeys = Object.keys(firstPoint).filter((key) => key !== "date")
      console.log('[Sentiment] Loaded sentiment index series:', {
        totalPoints: sentimentIndexSeries.length,
        brandsInData: brandKeys.length,
        brandNames: brandKeys,
      })
    }
  }, [sentimentIndexSeries])

  // Prepare chart data (filter by visible brands)
  const chartData = useMemo(() => {
    if (!sentimentIndexSeries || sentimentIndexSeries.length === 0) return []
    return sentimentIndexSeries.map((point) => {
      // 统一日期格式为 MM/dd
      let displayDate = point.date
      if (point.date.includes('-') && point.date.length === 10) {
        // 如果是 yyyy-MM-dd 格式，转换为 MM/dd
        const dateParts = point.date.split('-')
        displayDate = `${dateParts[1]}/${dateParts[2]}`
      }
      
      const filteredPoint: any = { date: displayDate }
      Array.from(visibleBrands).forEach((brand) => {
        if (point[brand] !== undefined) {
          filteredPoint[brand] = point[brand]
        }
      })
      return filteredPoint
    })
  }, [sentimentIndexSeries, visibleBrands])

  const handleReset = () => {
    const end = getTodayShanghai()
    const start = subDays(end, 29)
    handleDateRangeChange(start, end)
  }

  const handleExport = () => {
    console.log("Export", riskTopics?.length || 0)
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading sentiment data...</div>
      </div>
    )
  }

  if (error || !apiData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-destructive">
          Failed to load sentiment data. Please try again.
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
                <h1 className="text-xl font-semibold text-foreground">Sentiment Insights</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Analyze brand sentiment trends and identify risk topics
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
            {/* Top Section: Trend Chart and Ranking */}
            {kpis && sentimentIndexRanking && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
                {/* Left Column - Sentiment Trend Chart */}
                <div className="lg:col-span-3 space-y-4">
                  <FadeUp delay={0.1}>
                    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-semibold">Sentiment Trend</CardTitle>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getTooltipContent("Sentiment trend", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Brand Filter */}
                        <div className="mb-4 flex items-center gap-2 flex-wrap">
                          {Array.from(visibleBrands).map((brand, idx) => {
                            const color = CHART_COLORS[idx % CHART_COLORS.length]
                            return (
                              <div
                                key={brand}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800"
                              >
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                                  style={{ backgroundColor: color }}
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
                          {canAddBrand && availableBrands.length > 0 && (
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
                              <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                                {availableBrands.map((brand) => (
                                  <DropdownMenuItem key={brand} onClick={() => addBrand(brand)}>
                                    {translate(brand, language)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {(!canAddBrand || availableBrands.length === 0) && (
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

                        {!sentimentIndexSeries || sentimentIndexSeries.length === 0 ? (
                          <div className="h-[435px] w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-2">
                                Sentiment Trend Chart
                              </div>
                              <div className="text-xs text-muted-foreground">
                                No data available
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-[435px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                  dataKey="date"
                                  stroke="#6b7280"
                                  style={{ fontSize: "12px" }}
                                />
                                <YAxis
                                  domain={[0, 1]}
                                  stroke="#6b7280"
                                  style={{ fontSize: "12px" }}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                  }}
                                />
                                {Array.from(visibleBrands).map((brand, idx) => {
                                  const color = CHART_COLORS[idx % CHART_COLORS.length]
                                  return (
                                    <Line
                                      key={brand}
                                      type="monotone"
                                      dataKey={brand}
                                      stroke={color}
                                      strokeWidth={2}
                                      dot={{ r: 3 }}
                                      activeDot={{ r: 5 }}
                                      name={translate(brand, language)}
                                    />
                                  )
                                })}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </FadeUp>
                </div>

                {/* Right Column - Sentiment Score Rank */}
                <div className="lg:col-span-2 flex flex-col">
                  <FadeUp delay={0.2}>
                    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-semibold">Sentiment Score Rank</CardTitle>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getTooltipContent("Sentiment Score Rank", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
                        {sentimentIndexRanking && (() => {
                          // Sort brands by value (descending)
                          const sortedRanking = [...sentimentIndexRanking].sort((a, b) => b.value - a.value).map((item, index) => ({
                            ...item,
                            rank: index + 1,
                          }))
                          
                          const selfBrand = sortedRanking.find((item) => item.isSelf || item.brand === "英业达")
                          const brandsPerPage = 7
                          const totalBrands = sortedRanking.length
                          const totalPages = Math.max(1, Math.ceil(totalBrands / brandsPerPage))
                          
                          // Get paginated brands
                          const startIndex = (rankingPage - 1) * brandsPerPage
                          const endIndex = Math.min(startIndex + brandsPerPage, totalBrands)
                          const paginatedBrands = sortedRanking.slice(startIndex, endIndex)
                          
                          // Display delta based on mode: 1day shows rank change (integer), multi-day shows percentage
                          const formatDelta = (delta: number | undefined) => {
                            if (delta === undefined || delta === 0) return null
                            if (isOneDay) {
                              // 1day mode: delta is rank change (integer)
                              return delta > 0 ? `+${delta}` : `${delta}`
                            } else {
                              // Multi-day mode: delta is percentage
                              return delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`
                            }
                          }
                          
                          return (
                            <div className="flex-1 flex flex-col gap-2">
                              {/* Pinned Self Brand */}
                              {selfBrand && (
                                <motion.div
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
                                        <DelayedTooltip content={selfBrand.brand}>
                                          <span className="font-medium text-sm truncate">{translate(selfBrand.brand, language)}</span>
                                        </DelayedTooltip>
                                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                                          You
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2.5 ml-4">
                                    {(() => {
                                      const deltaStr = formatDelta(selfBrand.delta)
                                      if (deltaStr === null) {
                                        return (
                                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <span className="text-sm font-medium">{isOneDay ? "0" : "0%"}</span>
                                          </div>
                                        )
                                      }
                                      return selfBrand.delta! > 0 ? (
                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                          <ArrowUp className="h-4 w-4" />
                                          <span className="text-sm font-medium">{deltaStr}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                          <ArrowDown className="h-4 w-4" />
                                          <span className="text-sm font-medium">{deltaStr}</span>
                                        </div>
                                      )
                                    })()}
                                    <span className="text-sm font-medium">{selfBrand.value.toFixed(2)}</span>
                                  </div>
                                </motion.div>
                              )}
                              
                              {/* Divider */}
                              {selfBrand && <div className="border-t border-border my-1 mb-2" />}
                              
                              {/* Paginated Brand List */}
                              <div className="flex-1 flex flex-col gap-2">
                                {paginatedBrands.map((item, index) => {
                                  const isSelf = item.isSelf || item.brand === "英业达"
                                  return (
                                    <motion.div
                                      key={`${item.brand}-${item.rank}-${index}`}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg border transition-colors cursor-pointer ${
                                        isSelf
                                          ? "bg-primary/5 border-primary/20"
                                          : "bg-card border-border hover:bg-accent/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <div
                                          className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${
                                            isSelf
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {item.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <DelayedTooltip content={item.brand}>
                                              <span className="font-medium text-sm truncate">{translate(item.brand, language)}</span>
                                            </DelayedTooltip>
                                            {isSelf && (
                                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                You
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2.5 ml-4">
                                        {(() => {
                                          const deltaStr = formatDelta(item.delta)
                                          if (deltaStr === null) {
                                            return (
                                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <span className="text-sm font-medium">{isOneDay ? "0" : "0%"}</span>
                                              </div>
                                            )
                                          }
                                          return item.delta! > 0 ? (
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                              <ArrowUp className="h-4 w-4" />
                                              <span className="text-sm font-medium">{deltaStr}</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                              <ArrowDown className="h-4 w-4" />
                                              <span className="text-sm font-medium">{deltaStr}</span>
                                            </div>
                                          )
                                        })()}
                                        <span className="text-sm font-medium">{item.value.toFixed(2)}</span>
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </div>
                              
                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <div className="flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRankingPage((p) => Math.max(1, p - 1))}
                                        disabled={rankingPage === 1}
                                        className="h-8 w-8 p-0"
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                          <Button
                                            key={page}
                                            variant={rankingPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setRankingPage(page)}
                                            className="h-8 w-8 p-0 text-xs"
                                          >
                                            {page}
                                          </Button>
                                        ))}
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRankingPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={rankingPage === totalPages}
                                        className="h-8 w-8 p-0"
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  </FadeUp>
                </div>
              </div>
            )}

            {/* Sentiment Structure - Horizontal Stacked Bar Chart */}
            {kpis && (
              <FadeUp delay={0.25}>
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-lg font-semibold">Sentiment Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Stacked Progress Bar */}
                    <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative mb-4">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${kpis.positive}%` }}
                        title={`Positive: ${kpis.positive}%`}
                      />
                      <div
                        className="h-full bg-yellow-500 transition-all duration-300 absolute top-0"
                        style={{ 
                          left: `${kpis.positive}%`,
                          width: `${kpis.neutral}%` 
                        }}
                        title={`Neutral: ${kpis.neutral}%`}
                      />
                      <div
                        className="h-full bg-red-500 transition-all duration-300 absolute top-0"
                        style={{ 
                          left: `${kpis.positive + kpis.neutral}%`,
                          width: `${kpis.negative}%` 
                        }}
                        title={`Negative: ${kpis.negative}%`}
                      />
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Positive */}
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: "#16a34a" }}
                        />
                        <span className="text-sm font-medium">Positive</span>
                        <span className="text-sm font-semibold text-muted-foreground">{kpis.positive}%</span>
                      </div>
                      
                      {/* Neutral */}
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: "#fbbf24" }}
                        />
                        <span className="text-sm font-medium">Neutral</span>
                        <span className="text-sm font-semibold text-muted-foreground">{kpis.neutral}%</span>
                      </div>
                      
                      {/* Negative */}
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: "#ef4444" }}
                        />
                        <span className="text-sm font-medium">Negative</span>
                        <span className="text-sm font-semibold text-muted-foreground">{kpis.negative}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            )}

            {/* Risk Queries Table */}
            <FadeUp delay={0.25}>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Risk queries</CardTitle>
                </CardHeader>
                <CardContent>
                  {riskTopics && riskTopics.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-sm text-muted-foreground">
                        No risk topics found.
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-[10%]">
                              Sentiment
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-[30%]">
                              Query
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-[40%]">
                              AI Answer
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-[20%]">
                              Source
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {riskTopics?.map((topic) => (
                            <tr
                              key={topic.id}
                              className="border-b border-border hover:bg-accent/50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                                    topic.sentiment < -0.3 ? "bg-red-500" : topic.sentiment < 0 ? "bg-orange-500" : topic.sentiment > 0.3 ? "bg-green-500" : "bg-yellow-500"
                                  }`} />
                                  <span className="text-sm font-medium">
                                    {topic.sentiment < -0.3 ? "Negative" : topic.sentiment < 0 ? "Slightly Negative" : topic.sentiment > 0.3 ? "Positive" : topic.sentiment > 0 ? "Slightly Positive" : "Neutral"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">{topic.prompt}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-muted-foreground">{topic.answer}</span>
                              </td>
                              <td className="py-3 px-4">
                                {topic.sourceUrl ? (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`https://${topic.sourceUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                      {topic.sourceUrl}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <button
                                      onClick={() => handleCopyUrl(`https://${topic.sourceUrl}`)}
                                      className="opacity-70 hover:opacity-100 transition-opacity"
                                      title="复制网址"
                                    >
                                      <Copy className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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