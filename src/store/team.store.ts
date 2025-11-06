import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Member } from "@/types/team"

/**
 * Team Store
 * 
 * 管理团队成员状态
 */
interface TeamState {
  members: Member[]
  setMembers: (members: Member[]) => void
  addMember: (member: Member) => void
  updateRole: (id: string, role: "Admin" | "Viewer") => void
  removeMember: (id: string) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      members: [],

      setMembers: (members) => set({ members }),

      addMember: (member) =>
        set((state) => ({
          members: [member, ...state.members],
        })),

      updateRole: (id, role) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role, updatedAt: new Date().toISOString() } : m
          ),
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
    }),
    {
      name: "team-store",
      partialize: (state) => ({
        members: state.members,
      }),
    }
  )
)
