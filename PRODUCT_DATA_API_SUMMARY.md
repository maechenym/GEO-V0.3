# 产品数据更新总结

## 完成的任务 ✅

### 1. 产品数据API端点

已创建以下API端点来访问JSON文件中的产品数据：

#### `/api/products-data`
- **方法**: GET
- **功能**: 返回所有产品的分析数据（完整JSON文件内容）
- **位置**: `src/app/api/products-data/route.ts`
- **用途**: 为MSW mock和前端提供数据访问

#### `/api/products/[productId]/analytics`
- **方法**: GET
- **功能**: 获取指定产品的分析数据
- **查询参数**:
  - `startDate`: 开始日期（可选）
  - `endDate`: 结束日期（可选）
- **位置**: `src/app/api/products/[productId]/analytics/route.ts`
- **返回格式**:
  ```json
  {
    "productName": "英业达 (Inventec) 机架解决方案",
    "data": [
      ["2025-10-31", { "overall": {...}, "chatgpt": {...} }],
      ...
    ]
  }
  ```

### 2. MSW Mock Handlers更新

#### `/api/products/:productId/analytics` Handler
- **位置**: `src/mocks/handlers.ts`
- **功能**: Mock产品分析数据API
- **说明**: 
  - 需要Authorization token
  - 从 `/api/products-data` 获取完整数据
  - 根据产品名称过滤数据
  - 支持日期范围过滤

### 3. MSW配置更新

- **位置**: `src/lib/init-msw.ts`
- **更改**: 配置MSW使用 `onUnhandledRequest: "bypass"`，允许 `/api/products-data` 直接通过到实际的API route

## 使用方法

### 1. 获取所有产品数据
```typescript
const response = await fetch('/api/products-data')
const allData = await response.json()
```

### 2. 获取特定产品的分析数据
```typescript
const productName = encodeURIComponent('英业达 (Inventec) 机架解决方案')
const response = await fetch(`/api/products/${productName}/analytics?startDate=2025-10-31&endDate=2025-11-06`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const data = await response.json()
```

### 3. 产品名称映射

产品在系统中的名称格式：
- **产品名称**: `英业达 (Inventec) ${产品类别}`
- **示例**: `英业达 (Inventec) 机架解决方案`

JSON文件中的键名与产品名称完全匹配，可以直接使用产品名称作为productId。

## 数据格式

每个产品的数据格式：
```json
[
  ["2025-10-31", {
    "overall": {
      "mention_rate": {...},
      "content_share": {...},
      "brand_domains": {...},
      "combined_score": {...},
      "sentiment_score": {...},
      "total_score": {...},
      "absolute_rank": {...},
      "aggregated_sentiment_detail": {...}
    },
    "chatgpt": {...}
  }],
  ...
]
```

## 注意事项

1. **产品名称编码**: 使用 `encodeURIComponent()` 编码产品名称作为URL参数
2. **Authorization**: `/api/products/:productId/analytics` 需要Authorization token
3. **日期格式**: 使用 `YYYY-MM-DD` 格式
4. **数据路径**: JSON文件位于项目根目录的上一级目录

## 下一步

1. 在前端页面中集成这些API端点
2. 根据选中的产品动态加载分析数据
3. 在Overview页面中使用实际的产品数据替换mock数据

