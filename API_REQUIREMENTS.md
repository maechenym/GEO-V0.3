# GEO MVP-V1 API 需求清单

## 文档说明

本文档详细列出了 GEO MVP-V1 所需的所有 API 端点、请求参数、响应格式和字段说明，用于与后端团队和算法团队进行对齐确认。

**版本**: 1.0  
**日期**: 2025-01-XX  
**状态**: 待确认

---

## 目录

1. [认证相关 API](#1-认证相关-api)
2. [Overview 页面 API](#2-overview-页面-api)
3. [Visibility 页面 API](#3-visibility-页面-api)
4. [Sentiment 页面 API](#4-sentiment-页面-api)
5. [Sources 页面 API](#5-sources-页面-api)
6. [Queries (Intent) 页面 API](#6-queries-intent-页面-api)
7. [品牌和产品管理 API](#7-品牌和产品管理-api)
8. [团队管理 API](#8-团队管理-api)
9. [订阅计划 API](#9-订阅计划-api)
10. [Onboarding 相关 API](#10-onboarding-相关-api)
11. [通用说明](#11-通用说明)

---

## 1. 认证相关 API

### 1.1 用户注册

**端点**: `POST /api/auth/signup`

**请求参数**:
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 characters)",
  "name": "string (optional)"
}
```

**响应**:
```json
{
  "ok": true,
  "token": "string (JWT token)",
  "isNew": true
}
```

**字段说明**:
- `token`: JWT 认证令牌，用于后续 API 请求
- `isNew`: 是否为新用户（首次注册为 true）

---

### 1.2 用户登录

**端点**: `POST /api/auth/login`

**请求参数**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**响应**:
```json
{
  "ok": true,
  "token": "string (JWT token)",
  "isNew": false
}
```

---

### 1.3 Magic Link 发送

**端点**: `POST /api/auth/magic-link`

**请求参数**:
```json
{
  "email": "string (required, email format)"
}
```

**响应**:
```json
{
  "ok": true
}
```

---

### 1.4 Magic Link 验证

**端点**: `GET /api/auth/magic-link/verify?token={token}`

**请求参数**:
- `token`: string (query parameter, required)

**响应**:
```json
{
  "ok": true,
  "token": "string (JWT token)",
  "isNew": true|false
}
```

---

### 1.5 Google OAuth 回调

**端点**: `GET /api/auth/google/callback?code={code}`

**请求参数**:
- `code`: string (query parameter, required, OAuth authorization code)

**响应**:
```json
{
  "ok": true,
  "token": "string (JWT token)",
  "isNew": false
}
```

---

### 1.6 获取用户会话信息

**端点**: `GET /api/auth/session`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "ok": true,
  "profile": {
    "id": "string (user ID)",
    "email": "string (user email)",
    "hasBrand": boolean,
    "role": "Admin" | "Viewer"
  }
}
```

**字段说明**:
- `hasBrand`: 用户是否已配置品牌（用于决定是否跳转到 onboarding）
- `role`: 用户角色，Admin 可管理团队，Viewer 只能查看

---

### 1.7 用户登出

**端点**: `POST /api/auth/logout`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "ok": true
}
```

---

## 2. Overview 页面 API

### 2.1 获取 Overview 数据

**端点**: `GET /api/overview`

**请求参数** (Query Parameters):
- `startDate`: string (required, format: YYYY-MM-DD, 例如: "2025-10-31")
- `endDate`: string (required, format: YYYY-MM-DD, 例如: "2025-11-06")
- `brandId`: string (optional, 品牌ID)
- `productId`: string (optional, 产品ID)
- `model`: string (optional, 模型平台: "all" | "chatgpt" | "gemini" | "claude", 默认: "all")

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "kpis": [
    {
      "name": "Reach",
      "value": 15.5,
      "delta": 2.3,
      "unit": "%",
      "description": "Indicates how often the brand is mentioned in AI responses — higher reach means greater exposure."
    },
    {
      "name": "Rank",
      "value": 3.2,
      "delta": -0.5,
      "unit": "",
      "description": "Shows how early the brand appears in AI answers — earlier mentions suggest higher relevance or priority."
    },
    {
      "name": "Focus",
      "value": 12.8,
      "delta": 1.2,
      "unit": "%",
      "description": "Measures how much of the AI's content focuses on the brand — representing its share of attention."
    },
    {
      "name": "Sentiment",
      "value": 0.75,
      "delta": 0.05,
      "unit": "",
      "description": "Shows AI's emotional tone toward the brand, ranging from negative to positive."
    },
    {
      "name": "Visibility",
      "value": 45.2,
      "delta": 3.1,
      "unit": "%",
      "description": "Measures the brand's overall visibility score based on combined metrics including reach, focus, and sentiment."
    }
  ],
  "brandInfluence": {
    "current": 85.5,
    "previousPeriod": 82.3,
    "changeRate": 3.2,
    "trend": [
      {
        "date": "2025-11-04",
        "brandInfluence": 83.2
      },
      {
        "date": "2025-11-05",
        "brandInfluence": 85.5
      }
    ]
  },
  "ranking": [
    {
      "rank": 1,
      "name": "HPE",
      "score": 92.5,
      "delta": 0,
      "isSelf": false
    },
    {
      "rank": 2,
      "name": "英业达",
      "score": 85.5,
      "delta": 1,
      "isSelf": true
    },
    {
      "rank": 3,
      "name": "超微",
      "score": 78.3,
      "delta": -1,
      "isSelf": false
    }
  ],
  "sources": [
    {
      "domain": "wikipedia.org",
      "mentionCount": 45,
      "mentionShare": 0.25,
      "mentionsSelf": true
    },
    {
      "domain": "techradar.com",
      "mentionCount": 32,
      "mentionShare": 0.18,
      "mentionsSelf": false
    }
  ],
  "topics": [
    {
      "topic": "AI server infrastructure",
      "mentionCount": 28,
      "mentionShare": 0.15
    },
    {
      "topic": "Edge computing strategies",
      "mentionCount": 22,
      "mentionShare": 0.12
    }
  ],
  "competitorTrends": {
    "HPE": [
      {
        "date": "2025-11-04",
        "brandInfluence": 90.2
      },
      {
        "date": "2025-11-05",
        "brandInfluence": 92.5
      }
    ],
    "超微": [
      {
        "date": "2025-11-04",
        "brandInfluence": 76.8
      },
      {
        "date": "2025-11-05",
        "brandInfluence": 78.3
      }
    ]
  },
  "actualDateRange": {
    "start": "2025-11-03",
    "end": "2025-11-05"
  }
}
```

**字段说明**:

#### KPIs
- `name`: KPI 名称，固定值: "Reach" | "Rank" | "Focus" | "Sentiment" | "Visibility"
- `value`: 当前值
- `delta`: 与上一周期的变化值
  - **1天模式**: Rank 的 delta 为排名变化（整数，上升为正，下降为负）
  - **多天模式**: 其他指标的 delta 为数值变化（百分比或绝对值）
- `unit`: 单位，"" 表示无单位，"%" 表示百分比

#### Brand Influence
- `current`: 当前周期的品牌影响力得分（基于 total_score）
- `previousPeriod`: 上一周期的品牌影响力得分
- `changeRate`: 变化率（current - previousPeriod）
- `trend`: 趋势数据数组
  - `date`: 日期（YYYY-MM-DD 格式）
  - `brandInfluence`: 该日期的品牌影响力得分
  - **注意**: 文件日期代表数据收集日期，显示日期需要减1天（例如：文件日期 2025-11-06 代表收集到的是 2025-11-05 的数据）

#### Ranking
- `rank`: 排名（从1开始）
- `name`: 品牌名称
- `score`: 品牌影响力得分（基于 total_score）
- `delta`: 排名变化
  - **1天模式**: 排名变化（整数，上升为正，下降为负）
  - **多天模式**: 得分变化（数值）
- `isSelf`: 是否为本品牌

#### Sources
- `domain`: 来源网站域名
- `mentionCount`: 提及次数
- `mentionShare`: 提及占比（0-1之间）
- `mentionsSelf`: 是否提及本品牌

#### Topics
- `topic`: 主题名称
- `mentionCount`: 提及次数
- `mentionShare`: 提及占比（0-1之间）

#### Competitor Trends
- 键为品牌名称，值为该品牌的趋势数据数组（格式同 brandInfluence.trend）

#### Actual Date Range
- `start`: 实际数据开始日期（已调整，文件日期减1天）
- `end`: 实际数据结束日期（已调整，文件日期减1天）

**日期范围处理逻辑**:
- **1天模式**: 当日期范围 ≤ 2天时，使用最后一天的数据，趋势显示最后2天
- **多天模式**: 当日期范围 > 2天时，计算平均值，趋势显示所有日期

**数据来源字段** (后端需要提供):
- `mention_rate`: 提及率（0-1之间，按品牌）
- `absolute_rank`: 绝对排名（字符串或数字，例如: "3.2" 或 3.2）
- `content_share`: 内容占比（0-1之间，按品牌）
- `sentiment_score`: 情绪得分（-1到1之间，按品牌）
- `combined_score`: 综合得分（0-1之间，按品牌，用于 Visibility）
- `total_score`: 总得分（数值，按品牌，用于 Brand Influence 排名）
- `brand_domains`: 品牌域名映射（对象，键为品牌名，值为域名数组）

---

## 3. Visibility 页面 API

### 3.1 获取 Visibility 数据

**端点**: `GET /api/visibility`

**请求参数** (Query Parameters):
- `startDate`: string (required, format: YYYY-MM-DD)
- `endDate`: string (required, format: YYYY-MM-DD)
- `brandId`: string (optional)
- `productId`: string (optional)
- `model`: string (optional, "all" | "chatgpt" | "gemini" | "claude", 默认: "all")

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "visibility": {
    "ranking": [
      {
        "brand": "HPE",
        "value": 92.5,
        "delta": 0,
        "rank": 1,
        "isSelf": false
      },
      {
        "brand": "英业达",
        "value": 85.5,
        "delta": 1,
        "rank": 2,
        "isSelf": true
      }
    ],
    "trends": [
      {
        "date": "2025-11-04",
        "HPE": 90.2,
        "英业达": 83.2,
        "超微": 76.8
      },
      {
        "date": "2025-11-05",
        "HPE": 92.5,
        "英业达": 85.5,
        "超微": 78.3
      }
    ]
  },
  "reach": {
    "ranking": [
      {
        "brand": "HPE",
        "value": 18.5,
        "delta": 0,
        "rank": 1,
        "isSelf": false
      },
      {
        "brand": "英业达",
        "value": 15.5,
        "delta": 1,
        "rank": 2,
        "isSelf": true
      }
    ],
    "trends": [
      {
        "date": "2025-11-04",
        "HPE": 17.2,
        "英业达": 14.8,
        "超微": 12.3
      },
      {
        "date": "2025-11-05",
        "HPE": 18.5,
        "英业达": 15.5,
        "超微": 13.1
      }
    ]
  },
  "rank": {
    "ranking": [
      {
        "brand": "HPE",
        "value": 2.1,
        "delta": 0,
        "rank": 1,
        "isSelf": false
      },
      {
        "brand": "英业达",
        "value": 3.2,
        "delta": -1,
        "rank": 2,
        "isSelf": true
      }
    ],
    "trends": [
      {
        "date": "2025-11-04",
        "HPE": 2.3,
        "英业达": 3.5,
        "超微": 4.2
      },
      {
        "date": "2025-11-05",
        "HPE": 2.1,
        "英业达": 3.2,
        "超微": 4.0
      }
    ]
  },
  "focus": {
    "ranking": [
      {
        "brand": "HPE",
        "value": 20.5,
        "delta": 0,
        "rank": 1,
        "isSelf": false
      },
      {
        "brand": "英业达",
        "value": 12.8,
        "delta": 1,
        "rank": 2,
        "isSelf": true
      }
    ],
    "trends": [
      {
        "date": "2025-11-04",
        "HPE": 19.8,
        "英业达": 12.2,
        "超微": 10.5
      },
      {
        "date": "2025-11-05",
        "HPE": 20.5,
        "英业达": 12.8,
        "超微": 11.2
      }
    ]
  },
  "heatmap": {
    "sources": [
      {
        "name": "wikipedia.org",
        "slug": "wikipedia-org"
      },
      {
        "name": "techradar.com",
        "slug": "techradar-com"
      }
    ],
    "topics": [
      {
        "name": "AI server infrastructure",
        "slug": "ai-server-infrastructure"
      },
      {
        "name": "Edge computing strategies",
        "slug": "edge-computing-strategies"
      }
    ],
    "cells": [
      {
        "source": "wikipedia.org",
        "topic": "AI server infrastructure",
        "mentionRate": 12.5,
        "sampleCount": 15,
        "example": "Discussions about AI server infrastructure and deployment choices."
      }
    ]
  },
  "actualDateRange": {
    "start": "2025-11-03",
    "end": "2025-11-05"
  }
}
```

**字段说明**:

#### Visibility / Reach / Rank / Focus
每个指标包含两个部分：
- `ranking`: 排名列表
  - `brand`: 品牌名称
  - `value`: 指标值
    - Visibility: 百分比（0-100）
    - Reach: 百分比（0-100）
    - Rank: 排名数值（越小越好，例如 2.1 表示平均排名第2.1位）
    - Focus: 百分比（0-100）
  - `delta`: 排名变化（1天模式为整数，多天模式为数值变化）
  - `rank`: 当前排名
  - `isSelf`: 是否为本品牌
- `trends`: 趋势数据数组
  - `date`: 日期（YYYY-MM-DD 格式）
  - 动态字段：每个品牌名称作为键，值为该品牌的指标值

#### Heatmap
- `sources`: 来源列表（Top 5-8）
  - `name`: 来源名称（域名）
  - `slug`: URL友好的标识符
- `topics`: 主题列表（Top 5-8）
  - `name`: 主题名称
  - `slug`: URL友好的标识符
- `cells`: 热力图单元格数据
  - `source`: 来源名称
  - `topic`: 主题名称
  - `mentionRate`: 提及率（百分比，0-100）
  - `sampleCount`: 样本数量
  - `example`: 示例文本

**数据来源字段** (后端需要提供):
- `combined_score`: 综合得分（用于 Visibility，0-1之间，按品牌）
- `mention_rate`: 提及率（用于 Reach，0-1之间，按品牌）
- `absolute_rank`: 绝对排名（用于 Rank，字符串或数字）
- `content_share`: 内容占比（用于 Focus，0-1之间，按品牌）
- `brand_domains`: 品牌域名映射（用于热力图来源）
- `aggregated_sentiment_detail`: 聚合情绪详情（用于热力图主题）
  - `positive_aspects`: 正向方面数组
  - `negative_aspects`: 负向方面数组

---

## 4. Sentiment 页面 API

### 4.1 获取 Sentiment 数据

**端点**: `GET /api/sentiment`

**请求参数** (Query Parameters):
- `startDate`: string (required, format: YYYY-MM-DD)
- `endDate`: string (required, format: YYYY-MM-DD)
- `brandId`: string (optional)
- `productId`: string (optional)
- `model`: string (optional, "all" | "gpt" | "gemini" | "claude", 默认: "all")
  - `all`: 所有模型的数据（使用 overall 数据）
  - `gpt`: 仅 ChatGPT 模型数据
  - `gemini`: 仅 Gemini 模型数据
  - `claude`: 仅 Claude 模型数据

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "kpis": {
    "sov": 15.5,
    "sentimentIndex": 0.75,
    "positive": 65.0,
    "neutral": 25.0,
    "negative": 10.0
  },
  "trends": [
    {
      "date": "11/04",
      "HPE": 0.82,
      "英业达": 0.75,
      "超微": 0.68
    },
    {
      "date": "11/05",
      "HPE": 0.85,
      "英业达": 0.78,
      "超微": 0.70
    }
  ],
  "ranking": [
    {
      "brand": "华为",
      "value": 0.96,
      "delta": 0,
      "rank": 1,
      "isSelf": false
    },
    {
      "brand": "英业达",
      "value": 0.75,
      "delta": 1,
      "rank": 2,
      "isSelf": true
    }
  ],
  "riskTopics": [],
  "actualDateRange": {
    "start": "2025-11-03",
    "end": "2025-11-05"
  }
}
```

**字段说明**:

#### KPIs
- `sov`: Share of Voice，声量占比（百分比，0-100）
- `sentimentIndex`: 情绪指数（0-1之间，与 Overview 的 Sentiment 一致）
- `positive`: 正向情绪占比（百分比，0-100）
- `neutral`: 中立情绪占比（百分比，0-100）
- `negative`: 负向情绪占比（百分比，0-100）
- **注意**: positive + neutral + negative = 100%

#### Trends
- `date`: 日期（多天模式为 MM/dd 格式，1天模式为 YYYY-MM-DD）
- 动态字段：每个品牌名称作为键，值为该品牌的情绪指数（0-1）

#### Ranking
- `brand`: 品牌名称
- `value`: 情绪指数（0-1之间）
- `delta`: 排名变化（整数，上升为正，下降为负）
- `rank`: 当前排名
- `isSelf`: 是否为本品牌

#### Risk Topics
- 当前为空数组，后续版本需要实现
- 预期格式：
  ```json
  [
    {
      "id": "string",
      "prompt": "string",
      "answer": "string",
      "sources": 5,
      "sentiment": -0.5,
      "optimization": "string (optional)",
      "sourceUrl": "string (optional)"
    }
  ]
  ```

**数据来源字段** (后端需要提供):
- `total_score`: 总得分（用于计算 SOV，按品牌）
- `sentiment_score`: 情绪得分（0-1之间，按品牌）
- `aggregated_sentiment_detail`: 聚合情绪详情（用于提取 Risk Topics）
  - `positive_aspects`: 正向方面数组
  - `negative_aspects`: 负向方面数组

**模型筛选说明**:
- 当 `model` 参数为 `all` 时，使用数据中的 `overall` 字段
- 当 `model` 参数为 `gpt` 时，使用数据中的 `chatgpt` 字段（如果不存在，回退到 `overall`）
- 当 `model` 参数为 `gemini` 时，使用数据中的 `gemini` 字段（如果不存在，回退到 `overall`）
- 当 `model` 参数为 `claude` 时，使用数据中的 `claude` 字段（如果不存在，回退到 `overall`）
- 所有计算（KPIs、Trends、Ranking）都应基于选定模型的数据

---

## 5. Sources 页面 API

### 5.1 获取 Sources 数据

**端点**: `GET /api/sources`

**请求参数** (Query Parameters):
- `startDate`: string (required, format: YYYY-MM-DD)
- `endDate`: string (required, format: YYYY-MM-DD)
- `brandId`: string (optional)
- `productId`: string (optional)
- `model`: string (optional, "all" | "chatgpt" | "gemini" | "claude", 默认: "all")
- `type`: string (optional, 来源类型筛选: "all" | "News" | "Blog" | "Forum" | ...)
- `mentioned`: string (optional, 是否提及本品牌: "all" | "yes" | "no")
- `sortBy`: string (optional, 排序字段: "citationRate" | "domain", 默认: "citationRate")
- `sortOrder`: string (optional, 排序方向: "asc" | "desc", 默认: "desc")
- `page`: number (optional, 页码，从1开始，默认: 1)
- `pageSize`: number (optional, 每页数量，默认: 7)

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "sources": [
    {
      "domain": "wikipedia.org",
      "type": "Encyclopedia",
      "citationRate": 0.25,
      "mentioned": true,
      "mentions": 15,
      "totalMentions": 45
    },
    {
      "domain": "techradar.com",
      "type": "News",
      "citationRate": 0.18,
      "mentioned": false,
      "mentions": 8,
      "totalMentions": 32
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 7,
    "total": 20,
    "totalPages": 3
  },
  "distribution": [
    {
      "type": "Encyclopedia",
      "count": 45,
      "percentage": 0.35,
      "mentionedCount": 12,
      "mentionedPercentage": 0.27
    },
    {
      "type": "News",
      "count": 32,
      "percentage": 0.25,
      "mentionedCount": 8,
      "mentionedPercentage": 0.25
    }
  ],
  "actualDateRange": {
    "start": "2025-11-03",
    "end": "2025-11-05"
  }
}
```

**字段说明**:

#### Sources
- `domain`: 来源域名
- `type`: 来源类型（例如: "News", "Blog", "Forum", "Encyclopedia", "Technical"）
- `citationRate`: 引用率（0-1之间，该来源在回答中被引用的频率）
- `mentioned`: 是否提及本品牌（boolean）
- `mentions`: 该来源中提及的品牌数量
- `totalMentions`: 该来源的总提及次数

#### Pagination
- `page`: 当前页码
- `pageSize`: 每页数量
- `total`: 总记录数
- `totalPages`: 总页数

#### Distribution
- `type`: 来源类型
- `count`: 该类型的来源总数
- `percentage`: 该类型占比（0-1之间）
- `mentionedCount`: 该类型中提及本品牌的来源数量
- `mentionedPercentage`: 该类型中提及本品牌的占比（0-1之间）

**数据来源字段** (后端需要提供):
- `brand_domains`: 品牌域名映射（对象，键为品牌名，值为域名数组）
- 需要提供来源类型分类（可通过域名或URL分析得出）

**模型筛选说明**:
- 当 `model` 参数为 `all` 时，使用数据中的 `overall` 字段
- 当 `model` 参数为 `gpt` 时，使用数据中的 `chatgpt` 字段（如果不存在，回退到 `overall`）
- 当 `model` 参数为 `gemini` 时，使用数据中的 `gemini` 字段（如果不存在，回退到 `overall`）
- 当 `model` 参数为 `claude` 时，使用数据中的 `claude` 字段（如果不存在，回退到 `overall`）
- 所有来源数据（sources、distribution）都应基于选定模型的数据

---

## 6. Queries (Intent) 页面 API

### 6.1 获取 Queries 数据

**端点**: `GET /api/queries` 或 `GET /api/intent`

**请求参数** (Query Parameters):
- `startDate`: string (required, format: YYYY-MM-DD)
- `endDate`: string (required, format: YYYY-MM-DD)
- `brandId`: string (optional)
- `productId`: string (optional)
- `model`: string (optional, "all" | "gpt" | "gemini" | "claude", 默认: "all")
  - `all`: 所有模型的数据（使用 overall 数据）
  - `gpt`: 仅 ChatGPT 模型数据
  - `gemini`: 仅 Gemini 模型数据
  - `claude`: 仅 Claude 模型数据
- `sortBy`: string (optional, 排序字段: "reach" | "rank" | "focus" | "sentiment", 默认: "reach")
- `sortOrder`: string (optional, 排序方向: "asc" | "desc", 默认: "desc")

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "kpis": {
    "coreQueries": 12,
    "totalQueries": 180
  },
  "intentDistribution": [
    {
      "intentKey": "Information",
      "label": "检索",
      "count": 85,
      "percentage": 47.2,
      "color": "#3B82F6"
    },
    {
      "intentKey": "Advice",
      "label": "建议",
      "count": 45,
      "percentage": 25.0,
      "color": "#10B981"
    },
    {
      "intentKey": "Evaluation",
      "label": "评估",
      "count": 30,
      "percentage": 16.7,
      "color": "#F59E0B"
    },
    {
      "intentKey": "Comparison",
      "label": "比较",
      "count": 15,
      "percentage": 8.3,
      "color": "#8B5CF6"
    },
    {
      "intentKey": "Other",
      "label": "其他",
      "count": 5,
      "percentage": 2.8,
      "color": "#6B7280"
    }
  ],
  "topics": [
    {
      "topic": "AI server infrastructure",
      "totalQueries": 25,
      "reach": 0.65,
      "rank": 3.2,
      "focus": 0.15,
      "sentiment": 0.75,
      "coreQueries": [
        {
          "prompt": "What are the best AI server solutions?",
          "answer": "The best AI server solutions include...",
          "intent": "Information",
          "mentions": 8,
          "rank": 2.5,
          "focus": 0.18,
          "citation": 5
        }
      ]
    }
  ],
  "actualDateRange": {
    "start": "2025-11-03",
    "end": "2025-11-05"
  }
}
```

**字段说明**:

#### KPIs
- `coreQueries`: 核心查询数量（总结后的查询数量）
- `totalQueries`: 总查询数量（原始查询数量，通常比核心查询多15倍以上）

#### Intent Distribution
- `intentKey`: 意图键值（"Information" | "Advice" | "Evaluation" | "Comparison" | "Other"）
- `label`: 显示标签（中文或英文）
- `count`: 该意图的查询数量
- `percentage`: 占比（百分比，0-100）
- `color`: 颜色代码（用于图表显示）

#### Topics
- `topic`: 主题名称
- `totalQueries`: 该主题下的总查询数
- `reach`: 提及率（0-1之间，本品牌在该主题下的提及率）
- `rank`: 排名（数值，越小越好）
- `focus`: 内容占比（0-1之间）
- `sentiment`: 情绪得分（0-1之间）
- `coreQueries`: 核心查询列表
  - `prompt`: 查询问题
  - `answer`: AI回复
  - `intent`: 意图类型
  - `mentions`: 提及的品牌数量
  - `rank`: 排名（数值）
  - `focus`: 内容占比（0-1之间）
  - `citation`: 引用来源数量

**数据来源字段** (后端需要提供):
- 需要提供原始查询数据（prompt, answer, intent）
- 需要提供查询的主题分类
- 需要提供每个查询的品牌提及信息（reach, rank, focus, sentiment）
- 需要提供查询的引用来源信息

**模型筛选说明**:
- 当 `model` 参数为 `all` 时，使用数据中的 `overall` 字段
- 当 `model` 参数为 `gpt` 时，使用数据中的 `chatgpt` 字段（如果不存在，回退到 `overall`）
- 当 `model` 参数为 `gemini` 时，使用数据中的 `gemini` 字段（如果不存在，回退到 `overall`）
- 当 `model` 参数为 `claude` 时，使用数据中的 `claude` 字段（如果不存在，回退到 `overall`）
- 所有查询数据（KPIs、Topics、Prompts）都应基于选定模型的数据

---

## 7. 品牌和产品管理 API

### 7.1 获取品牌列表

**端点**: `GET /api/brands`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "brands": [
    {
      "id": "brand_123",
      "name": "英业达 (Inventec)",
      "description": "品牌描述...",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7.2 获取品牌详情

**端点**: `GET /api/brands/{brandId}`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "brand": {
    "id": "brand_123",
    "name": "英业达 (Inventec)",
    "description": "品牌描述...",
    "logo": "/uploads/brands/logo_123.png",
    "website": "https://www.inventec.com",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 7.3 创建品牌

**端点**: `POST /api/brands`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "website": "string (optional, URL format)",
  "logo": "string (optional, logo URL)"
}
```

**响应**:
```json
{
  "brand": {
    "id": "brand_123",
    "name": "英业达 (Inventec)",
    "description": "品牌描述...",
    "website": "https://www.inventec.com",
    "logo": "/uploads/brands/logo_123.png",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

**字段说明**:
- `name`: 品牌名称（必填）
- `description`: 品牌描述（可选）
- `website`: 品牌网站（可选，URL 格式）
- `logo`: 品牌Logo URL（可选，通过文件上传API获取）

**功能说明**:
- 创建新的品牌记录
- 返回创建的品牌信息
- 创建品牌后，可能需要更新用户状态（`hasBrand: true`）

**错误响应**:
- 如果品牌名称为空，返回 `400 Bad Request`
- 如果用户未认证，返回 `401 Unauthorized`

**注意事项**:
- 此 API 为基本版本，仅创建品牌基本信息
- 如需在创建品牌时同时创建产品、用户角色、竞争对手等，请参考第10.3节（Onboarding 相关 API）

---

### 7.4 获取品牌下的产品列表

**端点**: `GET /api/brands/{brandId}/products`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "products": [
    {
      "id": "product_123",
      "name": "机架解决方案",
      "category": "Server",
      "active": true,
      "logo": "/uploads/products/logo_123.png",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7.5 创建产品

**端点**: `POST /api/brands/{brandId}/products`

**请求参数**:
```json
{
  "name": "string (required)",
  "category": "string (optional)",
  "logo": "string (optional, logo URL)"
}
```

**响应**:
```json
{
  "product": {
    "id": "product_123",
    "name": "机架解决方案",
    "category": "Server",
    "active": true,
    "logo": "/uploads/products/logo_123.png",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

**字段说明**:
- `name`: 产品名称（必填）
- `category`: 产品类别（可选）
- `logo`: 产品Logo URL（可选，通过文件上传API获取）

---

### 7.6 更新品牌

**端点**: `PATCH /api/brands/{brandId}`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "website": "string (optional, URL format)",
  "logo": "string (optional, logo URL)"
}
```

**响应**:
```json
{
  "brand": {
    "id": "brand_123",
    "name": "英业达 (Inventec)",
    "description": "品牌描述...",
    "website": "https://www.inventec.com",
    "logo": "/uploads/brands/logo_123.png",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

**字段说明**:
- `name`: 品牌名称（可选）
- `description`: 品牌描述（可选）
- `website`: 品牌网站（可选，URL 格式）
- `logo`: 品牌Logo URL（可选，通过文件上传API获取）

---

### 7.7 更新产品

**端点**: `PATCH /api/products/{productId}`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "name": "string (optional)",
  "category": "string (optional)",
  "active": "boolean (optional)",
  "logo": "string (optional, logo URL)"
}
```

**响应**:
```json
{
  "product": {
    "id": "product_123",
    "name": "机架解决方案",
    "category": "Server",
    "active": true,
    "logo": "/uploads/products/logo_123.png",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

**字段说明**:
- `name`: 产品名称（可选）
- `category`: 产品类别（可选）
- `active`: 产品状态（可选）
- `logo`: 产品Logo URL（可选，通过文件上传API获取）

---

### 7.8 删除产品

**端点**: `DELETE /api/products/{productId}`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "ok": true
}
```

---

### 7.9 文件上传 API

**端点**: `POST /api/upload`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数** (FormData):
- `file`: File (required) - 图片文件
- `type`: string (required) - 上传类型，值为 "brand" 或 "product"

**支持的文件类型**:
- image/jpeg
- image/png
- image/gif
- image/webp
- image/svg+xml

**文件大小限制**: 5MB

**响应**:
```json
{
  "ok": true,
  "url": "/uploads/brands/abc123def456.png",
  "fileName": "abc123def456.png",
  "size": 12345,
  "type": "image/png"
}
```

**字段说明**:
- `ok`: 上传是否成功
- `url`: 上传后的文件URL（相对于public目录）
- `fileName`: 生成的文件名
- `size`: 文件大小（字节）
- `type`: 文件MIME类型

**错误响应**:
- 如果文件未提供，返回 `400 Bad Request`
- 如果文件类型不支持，返回 `400 Bad Request`
- 如果文件大小超过限制，返回 `400 Bad Request`
- 如果用户未认证，返回 `401 Unauthorized`

**功能说明**:
- 上传的文件会保存到 `public/uploads/{type}/` 目录
- 文件会被重命名为随机生成的唯一文件名
- 返回的URL可以直接用于品牌或产品的logo字段

**使用示例**:
```javascript
const formData = new FormData()
formData.append("file", file)
formData.append("type", "brand")

const response = await fetch("/api/upload", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
})

const data = await response.json()
// data.url 可以用于更新品牌或产品的logo字段
```

---

## 8. 团队管理 API

### 8.1 获取团队成员列表

**端点**: `GET /api/team/members`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "members": [
    {
      "id": "member_123",
      "email": "user@example.com",
      "role": "Admin",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "limit": 10
}
```

---

### 8.2 邀请团队成员

**端点**: `POST /api/team/members/invite`

**请求参数**:
```json
{
  "email": "string (required, email format)",
  "role": "Admin" | "Viewer" (required)
}
```

**响应**:
```json
{
  "ok": true,
  "member": {
    "id": "member_123",
    "email": "user@example.com",
    "role": "Admin",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 8.3 删除团队成员

**端点**: `DELETE /api/team/members/{memberId}`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "ok": true
}
```

---

## 9. 订阅计划 API

### 9.1 获取订阅计划列表

**端点**: `GET /api/plan/list`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "plans": [
    {
      "id": "free_trial",
      "name": "Free Trial",
      "price": 0,
      "currency": "USD",
      "features": {
        "maxProducts": 1,
        "maxCompetitors": 5,
        "maxQueries": 100
      }
    },
    {
      "id": "basic",
      "name": "Basic",
      "price": 99,
      "currency": "USD",
      "features": {
        "maxProducts": 3,
        "maxCompetitors": 10,
        "maxQueries": 500
      }
    }
  ]
}
```

---

### 9.2 获取当前订阅信息

**端点**: `GET /api/plan/current`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "plan": {
    "id": "trial",
    "name": "Free Trial",
    "status": "active",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-08T00:00:00Z",
    "remainingDays": 4,
    "isTrial": true
  }
}
```

**字段说明**:
- `plan`: 当前订阅计划信息，如果用户没有订阅则为 `null`
- `id`: 计划ID（例如: "trial", "basic", "advanced", "enterprise"）
- `name`: 计划名称（显示名称）
- `status`: 订阅状态（"active" | "trialing" | "past_due" | "canceled" | "unpaid"）
- `startDate`: 订阅开始日期（ISO 8601 格式）
- `endDate`: 订阅结束日期（ISO 8601 格式）
- `remainingDays`: 剩余使用天数（整数，从结束日期到当前日期的天数）
- `isTrial`: 是否为试用计划（boolean）

**错误响应**:
- 如果用户没有订阅，返回 `plan: null`
- 如果 API 未实现，返回 `501 Not Implemented`

---

### 9.3 激活订阅计划

**端点**: `POST /api/plan/activate`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "payment_method_id": "string (required, Stripe payment method ID)"
}
```

**响应**:
```json
{
  "trialEndsAt": "2025-01-08T00:00:00Z",
  "plan": "trial"
}
```

**字段说明**:
- `payment_method_id`: Stripe 支付方式 ID（通过 `/api/stripe/create-setup-intent` 获取）
- `trialEndsAt`: 试用结束时间（ISO 8601 格式，当前时间 + 7 天）
- `plan`: 计划类型（"trial" 表示试用计划）

**功能说明**:
- 创建或获取 Stripe Customer
- 将支付方式附加到 Customer
- 设置默认支付方式
- 创建订阅（带 7 天试用期）
- 返回试用结束时间

**错误响应**:
- 如果 `payment_method_id` 缺失，返回 `400 Bad Request`
- 如果 Stripe 配置错误，返回 `500 Internal Server Error`

---

## 10. Onboarding 相关 API

### 10.1 加入等待列表

**端点**: `POST /api/onboarding/waitlist`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "brandName": "string (required)",
  "productName": "string (required)"
}
```

**响应**:
```json
{
  "ok": true,
  "message": "Successfully joined waitlist"
}
```

**字段说明**:
- `brandName`: 品牌名称（必填）
- `productName`: 产品名称（必填）

**功能说明**:
- 创建品牌记录
- 创建品牌下的第一个产品
- 将用户添加到等待列表
- 更新用户状态，标记为已完成 onboarding（`hasBrand: true`）
- 发送确认邮件（可选）

**错误响应**:
- 如果品牌名称或产品名称为空，返回 `400 Bad Request`
- 如果用户未认证，返回 `401 Unauthorized`

**注意事项**:
- 此 API 用于 onboarding 流程中的最后一步
- 调用成功后，用户状态会更新为 `hasBrand: true`
- 用户可以直接访问 overview 页面

---

### 10.2 创建 Stripe 支付设置意图

**端点**: `POST /api/stripe/create-setup-intent`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**: 无

**响应**:
```json
{
  "client_secret": "seti_xxxxx_secret_xxxxx"
}
```

**字段说明**:
- `client_secret`: Stripe SetupIntent 的客户端密钥，用于在前端确认支付方式

**功能说明**:
- 创建 Stripe SetupIntent（用于收集支付方式，不立即扣费）
- 返回 `client_secret`，前端使用 Stripe Elements 收集支付信息
- 用于设置页面中的支付方式设置（settings/plan）

**错误响应**:
- 如果 Stripe 配置错误，返回 `500 Internal Server Error`
- 如果未配置 `STRIPE_SECRET_KEY`，返回 `500 Internal Server Error`

**注意事项**:
- 此 API 仅用于收集支付方式，不会立即扣费
- 需要在后端配置 Stripe Secret Key
- 前端需要使用 Stripe.js 和 Stripe Elements 来处理支付

---

### 10.3 创建品牌（Onboarding 使用）

**说明**: 
- **Onboarding 流程**: 现在 onboarding 流程只需要调用 `POST /api/onboarding/waitlist`（参考 10.1 节），该 API 会自动创建品牌和产品。
- **其他用途**: 此 API 可用于其他场景（如设置页面中手动创建品牌）。后端可以实现以下两种方式之一：

#### 方式一：扩展 POST /api/brands API

**端点**: `POST /api/brands`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "string (required)",
  "website": "string (optional, URL format)",
  "productName": "string (required)"
}
```

**响应**:
```json
{
  "brand": {
    "id": "brand_123",
    "name": "英业达 (Inventec)",
    "website": "https://www.inventec.com",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  },
  "product": {
    "id": "product_123",
    "name": "机架解决方案",
    "brandId": "brand_123",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### 方式二：分步骤调用多个 API

1. **创建品牌**: `POST /api/brands` (参考第7.3节)
2. **创建产品**: `POST /api/brands/{brandId}/products` (参考第7.5节)

**字段说明**:
- `name`: 品牌名称（必填）
- `website`: 品牌网站（可选，URL 格式）
- `productName`: 产品名称（必填）

**功能说明**:
- 创建品牌记录
- 创建品牌下的第一个产品
- 更新用户状态，标记为已完成 onboarding（`hasBrand: true`）

**注意**: 
- 当前 onboarding 流程只需要品牌名称和产品名称
- Personas、Competitors 和 Prompts 功能已移除

**错误响应**:
- 如果品牌名称或产品名称为空，返回 `400 Bad Request`
- 如果用户未认证，返回 `401 Unauthorized`

**注意事项**:
- 当前前端实现使用本地存储（localStorage）保存 onboarding 数据
- 后端需要决定采用方式一（一次性API）还是方式二（分步API）
- 创建品牌后，用户状态需要更新为 `hasBrand: true`
- 后续可以通过 `/api/brands/{brandId}` 获取品牌详情

---

## 11. 通用说明

### 11.1 认证

所有需要认证的 API 都需要在请求头中包含：
```
Authorization: Bearer {token}
```

如果 token 无效或过期，返回：
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```
状态码: `401`

---

### 11.2 错误处理

所有 API 错误响应格式：
```json
{
  "error": "string (错误类型)",
  "message": "string (错误描述，可选)"
}
```

常见错误状态码：
- `400`: Bad Request（请求参数错误）
- `401`: Unauthorized（未认证或token无效）
- `403`: Forbidden（无权限）
- `404`: Not Found（资源不存在）
- `500`: Internal Server Error（服务器错误）

---

### 11.3 日期格式

- 所有日期参数使用 `YYYY-MM-DD` 格式（例如: "2025-11-06"）
- 所有日期响应字段使用 `YYYY-MM-DD` 格式或 ISO 8601 格式（例如: "2025-11-06T00:00:00Z"）
- **重要**: 文件日期代表数据收集日期，显示日期需要减1天

---

### 11.4 日期范围处理

**1天模式**:
- 当日期范围 ≤ 2天时
- 使用最后一天的数据作为当前值
- 使用前一天的数据作为对比值（用于计算 delta）
- 趋势数据显示最后2天

**多天模式**:
- 当日期范围 > 2天时
- 计算所有日期的平均值作为当前值
- 计算上一周期（等长）的平均值作为对比值
- 趋势数据显示所有日期

---

### 11.5 数据模型映射

**品牌名称识别**:
- 系统需要识别以下品牌名称变体作为"本品牌"：
  - "英业达"
  - "英業達"
  - "Your Brand"
  - "Inventec"

**模型平台映射**:
- `model` 参数值映射：
  - "all" → "overall"
  - "chatgpt" → "chatgpt"
  - "gemini" → "gemini"
  - "claude" → "claude"

---

### 11.6 数据文件结构

后端需要提供的数据文件结构（JSON格式）：
```json
{
  "产品名称": [
    ["日期", {
      "overall": {
        "mention_rate": { "品牌名": 0.15 },
        "absolute_rank": { "品牌名": "3.2" },
        "content_share": { "品牌名": 0.12 },
        "sentiment_score": { "品牌名": 0.75 },
        "combined_score": { "品牌名": 0.45 },
        "total_score": { "品牌名": 85.5 },
        "brand_domains": { "品牌名": ["wikipedia.org", "techradar.com"] },
        "aggregated_sentiment_detail": {
          "品牌名": {
            "positive_aspects": ["aspect1", "aspect2"],
            "negative_aspects": ["aspect3"]
          }
        }
      },
      "chatgpt": { ... },
      "gemini": { ... },
      "claude": { ... }
    }]
  ]
}
```

---

### 11.7 分页

支持分页的 API 使用以下参数：
- `page`: 页码（从1开始）
- `pageSize`: 每页数量（默认值根据API不同）

响应中包含分页信息：
```json
{
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 11.8 排序

支持排序的 API 使用以下参数：
- `sortBy`: 排序字段
- `sortOrder`: 排序方向（"asc" | "desc"）

---

## 附录：数据字段对照表

### Overview 页面所需字段

| 前端显示 | 后端字段 | 说明 | 格式 |
|---------|---------|------|------|
| Reach | `mention_rate[品牌名]` | 提及率 | 0-1 (需转换为百分比) |
| Rank | `absolute_rank[品牌名]` | 绝对排名 | 字符串或数字 |
| Focus | `content_share[品牌名]` | 内容占比 | 0-1 (需转换为百分比) |
| Sentiment | `sentiment_score[品牌名]` | 情绪得分 | -1到1 (或0-1) |
| Visibility | `combined_score[品牌名]` | 综合得分 | 0-1 (需转换为百分比) |
| Brand Influence | `total_score[品牌名]` | 总得分 | 数值 |
| Sources | `brand_domains[品牌名]` | 品牌域名数组 | 字符串数组 |
| Topics | `aggregated_sentiment_detail[品牌名].positive_aspects`<br>`aggregated_sentiment_detail[品牌名].negative_aspects` | 正向/负向方面 | 字符串数组 |

### Visibility 页面所需字段

| 前端显示 | 后端字段 | 说明 | 格式 |
|---------|---------|------|------|
| Visibility | `combined_score[品牌名]` | 综合得分 | 0-1 (需转换为百分比) |
| Reach | `mention_rate[品牌名]` | 提及率 | 0-1 (需转换为百分比) |
| Rank | `absolute_rank[品牌名]` | 绝对排名 | 字符串或数字 |
| Focus | `content_share[品牌名]` | 内容占比 | 0-1 (需转换为百分比) |
| Heatmap Sources | `brand_domains[品牌名]` | 品牌域名数组 | 字符串数组 |
| Heatmap Topics | `aggregated_sentiment_detail[品牌名].positive_aspects`<br>`aggregated_sentiment_detail[品牌名].negative_aspects` | 正向/负向方面 | 字符串数组 |

### Sentiment 页面所需字段

| 前端显示 | 后端字段 | 说明 | 格式 |
|---------|---------|------|------|
| SOV | `total_score[品牌名]` / `sum(total_score)` | 声量占比 | 百分比 |
| Sentiment Index | `sentiment_score[品牌名]` | 情绪指数 | 0-1 |
| Positive/Neutral/Negative | 基于 `sentiment_score` 计算 | 情绪分布 | 百分比 |
| Risk Topics | `aggregated_sentiment_detail[品牌名].negative_aspects` | 风险话题 | 字符串数组 |

---

## 确认清单

### 后端团队需要确认：

- [ ] 所有 API 端点路径是否正确
- [ ] 请求参数格式是否符合要求
- [ ] 响应数据格式是否完整
- [ ] 日期范围处理逻辑是否正确（1天模式 vs 多天模式）
- [ ] 日期调整逻辑是否正确（文件日期减1天）
- [ ] 品牌名称识别逻辑是否正确
- [ ] 模型平台映射是否正确
- [ ] 数据文件结构是否符合要求
- [ ] 错误处理是否完整
- [ ] 认证机制是否正确

### 算法团队需要确认：

- [ ] `mention_rate` 的计算方法
- [ ] `absolute_rank` 的计算方法和格式
- [ ] `content_share` 的计算方法
- [ ] `sentiment_score` 的计算方法和范围（-1到1 还是 0到1）
- [ ] `combined_score` 的计算方法（用于 Visibility）
- [ ] `total_score` 的计算方法（用于 Brand Influence）
- [ ] 主题（Topics）的提取方法
- [ ] 意图（Intent）的分类方法
- [ ] 来源类型（Source Type）的分类方法
- [ ] Risk Topics 的提取方法

---

**文档版本**: 1.0  
**最后更新**: 2025-01-XX  
**维护者**: Frontend Team

