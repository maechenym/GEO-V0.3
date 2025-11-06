# Onboarding Step 1: Brand Information 实现总结

## 概述

已完成 `/onboarding/brand` 页面的完整实现，包括品牌信息录入、自动生成 Personas/Competitors、增删改功能，以及完整的表单验证和状态管理。

## 文件结构

```
src/
├── types/
│   └── brand.ts                              # 品牌相关的类型定义和 Zod Schema
├── store/
│   └── brand.store.ts                        # Zustand store（带持久化）
├── app/(app)/onboarding/brand/
│   ├── page.tsx                              # 主页面（集成所有组件）
│   ├── StepIndicator.tsx                     # 步骤指示器组件
│   ├── BrandForm.tsx                         # 品牌信息表单组件
│   ├── PersonasTable.tsx                     # Personas 表格组件
│   ├── CompetitorsTable.tsx                  # Competitors 表格组件
│   ├── PersonaDialog.tsx                     # 添加角色弹窗
│   └── CompetitorDialog.tsx                 # 添加竞争对手弹窗
├── components/
│   ├── ui/
│   │   ├── alert-dialog.tsx                 # AlertDialog 组件
│   │   ├── toast.tsx                        # Toast 组件
│   │   ├── toaster.tsx                      # Toaster 组件
│   │   └── form-message.tsx                 # 表单错误消息组件
│   └── providers.tsx                         # 全局 Providers（已添加 Toaster）
├── hooks/
│   └── use-toast.ts                         # Toast hook
└── mocks/
    └── handlers.ts                          # MSW 处理器（已添加 brand/suggest endpoint）
```

## 核心功能

### 1. 品牌基本信息表单
- ✅ `website`（可选，URL 校验）
- ✅ `brandName`（必填）
- ✅ `productName`（必填）
- ✅ `brandDescription`（可选，多行文本）
- ✅ 上传箭头按钮：点击后调用 `POST /api/onboarding/brand/suggest`
- ✅ Loading 状态显示
- ✅ 成功后填充 Personas/Competitors 表格
- ✅ Toast 提示："Generated from your website"
- ✅ 失败时显示错误并可重试

### 2. Personas 表格
- ✅ 表格列：Name（必填）、Description（可选）、Region（必填）、Actions（删除）
- ✅ 右上角「添加角色」按钮 → 打开 Dialog
- ✅ 删除按钮 → 二次确认（AlertDialog）

### 3. Competitors 表格
- ✅ 表格列：Brand Name（必填）、Product Name（必填）、Actions（删除）
- ✅ 右上角「添加竞争对手」按钮 → 打开 Dialog
- ✅ 删除按钮 → 二次确认（AlertDialog）

### 4. 添加角色 Dialog
- ✅ 字段：name（必填）、region（必填）、description（可选）
- ✅ 按钮：「添加新角色」
- ✅ 成功：生成唯一 id → 插入表格首行 → 关闭并清空表单 → Toast "角色已添加"
- ✅ 可访问性：打开时聚焦第一个输入框，ESC 关闭，焦点返回

### 5. 添加竞争对手 Dialog
- ✅ 字段：brandName（必填）、productName（必填）
- ✅ 按钮：「添加新竞争对手」
- ✅ 成功：生成唯一 id → 插入表格首行 → 关闭并清空表单 → Toast "竞争对手已添加"
- ✅ 可访问性：打开时聚焦第一个输入框，ESC 关闭，焦点返回

### 6. 底部操作区
- ✅ 左侧：「保存草稿」按钮（实时保存到 store）
- ✅ 右侧：「Next →」按钮
  - ✅ 校验 `brandName` 和 `productName` 必填
  - ✅ 通过后写入 store，设置 `completed = true`
  - ✅ 跳转到 `/onboarding/prompt`

### 7. 状态管理
- ✅ Zustand store with persistence
- ✅ `basic`: BrandBasic
- ✅ `personas`: Persona[]
- ✅ `competitors`: Competitor[]
- ✅ `completed`: boolean
- ✅ Actions: `setBasic`, `addPersona`, `removePersona`, `addCompetitor`, `removeCompetitor`, `setCompleted`, `reset`

### 8. API Mock
- ✅ `POST /api/onboarding/brand/suggest`
  - ✅ 请求：`{ website?, brandName?, productName?, brandDescription? }`
  - ✅ 响应：`{ personas: Persona[], competitors: Competitor[] }`
  - ✅ 逻辑：如果 `website` 存在，返回 3-5 个 personas + 4-6 个 competitors；否则返回 1-2 个基础建议
  - ✅ 模拟网络延迟（1秒）

## 页面布局

