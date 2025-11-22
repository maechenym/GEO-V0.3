import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import * as productsApi from "@/services/products"
import type {
  Brand,
  Product,
  Persona,
  Competitor,
  CreateBrandRequest,
  UpdateBrandRequest,
  CreateProductRequest,
  UpdateProductRequest,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  CreateCompetitorRequest,
  UpdateCompetitorRequest,
} from "@/types/products"

/**
 * React Query hooks for Products Management
 */

// Query Keys
export const queryKeys = {
  brands: ["brands"] as const,
  brand: (id: string) => ["brands", id] as const,
  products: (brandId: string) => ["products", brandId] as const,
  personas: (brandId: string) => ["personas", brandId] as const,
  competitors: (brandId: string) => ["competitors", brandId] as const,
  competitorsByProduct: (productId: string) => ["competitors", "product", productId] as const,
}

/**
 * Brands
 */
export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: () => productsApi.getBrands(),
    staleTime: 60 * 1000,
  })
}

export function useBrand(id: string | null) {
  return useQuery({
    queryKey: queryKeys.brand(id!),
    queryFn: async () => {
      const brand = await productsApi.getBrand(id!)
      return { brand }
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => productsApi.createBrand(data),
    onSuccess: (newBrand) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands })
      queryClient.setQueryData(queryKeys.brand(newBrand.id), { brand: newBrand })
      toast({
        title: translate("Brand Created", language),
        description: `"${newBrand.name}" ${translate("has been created successfully", language)}`,
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Create Brand", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      productsApi.updateBrand(id, data),
    onSuccess: (updatedBrand) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands })
      queryClient.setQueryData(queryKeys.brand(updatedBrand.id), { brand: updatedBrand })
      toast({
        title: translate("Changes Saved", language),
        description: translate("Brand information updated successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Save", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands })
      toast({
        title: translate("Brand Deleted", language),
        description: translate("has been deleted successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Delete Brand", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

/**
 * Products
 */
export function useProducts(brandId: string | null) {
  return useQuery({
    queryKey: queryKeys.products(brandId!),
    queryFn: async () => {
      const products = await productsApi.getProducts(brandId!)
      return { products }
    },
    enabled: !!brandId,
    staleTime: 60 * 1000,
  })
}

export function useCreateProduct(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (data: CreateProductRequest) => {
      if (!brandId) {
        throw new Error("Brand ID is required")
      }
      return productsApi.createProduct(brandId, data)
    },
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: queryKeys.products(brandId!) })
      toast({
        title: translate("Product Added", language),
        description: translate("Product has been added successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Add Product", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateProduct(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(brandId!) })
      toast({
        title: translate("Product Updated", language),
        description: translate("Product has been updated successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Update", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteProduct(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(brandId!) })
      toast({
        title: translate("Product Deleted", language),
        description: translate("Product has been removed successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Delete Product", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

/**
 * Personas
 */
export function usePersonas(brandId: string | null) {
  return useQuery({
    queryKey: queryKeys.personas(brandId!),
    queryFn: async () => {
      const personas = await productsApi.getPersonas(brandId!)
      return { personas }
    },
    enabled: !!brandId,
    staleTime: 60 * 1000,
  })
}

export function useCreatePersona(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (data: CreatePersonaRequest) => {
      if (!brandId) {
        throw new Error("Brand ID is required")
      }
      return productsApi.createPersona(brandId, data)
    },
    onSuccess: (newPersona) => {
      // Invalidate and refetch personas list
      queryClient.invalidateQueries({ queryKey: queryKeys.personas(brandId!) })
      toast({
        title: translate("Persona Added", language),
        description: translate("Persona has been added successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Add Persona", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useUpdatePersona(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonaRequest }) =>
      productsApi.updatePersona(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personas(brandId!) })
      toast({
        title: translate("Persona Updated", language),
        description: translate("Persona has been updated successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Update", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useDeletePersona(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (id: string) => productsApi.deletePersona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personas(brandId!) })
      toast({
        title: translate("Persona Deleted", language),
        description: translate("Persona has been removed successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Delete Persona", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

/**
 * Competitors
 */
export function useCompetitors(brandId: string | null) {
  return useQuery({
    queryKey: queryKeys.competitors(brandId!),
    queryFn: async () => {
      const competitors = await productsApi.getCompetitors(brandId!)
      console.log("[useCompetitors] Fetched competitors:", competitors.length)
      const targetBanks = ["国泰世华银行", "玉山银行", "台新银行"]
      const found = competitors.filter(c => targetBanks.includes(c.name))
      if (found.length > 0) {
        console.log("[useCompetitors] Target banks found:", found.map(c => c.name))
      }
      return { competitors }
    },
    enabled: !!brandId,
    staleTime: 0, // 禁用缓存，确保每次都获取最新数据
  })
}

/**
 * Get competitors for a specific product
 */
export function useCompetitorsByProduct(productId: string | null) {
  return useQuery({
    queryKey: queryKeys.competitorsByProduct(productId!),
    queryFn: async () => {
      const competitors = await productsApi.getCompetitorsByProduct(productId!)
      console.log("[useCompetitorsByProduct] Fetched competitors:", competitors.length)
      const targetBanks = ["国泰世华银行", "玉山银行", "台新银行"]
      const found = competitors.filter(c => targetBanks.includes(c.name))
      if (found.length > 0) {
        console.log("[useCompetitorsByProduct] Target banks found:", found.map(c => c.name))
      }
      return { competitors }
    },
    enabled: !!productId,
    staleTime: 0, // 禁用缓存，确保每次都获取最新数据
  })
}

export function useCreateCompetitor(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (data: CreateCompetitorRequest) => {
      if (!brandId) {
        throw new Error("Brand ID is required")
      }
      return productsApi.createCompetitor(brandId, data)
    },
    onSuccess: (newCompetitor) => {
      // Invalidate and refetch competitors list
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors(brandId!) })
      toast({
        title: translate("Competitor Added", language),
        description: translate("Competitor has been added successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Add Competitor", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useCreateCompetitorForProduct(productId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (data: CreateCompetitorRequest) => {
      if (!productId) {
        throw new Error("Product ID is required")
      }
      return productsApi.createCompetitorForProduct(productId, data)
    },
    onSuccess: (newCompetitor) => {
      // Invalidate and refetch competitors list for this product
      queryClient.invalidateQueries({ queryKey: queryKeys.competitorsByProduct(productId!) })
      toast({
        title: translate("Competitor Added", language),
        description: translate("Competitor has been added successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Add Competitor", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useUpdateCompetitor(brandId: string | null, productId?: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompetitorRequest }) =>
      productsApi.updateCompetitor(id, data),
    onSuccess: () => {
      // Invalidate both brand and product competitors queries
      if (brandId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.competitors(brandId) })
      }
      if (productId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.competitorsByProduct(productId) })
      }
      toast({
        title: translate("Competitor Updated", language),
        description: translate("Competitor has been updated successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Update", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

export function useDeleteCompetitor(brandId: string | null, productId?: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguageStore()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteCompetitor(id),
    onSuccess: () => {
      // Invalidate both brand and product competitors queries
      if (brandId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.competitors(brandId) })
      }
      if (productId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.competitorsByProduct(productId) })
      }
      toast({
        title: translate("Competitor Deleted", language),
        description: translate("Competitor has been removed successfully", language),
      })
    },
    onError: (error: any) => {
      toast({
        title: translate("Failed to Delete Competitor", language),
        description: error?.response?.data?.error || error?.message || translate("Please try again", language),
        variant: "destructive",
      })
    },
  })
}

