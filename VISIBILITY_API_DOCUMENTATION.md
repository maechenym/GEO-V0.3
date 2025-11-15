# Visibility 页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 响应路径 / 契约 | 说明 |
|------|------------|--------------|---------------------|------|
| 1 | Header 过滤条（日期、模型、导出） | `actualDateRange.start`<br>`actualDateRange.end` | `GET /api/visibility`<br>查询参数: `startDate`, `endDate`, `model`, `language`, `productId?`, `brandId?`<br>响应: `{ actualDateRange: { start: string, end: string }, ... }` | API 根据数据文件可用日期返回最终范围，并回填过滤器。 |
| 2 | KPI - 触及率 (Reach) | `visibility.reach.value`<br>`visibility.reach.delta` | 同上 | `value` 为本品牌 Reach 值（%），`delta` 为相对上一周期变化。 |
| 3 | KPI - 提及顺序 (Rank) | `visibility.rank.value`<br>`visibility.rank.delta` | 同上 | `value` 表示综合排名，`delta` 为排名变化（正=名次上升）。 |
| 4 | KPI - 内容占比 (Focus) | `visibility.focus.value`<br>`visibility.focus.delta` | 同上 | `value` 为内容占比（%），`delta` 为变化值。 |
| 5 | KPI - 可见度 (Visibility) | `visibility.visibility.value`<br>`visibility.visibility.delta` | 同上 | 使用 `combined_score` 计算整体可见度。 |
| 6 | 可见度趋势图 | `visibility.trends[]`<br>`visibility.ranking[]` | 同上，响应片段：`{ visibility: { ranking: RankingItem[], trends: Array<{ date: string, [brandName]: number }> } }` | `trends` 提供各品牌可见度走势，`ranking` 提供当前值、delta、单位等。 |
| 7 | Reach / Rank / Focus 排名卡片 | `reach.ranking[]`<br>`rank.ranking[]`<br>`focus.ranking[]` | 同上 | 每组含 `brand`, `value`, `delta`, `rank`, `isSelf`, `unit`。 |
| 8 | 可见度热力图 | `heatmap.sources[]`<br>`heatmap.topics[]`<br>`heatmap.cells[]` | 同上 | `sources` 和 `topics` 列表定义轴标签；`cells` 提供 `source`, `topic`, `mentionRate`, `sampleCount`, `example`。 |
| 9 | Source / Topic 交互 | `heatmap.cells[].example` | 同上 | 用于在 hover/popup 中显示示例回答。 |
|10 | 侧边筛选（来源类别、主题关键词） | `heatmap.sources`<br>`heatmap.topics` | 同上 | 可直接复用 `sources`/`topics` 列表的 `name`、`slug`。 |

## 二、响应示例（节选）

```json
GET /api/visibility?startDate=2025-11-08&endDate=2025-11-14&model=all&language=zh-TW

{
  "actualDateRange": { "start": "2025-11-08", "end": "2025-11-14" },
  "visibility": {
    "ranking": [
      { "brand": "英業達", "value": 3.7, "delta": 0.4, "unit": "%", "rank": 35, "isSelf": true }
    ],
    "trends": [
      { "date": "2025-11-08", "英業達": 3.2, "廣達": 4.1, "仁寶": 3.9 },
      { "date": "2025-11-09", "英業達": 3.4, "廣達": 4.3, "仁寶": 4.0 }
    ]
  },
  "reach": {
    "ranking": [
      { "brand": "英業達", "value": 6.4, "delta": 0.8, "unit": "%", "rank": 8, "isSelf": true }
    ]
  },
  "rank": {
    "ranking": [
      { "brand": "英業達", "value": 35, "delta": -2, "unit": "", "rank": 35, "isSelf": true }
    ]
  },
  "focus": {
    "ranking": [
      { "brand": "英業達", "value": 42.1, "delta": 3.2, "unit": "%", "rank": 12, "isSelf": true }
    ]
  },
  "heatmap": {
    "sources": [
      { "name": "News", "slug": "news" },
      { "name": "Tech Blog", "slug": "tech-blog" }
    ],
    "topics": [
      { "name": "技術創新", "slug": "innovation" },
      { "name": "供應鏈管理", "slug": "supply-chain" }
    ],
    "cells": [
      {
        "source": "news",
        "topic": "innovation",
        "mentionRate": 34.2,
        "sampleCount": 56,
        "example": "市場將英業達視為AI伺服器供應鏈關鍵節點..."
      }
    ]
  }
}
```

## 三、额外说明

1. **查询参数**  
   - `startDate`/`endDate`: YYYY-MM-DD；需限制在数据文件可用范围（2025-11-08~2025-11-14）。  
   - `model`: 同 Overview，未知模型统一回退 `overall`。  
   - `language`: `zh-TW` 时 API 已输出繁体字符串。  
   - `productId`、`brandId`: 用于指定产品或品牌维度。

2. **指标说明**  
   - `visibility` 使用 `combined_score` 作为主指标；`reach` 与 `focus` 分别来自 `mention_rate`、`content_share`。  
   - `rank`（提及顺序）以综合排名数值表示，越小越靠前。  
   - 所有 `delta` 字段均为当前周期 vs. 上一周期对比值。

3. **热力图数据**  
   - `heatmap.sources` 与 `heatmap.topics` 已按业务优先级排序；前端直接渲染即可。  
   - `mentionRate` 为该源/主题组合的提及占比（%），`sampleCount` 为样本数。  
   - `example` 选自对应 `aggregated_sentiment_detail` 中的代表性句段。

4. **错误与状态码**  
   - 错误响应统一为 `{ error: string, message?: string }`。  
   - 状态码：200 表示成功；400 参数错误；401 未授权；404 数据缺失；500 服务异常。


