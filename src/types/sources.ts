import { z } from "zod"

/**
 * Source Analysis Types
 */

export const SourceFrequencyPointSchema = z.object({
  date: z.string(),
  frequency: z.number(),
  mentions: z.number(),
})

export type SourceFrequencyPoint = z.infer<typeof SourceFrequencyPointSchema>

export const SourceFrequencySeriesSchema = z.object({
  name: z.string(),
  points: z.array(SourceFrequencyPointSchema),
})

export type SourceFrequencySeries = z.infer<typeof SourceFrequencySeriesSchema>

export const SourceKpisSchema = z.object({
  totalMentions: z.number(),
  avgFrequency: z.number(),
  topSource: z.string().optional(),
  mentionGrowth: z.number().optional(),
})

export type SourceKpis = z.infer<typeof SourceKpisSchema>

export const SourceRowSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.string(), // e.g., "Official Website", "News", "UGC", "Social Media", "Knowledge Base", "Academic"
  share: z.number(), // Source share percentage
  shareChange: z.number().optional(), // Month-over-month change in share
  mentionRate: z.number(), // Brand mention rate percentage
  mentionRateChange: z.number().optional(), // Month-over-month change in mention rate
  rank: z.number(),
  mentioned: z.boolean(), // Whether this source mentions the brand
  mentions: z.array(z.string()), // List of brand names mentioned by this source
})

export type SourceRow = z.infer<typeof SourceRowSchema>

export const SourceTrendPointSchema = z.object({
  date: z.string(),
  value: z.number(),
})

export type SourceTrendPoint = z.infer<typeof SourceTrendPointSchema>

export const SourceTrendSeriesSchema = z.object({
  name: z.string(),
  points: z.array(SourceTrendPointSchema),
})

export type SourceTrendSeries = z.infer<typeof SourceTrendSeriesSchema>

export type TimeRange = "1d" | "7d" | "30d"
export type Granularity = "day" | "week" | "month"

export interface SourceFilters {
  timeRange: { start: string; end: string }
  brandId?: string
  productId?: string
  competitorIds: string[]
  granularity: Granularity
  category?: string
  platform?: string
}
