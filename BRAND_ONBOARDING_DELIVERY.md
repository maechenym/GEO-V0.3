# Onboarding Step 1: Brand Information - 交付文档

## 1. 文件结构树

```
src/
├── types/
│   └── brand.ts                              # 品牌类型定义（Zod + TS）
├── store/
│   └── brand.store.ts                        # Zustand store（带持久化）
├── app/(app)/onboarding/brand/
│   ├── page.tsx                              # 主页面
│   ├── StepIndicator.tsx                     # 步骤指示器组件
│   ├── BrandForm.tsx                        # 品牌信息表单组件
│   ├── PersonasTable.tsx                     # Personas 表格组件
│   ├── CompetitorsTable.tsx                  # Competitors 表格组件
│   ├── PersonaDialog.tsx                     # 添加角色弹窗
│   └── CompetitorDialog.tsx                 # 添加竞争对手弹窗
├── app/(app)/onboarding/prompt/
│   └── page.tsx                              # Prompt 页面（含 Warning Banner）
├── components/
│   └── ui/
│       ├── alert.tsx                         # Alert 组件
│       ├── alert-dialog.tsx                  # AlertDialog 组件
│       ├── toast.tsx                         # Toast 组件
│       ├── toaster.tsx                       # Toaster 组件
│       └── form-message.tsx                 # 表单错误消息组件
├── hooks/
│   └── use-toast.ts                         # Toast hook
└── mocks/
    └── handlers.ts                          # MSW 处理器（含 brand/suggest endpoint）
```

## 2. 关键文件完整代码

### 2.1 类型定义 (`src/types/brand.ts`)

```typescript
import { z } from "zod"

/**
 * 品牌基础信息 Schema
 */
export const BrandBasicSchema = z.object({
  website: z
    .union([z.string().url(), z.literal(""), z.undefined()])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  brandName: z.string().min(1, "品牌名称为必填"),
  productName: z.string().min(1, "产品名称为必填"),
  brandDescription: z.string().optional(),
})

export type BrandBasic = z.infer<typeof BrandBasicSchema>

/**
 * Persona Schema
 */
export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "角色名称为必填"),
  region: z.string().min(1, "角色地区为必填"),
  description: z.string().optional(),
})

export type Persona = z.infer<typeof PersonaSchema>

/**
 * Competitor Schema
 */
export const CompetitorSchema = z.object({
  id: z.string(),
  brandName: z.string().min(1, "竞争对手品牌名称为必填"),
  productName: z.string().min(1, "竞争对手产品名称为必填"),
})

export type Competitor = z.infer<typeof CompetitorSchema>

/**
 * Brand Suggest API 响应
 */
export const BrandSuggestResponseSchema = z.object({
  personas: z.array(PersonaSchema),
  competitors: z.array(CompetitorSchema),
})

export type BrandSuggestResponse = z.infer<typeof BrandSuggestResponseSchema>
```

### 2.2 Store (`src/store/brand.store.ts`)

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BrandBasic, Persona, Competitor } from "@/types/brand"

/**
 * Brand Store
 * 
 * 管理新手引导 Step1 的品牌信息状态
 */
interface BrandState {
  basic: BrandBasic | null
  personas: Persona[]
  competitors: Competitor[]
  completed: boolean
  setBasic: (v: BrandBasic) => void
  addPersona: (p: Persona) => void
  removePersona: (id: string) => void
  addCompetitor: (c: Competitor) => void
  removeCompetitor: (id: string) => void
  setCompleted: (v: boolean) => void
  reset: () => void
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      basic: null,
      personas: [],
      competitors: [],
      completed: false,

      setBasic: (v) => set({ basic: v }),

      // 新增插入到表格首行
      addPersona: (p) => set((s) => ({ personas: [p, ...s.personas] })),

      removePersona: (id) =>
        set((s) => ({ personas: s.personas.filter((x) => x.id !== id) })),

      // 新增插入到表格首行
      addCompetitor: (c) => set((s) => ({ competitors: [c, ...s.competitors] })),

      removeCompetitor: (id) =>
        set((s) => ({ competitors: s.competitors.filter((x) => x.id !== id) })),

      setCompleted: (v) => set({ completed: v }),

