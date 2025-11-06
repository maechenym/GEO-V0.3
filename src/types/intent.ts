import { z } from "zod"

/**
 * Intent Insights Types
 */

export const PromptItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  platform: z.string(),
  role: z.string().optional(),
  rank: z.number().optional(),
  mentionsBrand: z.boolean(),
  sentiment: z.number().optional(), // -1 to 1
  aiResponse: z.string().optional(), // AI response content
  mentions: z.number().optional(), // Total number of brands mentioned
  citation: z.number().optional(), // Number of cited websites
  focus: z.number().optional(), // Content share percentage for this brand
  intent: z.string().optional(), // Intent type for this query
})

export type PromptItem = z.infer<typeof PromptItemSchema>

export const TopicRowSchema = z.object({
  id: z.string(),
  topic: z.string(),
  intent: z.string(),
  promptCount: z.number(),
  visibility: z.number(), // 0-100
  mentionRate: z.number(), // 0-100
  sentiment: z.number().optional(), // -1 to 1
  rank: z.number().optional(),
  prompts: z.array(PromptItemSchema),
})

export type TopicRow = z.infer<typeof TopicRowSchema>

export const IntentKpisSchema = z.object({
  topicCount: z.number(),
  promptCount: z.number(),
  compositeRank: z.number(),
  avgVisibility: z.number(),
  avgMentionRate: z.number(),
  avgSentiment: z.number().optional(),
})

export type IntentKpis = z.infer<typeof IntentKpisSchema>

export type SortKey = "topicHot" | "rankAsc" | "rankDesc" | "visibility"

export interface IntentFilters {
  timeRange: { start: string; end: string }
  brandId?: string
  productId?: string
  platforms: string[]
  intents: string[]
  role?: string
  mentionBrand: boolean
  visibilitySort: "asc" | "desc" | null
}

