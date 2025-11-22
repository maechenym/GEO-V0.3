import { z } from "zod"

/**
 * 品牌基础信息 Schema
 */
export const BrandBasicSchema = z.object({
  brandName: z.string().min(1, "Brand Name is required"),
  productCategory: z.string().min(1, "Product Category is required"), // 产品类别（必填）
  specificProduct: z.string().optional().nullable(), // 具体产品（选填）
  industry: z.string().optional().nullable(), // 行业（选填）
  competitors: z.array(z.string()).optional().default([]), // 竞品品牌列表（选填）
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

