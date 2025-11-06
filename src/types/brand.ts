import { z } from "zod"

/**
 * 品牌基础信息 Schema
 */
export const BrandBasicSchema = z.object({
  brandName: z.string().min(1, "品牌名称为必填"),
  productName: z.string().min(1, "产品名称为必填"),
  brandDescription: z.string().optional(),
})

export type BrandBasic = z.infer<typeof BrandBasicSchema>

/**
 * Persona Schema
 */
export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "角色名称为必填"),
  region: z.string().min(1, "角色地区为必填"),
  description: z.string().optional(),
})

export type Persona = z.infer<typeof PersonaSchema>

/**
 * Competitor Schema
 */
export const CompetitorSchema = z.object({
  id: z.string(),
  brandName: z.string().min(1, "竞争对手品牌名称为必填"),
  productName: z.string().min(1, "竞争对手产品名称为必填"),
})

export type Competitor = z.infer<typeof CompetitorSchema>

/**
 * Brand Suggest API 响应
 */
export const BrandSuggestResponseSchema = z.object({
  personas: z.array(PersonaSchema),
  competitors: z.array(CompetitorSchema),
})

export type BrandSuggestResponse = z.infer<typeof BrandSuggestResponseSchema>

/**
 * Prompt Schema
 */
export const PromptSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "提示词文本为必填"),
  country: z.enum(["US", "UK", "DE", "FR", "JP", "CN", "TW", "HK", "SG", "AU", "IN"], {
    required_error: "国家为必填",
  }),
})

export type Prompt = z.infer<typeof PromptSchema>

/**
 * Prompt Suggest API 请求
 */
export const PromptSuggestRequestSchema = z.object({
  website: z.string().optional(),
  brandName: z.string().optional(),
  productName: z.string().optional(),
})

export type PromptSuggestRequest = z.infer<typeof PromptSuggestRequestSchema>

/**
 * Prompt Suggest API 响应
 */
export const PromptSuggestResponseSchema = z.object({
  prompts: z.array(PromptSchema),
})

export type PromptSuggestResponse = z.infer<typeof PromptSuggestResponseSchema>

