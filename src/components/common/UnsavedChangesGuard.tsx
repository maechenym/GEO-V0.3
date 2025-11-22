"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"

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
  const { language } = useLanguageStore()
  const router = useRouter()
  const pathname = usePathname()
  const [showDialog, setShowDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)

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

  // Intercept Next.js router navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    // Override router.push to check for unsaved changes
    const originalPush = router.push
    const originalReplace = router.replace
    const originalBack = router.back
    const originalForward = router.forward

    const checkAndNavigate = (targetPath: string, method: 'push' | 'replace') => {
      if (isDirty) {
        setPendingPath(targetPath)
        setShowDialog(true)
        return false
      }
      return true
    }

    router.push = (href: string, options?: any) => {
      if (checkAndNavigate(href, 'push')) {
        return originalPush.call(router, href, options)
      }
      return Promise.resolve(false)
    }

    router.replace = (href: string, options?: any) => {
      if (checkAndNavigate(href, 'replace')) {
        return originalReplace.call(router, href, options)
      }
      return Promise.resolve(false)
    }

    router.back = () => {
      if (isDirty) {
        setPendingPath(null)
        setShowDialog(true)
        return
      }
      originalBack.call(router)
    }

    router.forward = () => {
      if (isDirty) {
        setPendingPath(null)
        setShowDialog(true)
        return
      }
      originalForward.call(router)
    }

    // Handle link clicks (intercept all anchor clicks)
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href]') as HTMLAnchorElement
      
      if (!anchor) return
      
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || anchor.target === '_blank') return
      
      // Check if it's an internal Next.js link
      const isInternalLink = href.startsWith('/') || href.startsWith(window.location.origin)
      if (!isInternalLink) return
      
      // Extract pathname from href
      let targetPath = href
      try {
        const url = new URL(href, window.location.origin)
        targetPath = url.pathname + url.search
      } catch {
        // If href is relative, use it directly
        targetPath = href
      }

      // Don't intercept if navigating to the same page
      if (targetPath === pathname) return

      if (isDirty) {
        e.preventDefault()
        setPendingPath(targetPath)
        setShowDialog(true)
      }
    }

    document.addEventListener('click', handleLinkClick, true)

    return () => {
      router.push = originalPush
      router.replace = originalReplace
      router.back = originalBack
      router.forward = originalForward
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [isDirty, router, pathname])

  const handleSaveAndContinue = async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
        markSaved()
        setShowDialog(false)
        
        // Execute pending navigation if any
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        } else if (pendingPath) {
          router.push(pendingPath)
          setPendingPath(null)
        } else {
          // Browser back/forward
          if (pendingPath === null && typeof window !== "undefined") {
            window.history.back()
          }
        }
        
        toast({
          title: translate("Changes Saved", language),
          description: translate("Your changes have been saved successfully", language),
        })
      } catch (error) {
        toast({
          title: translate("Save Failed", language),
          description: translate("Failed to save changes. Please try again.", language),
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
      } else if (pendingPath) {
        router.push(pendingPath)
        setPendingPath(null)
      } else if (pendingPath === null && typeof window !== "undefined") {
        window.history.back()
      }
    }
  }

  const handleDiscard = () => {
    markSaved()
    setShowDialog(false)
    
    // Execute pending navigation if any
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    } else if (pendingPath) {
      router.push(pendingPath)
      setPendingPath(null)
    } else if (pendingPath === null && typeof window !== "undefined") {
      window.history.back()
    }
  }

  const handleCancel = () => {
    setShowDialog(false)
    setPendingAction(null)
    setPendingPath(null)
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
    <Dialog open={showDialog} onOpenChange={(open) => {
      if (!open) {
        handleCancel()
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translate("Unsaved Changes", language)}</DialogTitle>
          <DialogDescription>
            {translate("You have unsaved changes. Do you want to save them before leaving?", language)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {translate("Cancel", language)}
          </Button>
          <Button variant="outline" onClick={handleDiscard} disabled={isSaving}>
            {translate("Discard Changes", language)}
          </Button>
          <Button onClick={handleSaveAndContinue} disabled={isSaving}>
            {isSaving ? translate("Saving...", language) : translate("Save Changes", language)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
