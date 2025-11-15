# Overview 页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 响应路径 / 契约 | 说明 |
|------|------------|--------------|---------------------|------|
| 1 | Header 过滤条（日期、模型、导出） | `actualDateRange.start`<br>`actualDateRange.end` | `GET /api/overview`<br>查询参数: `startDate`, `endDate`, `model`, `language`, `productId?`, `brandId?`<br>响应: `{ actualDateRange: { start: string, end: string }, ... }` | API 会根据数据文件实际可用日期返回最终时间范围，用于回填筛选器。 |
| 2 | KPI - 触及率 (Reach) | `kpis.reach.value`<br>`kpis.reach.delta` | 同上 | `value` 为当前周期提及率（%），`delta` 为相对上一周期变化。 |
| 3 | KPI - 可见度排名 (Visibility Rank) | `kpis.rank.value`<br>`kpis.rank.delta` | 同上 | `value` 为综合分排名；`delta` 为排名变化（正=名次上升）。 |
| 4 | KPI - 内容占比 (Focus) | `kpis.focus.value`<br>`kpis.focus.delta` | 同上 | `value` 为内容占比（%），`delta` 为变化值。 |
| 5 | KPI - 情绪指数 (Sentiment) | `kpis.sentiment.value`<br>`kpis.sentiment.delta` | 同上 | `value` 为 0-1 情绪得分；`delta` 为变化值。 |
| 6 | 品牌影响力趋势 | `brandInfluence.self.value`<br>`brandInfluence.self.delta`<br>`brandInfluence.trend[]` | 同上，响应片段：`{ brandInfluence: { self: { brand: string, value: number, delta: number }, trend: Array<{ date: string, [brandName]: number }> } }` | `trend` 提供本品牌及竞品总分曲线，`self` 用于数值显示。 |
| 7 | 品牌影响力 - 竞品选择 | `brandInfluence.availableCompetitors[]` | 同上 | 列出可添加至趋势图的竞品，包含 `brand`, `displayName`。 |
| 8 | 影响力排名列表 | `ranking[]` | 同上 | 数组项含 `brand`, `value`, `delta`, `rank`, `isSelf`，用于排序展示。 |
| 9 | 来源 (Sources) 卡片 | `sources.topSources[]` | 同上 | 每项含 `domain`, `type`, `mentionCount`, `mentionShare`, `mentionedSelf`。 |
|10 | 热门主题 (Topics) 卡片 | `topics[]` | 同上 | 每项含 `name`, `mentionCount`, `mentionShare`, `translation`，已按权重排序。 |
|11 | 品牌 / 语言元数据 | `meta.selfBrandName`<br>`meta.language` | 同上 | `meta` 中提供当前语言下的品牌名称等通用信息。 |

## 二、响应示例（节选）

```json
GET /api/overview?startDate=2025-11-08&endDate=2025-11-14&model=all&language=zh-TW

{
  "actualDateRange": { "start": "2025-11-08", "end": "2025-11-14" },
  "kpis": {
    "reach": { "value": 6.4, "delta": 0.8, "unit": "%" },
    "rank": { "value": 35, "delta": -2 },
    "focus": { "value": 42.1, "delta": 3.2, "unit": "%" },
    "sentiment": { "value": 0.87, "delta": 0.05 }
  },
  "brandInfluence": {
    "self": { "brand": "英業達", "value": 72.4, "delta": 4.1 },
    "trend": [
      { "date": "11/08", "英業達": 68.3, "廣達": 71.5, "仁寶": 70.1 },
      { "date": "11/09", "英業達": 69.1, "廣達": 72.0, "仁寶": 69.8 }
    ],
    "availableCompetitors": [
      { "brand": "廣達電腦", "displayName": "Quanta" },
      { "brand": "仁寶電腦", "displayName": "Compal" }
    ]
  },
  "ranking": [
    { "brand": "英業達", "value": 72.4, "delta": 1, "rank": 3, "isSelf": true },
    { "brand": "廣達電腦", "value": 75.1, "delta": -1, "rank": 2, "isSelf": false }
  ],
  "sources": {
    "topSources": [
      { "domain": "sohu.com", "type": "News", "mentionCount": 120, "mentionShare": 30.1, "mentionedSelf": true },
      { "domain": "adreamertech.com.cn", "type": "Tech Blog", "mentionCount": 107, "mentionShare": 26.8, "mentionedSelf": true }
    ]
  },
  "topics": [
    { "name": "技術創新", "mentionCount": 36, "mentionShare": 36.7 },
    { "name": "供應鏈管理", "mentionCount": 15, "mentionShare": 15.6 }
  ],
  "meta": {
    "selfBrandName": { "zh": "英業達", "en": "Inventec" },
    "language": "zh-TW"
  }
}
```

## 三、额外说明

1. **查询参数**  
   - `startDate`/`endDate`: YYYY-MM-DD；需与数据文件可用范围匹配。  
   - `model`: `all` / `gpt` / `chatgpt` / `gemini` / `claude`（未知模型回退到 `overall` 数据）。  
   - `language`: `zh-CN` / `zh-TW` / `en`；为 `zh-TW` 时 API 负责繁体转换。  
   - `productId`、`brandId`: 可选，用于指定产品或品牌维度。

2. **数据约定**  
   - `topics` 与 `sources.topSources` 均已按业务指标降序排序；前端可直接渲染。  
   - `brandInfluence.trend` 中的品牌键名即前端折线图图例。  
   - `ranking` 列表包含 `isSelf` 字段，方便前端突出展示当前品牌。

3. **错误格式 & 状态码**  
   - 错误响应：`{ error: string, message?: string }`。  
   - 状态码遵循全局约定：200 成功、400 参数错误、401 未授权、404 数据缺失、500 服务异常。


