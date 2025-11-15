# Sources 页面 API 接口文档

## 一、接口总览

| 序号 | UI 元素位置 | 对应 API 字段 | API 路径 / 契约 | 说明 |
|------|------------|--------------|-----------------|------|
| 1 | Header 过滤条（日期 / 模型 / 类型筛选） | `filters.availableTypes[]`<br>`actualDateRange.start`<br>`actualDateRange.end` | `GET /api/sources`<br>查询参数: `startDate`, `endDate`, `model`, `language`, `productId?`, `brandId?`, `type?`, `mentioned?` | 返回可选类型列表与最终日期范围，并依据过滤器返回表格数据。 |
| 2 | KPI 概览（若启用） | `kpis.totalMentions`<br>`kpis.avgFrequency`<br>`kpis.topSource`<br>`kpis.mentionGrowth` | 同上 | 供顶部 Summary 使用，可按需扩展。 |
| 3 | Top Sources 表格 | `sources.rows[]` | 同上 | 每行包含 `id`, `url`, `type`, `share`, `shareChange`, `mentionRate`, `mentionRateChange`, `rank`, `mentioned`, `mentions[]`。 |
| 4 | 类型筛选下拉 | `filters.availableTypes[]` | 同上 | 为“Type”列上方下拉选项；值与 `sources.rows[].type` 对齐。 |
| 5 | “Mentioned” 筛选 | `filters.availableMentionStatus` | 同上 | 值为 `["all","yes","no"]`，对应是否提及本品牌。 |
| 6 | Citation Rate 排序 | `sources.sortableFields.share` | 同上 | API 可返回默认排序字段与方向；前端在点击箭头后带参数重新请求（例如 `sort=share&order=desc`）。 |
| 7 | 来源类别分布图（右侧图表） | `distribution.topSources[]` | 同上 | 仅取前 N 个来源，用于柱状图/环形图显示。字段：`type`, `share`, `brandShare`, `mentioned`。 |
| 8 | 详情展开列表 | `sources.rows[].mentions[]` | 同上 | 展开一行时显示引用中提到的品牌数组。 |

## 二、请求与响应示例

```http
GET /api/sources?startDate=2025-11-08&endDate=2025-11-14&model=all&language=zh-TW&productId=product_inventec_1
Authorization: Bearer {token}
```

```json
{
  "actualDateRange": { "start": "2025-11-08", "end": "2025-11-14" },
  "filters": {
    "availableTypes": ["News", "Tech Blog", "UGC", "Social Media", "Knowledge Base", "Academic"],
    "availableMentionStatus": ["all", "yes", "no"]
  },
  "kpis": {
    "totalMentions": 1234,
    "avgFrequency": 85.5,
    "topSource": "sohu.com",
    "mentionGrowth": 12.5
  },
  "sources": {
    "rows": [
      {
        "id": "s1",
        "url": "sohu.com",
        "type": "News",
        "share": 30.1,
        "shareChange": 4.2,
        "mentionRate": 40.0,
        "mentionRateChange": 5.0,
        "rank": 1,
        "mentioned": true,
        "mentions": ["英業達", "廣達", "仁寶"]
      },
      {
        "id": "s2",
        "url": "adreamertech.com.cn",
        "type": "Tech Blog",
        "share": 26.8,
        "shareChange": 2.1,
        "mentionRate": 35.0,
        "mentionRateChange": 3.0,
        "rank": 2,
        "mentioned": true,
        "mentions": ["英業達", "仁寶"]
      }
    ]
  },
  "distribution": {
    "topSources": [
      { "type": "News", "share": 30.1, "brandShare": 18.5, "mentioned": true },
      { "type": "Tech Blog", "share": 26.8, "brandShare": 14.7, "mentioned": true },
      { "type": "UGC", "share": 9.5, "brandShare": 5.2, "mentioned": false }
    ]
  }
}
```

## 三、额外说明

1. **查询参数**  
   - `type`: 可选，过滤来源类别；值与 `availableTypes` 中一致。  
   - `mentioned`: `all` / `yes` / `no`；用于区分是否提及本品牌。  
   - `sort` / `order`: 可选，定义表格排序字段与方向。常用字段：`share`, `mentionRate`, `rank`。

2. **字段说明**  
   - `share`: 该来源在所有引用中的占比（%）。  
   - `mentionRate`: 该来源中提及本品牌的比例（%）。  
   - `mentioned`: 布尔值，指该来源是否提及本品牌。  
   - `mentions[]`: 展开详情时展示的品牌列表。  
   - `distribution.topSources` 用于右侧图表，`brandShare` 表示该来源中提及本品牌的占比。

3. **本地化**  
   - `language=zh-TW` 时，`type`/`url` 标签会进行繁体转换（若配置了对应翻译）。  
   - 响应中可包含 `translations` 字段（可选）以提供额外文本映射。

4. **错误与状态码**  
   - 错误响应统一 `{ error: string, message?: string }`。  
   - 状态码：200 成功；400 参数错误；401 未授权；404 无数据；500 服务异常。  


