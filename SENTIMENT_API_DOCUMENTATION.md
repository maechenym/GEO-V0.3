# Sentiment 页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 响应路径 / 契约 | 说明 |
|------|------------|--------------|---------------------|------|
| 1 | Header 过滤条（日期、模型、导出） | `actualDateRange.start`<br>`actualDateRange.end` | `GET /api/sentiment`<br>查询参数: `startDate`, `endDate`, `model`, `language`, `productId?`, `brandId?`<br>响应: `{ actualDateRange: { start: string, end: string }, ... }` | API 根据数据文件可用日期回填筛选器。 |
| 2 | KPI - 平均情绪 (Avg Sentiment) | `kpis.sentimentIndex`<br>`kpis.delta` | 同上 | `sentimentIndex` 为 0-1 得分，`delta` 为上一周期差值，前端根据正负显示绿/红箭头。 |
| 3 | KPI - Positive/Neutral/Negative | `kpis.positive`<br>`kpis.neutral`<br>`kpis.negative` | 同上 | 三个百分比字段分别表示正面/中立/负面回答占比。 |
| 4 | 情绪趋势折线图 | `trends[]` | 同上 | 每个元素形如 `{ date: string, [brandName: string]: number }`，值为 0-1 情绪指数；前端按日期渲染。 |
| 5 | 情绪排名（若展示） | `ranking[]` | 同上 | 包含 `brand`, `value`, `delta`, `rank`, `isSelf`，可用于额外榜单。 |
| 6 | 情绪分布（按来源类别） | `sourcesDistribution[]` | 同上 | 每项为 `{ type, pos, neu, neg }`，`type` 对应 Sources 页分类，`pos/neu/neg` 为占比（%）。 |
| 7 | 热门正面主题 | `positiveTopics[]` | 同上 | 数组项含 `topic`, `sentiment`, `score`, `mentions`；前端按情绪分从高到低排序。 |
| 8 | 热门负面主题 | `negativeTopics[]` | 同上 | 数组项结构同上，情绪分由低到高排序。 |
| 9 | 风险主题详情 (Risk Topics) | `riskTopics[]` | 同上 | 原始负面细节，用于后续扩展或导出（含 `prompt`, `answer`, `sentiment`, `sources`, `sourceUrl`）。 |

## 二、响应示例（节选）

```json
GET /api/sentiment?startDate=2025-11-08&endDate=2025-11-14&model=all&language=zh-TW

{
  "actualDateRange": { "start": "2025-11-08", "end": "2025-11-14" },
  "kpis": {
    "sentimentIndex": 0.87,
    "positive": 74.7,
    "neutral": 5.1,
    "negative": 20.2
  },
  "trends": [
    { "date": "11/08", "英業達": 0.82, "廣達": 0.85, "仁寶": 0.81 },
    { "date": "11/09", "英業達": 0.86, "廣達": 0.84, "仁寶": 0.80 }
  ],
  "sourcesDistribution": [
    { "type": "News", "pos": 68.2, "neu": 20.1, "neg": 11.7 },
    { "type": "Tech Blog", "pos": 71.4, "neu": 18.3, "neg": 10.3 }
  ],
  "positiveTopics": [
    { "topic": "技術創新", "sentiment": 0.92, "score": 0.88, "mentions": 24 },
    { "topic": "數據中心級穩定性", "sentiment": 0.87, "score": 0.80, "mentions": 15 }
  ],
  "negativeTopics": [
    { "topic": "供應鏈延遲", "sentiment": -0.62, "score": 0.78, "mentions": 9 },
    { "topic": "耗能與散熱", "sentiment": -0.41, "score": 0.63, "mentions": 6 }
  ],
  "riskTopics": [
    {
      "id": "risk_0_supply_chain",
      "prompt": "供應鏈延遲",
      "answer": "供應鏈延遲",
      "sources": 9,
      "sentiment": -0.62,
      "sourceUrl": "https://sohu.com"
    }
  ]
}
```

## 三、额外说明

1. **查询参数与语言**  
   - `startDate`/`endDate`: YYYY-MM-DD，需限制在数据文件可用范围。  
   - `model`: `all` / `chatgpt` / `gemini` / `claude`（缺省时回退 `overall`）。  
   - `language`: `zh-TW` 时，`topics`、`sourcesDistribution.type` 等文本已由 API 输出繁体。  
   - `productId`、`brandId`: 可选，用于特定产品或品牌。

2. **KPI 计算**  
   - 若请求跨多日，API 会对每日日数据求平均；上一周期用于 `delta` 计算。  
   - `positive/neutral/negative` 由 `sentiment_score` 映射推算，保证三者和为 100%。  
   - 当上一周期样本不足时，API 会回退到模拟值（略低于当前值），保证 delta 字段可用。

3. **来源类别映射**  
   - `sourcesDistribution` 基于品牌域名映射到统一分类（同 Sources 页）；若域名未在映射表内，将按关键词规则归类为 `Other`。  

4. **主题排序逻辑**  
   - `positiveTopics` 按 `sentiment` 或 `score` 值由高到低；  
   - `negativeTopics` 按 `sentiment` 值由低到高；  
   - `mentions` 表示该主题在聚合细节中的出现次数，方便前端展示百分比。

5. **错误与状态码**  
   - 错误响应：`{ error: string, message?: string }`。  
   - 状态码：200 表示成功；400 参数错误；401 未授权；404 数据缺失；500 服务异常。  