      reset: () => set({ basic: null, personas: [], competitors: [], completed: false }),
    }),
    { name: "onboarding-brand" }
  )
)
```

### 2.3 主页面 (`src/app/(app)/onboarding/brand/page.tsx`)

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { BrandBasic, Persona, Competitor } from "@/types/brand"
import { useBrandStore } from "@/store/brand.store"
import { StepIndicator } from "./StepIndicator"
import { BrandForm } from "./BrandForm"
import { PersonasTable } from "./PersonasTable"
import { CompetitorsTable } from "./CompetitorsTable"
import { PersonaDialog } from "./PersonaDialog"
import { CompetitorDialog } from "./CompetitorDialog"
import { Button } from "@/components/ui/button"
import { ArrowRight, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"

/**
 * 新手引导 Step1 - 品牌信息录入页
 */
export default function BrandOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    basic,
    personas,
    competitors,
    setBasic,
    addPersona,
    removePersona,
    addCompetitor,
    removeCompetitor,
    setCompleted,
  } = useBrandStore()

  const [personaDialogOpen, setPersonaDialogOpen] = useState(false)
  const [competitorDialogOpen, setCompetitorDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 处理表单值变化
  const handleFormChange = (values: BrandBasic) => {
    setBasic(values)
  }

  // 处理自动生成建议
  const handleSuggest = (generatedPersonas: Persona[], generatedCompetitors: Competitor[]) => {
    generatedPersonas.forEach((p) => {
      const exists = personas.some((existing) => existing.name === p.name && existing.region === p.region)
      if (!exists) {
        addPersona({ ...p, id: nanoid() })
      }
    })

    generatedCompetitors.forEach((c) => {
      const exists = competitors.some(
        (existing) => existing.brandName === c.brandName && existing.productName === c.productName
      )
      if (!exists) {
        addCompetitor({ ...c, id: nanoid() })
      }
    })
  }

  // 保存草稿
  const handleSaveDraft = () => {
    toast({
      title: "草稿已保存",
      description: "您的品牌信息已保存为草稿",
    })
  }

  // 提交并跳转到下一步
  const handleNext = () => {
    if (!basic?.brandName || !basic?.productName) {
      toast({
        title: "请填写必填字段",
        description: "品牌名称和产品名称为必填项",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // 标记为已完成
    setCompleted(true)

    // 跳转到下一步
    router.push("/onboarding/prompt")
  }

  // 添加 Persona
  const handleAddPersona = (persona: { id: string; name: string; region: string; description?: string }) => {
    addPersona(persona as Persona)
    setPersonaDialogOpen(false)
    toast({
      title: "角色已添加",
      description: `已成功添加角色：${persona.name}`,
    })
  }

  // 添加 Competitor
  const handleAddCompetitor = (competitor: { id: string; brandName: string; productName: string }) => {
    addCompetitor(competitor as Competitor)
    setCompetitorDialogOpen(false)
    toast({
      title: "竞争对手已添加",
      description: `已成功添加竞争对手：${competitor.brandName}`,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左侧：步骤指示器 */}
          <div className="lg:col-span-3">
            <StepIndicator currentStep={1} />
          </div>

          {/* 右侧：主要内容区 */}
          <div className="lg:col-span-9 space-y-8">
            {/* 头部文案 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3 text-foreground">
                Let's build your brand together!
              </h1>
              <p className="text-lg text-muted-foreground">
                Just add your website and we'll automatically generate competitors, personas, and query
                to help you quickly set up your workspace. You can always edit or expand everything later.
              </p>
            </div>

            {/* 品牌基本信息表单 */}
            <BrandForm
              defaultValues={basic || undefined}
              onValuesChange={handleFormChange}
              onSuggest={handleSuggest}
            />

            {/* Personas 表格 */}
            <PersonasTable
              personas={personas}
              onAdd={() => setPersonaDialogOpen(true)}
              onRemove={removePersona}
            />

            {/* Competitors 表格 */}
            <CompetitorsTable
              competitors={competitors}
              onAdd={() => setCompetitorDialogOpen(true)}
              onRemove={removeCompetitor}
            />

            {/* 底部操作区 */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                保存草稿
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting || !basic?.brandName || !basic?.productName}
                className="bg-[#0000D2] hover:bg-[#0000D2]/90 text-white px-8"
              >
                {isSubmitting ? (
                  "提交中..."
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 添加角色弹窗 */}
      <PersonaDialog
        open={personaDialogOpen}
        onOpenChange={setPersonaDialogOpen}
        onConfirm={handleAddPersona}
      />

      {/* 添加竞争对手弹窗 */}
      <CompetitorDialog
        open={competitorDialogOpen}
        onOpenChange={setCompetitorDialogOpen}
        onConfirm={handleAddCompetitor}
      />
    </div>
  )
}
```

### 2.4 Mock Handler (`src/mocks/handlers.ts` - 相关部分)

