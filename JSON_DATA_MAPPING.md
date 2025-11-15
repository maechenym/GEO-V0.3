# JSON数据字段映射关系文档

## 一、JSON文件数据结构

### 顶层结构
```
{
  "品牌名 (英文名) | 产品名": [
    ["日期", {
      "brand_name": "品牌名 (英文名)",
      "product_name": "产品名",
      "overall": { ... },
      "chatgpt": { ... }  // 结构与overall相同
    }],
    ...
  ]
}
```

**注意**: 
- 产品键名格式已改为: `"品牌名 (英文名) | 产品名"`（用 `|` 分隔）
- 每天的数据中添加了 `brand_name` 和 `product_name` 字段
- 只有 `overall` 和 `chatgpt` 两个数据源，`gemini` 和 `claude` 不存在时使用 `overall`

### overall 数据结构
```typescript
{
  mention_rate: { [品牌名: string]: number },           // 提及率 (0-1)
  content_share: { [品牌名: string]: number },         // 内容份额 (0-1)
  brand_domains: { [品牌名: string]: string[] },       // 品牌域名列表
  combined_score: { [品牌名: string]: number },         // 综合分数 (0-1)
  sentiment_score: { [品牌名: string]: number },       // 情感分数 (0-1或更大)
  total_score: { [品牌名: string]: number },           // 总分 (更大的数字)
  absolute_rank: { [品牌名: string]: string },         // 绝对排名 (格式: "3.9/4.8")
  aggregated_sentiment_detail: {                        // 聚合情感详情
    [品牌名: string]: {
      positive_aspects: string[],                       // 正面描述列表
      negative_aspects: string[]                         // 负面描述列表
    }
  },
  mention_rate_avg: number,                            // 平均提及率
  content_share_avg: number,                           // 平均内容份额
  combined_score_avg: number,                          // 平均综合分数
  sentiment_score_avg: number,                         // 平均情感分数
  total_score_avg: number,                             // 平均总分
  topics: [],                                          // 主题数据（空数组，待填写）
  queries: [],                                         // 查询数据（空数组，待填写）
  response: []                                         // 回复数据（空数组，待填写）
}
```

