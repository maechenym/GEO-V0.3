import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
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

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => productsApi.createBrand(data),
    onSuccess: (newBrand) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands })
      queryClient.setQueryData(queryKeys.brand(newBrand.id), { brand: newBrand })
      toast({
        title: "Brand Created",
        description: `"${newBrand.name}" has been created successfully`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Brand",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      productsApi.updateBrand(id, data),
    onSuccess: (updatedBrand) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands })
      queryClient.setQueryData(queryKeys.brand(updatedBrand.id), { brand: updatedBrand })
      toast({
        title: "Changes Saved",
        description: "Brand information updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands })
      toast({
        title: "Brand Deleted",
        description: "Brand has been removed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete",
        description: error?.response?.data?.error || error?.message || "Please try again",
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
        title: "Product Added",
        description: "Product has been added successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Product",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateProduct(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(brandId!) })
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteProduct(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products(brandId!) })
      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete",
        description: error?.response?.data?.error || error?.message || "Please try again",
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
        title: "Persona Added",
        description: "Persona has been added successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Persona",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useUpdatePersona(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonaRequest }) =>
      productsApi.updatePersona(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personas(brandId!) })
      toast({
        title: "Persona Updated",
        description: "Persona has been updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useDeletePersona(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => productsApi.deletePersona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personas(brandId!) })
      toast({
        title: "Persona Deleted",
        description: "Persona has been removed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete",
        description: error?.response?.data?.error || error?.message || "Please try again",
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
      return { competitors }
    },
    enabled: !!brandId,
    staleTime: 60 * 1000,
  })
}

export function useCreateCompetitor(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

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
        title: "Competitor Added",
        description: "Competitor has been added successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Competitor",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateCompetitor(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompetitorRequest }) =>
      productsApi.updateCompetitor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors(brandId!) })
      toast({
        title: "Competitor Updated",
        description: "Competitor has been updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteCompetitor(brandId: string | null) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteCompetitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors(brandId!) })
      toast({
        title: "Competitor Deleted",
        description: "Competitor has been removed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete",
        description: error?.response?.data?.error || error?.message || "Please try again",
        variant: "destructive",
      })
    },
  })
}

