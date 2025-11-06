"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { FormMessage } from "@/components/ui/form-message"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Admin", "Viewer"], {
    required_error: "Please select a role",
  }),
})

type InviteMemberForm = z.infer<typeof inviteMemberSchema>

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: InviteMemberForm) => Promise<void>
  isSubmitting?: boolean
  canInviteMore?: boolean
  canInviteRole?: (role: "Admin" | "Viewer") => boolean
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  canInviteMore = true,
  canInviteRole,
}: InviteMemberDialogProps) {
  const { language } = useLanguageStore()
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "Viewer",
    },
  })

  const selectedRole = watch("role")
  const showUpgradeMessage = !canInviteMore || (canInviteRole && selectedRole && !canInviteRole(selectedRole))

  const handleFormSubmit = async (data: InviteMemberForm) => {
    await onSubmit(data)
    reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{translate("Invite Member", language)}</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team workspace. They will receive an email with
            instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Upgrade Message Card */}
          {showUpgradeMessage && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Upgrade your plan to invite more members.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="invite-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "invite-email-error" : undefined}
            />
            <FormMessage message={errors.email?.message} variant="error" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="invite-role">
                Role <span className="text-destructive">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                      aria-label="Role permissions information"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>{translate("Admin", language)}:</strong> Can manage brand and product settings, invite and
                        remove members.
                      </div>
                      <div>
                        <strong>{translate("Viewer", language)}:</strong> Can only view content, cannot make changes.
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger
                    id="invite-role"
                    className={errors.role ? "border-destructive" : ""}
                    aria-label="Select role"
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">{translate("Admin", language)}</SelectItem>
                    <SelectItem value="Viewer">{translate("Viewer", language)}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FormMessage message={errors.role?.message} variant="error" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || showUpgradeMessage}>
              {isSubmitting ? translate("Inviting...", language) : translate("Invite Member", language)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