```
┌─────────────────────────────────────────────────────────┐
│ 左侧：步骤指示器           │ 右侧：主要内容区            │
│                         │                               │
│ Brand → Prompt → Plan   │ H1: Let's build your...      │
│ (Brand 高亮蓝色)        │ Sub: Just add your website...│
│                         │                               │
│                         │ [品牌信息表单]                │
│                         │ - Website + 上传箭头          │
│                         │ - Brand Name (必填)           │
│                         │ - Product Name (必填)         │
│                         │ - Brand Description (可选)    │
│                         │                               │
│                         │ [Personas 表格卡片]           │
│                         │ - 表格 + 「添加角色」按钮      │
│                         │                               │
│                         │ [Competitors 表格卡片]        │
│                         │ - 表格 + 「添加竞争对手」按钮  │
│                         │                               │
│                         │ [底部操作区]                  │
│                         │ 「保存草稿」  「Next →」      │
└─────────────────────────────────────────────────────────┘
```

## UI 设计规范

- **背景**：白色背景（`bg-white`）
- **主色调**：品牌蓝 `#0000D2`
- **卡片样式**：`rounded-2xl`，白色背景，边框，阴影
- **步骤指示器**：当前步骤高亮显示（品牌蓝）

## 技术栈

- **框架**：Next.js 14 App Router
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **UI 组件**：shadcn/ui（Button, Input, Label, Textarea, Dialog, AlertDialog, Toast）
- **表单**：React Hook Form + Zod
- **状态管理**：Zustand (with persistence)
- **HTTP 客户端**：Axios
- **Mock API**：MSW (Mock Service Worker)
- **ID 生成**：nanoid

## 运行说明

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问页面**：
   - 登录后，如果用户没有品牌（`hasBrand: false`），会自动跳转到 `/onboarding/brand`
   - 或直接访问：`http://localhost:3000/onboarding/brand`

3. **Mock API 配置**：
   - 确保 `.env.local` 中有：`NEXT_PUBLIC_USE_MOCK=true`
   - MSW 会自动拦截所有 API 请求

## 自测清单

### 表单功能
- [ ] 输入品牌名称和产品名称（必填字段）
- [ ] 输入网站 URL（可选，需验证格式）
- [ ] 输入品牌描述（可选，多行文本）
- [ ] 点击网站输入框尾部的上传箭头按钮
- [ ] 验证加载状态显示（spinner）
- [ ] 验证自动生成 Personas 和 Competitors（如果有 website，应该生成 3-5 个 personas 和 4-6 个 competitors）
- [ ] 验证 Toast 提示："Generated from your website"
- [ ] 验证失败时显示错误并可重试

### Personas 表格
- [ ] 点击「添加角色」按钮，打开 Dialog
- [ ] 填写角色名称（必填）、地区（必填）、描述（可选）
- [ ] 提交后验证：生成唯一 id，插入表格首行，关闭 Dialog，清空表单，显示 Toast "角色已添加"
- [ ] 点击删除按钮，验证二次确认对话框
- [ ] 确认删除后，验证角色从表格中移除
- [ ] 验证表格空状态显示

### Competitors 表格
- [ ] 点击「添加竞争对手」按钮，打开 Dialog
- [ ] 填写品牌名称（必填）、产品名称（必填）
- [ ] 提交后验证：生成唯一 id，插入表格首行，关闭 Dialog，清空表单，显示 Toast "竞争对手已添加"
- [ ] 点击删除按钮，验证二次确认对话框
- [ ] 确认删除后，验证竞争对手从表格中移除
- [ ] 验证表格空状态显示

### 底部操作
- [ ] 点击「保存草稿」按钮，验证 Toast 提示
- [ ] 未填写必填字段时，验证「Next →」按钮禁用
- [ ] 填写必填字段后，验证「Next →」按钮启用
- [ ] 点击「Next →」，验证数据保存到 store，并跳转到 `/onboarding/prompt`

### 可访问性
- [ ] 打开 Dialog 时，验证第一个输入框自动聚焦
- [ ] 验证 ESC 键可关闭 Dialog
- [ ] 验证关闭 Dialog 后，焦点返回到触发按钮
- [ ] 验证键盘导航（Tab 键）正常工作
- [ ] 验证 ARIA 属性正确设置

### 状态持久化
- [ ] 填写表单数据后刷新页面，验证数据保留
- [ ] 添加 Personas/Competitors 后刷新页面，验证数据保留
- [ ] 验证 localStorage 中有 `onboarding-brand` 存储

### 响应式设计
- [ ] 验证移动端布局（步骤指示器在上方）
- [ ] 验证桌面端布局（步骤指示器在左侧）

## 注意事项

1. **API 路径**：`apiClient` 的 `baseURL` 已包含 `/api`，所以调用时使用 `/onboarding/brand/suggest` 而不是 `/api/onboarding/brand/suggest`

2. **URL 验证**：`website` 字段使用 Zod 的 `url()` 验证，空字符串会被转换为 `undefined`

3. **ID 生成**：使用 `nanoid()` 生成唯一 ID

4. **Toast 提示**：已在 `providers.tsx` 中添加 `Toaster` 组件，全局可用

5. **路由守卫**：`/onboarding/brand` 页面由 `AuthGuard` 保护，未登录用户会被重定向到登录页，已有品牌的用户访问 onboarding 页面会被重定向到 `/overview`

## 下一步

- [ ] 实现 `/onboarding/prompt` 页面
- [ ] 实现 `/onboarding/plan` 页面
- [ ] 完成后更新用户 `hasBrand` 状态

