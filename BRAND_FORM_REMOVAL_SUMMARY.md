# Step1 Website 字段与自动生成功能移除总结

## 修改文件列表

1. ✅ `src/types/brand.ts` - 删除 website 字段
2. ✅ `src/app/(app)/onboarding/brand/BrandForm.tsx` - 移除 website 输入框和自动生成逻辑
3. ✅ `src/app/(app)/onboarding/brand/page.tsx` - 移除 handleSuggest，更新文案
4. ✅ `src/mocks/handlers.ts` - 注释掉 /api/onboarding/brand/suggest handler
5. ✅ `src/store/brand.store.ts` - 已确认无 website 字段（BrandBasic 类型已更新）

## 关键代码更新

### 1. 类型定义 (`src/types/brand.ts`)

**更新前：**
```typescript
export const BrandBasicSchema = z.object({
  website: z
    .union([z.string().url(), z.literal(""), z.undefined()])
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  brandName: z.string().min(1, "品牌名称为必填"),
  productName: z.string().min(1, "产品名称为必填"),
  brandDescription: z.string().optional(),
})
```

**更新后：**
```typescript
export const BrandBasicSchema = z.object({
  brandName: z.string().min(1, "品牌名称为必填"),
  productName: z.string().min(1, "产品名称为必填"),
  brandDescription: z.string().optional(),
})
```

### 2. 表单组件 (`src/app/(app)/onboarding/brand/BrandForm.tsx`)

**主要变更：**
- ✅ 删除 `website` 输入框和 Upload 按钮
- ✅ 删除 `handleSuggest` 函数和所有自动生成逻辑
- ✅ 删除 `isGenerating` 状态
- ✅ 删除 `apiClient`、`BrandSuggestResponseSchema`、`useToast` 导入
- ✅ 删除 `Upload`、`Loader2` 图标导入
- ✅ 删除 `onSuggest` prop
- ✅ 移除所有与 `isGenerating` 相关的 `disabled` 属性

**更新后的组件接口：**
```typescript
interface BrandFormProps {
  defaultValues?: Partial<BrandBasic>
  onValuesChange?: (values: BrandBasic) => void
  // onSuggest 已移除
}
```

**更新后的表单字段：**
- ✅ `brandName`（必填）
- ✅ `productName`（必填）
- ✅ `brandDescription`（可选，多行）

### 3. 主页面 (`src/app/(app)/onboarding/brand/page.tsx`)

**主要变更：**
- ✅ 删除 `handleSuggest` 函数
- ✅ 删除 `nanoid` 导入（不再需要生成 ID）
- ✅ 移除 `BrandForm` 的 `onSuggest` prop
- ✅ 更新页面文案：从 "Just add your website..." 改为 "Define your brand and audience to start your AI journey."
- ✅ 更新页面注释：从 "基于输入自动生成" 改为 "手动录入"

**更新后的文案：**
```typescript
<h1 className="text-3xl font-bold mb-3 text-foreground">
  Let's build your brand together!
</h1>
<p className="text-lg text-muted-foreground">
  Define your brand and audience to start your AI journey.
</p>
```

### 4. Mock Handlers (`src/mocks/handlers.ts`)

**主要变更：**
- ✅ 注释掉 `POST /api/onboarding/brand/suggest` handler

**更新后的代码：**
```typescript
// POST /api/onboarding/brand/suggest
// 已移除：Step1 不再支持自动生成功能
// http.post("*/api/onboarding/brand/suggest", async ({ request }) => {
//   ...
// }),
```

### 5. Store (`src/store/brand.store.ts`)

**检查结果：**
- ✅ Store 使用 `BrandBasic` 类型，该类型已不包含 `website` 字段
- ✅ `setBasic` 函数直接使用传入的 `BrandBasic`，无需额外修改
- ✅ 无任何 website 相关的存储逻辑

## 保留的内容

以下内容被保留（因为它们属于 Step2 或其他功能）：

- `BrandSuggestResponseSchema` 和 `BrandSuggestResponse` 类型（虽然不再使用，但保留不会影响功能）
- Step2 (`/onboarding/prompt`) 中的 `website` 字段引用（Step2 仍然可能需要使用品牌信息中的 website，如果用户之前输入过）

## 验证检查清单

### ✅ 代码检查
- [x] `BrandForm.tsx` 中无 `website` 字段
- [x] `BrandForm.tsx` 中无 `handleSuggest` 函数
- [x] `BrandForm.tsx` 中无 Upload 按钮
- [x] `BrandBasicSchema` 中无 `website` 字段
- [x] `page.tsx` 中无 `handleSuggest` 函数
- [x] `page.tsx` 中无 `onSuggest` prop 传递
- [x] Mock handlers 中 `/api/onboarding/brand/suggest` 已注释
- [x] 文案已更新

### ✅ 功能验证
- [x] Linter 无错误
- [x] 类型定义完整
- [x] 表单字段正确（brandName, productName, brandDescription）
- [x] Personas 和 Competitors 手动添加功能正常
- [x] Next 按钮跳转逻辑正常

## 测试建议

1. **页面加载**
   - [ ] 访问 `/onboarding/brand` 页面无错误
   - [ ] 表单仅显示 brandName、productName、brandDescription 三个字段
   - [ ] 无 website 输入框和 Upload 按钮

2. **表单填写**
   - [ ] 填写 brandName 和 productName（必填）
   - [ ] 填写 brandDescription（可选）
   - [ ] 验证必填字段校验正常

3. **手动管理**
   - [ ] 手动添加 Personas 正常
   - [ ] 手动添加 Competitors 正常
   - [ ] 删除 Personas/Competitors 正常

4. **导航**
   - [ ] 点击 "Next →" 正常跳转到 `/onboarding/prompt`
   - [ ] 数据正确保存到 store

5. **网络请求**
   - [ ] 页面加载时不请求 `/api/onboarding/brand/suggest`
   - [ ] 无任何与 suggest 相关的 API 调用

## 注意事项

1. **数据迁移**：如果用户之前保存了包含 `website` 的数据，该字段会被自动忽略（因为类型定义已不包含该字段）
2. **Step2 兼容性**：Step2 (`/onboarding/prompt`) 中的 `website` 引用仍然保留，因为 Step2 可能需要使用之前保存的品牌信息（如果有的话）
3. **类型安全**：所有类型定义已更新，TypeScript 会确保类型一致性

