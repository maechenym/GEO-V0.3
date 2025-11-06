# Team Members Management - 交付文档

## 1. 文件结构树

```
src/
├── types/
│   ├── team.ts                              # Team 类型定义（Zod + TS）
│   └── auth.ts                              # 扩展 Profile 类型（添加 role 字段）
├── store/
│   └── team.store.ts                        # Zustand store（简化接口）
├── app/(app)/settings/team/
│   └── page.tsx                             # 主页面
├── components/
│   ├── team/
│   │   ├── TeamTable.tsx                    # 成员表格组件
│   │   └── InviteMemberDialog.tsx           # 邀请成员弹窗
│   └── ui/
│       └── tooltip.tsx                       # Tooltip 组件（Radix UI）
├── mocks/
│   └── handlers.ts                          # MSW mock handlers（更新 API 路径）
└── package.json                             # 添加 framer-motion 依赖
```

## 2. 核心代码

### 2.1 类型定义 (`src/types/team.ts`)

```typescript
export const MemberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["Admin", "Viewer"]),
  updatedAt: z.string(),
})

export type Member = z.infer<typeof MemberSchema>

export const TeamListSchema = z.object({
  members: z.array(MemberSchema),
})

// API 请求/响应类型
export const InviteMemberRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Admin", "Viewer"]),
})

export const UpdateMemberRoleRequestSchema = z.object({
  role: z.enum(["Admin", "Viewer"]),
})
```

### 2.2 Store (`src/store/team.store.ts`)

```typescript
interface TeamState {
  members: Member[]
  setMembers(m: Member[]): void
  addMember(m: Member): void
  updateRole(id: string, role: "Admin" | "Viewer"): void
  removeMember(id: string): void
}
```

### 2.3 TeamTable (`src/components/team/TeamTable.tsx`)

**核心特性：**
- 使用 `framer-motion` 实现淡入动效
- 从 `authStore.profile.role` 读取当前用户角色
- 权限控制：仅 Admin 可编辑/删除，Viewer 只读
- DataTable 样式：hover 效果、分隔线
- 时间格式：YYYY-MM-DD HH:mm
- 完整的 a11y 支持（aria-label）

**权限逻辑：**
```typescript
const currentUserRole = profile?.role || "Viewer"
const isAdmin = currentUserRole === "Admin"
const canEdit = isAdmin && !isCurrentUser // 不能编辑自己
```

### 2.4 InviteMemberDialog (`src/components/team/InviteMemberDialog.tsx`)

**核心特性：**
- Email 验证（zod.email）
- Role 选择（Admin / Viewer）
- Tooltip 解释权限差异
- 表单验证和错误提示

### 2.5 主页面 (`src/app/(app)/settings/team/page.tsx`)

**成员上限计算：**
```typescript
function getMemberLimits(planType: string | null): {
  maxAdmins: number
  maxMembers: number
  total: number
} {
  if (planType === "trial" || planType === null) {
    return { maxAdmins: 1, maxMembers: 0, total: 1 }
  }
  if (planType === "pro") {
    return { maxAdmins: 2, maxMembers: 5, total: 7 }
  }
  if (planType === "enterprise") {
    return { maxAdmins: 3, maxMembers: 10, total: 13 }
  }
  // Default to basic (1 admin + 2 members)
  return { maxAdmins: 1, maxMembers: 2, total: 3 }
}
```

**权限控制：**
- Invite 按钮：仅 Admin 可见，达到上限时 disabled + Tooltip
- Role 下拉：仅 Admin 可编辑（排除当前用户）
- 删除按钮：仅 Admin 可见（排除当前用户）

### 2.6 Mock Handlers (`src/mocks/handlers.ts`)

**API 路径：**
- `GET /api/team` → `{ members: Member[] }`
- `POST /api/team/invite` body: `{ email, role }` → `{ member: Member }`
- `PATCH /api/team/:id` body: `{ role }` → `{ member: Member }`
- `DELETE /api/team/:id` → `{ ok: true }`

