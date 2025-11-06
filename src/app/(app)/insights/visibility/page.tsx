"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, Download, ArrowUp, ArrowDown, HelpCircle, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FadeUp } from "@/lib/animations"
import { useToast } from "@/hooks/use-toast"
import { CalendarIconButtonShanghai } from "@/components/visibility/CalendarIconButtonShanghai"
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
import { CHART_COLORS } from "@/mocks/visibility"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { useLanguageStore } from "@/store/language.store"
import { translate, getTooltipContent } from "@/lib/i18n"
import { useBrandUIStore } from "@/store/brand-ui.store"

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
}

type RankingMetric = "visibility" | "reach" | "rank" | "focus"

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
  const { selectedProductId } = useBrandUIStore()
  
  // Date range state
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  
  // Tab/metric state (from URL or default)
  const tabParam = searchParams.get("tab") as RankingMetric | null
  const [tab, setTab] = useState<RankingMetric>(tabParam || "reach")
  
  // Pulse animation state
  const pulseParam = searchParams.get("pulse") as RankingMetric | null
  const [pulsingCard, setPulsingCard] = useState<string | null>(null)
  
  // Pagination state for each ranking card
  const [visibilityPage, setVisibilityPage] = useState(1)
  const [reachPage, setReachPage] = useState(1)
  const [rankPage, setRankPage] = useState(1)
  const [focusPage, setFocusPage] = useState(1)
  
  // Brand visibility toggle - max 6 brands
  const MAX_VISIBLE_BRANDS = 6
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(new Set())
  
  // Get user registered date (fallback to 30 days ago)
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayShanghai(), [])
  
  // Initialize date range from URL or default
  useEffect(() => {
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")
    
    if (startParam && endParam) {
      try {
        const parsedStart = parseDateShanghai(startParam)
        const parsedEnd = parseDateShanghai(endParam)
        setDateRange({
          start: parsedStart,
          end: parsedEnd,
        })
      } catch {
        setDateRange(getDefaultDateRange())
      }
    }
  }, [searchParams])
  
  // Initialize tab from URL or pulse param
  useEffect(() => {
    if (pulseParam) {
      setTab(pulseParam)
    } else if (tabParam) {
      setTab(tabParam)
    }
  }, [pulseParam, tabParam])
  
  // Sync URL when state changes
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString())
    urlParams.set("start", formatDateShanghai(dateRange.start))
    urlParams.set("end", formatDateShanghai(dateRange.end))
    urlParams.set("tz", "Asia/Shanghai")
    urlParams.set("productId", "all")
    urlParams.set("tab", tab)
    
    // Remove pulse param after handling
    if (pulseParam) {
      urlParams.delete("pulse")
    }
    
    router.replace(`/insights/visibility?${urlParams.toString()}`, { scroll: false })
  }, [dateRange, tab, router, searchParams, pulseParam])
  
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery<VisibilityAPIResponse>({
    queryKey: ["visibility", formatDateShanghai(dateRange.start), formatDateShanghai(dateRange.end), selectedProductId],
    queryFn: async () => {
      const response = await apiClient.get<VisibilityAPIResponse>("/api/visibility", {
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

  // Extract ranking and trend data from API response
  const visibilityRankingData = useMemo(() => apiData?.visibility.ranking || [], [apiData])
  const reachRankingData = useMemo(() => apiData?.reach.ranking || [], [apiData])
  const rankRankingData = useMemo(() => apiData?.rank.ranking || [], [apiData])
  const focusRankingData = useMemo(() => apiData?.focus.ranking || [], [apiData])
  
  // Get trend data based on tab
  const trendData = useMemo(() => {
    if (!apiData) return []
    
    switch (tab) {
      case "visibility":
        return apiData.visibility.trends
      case "reach":
        return apiData.reach.trends
      case "rank":
        return apiData.rank.trends
      case "focus":
        return apiData.focus.trends
      default:
        return apiData.reach.trends
    }
  }, [tab, apiData])
  
  // Calculate metrics data from API
  const metricsData = useMemo(() => {
    if (!apiData) {
      return {
        visibility: { value: 0, growth: 0 },
        reach: { value: 0, growth: 0 },
        rank: { value: 0, growth: 0 },
        focus: { value: 0, growth: 0 },
      }
    }
    
    const visibilityItem = apiData.visibility.ranking.find(item => item.isSelf)
    const reachItem = apiData.reach.ranking.find(item => item.isSelf)
    const rankItem = apiData.rank.ranking.find(item => item.isSelf)
    const focusItem = apiData.focus.ranking.find(item => item.isSelf)
    
    return {
      visibility: {
        value: visibilityItem?.value || 0,
        growth: visibilityItem?.delta || 0,
      },
      reach: {
        value: reachItem?.value || 0,
        growth: reachItem?.delta || 0,
      },
      rank: {
        value: rankItem?.value || 0,
        growth: rankItem?.delta || 0,
      },
      focus: {
        value: focusItem?.value || 0,
        growth: focusItem?.delta || 0,
      },
    }
  }, [apiData])
  
  // Handle pulse animation
  useEffect(() => {
    if (pulseParam) {
      setPulsingCard(pulseParam)
      setTimeout(() => {
        const cardElement = document.getElementById(`ranking-card-${pulseParam}`)
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)
      
      const timer = setTimeout(() => {
        setPulsingCard(null)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [pulseParam])
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    setVisibilityPage(1)
    setReachPage(1)
    setRankPage(1)
    setFocusPage(1)
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
    // 这样会显示为11.4和11.5（因为日期减1）
    const endDate = new Date("2025-11-05")
    const startDate = new Date("2025-11-04")
    handleDateRangeChange(startDate, endDate)
  }
  
  // Handle tab change
  const handleTabChange = (newTab: RankingMetric) => {
    setTab(newTab)
  }
  
  // Get period days
  const periodDays = getDateRangeDays(dateRange.start, dateRange.end)
  // 判断是否为1day模式：periodDays为1或2且日期范围不超过2天
  const dateDiffMs = dateRange.end.getTime() - dateRange.start.getTime()
  const isOneDay = periodDays <= 2 && dateDiffMs <= 172800000 // 2天的毫秒数
  
  // Get brands from ranking data
  const brands = useMemo(() => {
    return reachRankingData.map((item: RankingItem) => item.brand)
  }, [reachRankingData])
  
  // Initialize visible brands
  useEffect(() => {
    if (brands.length > 0 && visibleBrands.size === 0) {
      const selfBrand = brands.find((b: string) => b === "英业达")
      const otherBrands = brands.filter((b: string) => b !== "英业达")
      const initialBrands = selfBrand
        ? [selfBrand, ...otherBrands.slice(0, MAX_VISIBLE_BRANDS - 1)]
        : otherBrands.slice(0, MAX_VISIBLE_BRANDS)
      setVisibleBrands(new Set(initialBrands))
    }
  }, [brands, visibleBrands.size])
  
  const toggleBrand = (brand: string) => {
    setVisibleBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) {
        next.delete(brand)
      } else {
        if (next.size < MAX_VISIBLE_BRANDS) {
          next.add(brand)
        }
      }
      return next
    })
  }
  
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
  
  const isSelfBrand = (brand: string) => {
    return brand === "英业达"
  }
  
  const canAddBrand = visibleBrands.size < MAX_VISIBLE_BRANDS
  const availableBrands = brands.filter((b: string) => !visibleBrands.has(b))
  
  // Get brand icon (first letter or initial)
  const getBrandIcon = (brand: string) => {
    return brand.charAt(0).toUpperCase()
  }
  
  const handleExport = () => {
    toast({
      title: "导出功能",
      description: "导出功能开发中",
    })
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

  // Prepare chart data from trendData
  const chartData = useMemo(() => {
    if (!trendData || trendData.length === 0) return []
    
    const selectedBrandsArray = Array.from(visibleBrands)
    
    return trendData.map((point) => {
      const dataPoint: Record<string, string | number> = {
        date: format(new Date(point.date), "MM/dd"),
        fullDate: point.date,
      }
      
      // Add value for each selected brand
      selectedBrandsArray.forEach((brandName) => {
        const value = point[brandName]
        if (value !== undefined) {
          dataPoint[brandName] = typeof value === 'number' ? value : parseFloat(value as string) || 0
        } else {
          dataPoint[brandName] = 0
        }
      })
      
      return dataPoint
    })
  }, [trendData, visibleBrands])
  
  const getMetricDescription = (metric: RankingMetric) => {
    switch (metric) {
      case "visibility":
        return "Ranks brands by overall visibility in AI answers."
      case "reach":
        return "Ranks brands by how often they're mentioned by AI."
      case "rank":
        return "Ranks brands by how early they appear in AI answers."
      case "focus":
        return "Ranks brands by how much of the answer content focuses on them."
    }
  }
  
  // Helper function to get ranking data for a metric
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
  
  // Render ranking content (without Card wrapper)
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
    
    // Get paginated brands (including self if in range)
    const startIndex = (currentPage - 1) * brandsPerPage
    const endIndex = startIndex + brandsPerPage
    const paginatedBrands = rankingItems.slice(startIndex, endIndex)
    
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {getMetricLabel(metric)} Ranking
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getMetricDescription(metric)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 pb-4">
          <div className="flex-1 flex flex-col gap-2">
            {/* Pinned Self Brand - Always at top */}
            {selfBrand && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center py-1.5 px-2 rounded-lg border bg-primary/5 border-primary/20 mb-1.5 gap-3"
              >
                <div className="flex items-center gap-2.5 flex-[3] min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 bg-primary text-primary-foreground">
                    {selfBrand.rank}
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <DelayedTooltip content={selfBrand.brand}>
                        <span className="font-medium text-sm break-words">{translate(selfBrand.brand, language)}</span>
                      </DelayedTooltip>
                      <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                        You
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {selfBrand.delta !== 0 ? (
                    selfBrand.delta > 0 ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <ArrowUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {metric === "rank" ? Math.round(selfBrand.delta) : Math.abs(Math.round(selfBrand.delta))}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <ArrowDown className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {metric === "rank" ? Math.abs(Math.round(selfBrand.delta)) : Math.abs(Math.round(selfBrand.delta))}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <span className="text-sm font-medium">0</span>
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {selfBrand.value.toFixed(metric === "rank" ? 1 : 1)}{selfBrand.unit}
                  </span>
                </div>
              </motion.div>
            )}
            
            {/* Divider */}
            {selfBrand && <div className="border-t border-border my-1 mb-2" />}
            
            {/* Paginated Brand List */}
            <div className="flex-1 flex flex-col gap-2">
              {paginatedBrands.map((item, index) => (
                <motion.div
                  key={`${metric}-${item.brand}-${item.rank}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center py-1.5 px-2 rounded-lg border transition-colors cursor-pointer gap-3 ${
                    item.isSelf
                      ? "bg-primary/5 border-primary/20"
                      : "bg-card border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-[3] min-w-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${
                        item.isSelf
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.rank}
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <DelayedTooltip content={item.brand}>
                          <span className="font-medium text-sm break-words">{translate(item.brand, language)}</span>
                        </DelayedTooltip>
                        {item.isSelf && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {item.delta !== 0 ? (
                      item.delta > 0 ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {metric === "rank" ? Math.round(item.delta) : Math.abs(Math.round(item.delta))}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <ArrowDown className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {metric === "rank" ? Math.abs(Math.round(item.delta)) : Math.abs(Math.round(item.delta))}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span className="text-sm font-medium">0</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {item.value.toFixed(metric === "rank" ? 1 : 1)}{item.unit}
                    </span>
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
                      onClick={handlePrevPage}
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
                          onClick={() => handlePageClick(page)}
                          className="h-8 w-8 p-0 text-xs"
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
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Loading and error states
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
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Failed to load visibility data</div>
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
                <h1 className="text-xl font-semibold text-foreground">Visibility Insights</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Analyze brand visibility metrics: Reach, Rank, and Focus
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
                  <CalendarIconButtonShanghai
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
            {/* Combined Ranking Card */}
            <FadeUp delay={0.1}>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Visibility Ranking */}
                    <div
                      id="ranking-card-visibility"
                      className={`flex flex-col min-h-0 transition-all duration-300 ${
                        pulsingCard === "visibility"
                          ? "animate-pulse shadow-lg shadow-primary/50"
                          : ""
                      }`}
                    >
                      {renderRankingContent("visibility", visibilityPage, setVisibilityPage)}
                    </div>

                    {/* Reach Ranking */}
                    <div
                      id="ranking-card-reach"
                      className={`flex flex-col min-h-0 transition-all duration-300 ${
                        pulsingCard === "reach"
                          ? "animate-pulse shadow-lg shadow-primary/50"
                          : ""
                      }`}
                    >
                      {renderRankingContent("reach", reachPage, setReachPage)}
                    </div>

                    {/* Rank Ranking */}
                    <div
                      id="ranking-card-rank"
                      className={`flex flex-col min-h-0 transition-all duration-300 ${
                        pulsingCard === "rank"
                          ? "animate-pulse shadow-lg shadow-primary/50"
                          : ""
                      }`}
                    >
                      {renderRankingContent("rank", rankPage, setRankPage)}
                    </div>

                    {/* Focus Ranking */}
                    <div
                      id="ranking-card-focus"
                      className={`flex flex-col min-h-0 transition-all duration-300 ${
                        pulsingCard === "focus"
                          ? "animate-pulse shadow-lg shadow-primary/50"
                          : ""
                      }`}
                    >
                      {renderRankingContent("focus", focusPage, setFocusPage)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeUp>

            {/* Trend Chart Card */}
            <FadeUp delay={0.2}>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>Trend</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipContent("Trend", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={tab} onValueChange={(value) => handleTabChange(value as RankingMetric)}>
                      <SelectTrigger className="w-[140px] text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visibility">Visibility</SelectItem>
                        <SelectItem value="reach">Reach</SelectItem>
                        <SelectItem value="rank">Rank</SelectItem>
                        <SelectItem value="focus">Focus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Brand Filter */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    {Array.from(visibleBrands).map((brand: string, idx: number) => {
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

                  {/* Trend Chart */}
                  {!trendData || trendData.length === 0 ? (
                    <div className="h-[400px] w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">
                          {getMetricLabel(tab)} Trend Chart
                        </div>
                        <div className="text-xs text-muted-foreground">
                          No data available
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                          {Array.from(visibleBrands).map((brandName, idx) => {
                            const color = CHART_COLORS[idx % CHART_COLORS.length]
                            return (
                              <Line
                                key={brandName}
                                type="monotone"
                                dataKey={brandName}
                                stroke={color}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                                name={translate(brandName, language)}
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
        </div>
      </div>
    </TooltipProvider>
  )
}
