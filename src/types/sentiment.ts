import { z } from "zod"

/**
 * Sentiment Analysis Types
 */

export const VolumePointSchema = z.object({
  date: z.string(),
  count: z.number(),
})

export type VolumePoint = z.infer<typeof VolumePointSchema>

export const VolumeSeriesSchema = z.object({
  label: z.string(),
  data: z.array(VolumePointSchema),
})

export type VolumeSeries = z.infer<typeof VolumeSeriesSchema>

export const SentimentIndexPointSchema = z.object({
  date: z.string(),
  [z.string()]: z.union([z.number(), z.string()]),
})

export type SentimentIndexPoint = z.infer<typeof SentimentIndexPointSchema>

export const SentimentKpisSchema = z.object({
  sov: z.number(), // Share of Voice percentage
  sentimentIndex: z.number(), // Sentiment index (0-1 range, consistent with overview)
  positive: z.number(), // Positive sentiment percentage
  neutral: z.number(), // Neutral sentiment percentage
  negative: z.number(), // Negative sentiment percentage
})

export type SentimentKpis = z.infer<typeof SentimentKpisSchema>

export const RankingItemSchema = z.object({
  brand: z.string(),
  value: z.number(), // Sentiment score (0-1 range)
  delta: z.number().optional(), // Rank change (integer, positive = rank up, negative = rank down)
  rank: z.number().optional(), // Ranking position
  isSelf: z.boolean().optional(),
})

export type RankingItem = z.infer<typeof RankingItemSchema>

export const RiskTopicSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  answer: z.string(),
  sources: z.number(),
  sentiment: z.number(),
  optimization: z.string().optional(),
  sourceUrl: z.string().optional(),
})

export type RiskTopic = z.infer<typeof RiskTopicSchema>

export interface SentimentFilters {
  timeRange: { start: string; end: string }
  brandId?: string
  productId?: string
  competitorIds: string[]
  platforms: string[]
  intents: string[]
  role?: string
  model?: string // Model filter: "all", "gpt", "gemini", "claude"
}

// API Response Types
export interface SentimentKPIs {
  sov: number
  sentimentIndex: number // 0-1 range
  positive: number
  neutral: number
  negative: number
}

export interface SentimentTrendData {
  date: string // MM/dd format
  [brandName: string]: string | number
}

export interface SentimentRankingItem {
  brand: string
  value: number // 0-1 range
  delta: number // Rank change (integer, positive = rank up, negative = rank down)
  rank: number
  isSelf: boolean
}

export interface SentimentSourceDistribution {
  type: string
  pos: number
  neu: number
  neg: number
}

export interface SentimentTopicSummary {
  topic: string
  sentiment: number
  score: number
  mentions: number
}

export interface SentimentData {
  kpis: SentimentKPIs
  trends: SentimentTrendData[]
  ranking: SentimentRankingItem[]
  riskTopics: RiskTopic[]
  sourcesDistribution?: SentimentSourceDistribution[]
  positiveTopics?: SentimentTopicSummary[]
  negativeTopics?: SentimentTopicSummary[]
  actualDateRange?: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
}
