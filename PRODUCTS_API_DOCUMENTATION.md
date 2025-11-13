# 产品管理模块 API 接口文档

## 一、品牌（Brand）相关接口

| 序号 | UI 元素位置 | 对应 API 字段 | API 响应路径 / 契约 | 说明 |
|------|------------|--------------|---------------------|------|
| 1 | 产品设置页面 - 品牌名称显示区域 | `brand.name` | `GET /api/brands/:id`<br>响应: `{ brand: { id: string, name: string, description?: string \| null, website?: string \| null } }` | 获取品牌信息，用于显示品牌名称 |
| 2 | 产品设置页面 - 品牌名称显示区域 | `brand.name`<br>`brand.description`<br>`brand.website` | `PATCH /api/brands/:id`<br>请求: `{ name?: string, description?: string \| null, website?: string \| null }`<br>响应: `{ brand: { id: string, name: string, description?: string \| null, website?: string \| null } }` | 更新品牌信息（名称、描述、网站） |

## 二、产品（Product）相关接口

| 序号 | UI 元素位置 | 对应 API 字段 | API 响应路径 / 契约 | 说明 |
|------|------------|--------------|---------------------|------|
| 3 | 产品设置页面 - 产品选择器下拉框 | `products[].id`<br>`products[].name` | `GET /api/brands/:brandId/products`<br>响应: `{ products: Array<{ id: string, brandId: string, name: string, category?: string \| null, active: boolean }> }` | 获取品牌下的所有产品列表，用于产品选择器 |
| 4 | 产品设置页面 - 产品列表卡片 | `products[].id`<br>`products[].name`<br>`products[].category`<br>`products[].active` | `GET /api/brands/:brandId/products`<br>响应: `{ products: Array<{ id: string, brandId: string, name: string, category?: string \| null, active: boolean }> }` | 获取产品列表，显示在"Products"卡片中 |
| 5 | 产品设置页面 - 产品列表卡片 - "Add Product" 按钮 | `name`<br>`category` | `POST /api/brands/:brandId/products`<br>请求: `{ name: string, category?: string \| null }`<br>响应: `{ product: { id: string, brandId: string, name: string, category?: string \| null, active: boolean } }` | 创建新产品 |
| 6 | 产品设置页面 - 产品列表卡片 - 编辑按钮 | `name`<br>`category`<br>`active` | `PATCH /api/products/:id`<br>请求: `{ name?: string, category?: string \| null, active?: boolean }`<br>响应: `{ product: { id: string, brandId: string, name: string, category?: string \| null, active: boolean } }` | 更新产品信息（名称、分类、激活状态） |
| 7 | 产品设置页面 - 产品列表卡片 - 删除按钮 | - | `DELETE /api/products/:id`<br>响应: `{ ok: boolean, message: string }` | 删除产品 |

## 三、竞品（Competitor）相关接口

| 序号 | UI 元素位置 | 对应 API 字段 | API 响应路径 / 契约 | 说明 |
|------|------------|--------------|---------------------|------|
| 8 | 产品设置页面 - 竞品卡片 - 竞品列表表格 | `competitors[].id`<br>`competitors[].name`<br>`competitors[].product`<br>`competitors[].region` | `GET /api/products/:productId/competitors`<br>响应: `{ competitors: Array<{ id: string, brandId: string, name: string, product?: string \| null, region?: string \| null }> }` | **根据选中的产品ID获取该产品对应的竞品列表**（核心功能：不同产品显示不同竞品） |
| 9 | 产品设置页面 - 竞品卡片 - "Add Competitor" 按钮 | `name`<br>`product`<br>`region` | `POST /api/products/:productId/competitors`<br>请求: `{ name: string, product?: string \| null, region?: string \| null }`<br>响应: `{ competitor: { id: string, brandId: string, name: string, product: string, region?: string \| null } }` | 为指定产品创建竞品 |
| 10 | 产品设置页面 - 竞品卡片 - 编辑按钮 | `name`<br>`product`<br>`region` | `PATCH /api/competitors/:id`<br>请求: `{ name?: string, product?: string \| null, region?: string \| null }`<br>响应: `{ competitor: { id: string, brandId: string, name: string, product?: string \| null, region?: string \| null } }` | 更新竞品信息 |
| 11 | 产品设置页面 - 竞品卡片 - 删除按钮 | - | `DELETE /api/competitors/:id`<br>响应: `{ ok: boolean, message?: string }` | 删除竞品 |

## 四、数据模型定义

### Brand（品牌）
```typescript
{
  id: string;              // 品牌ID，如 "brand_inventec"
  name: string;            // 品牌名称，如 "英业达 (Inventec)"
  description?: string | null;  // 品牌描述（可选）
  website?: string | null;     // 品牌网站URL（可选）
}
```

### Product（产品）
```typescript
{
  id: string;              // 产品ID，如 "product_1"
  brandId: string;        // 所属品牌ID
  name: string;            // 产品名称，如 "机架解决方案"
  category?: string | null;    // 产品分类（可选），如 "服务器"
  active: boolean;         // 是否激活，默认 true
}
```

### Competitor（竞品）
```typescript
{
  id: string;              // 竞品ID，如 "comp_1"
  brandId: string;        // 所属品牌ID
  name: string;           // 竞品名称，如 "HPE"
  product?: string | null;     // 关联的产品ID（可选），如 "product_1"
  region?: string | null;      // 地区（可选），如 "United States"
}
```

## 五、重要说明

### 1. 产品选择与竞品关联逻辑
- **核心功能**：当用户在"产品选择器"中选择不同产品时，系统会自动调用 `GET /api/products/:productId/competitors` 获取该产品对应的竞品列表
- **数据隔离**：每个产品有独立的竞品列表，不同产品的竞品数据互不影响
- **前端实现**：
  - 产品选择器使用 `useBrandUIStore` 存储当前选中的 `selectedProductId`
  - 竞品卡片使用 `useCompetitorsByProduct(selectedProductId)` hook 获取竞品数据
  - 当 `selectedProductId` 变化时，React Query 会自动重新获取竞品数据

### 2. 请求头要求
所有 API 请求需要在请求头中包含认证信息：
```
Authorization: Bearer {token}
```

### 3. 错误响应格式
```typescript
{
  error: string;          // 错误信息
  message?: string;       // 详细错误描述（可选）
}
```

### 4. 状态码
- `200 OK`: 请求成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 六、API 调用示例

### 示例1：获取产品列表
```http
GET /api/brands/brand_inventec/products
Authorization: Bearer {token}
```

响应：
```json
{
  "products": [
    {
      "id": "product_1",
      "brandId": "brand_inventec",
      "name": "机架解决方案",
      "category": "服务器",
      "active": true
    }
  ]
}
```

### 示例2：根据产品ID获取竞品列表
```http
GET /api/products/product_1/competitors
Authorization: Bearer {token}
```

响应：
```json
{
  "competitors": [
    {
      "id": "comp_1",
      "brandId": "brand_inventec",
      "name": "HPE",
      "product": "product_1",
      "region": null
    }
  ]
}
```

### 示例3：为产品创建竞品
```http
POST /api/products/product_1/competitors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "HPE",
  "region": "United States"
}
```

响应：
```json
{
  "competitor": {
    "id": "comp_1234567890",
    "brandId": "brand_inventec",
    "name": "HPE",
    "product": "product_1",
    "region": "United States"
  }
}
```

