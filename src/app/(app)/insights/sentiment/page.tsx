"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowUp, ArrowDown, HelpCircle } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { PageHeaderFilterBar } from "@/components/filters/PageHeaderFilterBar"
import { Button } from "@/components/ui/button"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getDefaultDateRange,
  getTodayShanghai,
  getUserRegisteredAt,
  formatDateShanghai,
} from "@/lib/date-utils"
import { differenceInDays } from "date-fns"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import { INK_COLORS, SEMANTIC_COLORS } from "@/lib/design-tokens"
import { MODEL_OPTIONS } from "@/constants/models"
import type { ModelOptionValue } from "@/constants/models"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services/api"
import type { SentimentData } from "@/types/sentiment"

// Types
type RangeKey = "1d" | "7d" | "14d" | "30d"

type SeriesPoint = {
  date: string
  sentimentScore: number
  pos: number
  neu: number
  neg: number
}

type TopicItem = {
  topic: string
  score: number // 0~1
  sentiment?: number // -1 ~ +1
}

type SourceItem = {
  type: string // Source category type, e.g., "Official Website", "News", "UGC", "Social Media", "Knowledge Base", "Academic"
  pos: number
  neu: number
  neg: number
  name?: string
}

// Data Adapter
export function mapBackendToUI(raw: any): SeriesPoint {
  return {
    date: raw.date,
    sentimentScore: raw.sentiment, // -1 ~ +1
    pos: raw.pos_ratio || 0, // 0~1
    neu: raw.neu_ratio || 0, // 0~1
    neg: raw.neg_ratio || 0, // 0~1
  }
}

// Mock Data (will be replaced with API calls)
// sentimentScore range: -1 to +1
const MOCK_SERIES: Record<string, Record<RangeKey, SeriesPoint[]>> = {
  default: {
    "1d": [
      { date: "11/07", sentimentScore: 0.40, pos: 0.50, neu: 0.30, neg: 0.20 },
    ],
    "7d": [
      { date: "11/01", sentimentScore: 0.3, pos: 0.45, neu: 0.35, neg: 0.20 },
      { date: "11/02", sentimentScore: 0.44, pos: 0.50, neu: 0.30, neg: 0.20 },
      { date: "11/03", sentimentScore: 0.16, pos: 0.40, neu: 0.40, neg: 0.20 },
      { date: "11/04", sentimentScore: 0.60, pos: 0.60, neu: 0.25, neg: 0.15 },
      { date: "11/05", sentimentScore: 0.50, pos: 0.55, neu: 0.30, neg: 0.15 },
      { date: "11/06", sentimentScore: 0.36, pos: 0.48, neu: 0.32, neg: 0.20 },
      { date: "11/07", sentimentScore: 0.40, pos: 0.50, neu: 0.30, neg: 0.20 },
    ],
    "14d": Array.from({ length: 14 }, (_, i) => ({
      date: `11/${String(i + 1).padStart(2, "0")}`,
      sentimentScore: (Math.random() * 2 - 1), // -1 to +1
      pos: 0.4 + Math.random() * 0.2,
      neu: 0.3 + Math.random() * 0.2,
      neg: 0.2 + Math.random() * 0.1,
    })),
    "30d": Array.from({ length: 30 }, (_, i) => ({
      date: `11/${String(i + 1).padStart(2, "0")}`,
      sentimentScore: (Math.random() * 2 - 1), // -1 to +1
      pos: 0.4 + Math.random() * 0.2,
      neu: 0.3 + Math.random() * 0.2,
      neg: 0.2 + Math.random() * 0.1,
    })),
  },
}

const MOCK_TOPICS = {
  positive: [
    { topic: "Innovation leadership", score: 0.85 },
    { topic: "Product quality", score: 0.78 },
    { topic: "Customer satisfaction", score: 0.72 },
    { topic: "Market position", score: 0.68 },
    { topic: "Technology advancement", score: 0.65 },
  ] as TopicItem[],
  negative: [
    { topic: "Pricing concerns", score: 0.45 },
    { topic: "Delivery delays", score: 0.38 },
    { topic: "Support issues", score: 0.32 },
    { topic: "Competition pressure", score: 0.28 },
    { topic: "Feature gaps", score: 0.25 },
  ] as TopicItem[],
}

