"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FormMessage } from "@/components/ui/form-message"
import type { Product } from "@/types/products"
import { usePlanStore } from "@/store/plan.store"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import { useAuthStore } from "@/store/auth.store"
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products"
import { translate } from "@/lib/i18n"

interface ProductListCardProps {
  products: Product[]
  brandId: string
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().optional().nullable(),
})

type ProductForm = z.infer<typeof productSchema>

const sanitizeProductName = (name: string) => {
  if (!name) return ""
  const trimmed = name.trim()

  if (trimmed.includes("|")) {
    const parts = trimmed.split("|").map((part) => part.trim())
    return parts[parts.length - 1] || trimmed
  }

  if (trimmed.includes("-")) {
    const parts = trimmed.split("-").map((part) => part.trim())
    if (parts.length > 1) {
      return parts[parts.length - 1]
    }
  }

  const withoutBrand = trimmed.replace(/^英业达\s*\(Inventec\)\s*/i, "").trim()
  if (withoutBrand && withoutBrand !== trimmed) {
    return withoutBrand
  }

  return trimmed
}

export function ProductListCard({ products, brandId }: ProductListCardProps) {
  const { getMaxProducts } = usePlanStore()
  const { setDirty } = useBrandUIStore()
  const { language } = useLanguageStore()
  const { profile } = useAuthStore()
  const isTestAccount = profile?.email === "test@example.com"
  const maxProducts = isTestAccount ? Infinity : getMaxProducts()
  const canAddMore = isTestAccount || products.length < maxProducts

  const createProductMutation = useCreateProduct(brandId)
  const updateProductMutation = useUpdateProduct(brandId)
  const deleteProductMutation = useDeleteProduct(brandId)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const handleAddProduct = async (data: ProductForm) => {
    const normalizedData: ProductForm = {
      name: sanitizeProductName(data.name),
      category: data.category?.trim() || "",
    }
    await createProductMutation.mutateAsync(normalizedData)
    reset()
    setAddDialogOpen(false)
    setDirty(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditId(product.id)
    resetEdit({
      name: sanitizeProductName(product.name),
      category: product.category || "",
    })
  }

  const handleUpdateProduct = async (data: ProductForm) => {
    if (!editId) return
    const normalizedData: ProductForm = {
      name: sanitizeProductName(data.name),
      category: data.category?.trim() || "",
    }
    await updateProductMutation.mutateAsync({
      id: editId,
      data: normalizedData,
    })
    resetEdit()
    setEditId(null)
    setEditingProduct(null)
    setDirty(true)
  }

  const handleDeleteProduct = async () => {
    if (!deleteId) return
    await deleteProductMutation.mutateAsync(deleteId)
    setDeleteId(null)
    setDirty(true)
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">{translate("Products", language)}</h2>
            <p className="text-sm text-muted-foreground">
              {isTestAccount
                ? `${products.length} ${translate("products", language)}`
                : `${products.length} / ${maxProducts} ${translate("products", language)}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            disabled={!canAddMore}
            aria-label="Add new product"
          >
            <Plus className="mr-2 h-4 w-4" />
            {translate("Add Product", language)}
          </Button>
        </div>

        {!canAddMore && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Upgrade plan to add more products (current limit: {maxProducts})
            </p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{translate("No products yet. Click \"Add Product\" to get started.", language)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Product name"
                  >
                    {translate("Product", language)}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Product category"
                  >
                    {translate("Category", language)}
                  </th>
                  <th
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Actions"
                  >
                    {translate("Actions", language)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4" aria-label={`Product: ${product.name}`}>
                      {editId === product.id ? (
                        <Input
                          {...registerEdit("name")}
                          className={errorsEdit.name ? "border-destructive w-full" : "w-full"}
                          aria-invalid={!!errorsEdit.name}
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {translate(sanitizeProductName(product.name), language)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4" aria-label={`Category: ${product.category || "None"}`}>
                      {editId === product.id ? (
                        <Input
                          {...registerEdit("category")}
                          placeholder="Category"
                          className="w-full"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {product.category ? translate(product.category, language) : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editId === product.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              resetEdit()
                              setEditId(null)
                              setEditingProduct(null)
                            }}
                            aria-label="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSubmitEdit(handleUpdateProduct)}
                            disabled={updateProductMutation.isPending}
                            aria-label="Save changes"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            aria-label={`Edit product: ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(product.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Delete product: ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{translate("Add Product", language)}</DialogTitle>
            <DialogDescription>{translate("Add a new product to track", language)}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">
                {translate("Product Name", language)} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                {...register("name")}
                placeholder="Enter product name"
                className={errors.name ? "border-destructive" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "product-name-error" : undefined}
              />
              <FormMessage message={errors.name?.message} variant="error" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">
                {translate("Category", language)} <span className="text-muted-foreground text-xs">({translate("Optional", language)})</span>
              </Label>
              <Input
                id="product-category"
                {...register("category")}
                placeholder="e.g., SaaS, Hardware, Software"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                aria-label="Add product"
              >
                {createProductMutation.isPending ? translate("Adding...", language) : translate("Add Product", language)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translate("Delete Product", language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {translate("Are you sure you want to delete this product? This action cannot be undone.", language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translate("Cancel", language)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? translate("Deleting...", language) : translate("Delete", language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
