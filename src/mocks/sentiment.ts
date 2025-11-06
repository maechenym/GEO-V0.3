import {
  SentimentKpis,
  VolumeSeries,
  SentimentIndexPoint,
  RankingItem,
  RiskTopic,
} from "@/types/sentiment"

/**
 * Simulate async loading delay
 */
export const simulateLoad = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

/**
 * Generate dates array
 */
function generateDates(days: number): string[] {
  const today = new Date()
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

/**
 * Generate trend data
 */
function genTrend(base: number, dates: string[]): number[] {
  let cur = base
  return dates.map(() => {
    cur = Math.max(10, cur + (Math.random() - 0.5) * base * 0.15)
    return Math.round(cur)
  })
}

/**
 * Generate sentiment index data (-1 to +1)
 */
function genIndex(base: number, dates: string[]): number[] {
  let cur = base
  return dates.map(() => {
    cur = Math.max(-1, Math.min(1, cur + (Math.random() - 0.5) * 0.1))
    return Math.round(cur * 100) / 100 // Round to 2 decimal places
  })
}

/**
 * Mock brands - Extended to 20 competitors + Your Brand
 */
const mockBrands = [
  "Your Brand",
  "Competitor A",
  "Competitor B",
  "Competitor C",
  "Competitor D",
  "Competitor E",
  "Competitor F",
  "Competitor G",
  "Competitor H",
  "Competitor I",
  "Competitor J",
  "Competitor K",
  "Competitor L",
  "Competitor M",
  "Competitor N",
  "Competitor O",
  "Competitor P",
  "Competitor Q",
  "Competitor R",
  "Competitor S",
  "Competitor T",
]

/**
 * Mock KPIs
 */
export const mockSentimentKpis: SentimentKpis = {
  sov: 28,
  sentimentIndex: 0.42, // -1 to +1 range
  positive: 52,
  neutral: 34,
  negative: 14,
}

/**
 * Mock Volume Series
 */
const dates = generateDates(30)
export const mockVolumeSeries: VolumeSeries[] = mockBrands.map((brand, idx) => {
  const bases = [
    120, 110, 95, 105, 85, 90, 88, 92, 87, 89,
    86, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75
  ]
  return {
    label: brand,
    data: dates.map((date, i) => ({
      date: date.split("-").slice(1, 3).join("/"),
      count: genTrend(bases[idx], dates)[i],
    })),
  }
})

/**
 * Mock Sentiment Index Series
 */
export const mockSentimentIndexSeries: SentimentIndexPoint[] = (() => {
  const baseIdx = [
    0.4, 0.35, 0.2, 0.25, 0.1, 0.15, 0.18, 0.12, 0.08, 0.05,
    0.02, -0.01, -0.04, -0.07, -0.10, -0.13, -0.16, -0.19, -0.22, -0.25, -0.28
  ] // -1 to +1 range
  const series: SentimentIndexPoint[] = dates.map((date) => ({
    date: date.split("-").slice(1, 3).join("/"),
  }))
  mockBrands.forEach((brand, bi) => {
    const arr = genIndex(baseIdx[bi], dates)
    series.forEach((row, i) => {
      row[brand] = arr[i]
    })
  })
  return series
})()

/**
 * Mock SOV Ranking
 */
export const mockSovRanking: RankingItem[] = [
  { brand: "Your Brand", value: 28 },
  { brand: "Competitor A", value: 25 },
  { brand: "Competitor B", value: 20 },
  { brand: "Competitor C", value: 15 },
  { brand: "Competitor D", value: 12 },
]

/**
 * Mock Sentiment Index Ranking (score range: -1 to +1)
 * Extended to 21 brands for pagination
 */
export const mockSentimentIndexRanking: RankingItem[] = [
  { brand: "Your Brand", value: 0.42, delta: 0.05, isSelf: true },
  { brand: "Competitor A", value: 0.38, delta: 0.02 },
  { brand: "Competitor B", value: 0.32, delta: -0.01 },
  { brand: "Competitor C", value: 0.28, delta: 0.03 },
  { brand: "Competitor D", value: 0.22, delta: -0.02 },
  { brand: "Competitor E", value: 0.18, delta: 0.01 },
  { brand: "Competitor F", value: 0.15, delta: -0.03 },
  { brand: "Competitor G", value: 0.12, delta: 0.02 },
  { brand: "Competitor H", value: 0.08, delta: -0.01 },
  { brand: "Competitor I", value: 0.05, delta: 0.01 },
  { brand: "Competitor J", value: 0.02, delta: -0.02 },
  { brand: "Competitor K", value: -0.01, delta: 0.01 },
  { brand: "Competitor L", value: -0.04, delta: -0.01 },
  { brand: "Competitor M", value: -0.07, delta: 0.02 },
  { brand: "Competitor N", value: -0.10, delta: -0.02 },
  { brand: "Competitor O", value: -0.13, delta: 0.01 },
  { brand: "Competitor P", value: -0.16, delta: -0.01 },
  { brand: "Competitor Q", value: -0.19, delta: 0.02 },
  { brand: "Competitor R", value: -0.22, delta: -0.02 },
  { brand: "Competitor S", value: -0.25, delta: 0.01 },
  { brand: "Competitor T", value: -0.28, delta: -0.01 },
]

/**
 * Mock Risk Topics
 */
export const mockRiskTopics: RiskTopic[] = [
  {
    id: "r1",
    prompt: "What are the main complaints about business credit cards?",
    answer: "Common complaints include high fees, complex reward structures, and limited acceptance.",
    sources: 8,
    sentiment: -0.65,
    optimization: "Optimize content wording to address negative points; add evidence and case studies to clarify concerns.",
    sourceUrl: "example.com",
  },
  {
    id: "r2",
    prompt: "Are business credit cards worth the annual fees?",
    answer: "Many users find annual fees hard to justify given the benefits offered.",
    sources: 6,
    sentiment: -0.52,
    optimization: "Highlight value proposition and ROI; provide clear fee structure and benefits comparison.",
    sourceUrl: "example.com",
  },
  {
    id: "r3",
    prompt: "What are the disadvantages of business credit cards?",
    answer: "Potential disadvantages include high interest rates and strict approval requirements.",
    sources: 5,
    sentiment: -0.48,
    optimization: "Address concerns proactively; emphasize positive aspects and competitive advantages.",
    sourceUrl: "example.com",
  },
]

/**
 * Chart Colors
 */
export const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"]

