# 数据映射关系核对清单

## ✅ 已确认的字段

### 基础字段（完全匹配）
- ✅ `mention_rate` - 提及率 (0-1)
- ✅ `content_share` - 内容份额 (0-1)
- ✅ `brand_domains` - 品牌域名列表
- ✅ `combined_score` - 综合分数 (0-1)
- ✅ `sentiment_score` - 情感分数 (0-1)
- ✅ `total_score` - 总分
- ✅ `absolute_rank` - 绝对排名 (格式: "3.9/4.8")
- ✅ `aggregated_sentiment_detail` - 聚合情感详情
  - ✅ `positive_aspects` - 正面描述列表
  - ✅ `negative_aspects` - 负面描述列表
- ✅ 所有 `*_avg` 平均字段

### 新增字段（已添加，待填写数据）
- ✅ `topics[]` - 主题数据（空数组）
- ✅ `queries[]` - 查询数据（空数组）
- ✅ `response[]` - 回复数据（空数组）
- ✅ `brand_name` - 品牌名称
- ✅ `product_name` - 产品名称

---

## ❓ 需要确认的映射关系

### 1. 品牌名称识别
**问题**: JSON 中的品牌名是中文（如 "英业达"、"华勤技术"、"闻泰科技"），但前端可能需要识别哪个是"本品牌"。

**当前逻辑**: API 使用 `SELF_BRAND_CANDIDATES = ["英业达", "英業達", "Your Brand", "Inventec"]` 来识别本品牌。

**需要确认**:
- [ ] 新文件中的本品牌名称是 "英业达" 吗？
- [ ] 是否需要添加其他候选名称？

---

### 2. Overview 页面 - Brand Influence
**映射**: `overall.total_score["英业达"]`

**需要确认**:
- [ ] 新文件中本品牌在 `total_score` 中的键名是 "英业达" 吗？
- [ ] 如果键名不同，需要如何匹配？

---

### 3. Overview 页面 - Ranking
**映射**: 根据 `overall.total_score` 排序

**需要确认**:
- [ ] 新文件中的品牌列表是否完整？
- [ ] 排序逻辑是否需要调整？

---

### 4. Overview 页面 - Sources
**映射**: `overall.brand_domains[品牌名]`

**需要确认**:
- [ ] 域名数据格式是否正确？
- [ ] 是否需要去重处理？

---

### 5. Overview 页面 - Topics
**映射**: `overall.topics[].name` 和 `overall.topics[].mention_count`

**当前状态**: `topics` 是空数组

**需要确认**:
- [ ] 何时会填写 topics 数据？
- [ ] topics 数据的格式是否符合预期？

---

### 6. Visibility 页面 - Heatmap
**映射**: 使用 `overall.topics[]` 和 `overall.brand_domains`

**需要确认**:
- [ ] Heatmap 的数据来源是否正确？
- [ ] 是否需要从 `aggregated_sentiment_detail` 中提取数据？

---

### 7. Sentiment 页面 - Risk Topics
**映射**: 基于 `aggregated_sentiment_detail[品牌名].negative_aspects`

**当前状态**: 已确认 `negative_aspects` 存在

**需要确认**:
- [ ] 如何将 `negative_aspects` 转换为 Risk Topics 的格式？
- [ ] 是否需要添加其他字段？

---

### 8. Intent/Queries 页面
**映射**: 
- `overall.topics[]` - 主题列表
- `overall.queries[]` - 查询数据
- `overall.response[]` - 回复数据

**当前状态**: 三个字段都是空数组

**需要确认**:
- [ ] 何时会填写这些数据？
- [ ] 数据格式是否符合预期？

---

### 9. 日期范围
**新文件日期**: 2025-11-08 到 2025-11-14（7天）

**需要确认**:
- [ ] 前端日期选择器是否需要调整？
- [ ] 是否需要支持更早的日期？

---

### 10. 产品匹配
**新文件产品**: "英业达 (Inventec) | 笔记本电脑代工"

**需要确认**:
- [ ] API 路由是否能正确匹配这个产品？
- [ ] 如果用户选择了其他产品，如何处理？

---

## 🔧 需要修改的地方

### 1. API 路由更新
- [ ] 更新 `/api/overview` 以使用新文件
- [ ] 更新 `/api/visibility` 以使用新文件
- [ ] 更新 `/api/sentiment` 以使用新文件
- [ ] 确保产品名称匹配逻辑正确

### 2. 文件路径配置
- [ ] 确认使用哪个文件：`all_products_results_20251114_021851.json` 还是 `all_brands_results_20251106_075334.json`？
- [ ] 是否需要同时支持两个文件？
- [ ] 如何根据产品选择不同的文件？

---

## 📝 待办事项

1. **等待用户确认**:
   - [ ] 品牌名称识别逻辑
   - [ ] 产品匹配逻辑
   - [ ] 日期范围处理
   - [ ] topics/queries/response 数据填写时间

2. **代码更新**:
   - [ ] 更新 API 路由使用新文件
   - [ ] 测试所有页面的数据加载
   - [ ] 验证映射关系正确性