**新增字段说明**:
- `topics`: 用于存储6个固定主题的数据，格式: `[{ "name": "主题名", "mention_count": 0, "aspects": [] }, ...]`
- `queries`: 用于存储查询数据，格式: `[{ "text": "查询文本", "platform": "ChatGPT", "role": "角色", ... }, ...]`
- `response`: 用于存储回复数据，格式: `[{ "text": "查询文本", "platform": "ChatGPT", "response": "回复内容", "role": "角色", ... }, ...]`
```

---

## 二、字段映射关系

### 1. Overview 页面字段映射

| 前端字段 | JSON字段路径 | 转换说明 | 确认 |
|---------|-------------|---------|------|
| **KPIs - Reach** | `overall.mention_rate[品牌名]` | 直接使用，转换为百分比 (×100) | ⬜ |
| **KPIs - Rank** | `overall.absolute_rank[品牌名]` | 解析字符串 "3.9/4.8"，取第一个数字作为排名 | ⬜ |
| **KPIs - Focus** | `overall.content_share[品牌名]` | 直接使用，转换为百分比 (×100) | ⬜ |
| **KPIs - Sentiment** | `overall.sentiment_score[品牌名]` | 直接使用（数据保证在0-1范围内） | ✅ |
| **KPIs - Visibility** | `overall.combined_score[品牌名]` | 使用combined_score | ✅ |
| **Brand Influence - current** | `overall.total_score["英业达"]` | 使用本品牌的总分 | ⬜ |
| **Brand Influence - previousPeriod** | 前一个时间段的 `overall.total_score["英业达"]` | 需要计算时间段差值 | ⬜ |
| **Brand Influence - changeRate** | (current - previousPeriod) / previousPeriod × 100 | 计算变化率 | ⬜ |
| **Brand Influence - trend** | 多天的 `overall.total_score["英业达"]` | 按日期聚合 | ⬜ |
| **Ranking - rank** | 根据 `overall.total_score` 排序 | 按总分降序排序，计算排名 | ⬜ |
| **Ranking - name** | `overall.total_score` 的键名 | 直接使用品牌名 | ⬜ |
| **Ranking - score** | `overall.total_score[品牌名]` | 直接使用 | ⬜ |
| **Ranking - delta** | 与前一个时间段对比 | 计算排名变化 | ⬜ |
| **Sources - domain** | `overall.brand_domains[品牌名]` 中的域名 | 去重并统计 | ⬜ |
| **Sources - mentionCount** | `overall.brand_domains[品牌名]` 数组长度 | 统计域名出现次数 | ⬜ |
| **Sources - mentionShare** | mentionCount / 总mentionCount | 计算占比 | ⬜ |
| **Sources - mentionsSelf** | 检查域名是否来自"英业达" | 判断是否为本品牌 | ⬜ |
| **Topics - topic** | `overall.topics[].name` | 使用topics字段中的主题名称 | ✅ |
| **Topics - mentionCount** | `overall.topics[].mention_count` | 使用topics字段中的提及次数 | ✅ |
| **Topics - mentionShare** | mentionCount / 总mentionCount | 计算占比 | ✅ |
| **Competitor Trends** | 多天的 `overall.total_score[品牌名]` | 按品牌和日期聚合 | ⬜ |

---

### 2. Visibility 页面字段映射

| 前端字段 | JSON字段路径 | 转换说明 | 确认 |
|---------|-------------|---------|------|
| **Visibility Ranking - brand** | `overall.combined_score` 或 `overall.total_score` 的键名 | 使用品牌名 | ⬜ |
| **Visibility Ranking - reach** | `overall.mention_rate[品牌名]` | 转换为百分比 (×100) | ⬜ |
| **Visibility Ranking - rank** | 根据 `overall.total_score` 排序 | 计算排名位置 | ⬜ |
| **Visibility Ranking - focus** | `overall.content_share[品牌名]` | 转换为百分比 (×100) | ⬜ |
| **Visibility Ranking - reachDelta** | 与前一个时间段对比 | 计算变化 | ⬜ |
| **Visibility Ranking - rankDelta** | 与前一个时间段对比 | 计算排名变化 | ⬜ |
| **Visibility Ranking - focusDelta** | 与前一个时间段对比 | 计算变化 | ⬜ |
| **Visibility Trends - date** | 日期字段 | 直接使用 | ⬜ |
| **Visibility Trends - [品牌名]** | `overall.mention_rate[品牌名]` 或 `overall.total_score[品牌名]` | 需要确认使用哪个 | ⬜ |
| **Reach Ranking** | 基于 `overall.mention_rate` 排序 | 按提及率降序 | ⬜ |
| **Reach Trends** | 多天的 `overall.mention_rate[品牌名]` | 按日期聚合 | ⬜ |
| **Rank Ranking** | 基于 `overall.total_score` 排序 | 按总分降序 | ⬜ |
| **Rank Trends** | 多天的排名位置 | 计算每天的排名 | ⬜ |
| **Focus Ranking** | 基于 `overall.content_share` 排序 | 按内容份额降序 | ⬜ |
| **Focus Trends** | 多天的 `overall.content_share[品牌名]` | 按日期聚合 | ⬜ |
| **Heatmap - source** | `overall.brand_domains` 中的域名 | 去重后的域名列表 | ⬜ |
| **Heatmap - topic** | `overall.topics[].name` | 与Topics使用同一个来源 | ✅ |
| **Heatmap - mentionRate** | 基于aspects匹配到主题的提及率 | 需要计算 | ⬜ |
| **Heatmap - sampleCount** | 匹配到该主题的aspects数量 | 统计数量 | ⬜ |
| **Heatmap - example** | `aggregated_sentiment_detail[品牌名].positive_aspects` 中匹配的aspect | 取第一个匹配的aspect | ⬜ |

---

### 3. Sentiment 页面字段映射

| 前端字段 | JSON字段路径 | 转换说明 | 确认 |
|---------|-------------|---------|------|
| **KPIs - SOV (Share of Voice)** | `overall.mention_rate["英业达"]` / 总mention_rate | 计算本品牌占比 | ⬜ |
| **KPIs - Sentiment Index** | `overall.sentiment_score["英业达"]` | 直接使用（数据保证在0-1范围内） | ✅ |
| **KPIs - Positive** | 基于 `sentiment_score` 计算 | sentiment_score > 0.3 为positive | ✅ |
| **KPIs - Neutral** | 基于 `sentiment_score` 计算 | -0.3 <= sentiment_score <= 0.3 为neutral | ✅ |
| **KPIs - Negative** | 基于 `sentiment_score` 计算 | sentiment_score < -0.3 为negative | ✅ |
| **Trends - date** | 日期字段 | 直接使用 | ⬜ |
| **Trends - [品牌名]** | `overall.sentiment_score[品牌名]` | 直接使用，可能需要归一化 | ⬜ |
| **Ranking - brand** | `overall.sentiment_score` 的键名 | 使用品牌名 | ⬜ |
| **Ranking - value** | `overall.sentiment_score[品牌名]` | 直接使用，可能需要归一化 | ⬜ |
| **Ranking - rank** | 根据 `sentiment_score` 排序 | 按情感分数降序排序 | ⬜ |
| **Ranking - delta** | 与前一个时间段对比 | 计算排名变化 | ⬜ |
| **Risk Topics - prompt** | 基于 `negative_aspects` 生成 | 将负面aspect转换为查询文本 | ⬜ |
| **Risk Topics - answer** | `aggregated_sentiment_detail[品牌名].negative_aspects` | 直接使用负面aspect作为答案 | ⬜ |
| **Risk Topics - sources** | `overall.brand_domains[品牌名]` 数组长度 | 统计域名数量 | ⬜ |
| **Risk Topics - sentiment** | `overall.sentiment_score[品牌名]` | 直接使用 | ⬜ |
| **Risk Topics - sourceUrl** | `overall.brand_domains[品牌名][0]` | 取第一个域名 | ⬜ |
| **Volume - date** | 日期字段 | 直接使用 | ⬜ |
| **Volume - count** | `overall.brand_domains[品牌名]` 数组长度总和 | 统计所有品牌的域名总数 | ⬜ |

---

### 4. Intent/Queries 页面字段映射

| 前端字段 | JSON字段路径 | 转换说明 | 确认 |
|---------|-------------|---------|------|
| **KPIs - topicCount** | `overall.topics.length` | 使用topics数组长度 | ✅ |
| **KPIs - promptCount** | `overall.queries.length` 或 `overall.response.length` | 使用queries/response数组长度 | ✅ |
| **KPIs - compositeRank** | 根据 `overall.total_score["英业达"]` 在所有品牌中的排名 | 计算排名位置 | ✅ |
| **KPIs - avgVisibility** | `overall.combined_score_avg` | 使用combined_score_avg | ✅ |
| **KPIs - avgMentionRate** | `overall.mention_rate_avg` | 转换为百分比 (×100) | ✅ |
| **KPIs - avgSentiment** | `overall.sentiment_score_avg` | 直接使用（数据保证在0-1范围内） | ✅ |
| **TopicRow - topic** | `overall.topics[].name` | 使用topics字段中的主题名称 | ✅ |
| **TopicRow - intent** | 基于aspects内容推断 | 根据关键词匹配意图类型 | ⬜ |
| **TopicRow - promptCount** | 匹配到该主题的aspects数量 | 统计匹配的aspects | ⬜ |
| **TopicRow - visibility** | 该主题下所有品牌的 `overall.combined_score` 平均值 | 需要计算 | ⬜ |
| **TopicRow - mentionRate** | 该主题下所有品牌的 `overall.mention_rate` 平均值 | 需要计算 | ⬜ |
| **TopicRow - sentiment** | 该主题下所有品牌的 `overall.sentiment_score` 平均值 | 需要计算 | ⬜ |
| **TopicRow - rank** | 该主题下"英业达"的排名 | 需要计算 | ⬜ |
| **PromptItem - text** | `overall.queries[].text` 或 `overall.response[].text` | 使用queries/response字段中的查询文本 | ✅ |
| **PromptItem - platform** | `overall.queries[].platform` 或 `overall.response[].platform` | 使用queries/response字段中的平台 | ✅ |
| **PromptItem - role** | `overall.queries[].role` 或 `overall.response[].role` | 使用queries/response字段中的角色 | ✅ |
| **PromptItem - rank** | 根据 `overall.total_score` 排序 | 计算排名 | ⬜ |
| **PromptItem - mentionsBrand** | 检查aspect中是否包含"英业达" | 判断是否提及本品牌 | ⬜ |
| **PromptItem - sentiment** | `overall.sentiment_score[品牌名]` | 直接使用，可能需要归一化 | ⬜ |
| **PromptItem - aiResponse** | `overall.response[].response` 或 `overall.queries[].response` | 使用response/queries字段中的回复 | ✅ |
| **PromptItem - mentions** | `overall.mention_rate` 的键数量 | 统计品牌总数 | ⬜ |
| **PromptItem - citation** | `overall.brand_domains[品牌名]` 数组长度 | 统计域名数量 | ⬜ |
| **PromptItem - focus** | `overall.content_share[品牌名]` | 转换为百分比 (×100) | ⬜ |
| **PromptItem - intent** | `overall.queries[].intent` 或 `overall.response[].intent` | 使用queries/response字段中的意图 | ✅ |

---

## 三、需要确认的映射关系

### 1. Visibility 指标选择 ✅
- **确认**: Visibility 使用 `combined_score`
- **实现**: 已更新映射关系

### 2. Sentiment Score 处理 ✅
- **确认**: 不需要归一化，数据源会保证所有sentiment_score值都在0-1范围内
- **实现**: JSON文件保持原始sentiment_score值，不进行归一化处理

### 3. Intent/Queries 数据生成 ✅
- **确认**: 使用 `overall.queries` 和 `overall.response` 字段（空数组，待用户填写）
- **实现**: JSON文件已添加 `queries` 和 `response` 空数组字段

### 4. 产品名称匹配 ✅
- **确认**: JSON中已拆分为 `brand_name` 和 `product_name` 两个字段
- **实现**: 产品键名格式改为 `"品牌名 (英文名) | 产品名"`，每天数据包含 `brand_name` 和 `product_name`

### 5. 模型数据选择 ✅
- **确认**: 只有 `chatgpt` 有独立数据，`gemini` 和 `claude` 不存在时使用 `overall` 数据
- **实现**: 已更新映射关系

---

## 四、数据转换规则

### 1. 百分比转换
- `mention_rate` (0-1) → Reach (0-100%)
- `content_share` (0-1) → Focus (0-100%)

### 2. 排名计算
- 根据 `total_score` 降序排序
- 排名从1开始（最高分排名为1）

### 3. 时间段对比
- 需要计算前一个时间段的数据
- 计算变化率: (当前值 - 之前值) / 之前值 × 100

### 4. 主题匹配
- 使用关键词匹配aspects到6个固定主题
- 匹配规则已在 `computeTopTopics` 函数中定义

---

## 五、JSON文件更新说明

### 已完成的更新：

1. ✅ **产品名称拆分**: 
   - 键名格式改为: `"品牌名 (英文名) | 产品名"`
   - 每天数据添加 `brand_name` 和 `product_name` 字段

2. ✅ **Sentiment Score 处理**: 
   - 保持原始值，不进行归一化（数据源会保证值在0-1范围内）

3. ✅ **新增字段**（空数组，待用户填写）:
   - `overall.topics`: 用于存储6个固定主题的数据
   - `overall.queries`: 用于存储查询数据
   - `overall.response`: 用于存储回复数据

4. ✅ **原文件备份**: 
   - 原文件已备份到 `data/all_brands_results_20251106_075334_backup.json`
   - 新文件已保存到 `data/all_brands_results_20251106_075334.json`

### 待用户填写的数据格式：

**topics 字段格式**:
```json
"topics": [
  {
    "name": "Performance and Architecture",
    "mention_count": 0,
    "aspects": []
  },
  ...
]
```

**queries 字段格式**:
```json
"queries": [
  {
    "text": "查询文本",
    "platform": "ChatGPT",
    "role": "IT Manager",
    "intent": "Comparison",
    "sentiment": 0.8,
    "mentions_brand": true,
    "rank": 1,
    "mentions": 5,
    "citation": 3,
    "focus": 25.5
  },
  ...
]
```

**response 字段格式**:
```json
"response": [
  {
    "text": "查询文本",
    "platform": "ChatGPT",
    "role": "IT Manager",
    "response": "AI回复内容",
    "intent": "Comparison",
    "sentiment": 0.8,
    "mentions_brand": true,
    "rank": 1,
    "mentions": 5,
    "citation": 3,
    "focus": 25.5
  },
  ...
]
```

