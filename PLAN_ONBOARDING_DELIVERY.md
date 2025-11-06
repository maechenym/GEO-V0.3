# Plan 页面集成 Stripe - 交付文档

## 1. 文件结构树

```
src/
├── app/(app)/onboarding/plan/
│   ├── page.tsx                    # 主页面
│   ├── PlanCard.tsx               # 左侧试用清单组件
│   └── PaymentForm.tsx            # 右侧支付表单组件（集成 Stripe Elements）
├── app/api/
│   ├── stripe/
│   │   └── create-setup-intent/
│   │       └── route.ts           # 创建 SetupIntent API (真实模式)
│   └── plan/
│       └── activate/
│           └── route.ts           # 激活计划 API (真实模式)
├── store/
│   └── plan.store.ts              # Plan Store (Zustand + persist)
└── mocks/
    └── handlers.ts                # MSW handlers (Mock 模式，含 Stripe/Plan endpoints)
```

## 2. 关键实现

### 2.1 Plan Store (`src/store/plan.store.ts`)

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PlanType = "trial" | "pro" | "enterprise" | null

interface PlanState {
  planType: PlanType
  trialEndsAt: string | null
  setPlan: (payload: { planType: PlanType; trialEndsAt: string | null }) => void
  reset: () => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      planType: null,
      trialEndsAt: null,
      setPlan: (payload) => set(payload),
      reset: () => set({ planType: null, trialEndsAt: null }),
    }),
    { name: "plan-store" }
  )
)
```

### 2.2 主页面 (`src/app/(app)/onboarding/plan/page.tsx`)

**核心功能：**
- 左侧步骤指示器，高亮 Step 3 (Plan)
- 顶部标题：`开始您的 7 天免费试用`
- 显示试用结束日期（自动计算：今天 +7 天）
- 左侧 PlanCard：显示试用清单
- 右侧 PaymentForm：Stripe 支付表单
- 页脚合规文案：`Data secured by GEO · Powered by Stripe`

### 2.3 PaymentForm 组件 (`src/app/(app)/onboarding/plan/PaymentForm.tsx`)

**核心功能：**
- 支持 Mock 和真实两种模式
- Mock 模式：跳过 Stripe Elements，直接使用假 payment_method_id
- 真实模式：使用 Stripe Elements 收集支付信息
- 表单验证：持卡人姓名为必填
- 提交流程：
  1. 调用 `POST /api/stripe/create-setup-intent` 获取 client_secret
  2. Mock 模式：直接使用 `pm_mock_123`
  3. 真实模式：调用 `stripe.confirmSetup()` 确认支付方式
  4. 调用 `POST /api/plan/activate` 激活试用
  5. 写入 plan store
  6. 触发 `onSuccess` 回调（跳转到 `/onboarding/ai-analysis`）

### 2.4 API Route Handlers

#### 2.4.1 `/api/stripe/create-setup-intent/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 检查 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    return NextResponse.json({ error: "Mock mode enabled" }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  })

  const setupIntent = await stripe.setupIntents.create({
    usage: "off_session",
  })

  return NextResponse.json({
    client_secret: setupIntent.client_secret,
  })
}
```

#### 2.4.2 `/api/plan/activate/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 检查 Mock 模式
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    return NextResponse.json({ error: "Mock mode enabled" }, { status: 400 })
  }

  const body = await request.json()
  const { payment_method_id } = body

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  })

  // 创建 Customer、附加支付方式、创建订阅（带 7 天试用）
  // ...

  return NextResponse.json({
    trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    plan: "trial",
  })
}
```

### 2.5 MSW Handlers (Mock 模式)

#### 2.5.1 `POST /api/stripe/create-setup-intent`

```typescript
http.post("*/api/stripe/create-setup-intent", async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return HttpResponse.json({
    client_secret: "seti_mock_secret_test_123456789",
  })
})
```

#### 2.5.2 `POST /api/plan/activate`

```typescript
http.post("*/api/plan/activate", async ({ request }) => {
  const body = await request.json()
  const { payment_method_id } = body

  if (!payment_method_id) {
    return HttpResponse.json({ error: "payment_method_id is required" }, { status: 400 })
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 7)

  return HttpResponse.json({
    trialEndsAt: trialEndsAt.toISOString(),
    plan: "trial",
  })
})
```

## 3. 环境变量配置

### 3.1 `.env.local` (Mock 模式 - 默认)

```bash
# Mock 模式（默认）
NEXT_PUBLIC_USE_MOCK=true

# Stripe 密钥（Mock 模式下可选）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

### 3.2 `.env.local` (真实模式)

```bash
# 关闭 Mock 模式
NEXT_PUBLIC_USE_MOCK=false

# Stripe 发布密钥（必需）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe 密钥（服务端，必需）
STRIPE_SECRET_KEY=sk_test_...
```

## 4. 运行说明

### 4.1 Mock 模式（默认）

1. **确保 `.env.local` 包含：**
   ```bash
   NEXT_PUBLIC_USE_MOCK=true
   ```

2. **启动开发服务器：**
   ```bash
   npm run dev
   ```

3. **访问页面：**
   - 直接访问：`http://localhost:3000/onboarding/plan`
   - 或完成前面的 onboarding 步骤后自动跳转

