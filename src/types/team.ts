import { z } from "zod"

/**
 * Team Member Types
 */

export const MemberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["Admin", "Viewer"]),
  updatedAt: z.string(), // ISO 8601 date string
})

export type Member = z.infer<typeof MemberSchema>

export const TeamListSchema = z.object({
  members: z.array(MemberSchema),
})

export type TeamList = z.infer<typeof TeamListSchema>

// Invite Member Request
export const InviteMemberRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Admin", "Viewer"]),
})

export type InviteMemberRequest = z.infer<typeof InviteMemberRequestSchema>

// Invite Member Response
export const InviteMemberResponseSchema = z.object({
  member: MemberSchema,
})

export type InviteMemberResponse = z.infer<typeof InviteMemberResponseSchema>

// Update Member Role Request
export const UpdateMemberRoleRequestSchema = z.object({
  role: z.enum(["Admin", "Viewer"]),
})

export type UpdateMemberRoleRequest = z.infer<typeof UpdateMemberRoleRequestSchema>

// Update Member Role Response
export const UpdateMemberRoleResponseSchema = z.object({
  member: MemberSchema,
})

export type UpdateMemberRoleResponse = z.infer<typeof UpdateMemberRoleResponseSchema>

// Delete Member Response
export const DeleteMemberResponseSchema = z.object({
  ok: z.boolean(),
})

export type DeleteMemberResponse = z.infer<typeof DeleteMemberResponseSchema>
