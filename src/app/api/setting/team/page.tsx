"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TeamTable } from "@/components/team/TeamTable"
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog"
import { useAuthStore } from "@/store/auth.store"
import { usePlanStore } from "@/store/plan.store"
import { useTeamStore } from "@/store/team.store"
import { useToast } from "@/hooks/use-toast"
import type { Member } from "@/types/team"
import apiClient from "@/services/api"
import {
  TeamListSchema,
  InviteMemberResponseSchema,
  UpdateMemberRoleResponseSchema,
} from "@/types/team"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"

/**
 * Calculate member limits based on plan type
 */
function getMemberLimits(planType: string | null): {
  maxAdmins: number
  maxMembers: number
  total: number
} {
  // Map planType to limits
  // free: 1 admin
  // basic: 1 admin + 2 members
  // pro: 2 admins + 5 members
  // enterprise: 3 admins + 10 members
  if (planType === "trial" || planType === null) {
    return { maxAdmins: 1, maxMembers: 0, total: 1 }
  }
  if (planType === "basic") {
    return { maxAdmins: 1, maxMembers: 2, total: 3 }
  }
  if (planType === "pro") {
    return { maxAdmins: 2, maxMembers: 5, total: 7 }
  }
  if (planType === "enterprise") {
    return { maxAdmins: 3, maxMembers: 10, total: 13 }
  }
  // Fallback to basic limits
  return { maxAdmins: 1, maxMembers: 2, total: 3 }
}

export default function TeamSettingsPage() {
  const { toast } = useToast()
  const { profile } = useAuthStore()
  const { planType } = usePlanStore()
  const { members, setMembers, addMember, updateRole, removeMember } = useTeamStore()
  const { language } = useLanguageStore()

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)

  const currentUserRole = profile?.role || "Admin" // Default to Admin if role not set
  const isAdmin = currentUserRole === "Admin"

  // Calculate member limits
  const limits = useMemo(() => getMemberLimits(planType), [planType])
  const currentAdmins = members.filter((m) => m.role === "Admin").length
  const currentMembers = members.filter((m) => m.role === "Viewer").length

  // Check if can invite more members
  const canInviteMore = useMemo(() => {
    if (members.length >= limits.total) return false
    // Check admin limit
    if (currentAdmins >= limits.maxAdmins) {
      // Can only invite viewers
      return true
    }
    // Check member limit
    if (currentMembers >= limits.maxMembers) {
      // Can only invite admins
      return true
    }
    return true
  }, [members.length, currentAdmins, currentMembers, limits])

  // Check if can invite specific role
  const canInviteRole = (role: "Admin" | "Viewer"): boolean => {
    if (members.length >= limits.total) return false
    if (role === "Admin") {
      return currentAdmins < limits.maxAdmins
    }
    return currentMembers < limits.maxMembers
  }

  // Load team members on mount
  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    setIsLoadingMembers(true)
    try {
      const response = await apiClient.get("/api/team")
      console.log("Team API response:", response.data)
      
      // 尝试解析响应数据
      let data
      try {
        data = TeamListSchema.parse(response.data)
      } catch (parseError) {
        console.error("Failed to parse team members response:", parseError, response.data)
        // 如果解析失败，尝试使用 response.data.members 或创建默认数据
        if (response.data && Array.isArray(response.data.members)) {
          data = { members: response.data.members }
        } else if (Array.isArray(response.data)) {
          data = { members: response.data }
        } else {
          throw new Error("Invalid response format")
        }
      }
      
      // 如果是 free/trial 版本，只显示当前用户
      const limits = getMemberLimits(planType)
      if (limits.total === 1) {
        // 只保留当前用户
        const currentUserMember = data.members.find((m: any) => m.email === profile?.email)
        if (currentUserMember) {
          setMembers([currentUserMember])
        } else if (profile?.email) {
          // 如果当前用户不在列表中，创建一个
          const newMember: Member = {
            id: `member_${Date.now()}`,
            email: profile.email,
            role: "Admin",
            updatedAt: new Date().toISOString(),
          }
          setMembers([newMember])
        } else {
          setMembers([])
        }
      } else {
        setMembers(data.members || [])
      }
    } catch (error: any) {
      console.error("Failed to load team members:", error)
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      })
      
      // 如果是 free/trial 版本，创建当前用户的默认成员记录（不显示错误）
      const limits = getMemberLimits(planType)
      if (limits.total === 1 && profile?.email) {
        const defaultMember: Member = {
          id: `member_${Date.now()}`,
          email: profile.email,
          role: "Admin",
          updatedAt: new Date().toISOString(),
        }
        setMembers([defaultMember])
      } else {
        // 只有在非 free/trial 版本时才显示错误提示
        toast({
          title: "Failed to load members",
          description: error?.response?.data?.error || error?.message || "Please refresh the page and try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleInvite = async (formData: { email: string; role: "Admin" | "Viewer" }) => {
    if (!canInviteRole(formData.role)) {
      toast({
        title: "Limit Reached",
        description: `Your plan does not allow adding more ${formData.role}s. Upgrade to add more members.`,
        variant: "destructive",
      })
      return
    }

    setIsInviting(true)
    try {
      const response = await apiClient.post("/api/team/invite", formData)
      const data = InviteMemberResponseSchema.parse(response.data)

      addMember(data.member)
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${formData.email}`,
      })
      setInviteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Invitation failed",
        description: error?.response?.data?.error || error?.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (id: string, role: "Admin" | "Viewer") => {
    try {
      const response = await apiClient.patch(`/api/team/${id}`, { role })
      const data = UpdateMemberRoleResponseSchema.parse(response.data)

      updateRole(id, data.member.role)
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.response?.data?.error || error?.message || "Failed to update role. Please try again.",
        variant: "destructive",
      })
    }
  }


  return (
    <>
      <div className="bg-background -mx-6">
        {/* Top Filter Bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-2">
          <div className="container mx-auto max-w-[1600px]">
            <div className="flex items-center justify-between">
              {/* Left: Title */}
              <div className="-ml-6">
                <h1 className="text-xl font-semibold text-foreground">Team Members</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your teammates and assign roles for your brand workspace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-pageX py-4 sm:py-pageY max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Member Limit Info */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">
                    {members.length} / {limits.total}
                  </span>{" "}
                  members
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setInviteDialogOpen(true)}
                  disabled={!isAdmin}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {translate("Invite Member", language)}
                </Button>
              </div>
            </div>

            {/* Members Table */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              {isLoadingMembers ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p>Loading members...</p>
                </div>
              ) : (
                <TeamTable
                  members={members}
                  onUpdateRole={handleUpdateRole}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Invite Member Dialog */}
      {isAdmin && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onSubmit={handleInvite}
          isSubmitting={isInviting}
          canInviteMore={canInviteMore}
          canInviteRole={canInviteRole}
        />
      )}
    </>
  )
}
