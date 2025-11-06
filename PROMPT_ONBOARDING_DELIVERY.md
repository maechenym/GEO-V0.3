# Onboarding Step 2: Prompt - 交付文档

## 1. 文件结构树

```
src/
├── types/
│   └── prompt.ts                              # Prompt 类型定义（Zod + TS）
├── store/
│   └── prompt.store.ts                        # Prompt Zustand store（带持久化）
├── app/(app)/onboarding/prompt/
│   ├── page.tsx                               # 主页面
│   ├── PromptsToolbar.tsx                     # 顶部工具栏组件
│   ├── PromptsTable.tsx                       # 提示词表格组件
│   └── PromptDialog.tsx                       # 新增/编辑弹窗组件
└── mocks/
    └── handlers.ts                            # MSW 处理器（含所有 prompt endpoints）
```

## 2. 关键文件完整代码

### 2.1 类型定义 (`src/types/prompt.ts`)

```typescript
import { z } from "zod"

/**
 * Prompt Schema
 */
export const PromptSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "提示词内容为必填"),
  country: z.string().min(1, "提示词国家为必选"), // 值为国家码或名称
})

export type PromptItem = z.infer<typeof PromptSchema>

/**
 * Prompt Suggest API 请求
 */
export const PromptSuggestRequestSchema = z.object({
  website: z.string().optional(),
  brandName: z.string().optional(),
  productName: z.string().optional(),
  brandDescription: z.string().optional(),
})

export type PromptSuggestRequest = z.infer<typeof PromptSuggestRequestSchema>

/**
 * Prompt Suggest API 响应
 */
export const PromptSuggestResponseSchema = z.object({
  prompts: z.array(PromptSchema),
})

export type PromptSuggestResponse = z.infer<typeof PromptSuggestResponseSchema>

/**
 * Create Prompt API 请求
 */
export const CreatePromptRequestSchema = PromptSchema.omit({ id: true })

export type CreatePromptRequest = z.infer<typeof CreatePromptRequestSchema>

/**
 * Create Prompt API 响应
 */
export const CreatePromptResponseSchema = z.object({
  prompt: PromptSchema,
})

export type CreatePromptResponse = z.infer<typeof CreatePromptResponseSchema>

/**
 * Update Prompt API 请求
 */
export const UpdatePromptRequestSchema = PromptSchema.partial().omit({ id: true })

export type UpdatePromptRequest = z.infer<typeof UpdatePromptRequestSchema>

/**
 * Update Prompt API 响应
 */
export const UpdatePromptResponseSchema = z.object({
  prompt: PromptSchema,
})

export type UpdatePromptResponse = z.infer<typeof UpdatePromptResponseSchema>

/**
 * Get Prompts API 响应
 */
export const GetPromptsResponseSchema = z.object({
  prompts: z.array(PromptSchema),
})

export type GetPromptsResponse = z.infer<typeof GetPromptsResponseSchema>

/**
 * Delete Prompt API 响应
 */
export const DeletePromptResponseSchema = z.object({
  ok: z.boolean(),
})

export type DeletePromptResponse = z.infer<typeof DeletePromptResponseSchema>
```

### 2.2 Store (`src/store/prompt.store.ts`)

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PromptItem } from "@/types/prompt"

/**
 * Prompt Store
 * 
 * 管理新手引导 Step2 的提示词状态
 */