const MOCK_SOURCES: SourceItem[] = [
  { name: "Official Website", type: "Official Website", pos: 65, neu: 25, neg: 10 },
  { name: "TechCrunch", type: "News", pos: 60, neu: 30, neg: 10 },
  { name: "Forbes", type: "News", pos: 55, neu: 35, neg: 10 },
  { name: "Blog Example", type: "UGC", pos: 50, neu: 40, neg: 10 },
  { name: "Social Media", type: "Social Media", pos: 45, neu: 40, neg: 15 },
  { name: "Knowledge Base", type: "Knowledge Base", pos: 55, neu: 35, neg: 10 },
  { name: "Academic", type: "Academic", pos: 40, neu: 45, neg: 15 },
]

const METRIC_TOOLTIPS = {
  avgSentiment: {
    zh: "展示 AI 回答中提及你品牌時的平均情緒傾向，反映整體正負面態度。",
    en: "Shows the average emotional tone in AI responses mentioning your brand — overall positivity or negativity.",
  },
  positive: {
    zh: "表示 AI 對你品牌持積極態度的回答占比。",
    en: "Percentage of AI responses expressing positive sentiment toward your brand.",
  },
  neutral: {
    zh: "表示 AI 對你品牌保持客觀或中立態度的回答占比。",
    en: "Percentage of AI responses that remain neutral or factual toward your brand.",
  },
  negative: {
    zh: "表示 AI 對你品牌持負面態度的回答占比。",
    en: "Percentage of AI responses expressing negative sentiment toward your brand.",
  },
  sentimentTrend: {
    zh: "展示情緒得分隨時間變化的趨勢，用於觀察品牌口碑走向。",
    en: "Shows how your brand’s sentiment score changes over time — tracking reputation trends.",
  },
  positiveTopics: {
    zh: "展示 AI 回答中對你品牌評價最積極的主題。",
    en: "Highlights the topics where AI shows the most positive sentiment toward your brand.",
  },
  negativeTopics: {
    zh: "展示 AI 回答中對你品牌評價最消極的主題。",
    en: "Highlights the topics where AI shows the most negative sentiment toward your brand.",
  },
  sentimentDistribution: {
    zh: "展示不同來源類別中的情緒表現，對比各渠道的正面與負面傾向。",
    en: "Shows how sentiment shifts across each source category, comparing positive vs. negative share.",
  },
}

// Hook stub for API integration
function useSentiment(brand: string, range: RangeKey) {
  // TODO: Replace with actual API call
  // const { data } = useSWR(`/api/sentiment/series?brand=${brand}&range=${range}`)
  const series = MOCK_SERIES[brand]?.[range] || MOCK_SERIES.default[range]
  return {
    series,
    topics: MOCK_TOPICS,
    sources: MOCK_SOURCES,
  }
}

