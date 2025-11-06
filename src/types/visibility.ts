import { z } from "zod"

/**
 * Visibility Analysis Types
 */

export const VisibilityMetricSchema = z.enum(["visibility", "reach", "rank", "focus"])

export type VisibilityMetric = z.infer<typeof VisibilityMetricSchema>

export const VisibilityDataPointSchema = z.object({
  date: z.string(),
  [z.string()]: z.union([z.number(), z.string()]),
})

export type VisibilityDataPoint = z.infer<typeof VisibilityDataPointSchema>

export const VisibilityRankingSchema = z.object({
  brand: z.string(),
  reach: z.number(), // Mention rate percentage
  rank: z.number(), // Average rank position
  focus: z.number(), // Content share percentage
  reachDelta: z.number().optional(),
  rankDelta: z.number().optional(),
  focusDelta: z.number().optional(),
  isSelf: z.boolean().optional(),
})

export type VisibilityRanking = z.infer<typeof VisibilityRankingSchema>

export interface VisibilityFilters {
  timeRange: { start: string; end: string }
  brandId?: string
  productId?: string
  competitorIds: string[]
  metric?: VisibilityMetric
}