type PromptState = {
  list: PromptItem[]
  setList: (arr: PromptItem[]) => void
  addPrompt: (p: PromptItem) => void // 新增插入首行
  updatePrompt: (id: string, patch: Partial<PromptItem>) => void
  removePrompt: (id: string) => void
  reset: () => void
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set) => ({
      list: [],

      setList: (arr) => set({ list: arr }),

      addPrompt: (p) => set((s) => ({ list: [p, ...s.list] })),

      updatePrompt: (id, patch) =>
        set((s) => ({
          list: s.list.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      removePrompt: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),

      reset: () => set({ list: [] }),
    }),
    { name: "onboarding-prompts" }
  )
)
```

### 2.3 主页面 (`src/app/(app)/onboarding/prompt/page.tsx`)

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBrandStore } from "@/store/brand.store"
import { usePromptStore } from "@/store/prompt.store"
import { StepIndicator } from "../brand/StepIndicator"
import { PromptsToolbar } from "./PromptsToolbar"
import { PromptsTable } from "./PromptsTable"
import { PromptDialog } from "./PromptDialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import apiClient from "@/services/api"
import type { PromptItem, PromptSuggestRequest } from "@/types/prompt"
import { PromptSuggestResponseSchema } from "@/types/prompt"
import { Loader2 } from "lucide-react"

/**
 * Onboarding Step 2: Prompt
 * 
 * 路径：/onboarding/prompt
 * 目的：展示根据 Step1 生成的提示词；支持查看、编辑、新增、删除；点击 CTA 进入 /onboarding/plan
 */
export default function PromptOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { basic, completed } = useBrandStore()
  const { list: prompts, setList, addPrompt, updatePrompt, removePrompt } = usePromptStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedPrompts, setHasLoadedPrompts] = useState(false)

  // 检查是否完成了 brand 步骤
  const isBrandIncomplete = !completed || !basic?.brandName || !basic?.productName

  // 页面加载时请求生成 prompts
  useEffect(() => {
    // 如果已有 prompts，跳过自动加载
    if (prompts.length > 0) {
      setHasLoadedPrompts(true)
      return
    }

    // 若 list 为空且品牌 basic 存在 → 调 suggest 并 setList
    if (!basic || (!basic.website && !basic.brandName && !basic.productName)) {
      setHasLoadedPrompts(true)
      return
    }

    // 如果已经加载过，不再重复加载
    if (hasLoadedPrompts) return

    setIsLoading(true)
    const requestData: PromptSuggestRequest = {
      website: basic.website,
      brandName: basic.brandName,
      productName: basic.productName,
      brandDescription: basic.brandDescription,
    }

    apiClient
      .post("/onboarding/prompt/suggest", requestData)
      .then((response) => {
        const result = PromptSuggestResponseSchema.parse(response.data)
        if (result.prompts && result.prompts.length > 0) {
          // 只在本地列表为空时才设置
          if (prompts.length === 0) {
            setList(result.prompts)
          }
        }
        setHasLoadedPrompts(true)
      })
      .catch((error) => {
        console.error("Failed to load prompts:", error)
        toast({
          title: "加载失败",
          description: "无法自动生成提示词，您可以手动添加",
          variant: "destructive",
        })
        // 失败不影响继续使用页面
        setHasLoadedPrompts(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [basic, prompts.length, hasLoadedPrompts, setList, toast])

  // 添加提示词
  const handleAdd = () => {
    setEditingPrompt(null)
    setDialogOpen(true)
  }

  // 编辑提示词
  const handleEdit = (prompt: PromptItem) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  // 保存提示词（新增或更新）
  const handleConfirm = async (prompt: PromptItem) => {
    if (editingPrompt) {
      // 更新现有提示词（先调 API 再更新 store）
      try {
        await apiClient.patch(`/prompts/${editingPrompt.id}`, {
          text: prompt.text,
          country: prompt.country,
        })
        updatePrompt(editingPrompt.id, prompt)
        toast({
          title: "Prompt updated",
          description: "提示词已更新",
        })
      } catch (error) {
        // API 失败时仍更新本地 store
        updatePrompt(editingPrompt.id, prompt)
        toast({
          title: "提示词已更新（本地）",
          description: "网络请求失败，已保存到本地",
          variant: "default",
        })
      }
    } else {
      // 添加新提示词（先调 API 再更新 store）
      try {
        await apiClient.post("/prompts", {
          text: prompt.text,
          country: prompt.country,
        })
        // API 返回的 prompt 可能有不同的 id，使用本地生成的 id
        addPrompt(prompt)
        toast({
          title: "Prompt added",
          description: "提示词已添加",
        })
      } catch (error) {
        // API 失败时仍添加到本地 store
        addPrompt(prompt)
        toast({
          title: "提示词已添加（本地）",
          description: "网络请求失败，已保存到本地",
          variant: "default",
        })
      }
    }
    setDialogOpen(false)
    setEditingPrompt(null)
  }

  // 删除提示词
  const handleRemove = async (id: string) => {
    try {
      await apiClient.delete(`/prompts/${id}`)
      removePrompt(id)
      toast({
        title: "Prompt removed",
        description: "提示词已删除",
      })
    } catch (error) {
      // API 失败时仍删除本地 store
      removePrompt(id)
      toast({
        title: "提示词已删除（本地）",
        description: "网络请求失败，已从本地删除",
        variant: "default",
      })
    }
  }

  // 跳转到下一步
  const handleNext = () => {
    router.push("/onboarding/plan")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {isBrandIncomplete && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>请先完成品牌信息录入</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>您需要先完成品牌信息录入才能继续下一步。</span>
              <Button asChild variant="outline" size="sm" className="ml-4">
                <Link href="/onboarding/brand">前往品牌信息页</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左侧：步骤指示器 */}
          <div className="lg:col-span-3">
            <StepIndicator currentStep={2} />
          </div>

          {/* 右侧：主要内容区 */}
          <div className="lg:col-span-9 space-y-8">
            {/* 顶部工具栏 */}
            <PromptsToolbar onAdd={handleAdd} />

            {/* 提示词表格 */}
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">加载提示词中...</span>
              </div>
            ) : (
              <PromptsTable prompts={prompts} onEdit={handleEdit} onRemove={handleRemove} />
            )}

            {/* 底部操作区 */}
            <div className="flex items-center justify-end pt-6 border-t border-border">
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#0000D2] hover:bg-[#0000D2]/90 text-white px-8"
              >
                Win your edge in AI search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 添加/编辑提示词弹窗 */}
      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editingPrompt}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
```