**虚拟数据生成：**
- 首次加载时生成 3-5 个虚拟成员
- `updatedAt` 为最近 7 天内随机时间
- 自动将当前登录用户添加为 Admin

## 3. 自测清单

### ✅ 页面加载
- [x] 展示成员表格（真实邮箱 + 角色）
- [x] 显示 3-5 个虚拟成员（首次加载）
- [x] 当前用户自动标记为 "(You)"
- [x] 时间格式：YYYY-MM-DD HH:mm

### ✅ 邀请成员
- [x] 点击 "Invite Member" → 弹窗打开
- [x] 填写邮箱 + 角色 → 表单验证
- [x] 邀请成功后刷新表格
- [x] Toast 提示："Invitation sent"
- [x] 弹窗关闭后清空输入内容

### ✅ 修改角色
- [x] Admin 用户可看到 Role 下拉
- [x] 修改角色 → PATCH 成功 → 表格实时更新
- [x] Viewer 用户看到只读 Badge
- [x] 不能修改自己的角色

### ✅ 删除成员
- [x] Admin 用户看到删除按钮（垃圾桶图标）
- [x] 点击删除 → AlertDialog 确认
- [x] 确认后 → DELETE 成功 → 表格刷新
- [x] Viewer 用户不显示删除按钮

### ✅ 成员上限
- [x] 根据 planType 计算上限：
  - free/trial: 1 admin
  - basic: 1 admin + 2 members (total: 3)
  - pro: 2 admins + 5 members (total: 7)
  - enterprise: 3 admins + 10 members (total: 13)
- [x] 达到上限 → Invite 按钮 disabled
- [x] Tooltip 提示："Upgrade plan to add more members."
- [x] 显示当前成员数 / 总限制

### ✅ 权限控制
- [x] Viewer 用户：
  - 不显示 Invite 按钮
  - 不显示 Role 下拉（只读 Badge）
  - 不显示删除按钮
- [x] Admin 用户：
  - 可邀请成员
  - 可修改角色（除自己）
  - 可删除成员（除自己）

### ✅ 可访问性 (a11y)
- [x] 表格 header / cell 有 aria-label
- [x] 弹窗可键盘导航（Tab、Enter、Escape）
- [x] 焦点恢复正确
- [x] 读屏软件可正确识别所有交互元素

### ✅ 响应式布局
- [x] 移动端单列显示
- [x] 表格横向滚动
- [x] 按钮和输入框适配小屏幕

### ✅ 动画效果
- [x] 页面进场：framer-motion 淡入（opacity + y）
- [x] 表格行：淡入 + 延迟（stagger）
- [x] 过渡流畅自然

## 4. 技术栈

- **状态管理**: Zustand (with persist)
- **类型验证**: Zod
- **表单管理**: React Hook Form
- **动画**: Framer Motion
- **UI 组件**: shadcn/ui (Radix UI)
- **API Mock**: MSW (Mock Service Worker)

## 5. 注意事项

1. **Profile 类型扩展**: `src/types/auth.ts` 中的 `ProfileSchema` 已添加可选的 `role` 字段
2. **Mock 数据**: 首次加载时自动生成 3-5 个虚拟成员，后续调用会保留这些数据
3. **权限默认值**: 如果 `profile.role` 未定义，默认使用 "Viewer"
4. **成员上限**: 根据 planType 动态计算，支持不同计划的限制规则

## 6. 测试建议

1. **测试不同角色**: 可通过修改 mock handlers 中的 `profile.role` 来测试 Viewer 用户
2. **测试上限**: 修改 `planType` 来测试不同计划的成员上限
3. **测试虚拟数据**: 清除浏览器存储后重新加载，验证虚拟成员生成
4. **测试键盘导航**: 使用 Tab 键导航所有交互元素
5. **测试响应式**: 调整浏览器窗口大小，验证移动端布局

