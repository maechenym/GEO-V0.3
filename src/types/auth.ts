import { z } from "zod"

/**
 * Auth API 响应类型定义（Zod Schemas）
 */

// Profile 类型
export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  hasBrand: z.boolean().default(false),
  role: z.enum(["Admin", "Viewer"]).optional(),
  subscription: z.object({
    planId: z.enum(["basic", "advanced", "enterprise"]).optional(),
    planName: z.string().optional(),
    trialEndsAt: z.string().nullable().optional(), // ISO date string or null
    status: z.enum(["trial", "active", "canceled", "expired"]).optional(),
  }).optional(),
})

export type Profile = z.infer<typeof ProfileSchema>

// Signup 响应
export const SignupResponseSchema = z.object({
  ok: z.boolean(),
  token: z.string(),
  isNew: z.boolean(),
})

export type SignupResponse = z.infer<typeof SignupResponseSchema>

// Login 响应
export const LoginResponseSchema = z.object({
  ok: z.boolean(),
  token: z.string(),
  isNew: z.boolean(),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>

// Magic Link 发送响应
export const MagicLinkResponseSchema = z.object({
  ok: z.boolean(),
})

export type MagicLinkResponse = z.infer<typeof MagicLinkResponseSchema>

// Magic Link 验证响应
export const MagicLinkVerifyResponseSchema = z.object({
  ok: z.boolean(),
  token: z.string(),
  isNew: z.boolean(),
})

export type MagicLinkVerifyResponse = z.infer<typeof MagicLinkVerifyResponseSchema>

// Session 响应
export const SessionResponseSchema = z.object({
  ok: z.boolean(),
  profile: ProfileSchema,
})

export type SessionResponse = z.infer<typeof SessionResponseSchema>

// Logout 响应
export const LogoutResponseSchema = z.object({
  ok: z.boolean(),
})

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>

// Google 开始响应
export const GoogleStartResponseSchema = z.object({
  ok: z.boolean(),
  redirect: z.string().optional(),
})

export type GoogleStartResponse = z.infer<typeof GoogleStartResponseSchema>

// Google 回调响应
export const GoogleCallbackResponseSchema = z.object({
  ok: z.boolean(),
  token: z.string(),
  isNew: z.boolean(),
})

export type GoogleCallbackResponse = z.infer<typeof GoogleCallbackResponseSchema>

// API 错误响应
export const ApiErrorResponseSchema = z.object({
  ok: z.boolean().default(false),
  error: z.string().optional(),
  message: z.string().optional(),
})

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>