### 2.4 Mock Handlers (`src/mocks/handlers.ts` - 相关部分)

```typescript
// POST /api/onboarding/prompt/suggest
http.post("*/api/onboarding/prompt/suggest", async ({ request }) => {
  const body = await request.json() as {
    website?: string
    brandName?: string
    productName?: string
    brandDescription?: string
  }

  // 使用 Zod 校验请求体
  const { PromptSuggestRequestSchema } = await import("@/types/prompt")
  const validated = PromptSuggestRequestSchema.safeParse(body)

  if (!validated.success) {
    return HttpResponse.json(
      {
        error: "Invalid request body",
        details: validated.error.errors,
      },
      { status: 400 }
    )
  }

  // 模拟生成 Prompts
  // 根据是否有 website/brandName/productName/brandDescription，生成不同数量和类型的 prompts
  const hasInfo = validated.data.website || validated.data.brandName || validated.data.productName
  // 返回 6-10 条
  const promptCount = hasInfo ? Math.floor(Math.random() * 5) + 6 : Math.floor(Math.random() * 4) + 6

  // 国家列表（国家码）
  const countries = ["US", "UK", "DE", "FR", "JP", "CN", "TW", "HK", "SG", "AU", "IN"]

  // 根据 brandName/productName 生成多样化样例（品牌/品类/用途/对比/渠道等）
  const brandName = validated.data.brandName || "Brand"
  const productName = validated.data.productName || "Product"
  const promptTemplates = hasInfo
    ? [
        // 品牌类
        `Find ${productName} from ${brandName}`,
        `Why choose ${brandName} ${productName}?`,
        `${brandName} ${productName} reviews and ratings`,
        // 品类类
        `Best ${productName} alternatives and competitors`,
        `Compare ${productName} options in the market`,
        `Top-rated ${productName} solutions`,
        // 用途类
        `How to use ${productName} effectively for your business`,
        `${productName} use cases and applications`,
        `Best practices for ${productName} implementation`,
        // 对比类
        `${brandName} vs competitors: Which is better?`,
        `${productName} comparison: Features and pricing`,
        // 渠道类
        `Where to buy ${productName} from ${brandName}`,
        `${brandName} ${productName} pricing and plans`,
        `${productName} support and documentation`,
      ]
    : [
        "Find the best solutions for your needs",
        "Compare products and services",
        "Top-rated options available",
        "Expert reviews and recommendations",
        "Best practices and guides",
        "Product comparison and alternatives",
      ]

  const prompts = Array.from({ length: promptCount }, (_, i) => ({
    id: `prompt_${Date.now()}_${i}`,
    text: promptTemplates[i % promptTemplates.length],
    country: countries[i % countries.length],
  }))

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return HttpResponse.json({
    prompts,
  })
}),

// GET /api/prompts
http.get("*/api/prompts", async () => {
  return HttpResponse.json({
    prompts: [],
  })
}),

// POST /api/prompts
http.post("*/api/prompts", async ({ request }) => {
  const body = await request.json()
  const { CreatePromptRequestSchema, PromptSchema } = await import("@/types/prompt")
  const validated = CreatePromptRequestSchema.safeParse(body)

  if (!validated.success) {
    return HttpResponse.json(
      {
        error: "Invalid request body",
        details: validated.error.errors,
      },
      { status: 400 }
    )
  }

  const prompt = {
    id: `prompt_${Date.now()}`,
    ...validated.data,
  }

  const result = PromptSchema.parse(prompt)

  return HttpResponse.json({
    prompt: result,
  })
}),

// PATCH /api/prompts/:id
http.patch("*/api/prompts/:id", async ({ request, params }) => {
  const body = await request.json()
  const { id } = params as { id: string }
  const { UpdatePromptRequestSchema, PromptSchema } = await import("@/types/prompt")
  const validated = UpdatePromptRequestSchema.safeParse(body)

  if (!validated.success) {
    return HttpResponse.json(
      {
        error: "Invalid request body",
        details: validated.error.errors,
      },
      { status: 400 }
    )
  }

  const prompt = {
    id,
    text: validated.data.text || "Updated prompt text",
    country: validated.data.country || "US",
  }

  const result = PromptSchema.parse(prompt)

  return HttpResponse.json({
    prompt: result,
  })
}),

// DELETE /api/prompts/:id
http.delete("*/api/prompts/:id", async () => {
  return HttpResponse.json({
    ok: true,
  })
}),
```

