import apiClient from "./api"
import type {
  Brand,
  Product,
  Persona,
  Competitor,
  GetBrandsResponse,
  GetBrandResponse,
  CreateBrandRequest,
  CreateBrandResponse,
  UpdateBrandRequest,
  UpdateBrandResponse,
  GetProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  GetPersonasResponse,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  PersonaResponse,
  GetCompetitorsResponse,
  CreateCompetitorRequest,
  UpdateCompetitorRequest,
  CompetitorResponse,
  DeleteResponse,
} from "@/types/products"

/**
 * Products API Service
 * 
 * Uses new API structure:
 * - Brands: /api/brands
 * - Products: /api/brands/:brandId/products, /api/products/:id
 * - Personas: /api/brands/:brandId/personas, /api/personas/:id
 * - Competitors: /api/brands/:brandId/competitors, /api/competitors/:id
 */

/**
 * Brands
 */

/**
 * Get all brands
 */
export async function getBrands(): Promise<Brand[]> {
  const response = await apiClient.get<GetBrandsResponse>("/api/brands")
  return response.data.brands
}

/**
 * Get brand by ID
 */
export async function getBrand(id: string): Promise<Brand> {
  const response = await apiClient.get<GetBrandResponse>(`/api/brands/${id}`)
  return response.data.brand
}

/**
 * Create brand
 */
export async function createBrand(data: CreateBrandRequest): Promise<Brand> {
  const response = await apiClient.post<CreateBrandResponse>("/api/brands", data)
  return response.data.brand
}

/**
 * Update brand
 */
export async function updateBrand(id: string, data: UpdateBrandRequest): Promise<Brand> {
  const response = await apiClient.patch<UpdateBrandResponse>(`/api/brands/${id}`, data)
  return response.data.brand
}

/**
 * Delete brand
 */
export async function deleteBrand(id: string): Promise<void> {
  await apiClient.delete<DeleteResponse>(`/api/brands/${id}`)
}

/**
 * Products
 */

/**
 * Get products for a brand
 */
export async function getProducts(brandId: string): Promise<Product[]> {
  const response = await apiClient.get<GetProductsResponse>(`/api/brands/${brandId}/products`)
  return response.data.products
}

/**
 * Create product
 */
export async function createProduct(brandId: string, data: CreateProductRequest): Promise<Product> {
  const response = await apiClient.post<ProductResponse>(`/api/brands/${brandId}/products`, data)
  return response.data.product
}

/**
 * Update product
 */
export async function updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
  const response = await apiClient.patch<ProductResponse>(`/api/products/${id}`, data)
  return response.data.product
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete<DeleteResponse>(`/api/products/${id}`)
}

/**
 * Personas
 */

/**
 * Get personas for a brand
 */
export async function getPersonas(brandId: string): Promise<Persona[]> {
  const response = await apiClient.get<GetPersonasResponse>(`/api/brands/${brandId}/personas`)
  return response.data.personas
}

/**
 * Create persona
 */
export async function createPersona(brandId: string, data: CreatePersonaRequest): Promise<Persona> {
  const response = await apiClient.post<PersonaResponse>(`/api/brands/${brandId}/personas`, data)
  return response.data.persona
}

/**
 * Update persona
 */
export async function updatePersona(id: string, data: UpdatePersonaRequest): Promise<Persona> {
  const response = await apiClient.patch<PersonaResponse>(`/api/personas/${id}`, data)
  return response.data.persona
}

/**
 * Delete persona
 */
export async function deletePersona(id: string): Promise<void> {
  await apiClient.delete<DeleteResponse>(`/api/personas/${id}`)
}

/**
 * Competitors
 */

/**
 * Get competitors for a brand
 */
export async function getCompetitors(brandId: string): Promise<Competitor[]> {
  const response = await apiClient.get<GetCompetitorsResponse>(`/api/brands/${brandId}/competitors`)
  return response.data.competitors
}

/**
 * Create competitor
 */
export async function createCompetitor(
  brandId: string,
  data: CreateCompetitorRequest
): Promise<Competitor> {
  const response = await apiClient.post<CompetitorResponse>(`/api/brands/${brandId}/competitors`, data)
  return response.data.competitor
}

/**
 * Update competitor
 */
export async function updateCompetitor(
  id: string,
  data: UpdateCompetitorRequest
): Promise<Competitor> {
  const response = await apiClient.patch<CompetitorResponse>(`/api/competitors/${id}`, data)
  return response.data.competitor
}

/**
 * Delete competitor
 */
export async function deleteCompetitor(id: string): Promise<void> {
  await apiClient.delete<DeleteResponse>(`/api/competitors/${id}`)
}
