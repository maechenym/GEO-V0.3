"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/components/ui/form-message"

const descriptionSchema = z.object({
  description: z.string().optional().nullable(),
})

type DescriptionForm = z.infer<typeof descriptionSchema>

interface EditDescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDescription: string | null | undefined
  onSave: (description: string | null) => Promise<void>
}

export function EditDescriptionDialog({
  open,
  onOpenChange,
  currentDescription,
  onSave,
}: EditDescriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DescriptionForm>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: currentDescription || "",
    },
  })

  // When dialog opens, show confirmation first
  const handleDialogOpen = (newOpen: boolean) => {
    if (newOpen) {
      setShowConfirmDialog(true)
    } else {
      setShowConfirmDialog(false)
      setShowEditDialog(false)
      reset({ description: currentDescription || "" })
    }
    onOpenChange(newOpen)
  }

  const handleConfirm = () => {
    setShowConfirmDialog(false)
    setShowEditDialog(true)
    reset({ description: currentDescription || "" })
  }

  const handleCancel = () => {
    setShowConfirmDialog(false)
    setShowEditDialog(false)
    onOpenChange(false)
  }

  const onSubmit = async (data: DescriptionForm) => {
    setIsSubmitting(true)
    try {
      await onSave(data.description || null)
      setShowEditDialog(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save description:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Confirmation Dialog */}
      <AlertDialog open={open && showConfirmDialog} onOpenChange={handleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Brand & Product Description</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to modify this important info? This description helps improve AI
              analysis accuracy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={open && showEditDialog} onOpenChange={handleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Brand & Product Description</DialogTitle>
            <DialogDescription>
              Update your brand and product description. This information helps improve AI analysis
              accuracy.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe your brand and products..."
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              <FormMessage message={errors.description?.message} variant="error" />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
