"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { Member } from "@/types/team"
import { useAuthStore } from "@/store/auth.store"
import { useTeamStore } from "@/store/team.store"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/services/api"
import { DeleteMemberResponseSchema } from "@/types/team"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"

interface TeamTableProps {
  members: Member[]
  onUpdateRole: (id: string, role: "Admin" | "Viewer") => Promise<void>
}

/**
 * Format date to YYYY-MM-DD HH:mm
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

type DialogMode = "forbidden" | "onlyOneMember" | "confirm" | null

export function TeamTable({ members, onUpdateRole }: TeamTableProps) {
  const { toast } = useToast()
  const { profile } = useAuthStore()
  const { removeMember } = useTeamStore()
  const { language } = useLanguageStore()
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

  const currentUserRole = profile?.role || "Viewer"
  const isAdmin = currentUserRole === "Admin"
  const currentUserEmail = profile?.email

  const handleRoleChange = async (memberId: string, newRole: "Admin" | "Viewer") => {
    if (!isAdmin) return
    await onUpdateRole(memberId, newRole)
  }

  const handleDeleteClick = (member: Member) => {
    // 设置要删除的成员信息
    setMemberToDelete(member)
    setDeleteMemberId(member.id)

    // 场景1: 只有1位成员（优先检查，无论是否为 Admin）
    if (members.length <= 1) {
      setDialogMode("onlyOneMember")
      return
    }

    // 场景2: 非 Admin 用户
    if (!isAdmin) {
      setDialogMode("forbidden")
      return
    }

    // 场景3: Admin 且成员数 > 1，显示确认弹窗
    setDialogMode("confirm")
  }

  const handleDeleteConfirm = async () => {
    if (!deleteMemberId || !memberToDelete) return

    try {
      const response = await apiClient.delete(`/api/team/${deleteMemberId}`)
      const data = DeleteMemberResponseSchema.parse(response.data)

      if (data.ok) {
        removeMember(deleteMemberId)
        toast({
          title: "成员已删除",
          description: "成员已成功从团队中移除",
        })
      }
    } catch (error: any) {
      // 处理业务校验错误
      if (error?.response?.status === 409) {
        // 只有1位成员
        setDialogMode("onlyOneMember")
        return
      }
      if (error?.response?.status === 403) {
        // 无权限
        setDialogMode("forbidden")
        return
      }

      toast({
        title: "删除失败",
        description: "删除失败，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setDeleteMemberId(null)
      setMemberToDelete(null)
      setDialogMode(null)
    }
  }

  const handleDialogClose = () => {
    setDeleteMemberId(null)
    setMemberToDelete(null)
    setDialogMode(null)
  }

  if (members.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p>No team members yet. Click "Invite Member" to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th
                className="px-6 py-4 text-left text-base font-semibold text-foreground border-b border-border"
                aria-label="Member email"
              >
                Members
              </th>
              <th
                className="px-6 py-4 text-left text-base font-semibold text-foreground border-b border-border"
                aria-label="Member role"
              >
                Role
              </th>
              <th
                className="px-6 py-4 text-left text-base font-semibold text-foreground border-b border-border"
                aria-label="Last updated time"
              >
                Updated At
              </th>
              <th
                className="px-6 py-4 text-right text-base font-semibold text-foreground border-b border-border"
                aria-label="Actions"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member, index) => {
              const isCurrentUser = member.email === currentUserEmail
              const canEdit = isAdmin && !isCurrentUser

              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4" aria-label={`Member: ${member.email}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {member.email.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{member.email}</div>
                        {isCurrentUser && (
                          <div className="text-xs text-muted-foreground mt-0.5">(You)</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" aria-label={`Role: ${member.role}`}>
                    {canEdit ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleRoleChange(member.id, value as "Admin" | "Viewer")
                        }
                      >
                        <SelectTrigger className="w-[140px]" aria-label="Select role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">{translate("Admin", language)}</SelectItem>
                          <SelectItem value="Viewer">{translate("Viewer", language)}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={member.role === "Admin" ? "default" : "secondary"}>
                        {translate(member.role, language)}
                      </Badge>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-muted-foreground"
                    aria-label={`Updated: ${formatDateTime(member.updatedAt)}`}
                  >
                    {formatDateTime(member.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(member)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Delete member: ${member.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 无权限弹窗 */}
      <AlertDialog open={dialogMode === "forbidden"} onOpenChange={handleDialogClose}>
        <AlertDialogContent role="alertdialog">
          <AlertDialogHeader>
            <AlertDialogTitle>无权限</AlertDialogTitle>
            <AlertDialogDescription>仅管理员可删除成员。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogClose}>我知道了</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 仅一位成员不可删除弹窗 */}
      <AlertDialog open={dialogMode === "onlyOneMember"} onOpenChange={handleDialogClose}>
        <AlertDialogContent role="alertdialog">
          <AlertDialogHeader>
            <AlertDialogTitle>无法删除，当前team仅有一位成员无法删除</AlertDialogTitle>
            <AlertDialogDescription>请先邀请新成员后再删除当前成员。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogClose}>我知道了</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 确认删除弹窗 */}
      <AlertDialog open={dialogMode === "confirm"} onOpenChange={handleDialogClose}>
        <AlertDialogContent role="alertdialog">
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete
                ? `此操作将移除成员 ${memberToDelete.email} 的访问权限。`
                : "此操作将移除该成员的访问权限。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              autoFocus
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
