"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Edit2, Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { Brand, Product } from "@/types/products"
import { usePlanStore } from "@/store/plan.store"
import { useBrandUIStore } from "@/store/brand-ui.store"
import {
  useUpdateBrand,
  useCreateBrand,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products"

interface BrandInfoCardProps {
  brand: Brand | null
  brands: Brand[]
  products: Product[]
  selectedProductId: string | null
  onBrandChange: (brandId: string | null) => void
  onCreateBrand: (brand: Brand) => void
  onProductChange: (productId: string | null) => void
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().optional().nullable(),
})

type ProductForm = z.infer<typeof productSchema>

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
})

type BrandForm = z.infer<typeof brandSchema>

export function BrandInfoCard({
  brand,
  brands,
  products,
  selectedProductId,
  onBrandChange,
  onCreateBrand,
  onProductChange,
}: BrandInfoCardProps) {
  const { setDirty, markSaved } = useBrandUIStore()
  const { getMaxProducts } = usePlanStore()
  const updateBrandMutation = useUpdateBrand()
  const createBrandMutation = useCreateBrand()
  const createProductMutation = useCreateProduct(brand?.id || null)
  const updateProductMutation = useUpdateProduct(brand?.id || null)
  const deleteProductMutation = useDeleteProduct(brand?.id || null)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(brand?.name || "")
  const [description, setDescription] = useState(brand?.description || "")

  // Product management state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  // Brand creation state
  const [addBrandDialogOpen, setAddBrandDialogOpen] = useState(false)

  const maxProducts = getMaxProducts()
  const canAddMore = products.length < maxProducts

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

  const {
    register: registerBrand,
    handleSubmit: handleSubmitBrand,
    reset: resetBrand,
    formState: { errors: errorsBrand },
  } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "My Brand",
    },
  })

  // Sync form state with brand prop
  useEffect(() => {
    if (brand) {
      setName(brand.name || "")
      setDescription(brand.description || "")
    }
  }, [brand])

  const hasChanges =
    name !== (brand?.name || "") || description !== (brand?.description || "")

  // Track dirty state
  useEffect(() => {
    if (isEditing && hasChanges) {
      setDirty(true)
    }
  }, [isEditing, hasChanges, setDirty])

  const handleSave = async () => {
    if (!brand) return

    if (!name.trim()) {
      return
    }

    await updateBrandMutation.mutateAsync({
      id: brand.id,
      data: {
        name: name.trim(),
        description: description.trim() || null,
      },
    })

    setIsEditing(false)
    markSaved()
  }

  const handleCancel = () => {
    setName(brand?.name || "")
    setDescription(brand?.description || "")
    setIsEditing(false)
    markSaved()
  }

  // Product handlers
  const handleAddProduct = async (data: ProductForm) => {
    // Multiple guards to prevent duplicate submission
    if (!brand) return
    if (createProductMutation.isPending) return
    if (isSubmittingRef.current) return
    
    // Set flag immediately to prevent any concurrent calls
    isSubmittingRef.current = true
    
    try {
      await createProductMutation.mutateAsync(data)
      // Only reset and close if mutation succeeded
      reset()
      setAddDialogOpen(false)
      markSaved()
    } catch (error) {
      // Error is handled by mutation's onError
      console.error("Failed to add product:", error)
    } finally {
      // Reset ref after mutation completes
      setTimeout(() => {
        isSubmittingRef.current = false
      }, 1000)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditId(product.id)
    resetEdit({
      name: product.name,
      category: product.category || "",
    })
  }

  const handleUpdateProduct = async (data: ProductForm) => {
    if (!editId) return
    await updateProductMutation.mutateAsync({
      id: editId,
      data,
    })
    resetEdit()
    setEditId(null)
    markSaved()
  }

  const handleToggleActive = async (product: Product) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      data: { active: !product.active },
    })
    markSaved()
  }

  const handleDeleteProduct = async () => {
    if (!deleteId) return
    await deleteProductMutation.mutateAsync(deleteId)
    setDeleteId(null)
    markSaved()
  }

  const handleBrandSelectChange = (value: string) => {
    if (value && value !== brand?.id) {
      onBrandChange(value)
    }
  }

  const handleCreateBrand = async (data: BrandForm) => {
    const newBrand = await createBrandMutation.mutateAsync({
      name: data.name.trim(),
    })
    onCreateBrand(newBrand)
    onBrandChange(newBrand.id)
    resetBrand()
    setAddBrandDialogOpen(false)
  }

  const handleAddBrandClick = () => {
    resetBrand({ name: "My Brand" }) // Reset to default value when opening dialog
    setAddBrandDialogOpen(true)
  }

  if (!brand) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">No brand information available</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Brand & Product Information</h2>
          <p className="text-sm text-muted-foreground">Manage your brand and products…</p>
        </div>

        <div className="space-y-6">
          {/* Brand Name - Display Only */}
          <div className="space-y-2">
            <Label htmlFor="brand-name">
              Brand
            </Label>
            <div className="text-sm font-medium text-foreground py-2">
              {brand.name}
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="products">
                Products
              </Label>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No products found.
              </p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                      {product.category && (
                        <span className="text-xs text-muted-foreground ml-2">({product.category})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) {
            reset()
            isSubmittingRef.current = false
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Add a new product to track</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name <span className="text-destructive">*</span>
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
                Category <span className="text-muted-foreground text-xs">(Optional)</span>
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
                {createProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Brand Dialog */}
      <Dialog open={addBrandDialogOpen} onOpenChange={setAddBrandDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>Create a new brand to manage</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitBrand(handleCreateBrand)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-brand-name">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-brand-name"
                {...registerBrand("name")}
                placeholder="Enter brand name"
                className={errorsBrand.name ? "border-destructive" : ""}
                aria-invalid={!!errorsBrand.name}
                aria-describedby={errorsBrand.name ? "new-brand-name-error" : undefined}
              />
              <FormMessage message={errorsBrand.name?.message} variant="error" />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddBrandDialogOpen(false)
                  resetBrand()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBrandMutation.isPending}
                aria-label="Create brand"
              >
                {createBrandMutation.isPending ? "Creating..." : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