## 3. 自测清单

### ✅ 基础布局与文案

- [ ] **左侧 Prompt 高亮**
  - 左侧步骤指示器显示：`Brand → Prompt → Plan`
  - `Prompt` 步骤高亮显示（品牌蓝 `#0000D2`）
  - `Brand` 步骤显示完成标记（✓）

- [ ] **顶部文案正确**
  - 主标题：`Suggested prompts for your brand`
  - 副标题：`You can edit them now or manage them later inside the product.`

### ✅ 首次进入自动加载

- [ ] **存在品牌信息时自动拉取建议并填充表格**
  - 完成 Step1 后进入 `/onboarding/prompt`
  - 验证：自动调用 `POST /api/onboarding/prompt/suggest`
  - 验证：显示加载状态（spinner）
  - 验证：成功后表格自动填充 6-10 条提示词
  - 验证：提示词内容包含品牌/品类/用途/对比/渠道等多样化样例

- [ ] **失败可手动添加**
  - 关闭 Mock 或模拟网络错误
  - 验证：显示错误 Toast："无法自动生成提示词，您可以手动添加"
  - 验证：仍可手动添加提示词

### ✅ 新增功能

- [ ] **新增提示词**
  - 点击 "Add Prompt" 按钮，打开 Dialog
  - 填写提示词文本（必填）：例如 "Find best solutions"
  - 选择国家（必填）：从下拉列表选择
  - 点击「添加新提示词」
  - 验证：text/country 必填校验生效（留空时显示错误）
  - 验证：提交成功插入表格首行
  - 验证：Toast 提示 "Prompt added"
  - 验证：Dialog 关闭并清空表单

