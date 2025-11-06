import { z } from "zod"

/**
 * Prompt Schema
 */
export const PromptSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "提示词内容为必填"),
  country: z.string().min(1, "提示词国家为必选"), // 值为国家码或名称
})

export type PromptItem = z.infer<typeof PromptSchema>

/**
 * Prompt Suggest API 请求
 */
export const PromptSuggestRequestSchema = z.object({
  brandName: z.string().optional(),
  productName: z.string().optional(),
  brandDescription: z.string().optional(),
})

export type PromptSuggestRequest = z.infer<typeof PromptSuggestRequestSchema>

/**
 * Prompt Suggest API 响应
 */
export const PromptSuggestResponseSchema = z.object({
  prompts: z.array(PromptSchema),
})

export type PromptSuggestResponse = z.infer<typeof PromptSuggestResponseSchema>

/**
 * Create Prompt API 请求
 */
export const CreatePromptRequestSchema = PromptSchema.omit({ id: true })

export type CreatePromptRequest = z.infer<typeof CreatePromptRequestSchema>

/**
 * Create Prompt API 响应
 */
export const CreatePromptResponseSchema = z.object({
  prompt: PromptSchema,
})

export type CreatePromptResponse = z.infer<typeof CreatePromptResponseSchema>

/**
 * Update Prompt API 请求
 */
export const UpdatePromptRequestSchema = PromptSchema.partial().omit({ id: true })

export type UpdatePromptRequest = z.infer<typeof UpdatePromptRequestSchema>

/**
 * Update Prompt API 响应
 */
export const UpdatePromptResponseSchema = z.object({
  prompt: PromptSchema,
})

export type UpdatePromptResponse = z.infer<typeof UpdatePromptResponseSchema>

/**
 * Get Prompts API 响应
 */
export const GetPromptsResponseSchema = z.object({
  prompts: z.array(PromptSchema),
})

export type GetPromptsResponse = z.infer<typeof GetPromptsResponseSchema>

/**
 * Delete Prompt API 响应
 */
export const DeletePromptResponseSchema = z.object({
  ok: z.boolean(),
})

export type DeletePromptResponse = z.infer<typeof DeletePromptResponseSchema>

