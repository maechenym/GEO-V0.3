"use client"

import { useEffect, useState } from "react"
import { useBrandUIStore } from "@/store/brand-ui.store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface UnsavedChangesGuardProps {
  onSave?: () => Promise<void>
}

/**
 * UnsavedChangesGuard
 * 
 * Warns users when they try to leave with unsaved changes
 * Supports both browser navigation and internal navigation
 */
export function UnsavedChangesGuard({ onSave }: UnsavedChangesGuardProps) {
  const { isDirty, markSaved } = useBrandUIStore()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Handle browser navigation (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isDirty])

  const handleSaveAndContinue = async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
        markSaved()
        setShowDialog(false)
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        }
        toast({
          title: "Changes Saved",
          description: "Your changes have been saved successfully",
        })
      } catch (error) {
        toast({
          title: "Save Failed",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      // If no onSave handler, just mark as saved and continue
      markSaved()
      setShowDialog(false)
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    }
  }

  const handleDiscard = () => {
    markSaved()
    setShowDialog(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const handleCancel = () => {
    setShowDialog(false)
    setPendingAction(null)
  }

  // Expose function to check and prompt for unsaved changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__checkUnsavedChanges = (action: () => void) => {
        if (isDirty) {
          setPendingAction(() => action)
          setShowDialog(true)
          return false
        }
        return true
      }
    }
  }, [isDirty])

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Do you want to save them before leaving?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleDiscard} disabled={isSaving}>
            Discard
          </Button>
          <Button onClick={handleSaveAndContinue} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