export default function SentimentPage() {
  const { language } = useLanguageStore()
  const { selectedBrandId, selectedProductId } = useBrandUIStore()
  const searchParams = useSearchParams()
  
  // Initialize model from URL or default to "all"
  const [selectedModel, setSelectedModel] = useState<ModelOptionValue>(
    (searchParams.get("model") as ModelOptionValue) || "all"
  )
  
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [isExporting, setIsExporting] = useState(false)
 
  const minDate = useMemo(() => getUserRegisteredAt(30), [])
  const maxDate = useMemo(() => getTodayShanghai(), [])
 
  const periodDays = useMemo(() => differenceInDays(dateRange.end, dateRange.start) + 1, [dateRange])

  // Calculate effective range based on dateRange
  const effectiveRange = useMemo<RangeKey>(() => {
    if (periodDays <= 1) return "1d"
    if (periodDays <= 7) return "7d"
    if (periodDays <= 14) return "14d"
    return "30d"
  }, [periodDays])

  // Fetch sentiment data from API (with error handling to fallback to mock)
  const { data: sentimentApiData, isLoading } = useQuery<SentimentData | null>({
    queryKey: [
      "sentiment",
      formatDateShanghai(dateRange.start),
      formatDateShanghai(dateRange.end),
      selectedProductId,
      selectedBrandId,
      selectedModel,
    ],
    queryFn: async () => {
      try {
        const response = await apiClient.get<SentimentData>("/api/sentiment", {
          params: {
            startDate: formatDateShanghai(dateRange.start),
            endDate: formatDateShanghai(dateRange.end),
            productId: selectedProductId || undefined,
            brandId: selectedBrandId || undefined,
            model: selectedModel,
          },
        })
        return response.data
      } catch (error) {
        // If API fails, return null to trigger fallback to mock data
        console.warn("[Sentiment] API call failed, using mock data:", error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false, // Don't retry, just use mock data on error
  })

  // Get mock data (always available as fallback)
  const mockSentimentData = useSentiment("default", effectiveRange)
  
  // Map API data to UI format, with fallback to mock data
  const sentimentData = useMemo(() => {
    // Ensure we always have mock data as baseline
    const fallbackData = mockSentimentData || {
      series: [],
      topics: { positive: [], negative: [] },
      sources: [],
    }
    
    // Try to use API data if available and valid
    if (sentimentApiData?.kpis && Array.isArray(sentimentApiData.trends) && sentimentApiData.trends.length > 0) {
      try {
        const kpis = sentimentApiData.kpis
        const avgPos = Math.max(0, Math.min(1, (kpis.positive || 0) / 100))
        const avgNeu = Math.max(0, Math.min(1, (kpis.neutral || 0) / 100))
        const avgNeg = Math.max(0, Math.min(1, (kpis.negative || 0) / 100))
        
        const series = sentimentApiData.trends
          .filter((trend) => trend && typeof trend === "object" && trend.date)
          .map((trend) => {
            const selfBrandScore = Number((trend as any)["英业达"]) || 0
            return {
              date: String(trend.date),
              sentimentScore: selfBrandScore,
              pos: avgPos,
              neu: avgNeu,
              neg: avgNeg,
            }
          })
          .filter((point) => point.date) // Ensure we have valid dates
      
        if (series.length > 0) {
          const apiPositiveTopics = (sentimentApiData.positiveTopics || [])
            .map((topic) => ({
              topic: topic.topic,
              score: Math.max(0, Math.min(1, topic.score ?? Math.max(0, topic.sentiment))),
              sentiment: topic.sentiment,
            }))
          
          const apiNegativeTopics = (sentimentApiData.negativeTopics || [])
            .map((topic) => ({
              topic: topic.topic,
              score: Math.max(0, Math.min(1, topic.score ?? Math.abs(topic.sentiment))),
              sentiment: topic.sentiment,
            }))

          const fallbackPositive = (sentimentApiData.riskTopics || [])
            .filter((t) => t && t.sentiment > 0)
            .map((t) => ({
              topic: t.prompt || "",
              score: Math.min(1, Math.max(0, (t.sentiment + 1) / 2)),
              sentiment: t.sentiment,
            }))

          const fallbackNegative = (sentimentApiData.riskTopics || [])
            .filter((t) => t && t.sentiment < 0)
            .map((t) => ({
              topic: t.prompt || "",
              score: Math.min(1, Math.max(0, Math.abs(t.sentiment))),
              sentiment: t.sentiment,
            }))

          const sourcesFromApi = Array.isArray(sentimentApiData.sourcesDistribution)
            ? sentimentApiData.sourcesDistribution.map((item) => ({
                type: item.type,
                name: item.type,
                pos: item.pos,
                neu: item.neu,
                neg: item.neg,
              }))
            : []
          
          return {
            series,
            topics: { 
              positive: apiPositiveTopics.length > 0 ? apiPositiveTopics : (fallbackPositive.length > 0 ? fallbackPositive : (fallbackData.topics?.positive || [])),
              negative: apiNegativeTopics.length > 0 ? apiNegativeTopics : (fallbackNegative.length > 0 ? fallbackNegative : (fallbackData.topics?.negative || [])),
            },
            sources: sourcesFromApi.length > 0 ? sourcesFromApi : (fallbackData.sources || []),
          }
        }
      } catch (error) {
        console.error("[Sentiment] Error processing API data:", error)
      }
    }
    // Always fallback to mock data if API data is not available or invalid
    return fallbackData
  }, [sentimentApiData, mockSentimentData])
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
  }

  // Handle model change
  const handleModelChange = (model: ModelOptionValue) => {
    setSelectedModel(model)
  }

  const computeSeriesKpis = (series: SeriesPoint[]) => {
    if (!series || series.length === 0) {
      return {
        avgSentiment: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
      }
    }
    const len = series.length
    const avgSentiment = series.reduce((sum, p) => sum + p.sentimentScore, 0) / len
    const avgPos = series.reduce((sum, p) => sum + p.pos, 0) / len
    const avgNeu = series.reduce((sum, p) => sum + p.neu, 0) / len
    const avgNeg = series.reduce((sum, p) => sum + p.neg, 0) / len
    return {
      avgSentiment,
      positive: Math.round(avgPos * 100),
      neutral: Math.round(avgNeu * 100),
      negative: Math.round(avgNeg * 100),
    }
  }

  const windowedSeries = useMemo(() => {
    const series = sentimentData?.series || []
    if (series.length === 0) {
      return {
        current: [] as SeriesPoint[],
        previous: [] as SeriesPoint[],
      }
    }
    const windowSize = Math.min(periodDays, series.length)
    const current = series.slice(-windowSize)
    let previous = series.slice(-windowSize * 2, -windowSize)
    if (previous.length === 0 && series.length > windowSize) {
      previous = series.slice(0, windowSize)
    }
    return { current, previous }
  }, [periodDays, sentimentData?.series])
  const currentSeriesWindow = windowedSeries.current
  const previousSeriesWindow = windowedSeries.previous

  // Calculate KPIs from API data or series data
  const kpis = useMemo(() => {
    // If we have API data, use it directly
    if (sentimentApiData?.kpis) {
      return {
        avgSentiment: sentimentApiData.kpis.sentimentIndex,
        positive: sentimentApiData.kpis.positive,
        neutral: sentimentApiData.kpis.neutral,
        negative: sentimentApiData.kpis.negative,
      }
    }

    // Otherwise, calculate from current window (fallback to mock data)
    return computeSeriesKpis(currentSeriesWindow.length ? currentSeriesWindow : sentimentData?.series || [])
  }, [currentSeriesWindow, sentimentApiData, sentimentData?.series])

  const previousKpis = useMemo(() => {
    if (previousSeriesWindow.length > 0) {
      return computeSeriesKpis(previousSeriesWindow)
    }
    return {
      avgSentiment: Math.max(-1, Math.min(1, kpis.avgSentiment - 0.05)),
      positive: Math.max(0, kpis.positive - 3),
      neutral: Math.max(0, kpis.neutral - 3),
      negative: Math.max(0, kpis.negative - 2),
    }
  }, [kpis.avgSentiment, kpis.negative, kpis.neutral, kpis.positive, previousSeriesWindow])

  const kpiChanges = useMemo(() => {
    return {
      avgSentiment: kpis.avgSentiment - previousKpis.avgSentiment,
      positive: kpis.positive - previousKpis.positive,
      neutral: kpis.neutral - previousKpis.neutral,
      negative: kpis.negative - previousKpis.negative,
    }
  }, [kpis, previousKpis])

  const positiveTopicList = useMemo(() => {
    const list = sentimentData?.topics?.positive || []
    return [...list]
      .sort((a, b) => (b.sentiment ?? b.score) - (a.sentiment ?? a.score))
      .slice(0, 5)
  }, [sentimentData?.topics?.positive])

  const negativeTopicList = useMemo(() => {
    const list = sentimentData?.topics?.negative || []
    return [...list]
      .sort((a, b) => {
        const aVal = a.sentiment ?? -a.score
        const bVal = b.sentiment ?? -b.score
        return aVal - bVal
      })
      .slice(0, 5)
  }, [sentimentData?.topics?.negative])

  const comparisonLabel = useMemo(() => {
    if (language === "zh-TW") {
      return `較前${periodDays}天`
    }
    if (periodDays === 1) return "vs previous day"
    return `vs previous ${periodDays} days`
  }, [language, periodDays])

  // Export functions
  const handleExportCSV = () => {
    if (!sentimentData || isExporting) return
    setIsExporting(true)
    
    try {
      const csvData: Array<Record<string, any>> = []
      
      // Series data
      if (sentimentData.series) {
        sentimentData.series.forEach((point) => {
          csvData.push({
            Date: point.date,
            "Sentiment Score": point.sentimentScore,
            Positive: point.pos,
            Neutral: point.neu,
            Negative: point.neg,
          })
        })
      }
      
      exportToCSV(
        csvData,
        `sentiment_${formatDateShanghai(dateRange.start)}_${formatDateShanghai(dateRange.end)}.csv`
      )
    } catch (error) {
      console.error("Error exporting CSV:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    if (!sentimentData || isExporting) return
    setIsExporting(true)
    
    try {
      let content = `<table>
        <tr><th>Date</th><th>Sentiment Score</th><th>Positive</th><th>Neutral</th><th>Negative</th></tr>`
      
      if (sentimentData.series) {
        sentimentData.series.forEach((point) => {
          content += `<tr>
            <td>${point.date}</td>
            <td>${point.sentimentScore.toFixed(2)}</td>
            <td>${(point.pos * 100).toFixed(1)}%</td>
            <td>${(point.neu * 100).toFixed(1)}%</td>
            <td>${(point.neg * 100).toFixed(1)}%</td>
          </tr>`
        })
      }
      
      content += `</table>
        <h2>Top Positive Topics</h2>
        <table><tr><th>Topic</th><th>Score</th></tr>`
      
      if (sentimentData.topics?.positive) {
        sentimentData.topics.positive.forEach((topic) => {
          content += `<tr><td>${topic.topic}</td><td>${(topic.score * 100).toFixed(1)}%</td></tr>`
        })
      }
      
      content += `</table>
        <h2>Top Negative Topics</h2>
        <table><tr><th>Topic</th><th>Score</th></tr>`
      
      if (sentimentData.topics?.negative) {
        sentimentData.topics.negative.forEach((topic) => {
          content += `<tr><td>${topic.topic}</td><td>${(topic.score * 100).toFixed(1)}%</td></tr>`
        })
      }
      
      content += `</table>
        <h2>Sentiment Distribution</h2>
        <table><tr><th>Source</th><th>Positive</th><th>Neutral</th><th>Negative</th></tr>`
      
      if (sentimentData.sources) {
        sentimentData.sources.forEach((source) => {
          content += `<tr>
            <td>${source.name}</td>
            <td>${source.pos}%</td>
            <td>${source.neu}%</td>
            <td>${source.neg}%</td>
          </tr>`
        })
      }
      
      content += `</table>`
      
      exportToPDF("Sentiment Analysis Report", content)
    } catch (error) {
      console.error("Error exporting PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="bg-background -mx-6">
        <PageHeaderFilterBar
          title={language === "zh-TW" ? "情緒分析" : "Sentiment"}
          description={
            language === "zh-TW"
              ? "分析品牌情緒趨勢並識別關鍵主題"
              : "Analyze brand sentiment trends and identify key topics"
          }
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={handleDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          showModelSelector={true}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-pageX py-3 sm:py-4 max-w-[1600px]">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 items-stretch">
            {[
              {
                key: "avgSentiment" as const,
                label: translate("Avg Sentiment", language),
                tooltip: METRIC_TOOLTIPS.avgSentiment,
                value: kpis.avgSentiment,
                isPercentage: false,
                decimals: 2,
              },
              {
                key: "positive" as const,
                label: translate("Positive", language),
                tooltip: METRIC_TOOLTIPS.positive,
                value: kpis.positive,
                isPercentage: true,
                decimals: 0,
              },
              {
                key: "neutral" as const,
                label: translate("Neutral", language),
                tooltip: METRIC_TOOLTIPS.neutral,
                value: kpis.neutral,
                isPercentage: true,
                decimals: 0,
              },
              {
                key: "negative" as const,
                label: translate("Negative", language),
                tooltip: METRIC_TOOLTIPS.negative,
                value: kpis.negative,
                isPercentage: true,
                decimals: 0,
              },
            ].map((card) => {
              const delta = kpiChanges[card.key]
              const isUp = delta > 0
              const isDown = delta < 0
              const showDelta = isUp || isDown
              const valueDisplay = card.isPercentage
                ? `${card.value.toFixed(card.decimals)}%`
                : card.value.toFixed(card.decimals)
              const deltaDisplay = card.isPercentage
                ? `${Math.abs(delta).toFixed(1)}%`
                : Math.abs(delta).toFixed(2)
              return (
                <div
                  key={card.key}
                  className="rounded-lg border border-ink-200 bg-white p-5 shadow-subtle hover:shadow-md transition-shadow h-full"
                >
                  <div className="flex items-start justify-between text-xs text-ink-500">
                    <span>{card.label}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-ink-400 hover:text-ink-600 transition-colors">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs text-ink-900">{card.tooltip.zh}</p>
                        <p className="text-xs text-ink-500 mt-1">{card.tooltip.en}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-[26px] leading-none font-semibold text-ink-900">{valueDisplay}</span>
                    <div className="text-right">
                      {showDelta ? (
                        <div
                          className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                            isUp ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          <span>{deltaDisplay}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-400">--</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
            {/* Left: Sentiment by Source */}
            <div className="xl:col-span-8 rounded-lg border border-ink-200 bg-white p-5 shadow-subtle hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-ink-900">{translate("Sentiment Distribution", language)}</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-ink-400 hover:text-ink-600 transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs text-ink-900">{METRIC_TOOLTIPS.sentimentDistribution.zh}</p>
                    <p className="text-xs text-ink-500 mt-1">{METRIC_TOOLTIPS.sentimentDistribution.en}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sentimentData?.sources || []}
                    margin={{ top: 5, right: 30, left: 5, bottom: 30 }}
                    barCategoryGap="80%"
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
                    <XAxis
                      type="category"
                      dataKey="type"
                      stroke={INK_COLORS[500]}
                      style={{ fontSize: "11px" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="number"
                      domain={[0, 100]}
                      stroke={INK_COLORS[500]}
                      style={{ fontSize: "11px" }}
                      axisLine={false}
                      tickLine={false}
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
                    />
                    <Bar dataKey="pos" name={translate("Positive", language)} fill={SEMANTIC_COLORS.info} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="neu" name={translate("Neutral", language)} fill={INK_COLORS[400]} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="neg" name={translate("Negative", language)} fill={SEMANTIC_COLORS.bad} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Topics */}
            <div className="xl:col-span-4 space-y-4">
              {/* Top Positive Topics */}
              <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-subtle hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-ink-900">{translate("Top Positive Topics", language)}</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-ink-400 hover:text-ink-600 transition-colors">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs text-ink-900">{METRIC_TOOLTIPS.positiveTopics.zh}</p>
                      <p className="text-xs text-ink-500 mt-1">{METRIC_TOOLTIPS.positiveTopics.en}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  {positiveTopicList.length > 0 ? (
                    positiveTopicList.map((item, idx) => (
                      <div key={`${item.topic}-${idx}`} className="flex items-center justify-between text-xs">
                        <span className="text-ink-700 truncate flex-1 mr-2">{translate(item.topic, language)}</span>
                        <span className="text-ink-900 font-medium">{Math.round(item.score * 100)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-ink-500 py-2">No positive topics available</div>
                  )}
                </div>
              </div>

              {/* Top Negative Topics */}
              <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-subtle hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-ink-900">{translate("Top Negative Topics", language)}</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-ink-400 hover:text-ink-600 transition-colors">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs text-ink-900">{METRIC_TOOLTIPS.negativeTopics.zh}</p>
                      <p className="text-xs text-ink-500 mt-1">{METRIC_TOOLTIPS.negativeTopics.en}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  {negativeTopicList.length > 0 ? (
                    negativeTopicList.map((item, idx) => (
                      <div key={`${item.topic}-${idx}`} className="flex items-center justify-between text-xs">
                        <span className="text-ink-700 truncate flex-1 mr-2">{translate(item.topic, language)}</span>
                        <span className="text-ink-900 font-medium">{Math.round(item.score * 100)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-ink-500 py-2">No negative topics available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