4. **测试流程：**
   - 填写持卡人姓名（必填）
   - 支付表单显示 "Mock 模式：支付表单已禁用，可直接提交测试"
   - 点击 "Start Free Trial"
   - 自动写入 plan store（trialEndsAt, plan: 'trial'）
   - 跳转到 `/onboarding/ai-analysis`

### 4.2 真实模式

1. **获取 Stripe 密钥：**
   - 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
   - 获取 Test Mode 的 Publishable Key 和 Secret Key

2. **更新 `.env.local`：**
   ```bash
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **重启开发服务器：**
   ```bash
   npm run dev
   ```

4. **测试流程：**
   - 填写持卡人姓名
   - 填写 Stripe 测试卡信息：
     - 卡号：`4242 4242 4242 4242`
     - 过期日期：任意未来日期
     - CVC：任意 3 位数字
   - 点击 "Start Free Trial"
   - Stripe 确认支付方式
   - 激活试用并写入 store
   - 跳转到 `/onboarding/ai-analysis`

## 5. 自测清单

### ✅ 页面布局

- [ ] **左侧步骤指示器**
  - 显示：`Brand → Prompt → Plan → AI-Analysis`
  - `Plan` 步骤高亮显示（品牌蓝 `#0000D2`）
  - 前两个步骤显示完成标记（✓）

- [ ] **顶部标题**
  - H1: "开始您的 7 天免费试用"
  - Sub：显示 "试用期至 YYYY-MM-DD"（正确计算 7 天后）

### ✅ 试用清单（PlanCard）

- [ ] **清单项显示**
  - 7 天全功能免费试用
  - 1 个产品
  - 5 个竞品监测
  - 50 个 AI 提示词额度
  - 邀请奖励说明

### ✅ 支付表单（PaymentForm）

- [ ] **表单字段**
  - 持卡人姓名输入框（必填，有校验）
  - Mock 模式：显示 "Mock 模式：支付表单已禁用"
  - 真实模式：显示 Stripe Payment Element

- [ ] **表单验证**
  - 持卡人姓名为空时显示错误提示
  - 提交按钮在验证失败时禁用

### ✅ Mock 模式测试

- [ ] **完整流程**
  - 填写持卡人姓名
  - 点击 "Start Free Trial"
  - 成功调用 `/api/stripe/create-setup-intent`（Mock）
  - 跳过 Stripe confirmSetup，直接使用 `pm_mock_123`
  - 成功调用 `/api/plan/activate`（Mock）
  - 写入 plan store：`{ planType: 'trial', trialEndsAt: ISO(7d later) }`
  - 显示成功 Toast
  - 跳转到 `/onboarding/ai-analysis`

### ✅ 真实模式测试（需配置 Stripe 密钥）

- [ ] **完整流程**
  - 填写持卡人姓名
  - 填写 Stripe 测试卡信息（4242...）
  - 点击 "Start Free Trial"
  - 成功调用 `/api/stripe/create-setup-intent`（真实）
  - Stripe confirmSetup 成功
  - 成功调用 `/api/plan/activate`（真实）
  - 写入 plan store
  - 跳转到 `/onboarding/ai-analysis`

### ✅ 错误处理

- [ ] **初始化失败**
  - 无法获取 client_secret 时显示错误信息

- [ ] **提交失败**
  - 显示错误 Toast
  - 表单保持可编辑状态

### ✅ 可访问性

- [ ] **表单标签**
  - 所有输入框都有 `<label>` 和 `htmlFor` 属性
  - 错误信息有 `aria-describedby` 关联

- [ ] **键盘导航**
  - Enter 键可提交表单
  - Tab 键可正常导航

- [ ] **屏幕阅读器**
  - 错误 Toast 可被读屏软件识别

### ✅ Store 持久化

- [ ] **持久化验证**
  - 刷新页面后，plan store 数据仍然存在
  - localStorage 中存在 `plan-store` 键

## 6. 注意事项

1. **Mock 模式限制：**
   - Mock 模式下，Stripe Elements 不会渲染，直接跳过支付确认
   - 使用假的 `payment_method_id: "pm_mock_123"`

2. **真实模式要求：**
   - 必须配置 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 和 `STRIPE_SECRET_KEY`
   - 必须设置 `NEXT_PUBLIC_USE_MOCK=false`

3. **API 路由保护：**
   - 真实模式的 API routes 会检查 Mock 模式标志
   - Mock 模式下调用真实 API 会返回错误

4. **Stripe 版本：**
   - 当前使用 Stripe API 版本 `2024-12-18.acacia`
   - 需要根据 Stripe 最新版本更新

5. **用户认证：**
   - 当前 API routes 中 Customer 创建逻辑简化
   - 实际项目中应该从认证中间件获取用户 ID

## 7. 依赖

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^latest",
    "react-stripe-js": "^latest",
    "stripe": "^latest"
  }
}
```

已在 `package.json` 中安装。

## 8. 技术要点

1. **条件渲染：**
   - Mock 模式下不渲染 Stripe Elements
   - 使用环境变量判断模式

2. **Hooks 条件使用：**
   - `useStripe()` 和 `useElements()` 仅在真实模式下调用
   - 使用条件检查避免在 Mock 模式下报错

3. **错误边界：**
   - 所有 API 调用都有错误处理
   - 显示用户友好的错误提示

4. **状态管理：**
   - 使用 Zustand + persist 持久化 plan 状态
   - 支持页面刷新后数据保留

5. **可访问性：**
   - 完整的 ARIA 属性
   - 键盘导航支持
   - 屏幕阅读器友好