### ✅ 编辑功能

- [ ] **编辑提示词**
  - 点击表格中的 Edit 按钮
  - 验证：Dialog 打开并回填当前提示词数据
  - 修改 text：例如改为 "Updated prompt text"
  - 修改 country：例如改为其他国家
  - 点击「保存」
  - 验证：text 或 country 修改成功保存并刷新当前行
  - 验证：Toast 提示 "Prompt updated"
  - 验证：Dialog 关闭

### ✅ 删除功能

- [ ] **删除提示词**
  - 点击表格中的 Delete 按钮
  - 验证：显示二次确认对话框
  - 点击确认删除
  - 验证：该行从表格中移除
  - 验证：Toast 提示 "Prompt removed"

### ✅ 数据持久化

- [ ] **刷新后数据仍在**
  - 添加/编辑几个提示词
  - 刷新页面（F5）
  - 验证：所有提示词数据保留
  - 验证：localStorage 中有 `onboarding-prompts` 存储

### ✅ 导航功能

- [ ] **点击 CTA 跳转到下一步**
  - 点击底部按钮："Win your edge in AI search"
  - 验证：跳转到 `/onboarding/plan` 页面

### ✅ API 集成

- [ ] **新增/编辑/删除调用对应 API**
  - 新增：调用 `POST /api/prompts`
  - 编辑：调用 `PATCH /api/prompts/:id`
  - 删除：调用 `DELETE /api/prompts/:id`
  - 验证：API 失败时仍能正常使用（降级到本地 store）

### ✅ 可访问性

- [ ] **Dialog 可访问性**
  - 打开 Dialog 时，验证第一个输入框（Textarea）自动聚焦
  - 验证 ESC 键可关闭 Dialog
  - 验证关闭 Dialog 后，焦点返回到触发按钮

- [ ] **表单控件可访问性**
  - 验证所有表单控件有正确的 `label` 和 `aria-describedby`
  - 验证错误消息正确关联到对应字段

- [ ] **按钮状态**
  - 验证加载时按钮有 disabled 状态
  - 验证提交时按钮显示 loading 状态

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

1. **完成 Step1 后自动跳转**：完成品牌信息录入后，点击 "Next →" 会自动跳转到 `/onboarding/prompt`
2. **直接访问**：`http://localhost:3000/onboarding/prompt`

### API Endpoints

所有 API endpoints 都有对应的 Mock handlers：

- `POST /api/onboarding/prompt/suggest` - 根据品牌信息生成提示词建议
- `GET /api/prompts` - 获取所有提示词
- `POST /api/prompts` - 创建新提示词
- `PATCH /api/prompts/:id` - 更新提示词
- `DELETE /api/prompts/:id` - 删除提示词

## 5. 技术要点

1. **数据持久化**：使用 Zustand `persist` middleware，数据存储在 `localStorage` 的 `onboarding-prompts` key 下
2. **API 降级**：API 失败时自动降级到本地 store，确保用户体验不受影响
3. **新增项位置**：`addPrompt` 使用展开运算符将新项插入数组首部：`[newItem, ...existingItems]`
4. **API 校验**：所有 Mock handlers 使用 Zod 校验请求体，确保数据格式正确
5. **多样化提示词**：根据品牌信息生成多样化的提示词模板（品牌/品类/用途/对比/渠道等）

## 6. 注意事项

1. **国家字段**：`country` 字段支持国家码（如 "US"）或名称（如 "United States"），表格会自动显示友好名称
2. **ID 生成**：使用 `nanoid()` 生成唯一 ID，避免冲突
3. **Toast 提示**：已在 `providers.tsx` 中添加 `Toaster` 组件，全局可用
4. **API 路径**：`apiClient` 的 `baseURL` 已包含 `/api`，所以调用时使用 `/prompts` 而不是 `/api/prompts`
5. **类型安全**：所有类型定义使用 Zod Schema，确保运行时类型安全

