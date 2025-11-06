"use client"

import { useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { Competitor } from "@/types/products"
import { useBrandUIStore } from "@/store/brand-ui.store"
import { useLanguageStore } from "@/store/language.store"
import {
  useCreateCompetitor,
  useUpdateCompetitor,
  useDeleteCompetitor,
} from "@/hooks/use-products"
import { translate } from "@/lib/i18n"

interface CompetitorsCardProps {
  competitors: Competitor[]
  brandId: string
}

const REGIONS = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "China",
  "Singapore",
  "Australia",
  "India",
  "Canada",
]

const competitorSchema = z.object({
  name: z.string().min(1, "Competitor name is required"),
  product: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

type CompetitorForm = z.infer<typeof competitorSchema>

export function CompetitorsCard({ competitors, brandId }: CompetitorsCardProps) {
  const { markSaved } = useBrandUIStore()
  const { language } = useLanguageStore()

  const createCompetitorMutation = useCreateCompetitor(brandId)
  const updateCompetitorMutation = useUpdateCompetitor(brandId)
  const deleteCompetitorMutation = useDeleteCompetitor(brandId)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)
  const isSubmittingRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CompetitorForm>({
    resolver: zodResolver(competitorSchema),
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
  } = useForm<CompetitorForm>({
    resolver: zodResolver(competitorSchema),
  })

  const handleAddCompetitor = async (data: CompetitorForm) => {
    // Multiple guards to prevent duplicate submission
    if (createCompetitorMutation.isPending) return
    if (isSubmittingRef.current) return
    
    // Set flag immediately to prevent any concurrent calls
    isSubmittingRef.current = true
    
    try {
      await createCompetitorMutation.mutateAsync({
        name: data.name.trim(),
        product: data.product?.trim() || null,
        region: data.region || null,
      })
      reset()
      setAddDialogOpen(false)
      markSaved()
    } catch (error) {
      // Error is handled by mutation's onError
      console.error("Failed to add competitor:", error)
    } finally {
      // Reset ref after mutation completes
      setTimeout(() => {
        isSubmittingRef.current = false
      }, 500)
    }
  }

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setEditId(competitor.id)
    resetEdit({
      name: competitor.name,
      product: competitor.product || "",
      region: competitor.region || "",
    })
  }

  const handleUpdateCompetitor = async (data: CompetitorForm) => {
    if (!editId) return
    await updateCompetitorMutation.mutateAsync({
      id: editId,
      data: {
        name: data.name.trim(),
        product: data.product?.trim() || null,
        region: data.region || null,
      },
    })
    resetEdit()
    setEditId(null)
    setEditingCompetitor(null)
    markSaved()
  }

  const handleDeleteCompetitor = async () => {
    if (!deleteId) return
    await deleteCompetitorMutation.mutateAsync(deleteId)
    setDeleteId(null)
    markSaved()
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">{translate("Competitors", language)}</h2>
            <p className="text-sm text-muted-foreground">
              {translate("Track your competitors", language)} ({competitors.length} {translate("competitors", language)})
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            aria-label="Add new competitor"
          >
            <Plus className="mr-2 h-4 w-4" />
            {translate("Add Competitor", language)}
          </Button>
        </div>

        {competitors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{translate("No competitors yet. Click \"Add Competitor\" to get started.", language)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-base font-semibold text-foreground border-b border-border"
                    aria-label="Competitor brand name"
                  >
                    {translate("Brand", language)}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-base font-semibold text-foreground border-b border-border"
                    aria-label="Competitor product"
                  >
                    {translate("Product", language)}
                  </th>
                  <th
                    className="px-6 py-4 text-left text-base font-semibold text-foreground border-b border-border"
                    aria-label="Competitor region"
                  >
                    {translate("Region", language)}
                  </th>
                  <th
                    className="px-6 py-4 text-right text-base font-semibold text-foreground border-b border-border"
                    aria-label="Actions"
                  >
                    {translate("Actions", language)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {competitors.map((competitor) => (
                  <tr key={competitor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4" aria-label={`Brand: ${competitor.name}`}>
                      {editId === competitor.id ? (
                        <Input
                          {...registerEdit("name")}
                          className={errorsEdit.name ? "border-destructive w-full" : "w-full"}
                          aria-invalid={!!errorsEdit.name}
                        />
                      ) : (
                        <span className="font-medium text-foreground">{translate(competitor.name, language)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4" aria-label={`Product: ${competitor.product || "None"}`}>
                      {editId === competitor.id ? (
                        <Input {...registerEdit("product")} placeholder="Product" className="w-full" />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {competitor.product ? translate(competitor.product, language) : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4" aria-label={`Region: ${competitor.region || "None"}`}>
                      {editId === competitor.id ? (
                        <Controller
                          name="region"
                          control={controlEdit}
                          render={({ field }) => (
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                {REGIONS.map((region) => (
                                  <SelectItem key={region} value={region}>
                                    {region}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">{competitor.region || "—"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editId === competitor.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              resetEdit()
                              setEditId(null)
                              setEditingCompetitor(null)
                            }}
                            aria-label="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSubmitEdit(handleUpdateCompetitor)}
                            disabled={updateCompetitorMutation.isPending}
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
                            onClick={() => handleEditCompetitor(competitor)}
                            aria-label={`Edit competitor: ${competitor.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(competitor.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Delete competitor: ${competitor.name}`}
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

      {/* Add Competitor Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            reset()
            isSubmittingRef.current = false
          }
          setAddDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{translate("Add Competitor", language)}</DialogTitle>
            <DialogDescription>{translate("Add a competitor to track", language)}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddCompetitor)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competitor-name">
                {translate("Competitor Name", language)} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="competitor-name"
                {...register("name")}
                placeholder="Enter competitor name"
                className={errors.name ? "border-destructive" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "competitor-name-error" : undefined}
              />
              <FormMessage message={errors.name?.message} variant="error" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-product">
                {translate("Product", language)} <span className="text-muted-foreground text-xs">({translate("Optional", language)})</span>
              </Label>
              <Input
                id="competitor-product"
                {...register("product")}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-region">
                {translate("Region", language)} <span className="text-muted-foreground text-xs">({translate("Optional", language)})</span>
              </Label>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger id="competitor-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                disabled={createCompetitorMutation.isPending}
                aria-label="Add competitor"
              >
                {createCompetitorMutation.isPending ? translate("Adding...", language) : translate("Add Competitor", language)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translate("Delete Competitor", language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {translate("Are you sure you want to delete this competitor? This action cannot be undone.", language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translate("Cancel", language)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompetitor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCompetitorMutation.isPending}
            >
              {deleteCompetitorMutation.isPending ? translate("Deleting...", language) : translate("Delete", language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
