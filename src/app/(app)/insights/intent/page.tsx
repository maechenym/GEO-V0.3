"use client"

import { useEffect, useMemo, useState } from "react"
import React from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PageHeaderFilterBar } from "@/components/filters/PageHeaderFilterBar"
import { FadeUp, StaggerContainer, staggerItem } from "@/lib/animations"
import { mockIntentKpis, mockTopicRows, simulateLoad } from "@/mocks/intent"
import { IntentFilters, TopicRow, SortKey, PromptItem } from "@/types/intent"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import { translate, getTooltipContent } from "@/lib/i18n"
import { getDefaultDateRange, getUserRegisteredAt, getTodayShanghai } from "@/lib/date-utils"
import { INK_COLORS, CHART_PRIMARY_COLOR } from "@/lib/design-tokens"
import { MODEL_OPTIONS } from "@/constants/models"
import type { ModelOptionValue } from "@/constants/models"
import { useSearchParams } from "next/navigation"

const todayStr = () => new Date().toISOString().slice(0, 10)
const daysAgoStr = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

export default function IntentPage() {
  const { selectedBrandId, selectedProductId } = useBrandUIStore()
  const { language } = useLanguageStore()
  const searchParams = useSearchParams()

  // Initialize model from URL or default to "all"
  const [selectedModel, setSelectedModel] = useState<ModelOptionValue>(
    (searchParams.get("model") as ModelOptionValue) || "all"
  )

  // Date range state
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayShanghai(), [])

  // Filters state
  const [filters, setFilters] = useState<IntentFilters>({
    timeRange: { start: daysAgoStr(30), end: todayStr() },
    brandId: selectedBrandId || undefined,
    productId: selectedProductId || undefined,
    platforms: ["ChatGPT", "Gemini", "Claude"],
    intents: [],
    role: undefined,
    mentionBrand: false,
    visibilitySort: null,
    model: selectedModel,
  })

  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
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
  const [kpis, setKpis] = useState<typeof mockIntentKpis | null>(null)
  const [rows, setRows] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("topicHot")

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPrompt, setDrawerPrompt] = useState<PromptItem | undefined>(undefined)
  const [drawerTopic, setDrawerTopic] = useState<TopicRow | undefined>(undefined)

  // Expanded topics
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(new Set())

  // Sort state for expanded table (per topic)
  const [expandedTableSort, setExpandedTableSort] = useState<{
    column: "rank" | "focus" | null
    order: "asc" | "desc"
  }>({ column: null, order: "asc" })

  // Load data
  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([simulateLoad(mockIntentKpis, 400), simulateLoad(mockTopicRows, 600)])
      .then(([k, r]) => {
        setKpis(k)
        setRows(r)
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [])

  // Sorting
  const sortedRows = useMemo(() => {
    const cloned = [...rows]
    switch (sortKey) {
      case "topicHot":
        cloned.sort((a, b) => b.promptCount - a.promptCount)
        break
      case "rankAsc":
        cloned.sort((a, b) => (a.rank || 999) - (b.rank || 999))
        break
      case "rankDesc":
        cloned.sort((a, b) => (b.rank || 999) - (a.rank || 999))
        break
      case "reachAsc":
        cloned.sort((a, b) => a.mentionRate - b.mentionRate)
        break
      case "reachDesc":
        cloned.sort((a, b) => b.mentionRate - a.mentionRate)
        break
      case "focusAsc":
        cloned.sort((a, b) => a.visibility - b.visibility)
        break
      case "focusDesc":
        cloned.sort((a, b) => b.visibility - a.visibility)
        break
      case "sentimentAsc":
        cloned.sort((a, b) => (a.sentiment ?? -1) - (b.sentiment ?? -1))
        break
      case "sentimentDesc":
        cloned.sort((a, b) => (b.sentiment ?? -1) - (a.sentiment ?? -1))
        break
      case "visibility":
        cloned.sort((a, b) =>
          filters.visibilitySort === "asc"
            ? a.visibility - b.visibility
            : b.visibility - a.visibility
        )
        break
    }
    return cloned
  }, [rows, sortKey, filters.visibilitySort])

  // Filtering
  const filteredRows = useMemo(() => {
    let r = sortedRows
    if (filters.role) r = r.filter((t) => t.prompts.some((p) => p.role === filters.role))
    if (filters.platforms.length)
      r = r.filter((t) => t.prompts.some((p) => filters.platforms.includes(p.platform)))
    if (filters.intents.length) r = r.filter((t) => filters.intents.includes(t.intent))
    if (filters.mentionBrand)
      r = r.filter((t) => t.prompts.some((p) => p.mentionsBrand))
    return r
  }, [sortedRows, filters])

  // Derive KPIs for current scope
  const scopedKpis = useMemo(() => {
    if (!kpis) return null
    const topicCount = 15 // Fixed to 15 core queries
    const promptCount = filteredRows.reduce((sum, t) => sum + t.prompts.length, 0)
    // Total queries should be at least 15 times more than core queries (topicCount)
    // So totalQueries >= topicCount * 16 (at least 16 times, which is 15 times more)
    const totalQueries = Math.max(topicCount * 16, promptCount + 1000)
    const topicAvgRanks = filteredRows.map((t) => {
      const ranks = t.prompts.map((p) => p.rank || 6)
      return ranks.length ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 6
    })
    const compositeRank = topicAvgRanks.length
      ? Math.max(1, Math.round(topicAvgRanks.reduce((a, b) => a + b, 0) / topicAvgRanks.length))
      : kpis.compositeRank
    return { ...kpis, topicCount, promptCount, totalQueries, compositeRank }
  }, [kpis, filteredRows])

  // Calculate intent distribution
  const intentDistribution = useMemo(() => {
    const intentMap: Record<string, number> = {}
    filteredRows.forEach((topic) => {
      const intent = topic.intent
      if (!intentMap[intent]) {
        intentMap[intent] = 0
      }
      intentMap[intent] += topic.promptCount
    })

    const total = Object.values(intentMap).reduce((sum, count) => sum + count, 0)

    // Map intent names to labels (will be translated based on language)
    const intentLabels: Record<string, string> = {
      Information: translate("Information", language),
      Advice: translate("Advice", language),
      Evaluation: translate("Evaluation", language),
      Comparison: translate("Comparison", language),
      Other: translate("Other", language),
    }

    // Intent colors
    const intentColors: Record<string, string> = {
      Information: "#2563eb", // Blue
      Advice: "#16a34a", // Green
      Evaluation: "#f59e0b", // Amber
      Comparison: "#ef4444", // Red
      Other: "#8b5cf6", // Purple
    }

    // Always show all 5 intent types
    const defaultIntents = [
      { label: translate("Information", language), key: "Information" },
      { label: translate("Advice", language), key: "Advice" },
      { label: translate("Evaluation", language), key: "Evaluation" },
      { label: translate("Comparison", language), key: "Comparison" },
      { label: translate("Other", language), key: "Other" },
    ]

    const result = defaultIntents.map(({ label, key }) => {
      const count = intentMap[key] || 0
      const percentage = total > 0 ? (count / total) * 100 : 0
      const color = intentColors[key] || "#6b7280"

      return {
        label,
        count,
        percentage,
        color,
        intentKey: key,
      }
    })

    // Sort by count from high to low
    return result.sort((a, b) => b.count - a.count)
  }, [filteredRows, language])

  // Prepare chart data for stacked bar chart
  const chartData = useMemo(() => {
    if (intentDistribution.length === 0) return []
    
    const dataObj: Record<string, number | string> = { name: "Intent" }
    intentDistribution.forEach((item) => {
      dataObj[item.intentKey] = item.percentage
    })
    return [dataObj]
  }, [intentDistribution])

  const intentDistributionGradient = useMemo(() => {
    if (!intentDistribution.length) {
      return "conic-gradient(#E5E7EB 0% 100%)"
    }

    let cumulative = 0
    const segments = intentDistribution.map((item) => {
      const start = cumulative
      cumulative += item.percentage
      const end = Math.min(100, cumulative)
      return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`
    })

    if (cumulative < 100) {
      segments.push(`#E5E7EB ${cumulative.toFixed(2)}% 100%`)
    }

    return `conic-gradient(${segments.join(", ")})`
  }, [intentDistribution])

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export", filteredRows.length)
  }

  const handleOpenDetail = (payload: { prompt?: PromptItem; topic?: TopicRow }) => {
    setDrawerPrompt(payload.prompt)
    setDrawerTopic(payload.topic)
    setDrawerOpen(true)
  }

  const toggleExpandTopic = (id: string) => {
    setExpandedTopicIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Intent color mapping
  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case "Comparison":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "Information":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "Evaluation":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "Advice":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-ink-100 text-ink-700 dark:bg-ink-900 dark:text-ink-300"
    }
  }

  const getIntentIcon = (intent?: string) => {
    // Return a simple colored dot or icon based on intent
    const colorMap: Record<string, string> = {
      Comparison: "bg-blue-500",
      Information: "bg-green-500",
      Evaluation: "bg-purple-500",
      Advice: "bg-orange-500",
    }
    const color = colorMap[intent || ""] || "bg-ink-500"
    return <div className={`h-2 w-2 rounded-full ${color}`} />
  }

  return (
    <TooltipProvider>
      <div className="bg-background -mx-6">
        <PageHeaderFilterBar
          title={language === "zh-TW" ? "查詢分析" : "Queries"}
          description={
            language === "zh-TW"
              ? "分析 AI 提示和回答以了解查詢可見度和情緒"
              : "Analyze AI prompts and answers to understand query visibility and sentiment"
          }
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={handleDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          showModelSelector={true}
          onExport={handleExport}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-pageX py-4 sm:py-pageY max-w-[1600px]">
          <div className="space-y-6">

        {/* KPI Cards */}
        {scopedKpis && (
          <StaggerContainer>
            <div className="flex gap-4 items-stretch">
              {/* Core Queries Card - 15% */}
              <motion.div variants={staggerItem} className="w-[15%] flex">
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                      Core Queries
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipContent("Core Queries", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center">
                    <div className="text-2xl font-bold">{scopedKpis.topicCount}</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Queries Card - 15% */}
              <motion.div variants={staggerItem} className="w-[15%] flex">
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                      Total Queries
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipContent("Total Queries", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center">
                    <div className="text-2xl font-bold">{scopedKpis.totalQueries}</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Intent Distribution Chart - 70% */}
              <motion.div variants={staggerItem} className="flex-1 w-[70%] flex">
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                      Intent Distribution
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipContent("Intent Distribution", language)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {intentDistribution.length > 0 && chartData.length > 0 ? (
                      <>
                        <div className="h-[60px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              layout="vertical"
                              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} />
                              <XAxis
                                type="number"
                                domain={[0, 100]}
                                stroke={INK_COLORS[500]}
                                style={{ fontSize: "11px" }}
                                tick={{ fill: INK_COLORS[500] }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                stroke={INK_COLORS[500]}
                                style={{ fontSize: "11px" }}
                                tick={{ fill: INK_COLORS[500] }}
                                axisLine={false}
                                tickLine={false}
                                hide={true}
                                width={0}
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
                                formatter={(value: number, name: string) => {
                                  const entry = intentDistribution.find((item) => item.intentKey === name)
                                  if (entry) {
                                    return [
                                      `${value.toFixed(1)}% (${entry.count.toLocaleString()})`,
                                      entry.label,
                                    ]
                                  }
                                  return [value, name]
                                }}
                              />
                              {intentDistribution.map((entry, index) => (
                                <Bar
                                  key={entry.intentKey}
                                  dataKey={entry.intentKey}
                                  stackId="intent"
                                  fill={entry.color}
                                  radius={
                                    index === intentDistribution.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]
                                  }
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 justify-center">
                          {intentDistribution.map((item) => (
                            <div key={item.intentKey} className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs text-ink-600">{item.label}</span>
                              <span className="text-xs font-medium text-ink-900">
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground flex items-center justify-center h-[200px]">
                        {language === "zh-TW" ? "無資料" : "No data"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </StaggerContainer>
        )}

        {/* Core Queries Table */}
        <FadeUp delay={0.2}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Core Queries
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getTooltipContent("Core Queries", language)}</p>
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
              ) : filteredRows.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-sm text-muted-foreground">
                    No data available. Try adjusting filters.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Topics</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getTooltipContent("Topics", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center justify-end gap-2">
                            <span>Total Queries</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getTooltipContent("Total Queries（Topic）", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                if (sortKey === "reachDesc") {
                                  setSortKey("reachAsc")
                                } else {
                                  setSortKey("reachDesc")
                                }
                              }}
                              className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                            >
                            <span>Reach</span>
                              <div className="flex flex-col">
                                <ChevronUp 
                                  className={`h-3 w-3 transition-colors ${sortKey === "reachDesc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                />
                                <ChevronDown 
                                  className={`h-3 w-3 -mt-1 transition-colors ${sortKey === "reachAsc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
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
                                <p>{getTooltipContent("Reach", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                if (sortKey === "rankDesc") {
                                  setSortKey("rankAsc")
                                } else {
                                  setSortKey("rankDesc")
                                }
                              }}
                              className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                            >
                            <span>Rank</span>
                              <div className="flex flex-col">
                                <ChevronUp 
                                  className={`h-3 w-3 transition-colors ${sortKey === "rankDesc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                />
                                <ChevronDown 
                                  className={`h-3 w-3 -mt-1 transition-colors ${sortKey === "rankAsc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
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
                                <p>{getTooltipContent("Rank", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                if (sortKey === "focusDesc") {
                                  setSortKey("focusAsc")
                                } else {
                                  setSortKey("focusDesc")
                                }
                              }}
                              className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                            >
                            <span>Focus</span>
                              <div className="flex flex-col">
                                <ChevronUp 
                                  className={`h-3 w-3 transition-colors ${sortKey === "focusDesc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                />
                                <ChevronDown 
                                  className={`h-3 w-3 -mt-1 transition-colors ${sortKey === "focusAsc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
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
                                <p>{getTooltipContent("Focus", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                if (sortKey === "sentimentDesc") {
                                  setSortKey("sentimentAsc")
                                } else {
                                  setSortKey("sentimentDesc")
                                }
                              }}
                              className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                            >
                            <span>Sentiment</span>
                              <div className="flex flex-col">
                                <ChevronUp 
                                  className={`h-3 w-3 transition-colors ${sortKey === "sentimentDesc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                />
                                <ChevronDown 
                                  className={`h-3 w-3 -mt-1 transition-colors ${sortKey === "sentimentAsc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
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
                                <p>{getTooltipContent("Sentiment", language)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((topic) => {
                        const isExpanded = expandedTopicIds.has(topic.id)
                        return (
                          <React.Fragment key={topic.id}>
                            <tr className="border-b border-border hover:bg-accent/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpandTopic(topic.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <span className="text-sm font-medium">{topic.topic}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-medium">{topic.promptCount}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-medium">{topic.mentionRate.toFixed(1)}%</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-medium">{topic.rank || "--"}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-medium">{topic.visibility.toFixed(1)}%</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm font-medium">
                                  {topic.sentiment !== undefined
                                    ? topic.sentiment.toFixed(2)
                                    : "--"}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="p-0 bg-muted/30">
                                  <div className="p-4">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-border">
                                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-[20%]">
                                            Core Query
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-[25%]">
                                            AI Response
                                          </th>
                                          <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground w-[15%]">
                                            <div className="flex items-center justify-center gap-2">
                                              <span>Intent</span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                    <HelpCircle className="h-3 w-3" />
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{getTooltipContent("Intent（core query 表格）", language)}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </th>
                                          <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground w-[10%]">
                                            <div className="flex items-center justify-center gap-2">
                                              <span>Mentions</span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                    <HelpCircle className="h-3 w-3" />
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{getTooltipContent("Mentions（core query 表格）", language)}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </th>
                                          <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground w-[10%]">
                                            <div className="flex items-center justify-center gap-1">
                                              <button
                                                onClick={() => {
                                                  if (expandedTableSort.column === "rank" && expandedTableSort.order === "desc") {
                                                    setExpandedTableSort({ column: "rank", order: "asc" })
                                                  } else {
                                                    setExpandedTableSort({ column: "rank", order: "desc" })
                                                  }
                                                }}
                                                className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                                              >
                                              <span>Rank</span>
                                                <div className="flex flex-col">
                                                  <ChevronUp 
                                                    className={`h-3 w-3 transition-colors ${expandedTableSort.column === "rank" && expandedTableSort.order === "desc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                                  />
                                                  <ChevronDown 
                                                    className={`h-3 w-3 -mt-1 transition-colors ${expandedTableSort.column === "rank" && expandedTableSort.order === "asc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
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
                                                  <p>{getTooltipContent("Rank（core query 表格）", language)}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </th>
                                          <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground w-[10%]">
                                            <div className="flex items-center justify-center gap-1">
                                              <button
                                                onClick={() => {
                                                  if (expandedTableSort.column === "focus" && expandedTableSort.order === "desc") {
                                                    setExpandedTableSort({ column: "focus", order: "asc" })
                                                  } else {
                                                    setExpandedTableSort({ column: "focus", order: "desc" })
                                                  }
                                                }}
                                                className="flex items-center justify-center gap-1 hover:text-foreground transition-colors group"
                                              >
                                              <span>Focus</span>
                                                <div className="flex flex-col">
                                                  <ChevronUp 
                                                    className={`h-3 w-3 transition-colors ${expandedTableSort.column === "focus" && expandedTableSort.order === "desc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
                                                  />
                                                  <ChevronDown 
                                                    className={`h-3 w-3 -mt-1 transition-colors ${expandedTableSort.column === "focus" && expandedTableSort.order === "asc" ? "text-foreground" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`} 
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
                                                  <p>{getTooltipContent("Focus（core query 表格）", language)}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </th>
                                          <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground w-[10%]">
                                            <div className="flex items-center justify-center gap-2">
                                              <span>Citation</span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                    <HelpCircle className="h-3 w-3" />
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{getTooltipContent("Citation（core query 表格）", language)}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {[...topic.prompts]
                                          .sort((a, b) => {
                                            if (expandedTableSort.column === "rank") {
                                              const aRank = a.rank ?? 999
                                              const bRank = b.rank ?? 999
                                              return expandedTableSort.order === "asc" 
                                                ? aRank - bRank 
                                                : bRank - aRank
                                            } else if (expandedTableSort.column === "focus") {
                                              const aFocus = a.focus ?? 0
                                              const bFocus = b.focus ?? 0
                                              return expandedTableSort.order === "asc" 
                                                ? aFocus - bFocus 
                                                : bFocus - aFocus
                                            }
                                            return 0
                                          })
                                          .map((prompt) => (
                                          <tr
                                            key={prompt.id}
                                            className="border-b border-border/50 hover:bg-background/50 transition-colors"
                                          >
                                            <td className="py-2 px-3">
                                              <span className="text-xs">{prompt.text}</span>
                                            </td>
                                            <td className="py-2 px-3">
                                              <span className="text-xs text-muted-foreground">
                                                {prompt.aiResponse || "--"}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <div className="flex items-center justify-center gap-2">
                                                {getIntentIcon(prompt.intent)}
                                                <span className={`text-xs ${getIntentColor(prompt.intent)} px-2 py-0.5 rounded`}>
                                                  {translate(prompt.intent || topic.intent || "Other", language)}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span className="text-xs font-medium">
                                                {prompt.mentions !== undefined ? prompt.mentions : "--"}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span className="text-xs font-medium">
                                                {prompt.rank !== undefined ? prompt.rank : "--"}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span className="text-xs font-medium">
                                                {prompt.focus !== undefined ? `${prompt.focus.toFixed(1)}%` : "--"}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span className="text-xs font-medium">
                                                {prompt.citation !== undefined ? prompt.citation : "--"}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
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
