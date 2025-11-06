"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormMessage } from "@/components/ui/form-message"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Brand } from "@/types/products"
import { useCreateBrand } from "@/hooks/use-products"

interface BrandSelectorProps {
  brands: Brand[]
  selectedBrandId: string | null
  onBrandChange: (brandId: string | null) => void
  onCreateBrand: (brand: Brand) => void
}

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
})

type BrandForm = z.infer<typeof brandSchema>

export function BrandSelector({
  brands,
  selectedBrandId,
  onBrandChange,
  onCreateBrand,
}: BrandSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const createBrandMutation = useCreateBrand()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "My Brand",
    },
  })

  const handleSelectChange = (value: string) => {
    if (value === "__create__") {
      reset({ name: "My Brand" }) // Reset to default value when opening dialog
      setDialogOpen(true)
    } else {
      onBrandChange(value || null)
    }
  }

  const handleCreateBrand = async (data: BrandForm) => {
    const newBrand = await createBrandMutation.mutateAsync({
      name: data.name.trim(),
    })
    onCreateBrand(newBrand)
    onBrandChange(newBrand.id)
    reset()
    setDialogOpen(false)
  }

  return (
    <>
      <Select value={selectedBrandId || undefined} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select brand" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
          <SelectItem value="__create__" className="text-primary font-medium">
            <Plus className="mr-2 h-4 w-4 inline" />
            Add new brand
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>Create a new brand to manage</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateBrand)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-brand-name">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-brand-name"
                {...register("name")}
                placeholder="Enter brand name"
                className={errors.name ? "border-destructive" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "new-brand-name-error" : undefined}
              />
              <FormMessage message={errors.name?.message} variant="error" />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  reset()
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
