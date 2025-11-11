import { z } from "zod"

/**
 * Products Management Types & Zod Schemas
 */

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(), // Website URL
})

export type Brand = z.infer<typeof BrandSchema>

export const ProductSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  name: z.string(),
  category: z.string().optional().nullable(),
  active: z.boolean().default(true),
})

export type Product = z.infer<typeof ProductSchema>

export const PersonaSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

export type Persona = z.infer<typeof PersonaSchema>

export const CompetitorSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  name: z.string(),
  product: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

export type Competitor = z.infer<typeof CompetitorSchema>

/**
 * API Request/Response Schemas
 */

// Get Brand Response
export const GetBrandResponseSchema = z.object({
  brand: BrandSchema,
})

export type GetBrandResponse = z.infer<typeof GetBrandResponseSchema>

// Update Brand Request
export const UpdateBrandRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(), // Website URL
})

export type UpdateBrandRequest = z.infer<typeof UpdateBrandRequestSchema>

// Update Brand Response
export const UpdateBrandResponseSchema = z.object({
  brand: BrandSchema,
})

export type UpdateBrandResponse = z.infer<typeof UpdateBrandResponseSchema>

// Get Products Response
export const GetProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
})

export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>

// Create Product Request
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
})

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>

// Update Product Request
export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  active: z.boolean().optional(),
})

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>

// Product Response
export const ProductResponseSchema = z.object({
  product: ProductSchema,
})

export type ProductResponse = z.infer<typeof ProductResponseSchema>

// Get Personas Response
export const GetPersonasResponseSchema = z.object({
  personas: z.array(PersonaSchema),
})

export type GetPersonasResponse = z.infer<typeof GetPersonasResponseSchema>

// Create Persona Request
export const CreatePersonaRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

export type CreatePersonaRequest = z.infer<typeof CreatePersonaRequestSchema>

// Update Persona Request
export const UpdatePersonaRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

export type UpdatePersonaRequest = z.infer<typeof UpdatePersonaRequestSchema>

// Persona Response
export const PersonaResponseSchema = z.object({
  persona: PersonaSchema,
})

export type PersonaResponse = z.infer<typeof PersonaResponseSchema>

// Get Competitors Response
export const GetCompetitorsResponseSchema = z.object({
  competitors: z.array(CompetitorSchema),
})

export type GetCompetitorsResponse = z.infer<typeof GetCompetitorsResponseSchema>

// Create Competitor Request
export const CreateCompetitorRequestSchema = z.object({
  name: z.string().min(1),
  product: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

export type CreateCompetitorRequest = z.infer<typeof CreateCompetitorRequestSchema>

// Update Competitor Request
export const UpdateCompetitorRequestSchema = z.object({
  name: z.string().min(1).optional(),
  product: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

export type UpdateCompetitorRequest = z.infer<typeof UpdateCompetitorRequestSchema>

// Competitor Response
export const CompetitorResponseSchema = z.object({
  competitor: CompetitorSchema,
})

export type CompetitorResponse = z.infer<typeof CompetitorResponseSchema>

// Get Brands Response
export const GetBrandsResponseSchema = z.object({
  brands: z.array(BrandSchema),
})

export type GetBrandsResponse = z.infer<typeof GetBrandsResponseSchema>

// Create Brand Request
export const CreateBrandRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(), // Website URL
})

export type CreateBrandRequest = z.infer<typeof CreateBrandRequestSchema>

// Create Brand Response
export const CreateBrandResponseSchema = z.object({
  brand: BrandSchema,
})

export type CreateBrandResponse = z.infer<typeof CreateBrandResponseSchema>