```typescript
// POST /api/onboarding/brand/suggest
http.post("*/api/onboarding/brand/suggest", async ({ request }) => {
  const body = await request.json() as {
    website?: string
    brandName?: string
    productName?: string
    brandDescription?: string
  }

  // 使用 Zod 校验请求体
  const { BrandBasicSchema } = await import("@/types/brand")
  const validated = BrandBasicSchema.safeParse(body)

  if (!validated.success) {
    return HttpResponse.json(
      {
        error: "Invalid request body",
        details: validated.error.errors,
      },
      { status: 400 }
    )
  }

  // 模拟生成 Personas 和 Competitors
  // 如果有 website，生成 3-5 个 personas 和 4-6 个 competitors
  // 如果没有 website，生成 1-2 个基础建议

  const hasWebsite = validated.data.website && validated.data.website.trim().length > 0
  const personaCount = hasWebsite ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1
  const competitorCount = hasWebsite ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 2) + 1

  // 模拟 personas
  const personas = Array.from({ length: personaCount }, (_, i) => ({
    id: `p_${Date.now()}_${i}`,
    name: hasWebsite
      ? [
          "Enterprise Decision Maker",
          "Marketing Manager",
          "Product Owner",
          "Sales Director",
          "IT Administrator",
        ][i % 5]
      : ["Target User", "Primary Buyer"][i % 2],
    region: ["North America", "Europe", "Asia Pacific", "Global"][i % 4],
    description: hasWebsite
      ? [
          "Senior executive responsible for strategic decisions",
          "Manages marketing campaigns and brand positioning",
          "Owns product roadmap and feature prioritization",
          "Leads sales team and customer acquisition",
          "Handles technical infrastructure and security",
        ][i % 5]
      : undefined,
  }))

  // 模拟 competitors
  const competitorBrands = hasWebsite
    ? [
        "Competitor Alpha",
        "Competitor Beta",
        "Competitor Gamma",
        "Competitor Delta",
        "Competitor Epsilon",
        "Competitor Zeta",
      ]
    : ["Main Competitor", "Alternative Solution"]
  const competitorProducts = hasWebsite
    ? [
        "Alpha Suite",
        "Beta Platform",
        "Gamma Tool",
        "Delta System",
        "Epsilon Solution",
        "Zeta App",
      ]
    : ["Competitor Product", "Alternative Platform"]

  const competitors = Array.from({ length: competitorCount }, (_, i) => ({
    id: `c_${Date.now()}_${i}`,
    brandName: competitorBrands[i % competitorBrands.length],
    productName: competitorProducts[i % competitorProducts.length],
  }))

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return HttpResponse.json({
    personas,
    competitors,
  })
}),
```

## 3. 自测清单

### ✅ 基础布局与文案

- [ ] **标题/副标题正确显示**
  - 主标题：`Let's build your brand together!`
  - 副标题：`Just add your website and we'll automatically generate competitors, personas, and query to help you quickly set up your workspace. You can always edit or expand everything later.`

- [ ] **左侧步骤指示器**
  - 仅显示：`Brand → Prompt → Plan`
  - `Brand` 高亮显示（品牌蓝 `#0000D2`）
  - 其他步骤为灰色/未激活状态

### ✅ 表单功能

- [ ] **填写 brandName 和 productName（必填字段）**
  - 输入品牌名称：例如 "Test Brand"
  - 输入产品名称：例如 "Test Product"
  - 验证必填字段提示（留空时显示错误）

- [ ] **点击"上传箭头"按钮**
  - 填写 website URL：例如 `https://example.com`
  - 填写 brandName 和 productName（必填）
  - 点击上传箭头按钮
  - 验证 Loading 状态（spinner 显示）
  - 验证自动生成结果：
    - 如果有 website：生成 3-5 个 personas + 4-6 个 competitors
    - 如果没有 website：生成 1-2 个 personas + 1-2 个 competitors
  - 验证 Toast 提示："Generated from your website"
  - 验证表格自动填充数据

### ✅ 添加/删除功能

- [ ] **添加角色（Persona）**
  - 点击「添加角色」按钮，打开 Dialog
  - 填写角色名称（必填）：例如 "Enterprise Buyer"
  - 填写角色地区（必填）：例如 "North America"
  - 填写角色描述（可选）：例如 "Senior executive..."
  - 点击「添加新角色」
  - 验证：生成唯一 ID、插入表格首行、关闭 Dialog、清空表单、Toast "角色已添加"
  - 验证必填字段校验（留空时显示错误）

- [ ] **删除角色**
  - 点击表格中的删除按钮
  - 验证二次确认对话框显示
  - 点击确认删除
  - 验证角色从表格中移除

