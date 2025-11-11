"use client"

import { useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
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
import type { Persona } from "@/types/products"
import { useBrandUIStore } from "@/store/brand-ui.store"
import {
  useCreatePersona,
  useUpdatePersona,
  useDeletePersona,
} from "@/hooks/use-products"

interface PersonasCardProps {
  personas: Persona[]
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

const personaSchema = z.object({
  name: z.string().min(1, "Persona name is required"),
  description: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
})

type PersonaForm = z.infer<typeof personaSchema>

export function PersonasCard({ personas, brandId }: PersonasCardProps) {
  const { markSaved } = useBrandUIStore()

  const createPersonaMutation = useCreatePersona(brandId)
  const updatePersonaMutation = useUpdatePersona(brandId)
  const deletePersonaMutation = useDeletePersona(brandId)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const isSubmittingRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PersonaForm>({
    resolver: zodResolver(personaSchema),
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
  } = useForm<PersonaForm>({
    resolver: zodResolver(personaSchema),
  })

  const handleAddPersona = async (data: PersonaForm) => {
    // Multiple guards to prevent duplicate submission
    if (createPersonaMutation.isPending) return
    if (isSubmittingRef.current) return
    
    // Set flag immediately to prevent any concurrent calls
    isSubmittingRef.current = true
    
    try {
      await createPersonaMutation.mutateAsync({
        name: data.name.trim(),
        description: data.description?.trim() || null,
        region: data.region || null,
      })
      reset()
      setAddDialogOpen(false)
      markSaved()
    } catch (error) {
      // Error is handled by mutation's onError
      console.error("Failed to add persona:", error)
    } finally {
      // Reset ref after mutation completes
      setTimeout(() => {
        isSubmittingRef.current = false
      }, 500)
    }
  }

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona(persona)
    setEditId(persona.id)
    resetEdit({
      name: persona.name,
      description: persona.description || "",
      region: persona.region || "",
    })
  }

  const handleUpdatePersona = async (data: PersonaForm) => {
    if (!editId) return
    await updatePersonaMutation.mutateAsync({
      id: editId,
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        region: data.region || null,
      },
    })
    resetEdit()
    setEditId(null)
    setEditingPersona(null)
    markSaved()
  }

  const handleDeletePersona = async () => {
    if (!deleteId) return
    await deletePersonaMutation.mutateAsync(deleteId)
    setDeleteId(null)
    markSaved()
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Personas</h2>
            <p className="text-sm text-muted-foreground">
              Define your target audience segments ({personas.length} personas)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            aria-label="Add new persona"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Persona
          </Button>
        </div>

        {personas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No personas yet. Click "Add Persona" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Persona name"
                  >
                    Name
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Persona region"
                  >
                    Region
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Persona description"
                  >
                    Description
                  </th>
                  <th
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                    aria-label="Actions"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {personas.map((persona) => (
                  <tr key={persona.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4" aria-label={`Persona: ${persona.name}`}>
                      {editId === persona.id ? (
                        <Input
                          {...registerEdit("name")}
                          className={errorsEdit.name ? "border-destructive w-full" : "w-full"}
                          aria-invalid={!!errorsEdit.name}
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{persona.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4" aria-label={`Region: ${persona.region || "None"}`}>
                      {editId === persona.id ? (
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
                        <span className="text-sm text-muted-foreground">{persona.region || "—"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editId === persona.id ? (
                        <Textarea
                          {...registerEdit("description")}
                          rows={2}
                          className="w-full"
                          placeholder="Description"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {persona.description || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editId === persona.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              resetEdit()
                              setEditId(null)
                              setEditingPersona(null)
                            }}
                            aria-label="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSubmitEdit(handleUpdatePersona)}
                            disabled={updatePersonaMutation.isPending}
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
                            onClick={() => handleEditPersona(persona)}
                            aria-label={`Edit persona: ${persona.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(persona.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Delete persona: ${persona.name}`}
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

      {/* Add Persona Dialog */}
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
            <DialogTitle>Add Persona</DialogTitle>
            <DialogDescription>Create a new target audience persona</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddPersona)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="persona-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="persona-name"
                {...register("name")}
                placeholder="e.g., Enterprise Decision Maker"
                className={errors.name ? "border-destructive" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "persona-name-error" : undefined}
              />
              <FormMessage message={errors.name?.message} variant="error" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona-description">
                Description <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Textarea
                id="persona-description"
                {...register("description")}
                rows={4}
                placeholder="Describe this persona..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona-region">
                Region <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger id="persona-region">
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
                disabled={createPersonaMutation.isPending}
                aria-label="Add persona"
              >
                {createPersonaMutation.isPending ? "Adding..." : "Add Persona"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Persona</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this persona? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePersona}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePersonaMutation.isPending}
            >
              {deletePersonaMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
