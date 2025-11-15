# Queries（Intent）页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 路径 / 契约 | 说明 |
|------|------------|--------------|-----------------|------|
| 1 | Header 过滤条（日期 / 模型） | `actualDateRange.start`<br>`actualDateRange.end` | `GET /api/intent`<br>查询参数: `startDate`, `endDate`, `model`, `language`, `productId?`, `brandId?` | API 根据数据文件可用日期返回最终范围，并带回 KPI/主题数据。 |
| 2 | KPI 卡片 | `kpis.topicCount`<br>`kpis.promptCount`<br>`kpis.compositeRank`<br>`kpis.avgVisibility`<br>`kpis.avgMentionRate`<br>`kpis.avgSentiment` | 同上 | 显示主题数量、提示词数量、综合排名、平均可见度/提及率/情绪。 |
| 3 | 主题列表（主表格） | `topics[]` | 同上 | `TopicRow` 包含 `id`, `topic`, `intent`, `promptCount`, `visibility`, `mentionRate`, `sentiment`, `rank`, `prompts[]`。 |
| 4 | 排序开关 | `topics.sortableFields` | 同上 | 可用排序字段：`topicHot`, `rankAsc`, `rankDesc`, `reachAsc`, `reachDesc`, `focusAsc`, `focusDesc`, `sentimentAsc`, `sentimentDesc`, `visibility`。前端在切换后携带 `sort`/`order` 重新请求。 |
| 5 | Topic 行展开 - Prompt 列表 | `topics[].prompts[]` | 同上 | 每个 PromptItem 含 `id`, `text`, `platform`, `role`, `rank`, `mentionsBrand`, `sentiment`, `aiResponse`, `mentions`, `citation`, `focus`, `intent`。 |
| 6 | 抽屉详情 | `topics[].prompts[]` | 同上 | 点击“查看详情”时展示同一组数据，可扩展 `sources`、`relatedQueries` 等字段。 |
| 7 | 过滤条件（平台 / 意图 / 是否提及品牌等） | `filters.availablePlatforms[]`<br>`filters.availableIntents[]` | 同上 | API 可返回可选值供前端渲染。当前前端在无 API 字段时使用常量。 |

## 二、请求与响应示例

```http
GET /api/intent?startDate=2025-11-08&endDate=2025-11-14&model=all&language=zh-TW&productId=product_inventec_1
Authorization: Bearer {token}
```

```json
{
  "actualDateRange": { "start": "2025-11-08", "end": "2025-11-14" },
  "kpis": {
    "topicCount": 6,
    "promptCount": 120,
    "compositeRank": 28,
    "avgVisibility": 42.5,
    "avgMentionRate": 24.1,
    "avgSentiment": 0.76
  },
  "topics": [
    {
      "id": "performance_and_architecture",
      "topic": "Performance and Architecture",
      "intent": "Information",
      "promptCount": 34,
      "visibility": 48.2,
      "mentionRate": 26.5,
      "sentiment": 0.83,
      "rank": 18,
      "prompts": [
        {
          "id": "performance_and_architecture_0_2025-11-09",
          "text": "What is Inventec's rack solution performance in GPU clusters?",
          "platform": "All Models",
          "role": "User",
          "rank": 18,
          "mentionsBrand": true,
          "sentiment": 0.83,
          "aiResponse": "Inventec delivers 400W+ GPU optimized racks...",
          "mentions": 12,
          "citation": 7,
          "focus": 41.2,
          "intent": "Information"
        }
      ]
    },
    {
      "id": "cooling_power_efficiency",
      "topic": "Cooling, Power Efficiency and High-Density Deployment",
      "intent": "Comparison",
      "promptCount": 21,
      "visibility": 38.1,
      "mentionRate": 22.7,
      "sentiment": 0.72,
      "rank": 26,
      "prompts": [ /* ... */ ]
    }
  ]
}
```

## 三、额外说明

1. **查询参数**  
   - `model`: `all` / `chatgpt` / `gemini` / `claude`，内部映射到 JSON 中的 `overall` / `chatgpt` 等节点。  
   - `productId`: 若提供，会先请求 `/api/products/:id` 以获取产品名称并构造 JSON 键。  
   - `language`: 控制主题/提示词是否需翻译（当前 API 默认返回中文/英文混合，前端使用 `translate()` 处理）。  

2. **主题映射**  
   - API 将 JSON 中的 aspects/queries 映射到固定的 6 个主题（保持与 Overview/Visibility 一致）。若用户后续补充 `overall.topics[]` 字段，则优先使用该数据。  

3. **排序与过滤**  
   - API 可以根据 `sort`/`order`/`intent`/`platform` 等查询参数返回已筛选、排序好的结果；当前实现由前端本地排序，后端可按需扩展。  

4. **错误与状态码**  
   - 常见错误：无数据（404）、参数错误（400）、内部错误（500）。  
   - 错误响应格式 `{ error: string, message?: string }`。  