- [ ] **添加竞争对手（Competitor）**
  - 点击「添加竞争对手」按钮，打开 Dialog
  - 填写品牌名称（必填）：例如 "Competitor X"
  - 填写产品名称（必填）：例如 "Competitor Product Y"
  - 点击「添加新竞争对手」
  - 验证：生成唯一 ID、插入表格首行、关闭 Dialog、清空表单、Toast "竞争对手已添加"
  - 验证必填字段校验（留空时显示错误）

- [ ] **删除竞争对手**
  - 点击表格中的删除按钮
  - 验证二次确认对话框显示
  - 点击确认删除
  - 验证竞争对手从表格中移除

### ✅ 数据持久化

- [ ] **保存草稿后刷新数据仍在**
  - 填写品牌名称、产品名称
  - 添加 2-3 个角色和竞争对手
  - 点击「保存草稿」按钮
  - 刷新页面（F5）
  - 验证：表单数据、角色列表、竞争对手列表均保留

### ✅ 导航功能

- [ ] **点击 Next → 跳转 `/onboarding/prompt`**
  - 填写必填字段（brandName、productName）
  - 点击「Next →」按钮
  - 验证：`setCompleted(true)` 执行
  - 验证：跳转到 `/onboarding/prompt` 页面

- [ ] **未完成 brand 步骤时访问 `/onboarding/prompt`**
  - 直接访问 `/onboarding/prompt`（未完成 brand 步骤）
  - 验证：显示 Warning Banner
  - 验证：Banner 中包含「前往品牌信息页」按钮
  - 点击按钮，验证跳转到 `/onboarding/brand`

### ✅ Mock API 功能

- [ ] **关闭 Mock 时仍可手动编辑表格并获得清晰错误提示**
  - 在 `.env.local` 中设置：`NEXT_PUBLIC_USE_MOCK=false`
  - 重启开发服务器
  - 填写表单，点击上传箭头按钮
  - 验证：显示网络错误（404 或连接失败）
  - 验证：Toast 显示错误提示和重试按钮
  - 验证：仍可手动添加角色和竞争对手（不依赖 API）

### ✅ 数据回填

- [ ] **初次进入页面时回填 store 数据**
  - 填写表单并添加一些角色/竞争对手
  - 保存草稿
  - 刷新页面
  - 验证：表单字段自动填充之前的值
  - 验证：角色和竞争对手表格显示之前的数据

### ✅ 表单校验

- [ ] **必填字段校验**
  - 尝试提交未填写 brandName 的表单
  - 验证：显示错误提示
  - 验证：「Next →」按钮禁用

- [ ] **URL 格式校验**
  - 在 website 字段输入无效 URL：例如 "invalid-url"
  - 验证：显示 URL 格式错误提示

## 4. 运行说明

### 启动开发服务器

```bash
npm run dev
```

### 环境变量配置

确保 `.env.local` 中包含：

```bash
NEXT_PUBLIC_USE_MOCK=true
```

### 访问页面

1. **登录后自动跳转**：如果用户 `hasBrand: false`，会自动跳转到 `/onboarding/brand`
2. **直接访问**：`http://localhost:3000/onboarding/brand`

### 测试 Mock API

- 默认启用 MSW，所有 API 请求会被拦截并返回 mock 数据
- 可在浏览器开发者工具的 Network 面板中查看请求
- 可在 Console 中看到 MSW 初始化日志

## 5. 技术要点

1. **数据持久化**：使用 Zustand `persist` middleware，数据存储在 `localStorage` 的 `onboarding-brand` key 下
2. **表单回填**：使用 `react-hook-form` 的 `reset` 方法，在 `defaultValues` 变化时更新表单
3. **新增项位置**：`addPersona` 和 `addCompetitor` 使用展开运算符将新项插入数组首部：`[newItem, ...existingItems]`
4. **API 校验**：Mock handler 使用 Zod 校验请求体，确保数据格式正确
5. **路由守卫**：`/onboarding/prompt` 页面检查 `completed` 状态，未完成时显示 Warning Banner

## 6. 注意事项

1. **ID 生成**：使用 `nanoid()` 生成唯一 ID，避免冲突
2. **重复检查**：自动生成时会检查是否已存在相同名称的角色/竞争对手，避免重复添加
3. **Toast 提示**：已在 `providers.tsx` 中添加 `Toaster` 组件，全局可用
4. **API 路径**：`apiClient` 的 `baseURL` 已包含 `/api`，所以调用时使用 `/onboarding/brand/suggest` 而不是 `/api/onboarding/brand/suggest`
5. **类型安全**：所有类型定义使用 Zod Schema，确保运行时类型安全

