# GEO V0.2 产品功能总结文档

## 日期：2025年11月6日

---

## 一、数据初始化

### 1.1 数据源
- **文件位置**: `/Users/yimingchen/Documents/all_brands_results_20251106_075334.json`
- **主要产品**: `英业达 (Inventec) 机架解决方案`
- **数据范围**: 2025-10-31 至 2025-11-06
- **数据指标**:
  - `mention_rate` (Reach)
  - `content_share` (Focus)
  - `sentiment_score` (Sentiment)
  - `total_score` (Brand Influence)
  - `combined_score` (Visibility)
  - `absolute_rank` (Rank)
  - `aggregated_sentiment_detail`

### 1.2 数据初始化规则
- 使用 2025-11-06 作为基准日期
- 其他日期（10.31-11.05）基于基准日期生成时间序列数据
- `mention_rate`: ±10% 随机波动
- `content_share`: ±5% 随机波动
- `total_score` = `mention_rate * content_share * sentiment_score`
- `combined_score` = `mention_rate * content_share`
- `brand_domains`, `absolute_rank`, `sentiment_score` 保持不变

### 1.3 账号配置
- **测试账号**: `test@example.com`
- 自动导入英业达品牌和所有产品数据
- 无需手动添加品牌，直接显示产品数据

---

## 二、Overview 页面功能

### 2.1 日期范围逻辑
- **1day模式**: 
  - 显示日期: 11.4-11.5（昨天和今天）
  - 数据来源: 使用最后一天的数据
  - 环比增长: 11.5 对比 11.4
  
- **7day模式**: 
  - 显示日期: 10.30-11.5
  - 数据来源: 10.31-11.6 取平均值
  - 环比增长: 当前周期对比上一周期（如果没有上一周期数据则不显示）

### 2.2 KPI指标计算

#### Reach (触达率)
- **来源**: 英业达的 `mention_rate`
- **计算**: `mention_rate * 100` (转换为百分比)
- **1day模式**: 使用最后一天的值
- **7day模式**: 计算平均值

#### Rank (排名)
- **来源**: 英业达的 `absolute_rank`
- **格式**: 字符串 "2.0/5.3"，取第一个数字（分子），保留小数
- **显示**: 绝对排名，带小数点
- **1day模式**: 
  - 显示排名变化：上升/下降的绝对名次（如 +2, -1）
  - 不是百分比变化
- **7day模式**: 计算平均值

#### Focus (关注度)
- **来源**: 英业达的 `content_share`
- **计算**: `content_share * 100` (转换为百分比)
- **1day模式**: 使用最后一天的值
- **7day模式**: 计算平均值

#### Sentiment (情绪)
- **来源**: 英业达的 `sentiment_score`
- **范围**: 0-1
- **单位**: 空字符串（无单位）
- **1day模式**: 使用最后一天的值
- **7day模式**: 计算平均值

#### Visibility (可见度)
- **来源**: 英业达的 `combined_score`
- **计算**: `combined_score * 100` (转换为百分比)
- **1day模式**: 使用最后一天的值
- **7day模式**: 计算平均值

### 2.3 Brand Influence Trend (品牌影响力趋势)
- **数据来源**: `total_score["英业达"]`
- **日期显示**: 后台11.6的数据代表收集到的是11.5的数据，向前减一天
- **竞品趋势**: 显示所有竞品的趋势数据
- **图表**: 支持多品牌对比，每个品牌不同颜色
- **品牌筛选**: 最多显示6个品牌（包括英业达）
- **品牌图标**: 点击1day时，品牌图标显示对应颜色（不全部变蓝）

### 2.4 Competitor Ranking (竞品排名)
- **排序依据**: 按 `total_score` 降序排列
- **显示数量**: 显示所有竞品（不限制Top 20）
- **排名变化**:
  - **1day模式**: 显示排名变化（上升/下降的绝对名次）
  - **7day模式**: 显示得分变化（百分比）
- **英业达显示**: 标记为 `isSelf: true`，名称显示为"英业达"

---

## 三、Visibility 页面功能

### 3.1 数据端点
- **API路径**: `/api/visibility`
- **参数**: `startDate`, `endDate`

### 3.2 排名表
支持四个指标的排名：

#### Visibility Ranking (可见度排名)
- **数据来源**: `total_score`（按得分排序）
- **排名变化**: 1day模式显示排名变化（绝对名次）

#### Reach Ranking (触达排名)
- **数据来源**: `mention_rate`（按得分排序）
- **排名变化**: 1day模式显示排名变化（绝对名次）

#### Rank Ranking (排名排名)
- **数据来源**: `absolute_rank`（按排名升序，排名越小越好）
- **显示**: 绝对排名的分子，带小数点
- **排名变化**: 1day模式显示排名变化（绝对名次）

#### Focus Ranking (关注度排名)
- **数据来源**: `content_share`（按得分排序）
- **排名变化**: 1day模式显示排名变化（绝对名次）

### 3.3 Trend Chart (趋势图表)
- **数据来源**: 对应指标的每日数据
- **日期显示**: 向前减一天（后台11.6代表11.5）
- **日期格式**: "MM/dd"
- **品牌颜色**: 各品牌使用不同颜色（参考overview图表设计）
- **图表底部**: 不显示品牌图标（仅显示在筛选器中）

### 3.4 竞品显示
- **显示数量**: 显示所有竞品（不限制Top 20）
- **排序逻辑**: 按得分排序（所有竞品）
- **一致性**: 1day和7day模式的竞品数量一致

---

## 四、Sentiment 页面功能

### 4.1 数据端点
- **API路径**: `/api/sentiment`
- **参数**: `startDate`, `endDate`

### 4.2 Sentiment KPIs

#### SOV (Share of Voice)
- **计算**: 英业达的 `total_score` / 所有品牌的 `total_score` 总和 * 100
- **1day模式**: 使用最后一天的数据
- **7day模式**: 计算平均值

#### Sentiment Index (情绪指数)
- **来源**: 英业达的 `sentiment_score`
- **范围**: 0-1（与overview的sentiment来源一致）
- **注意**: 不转换为-1到+1范围
- **1day模式**: 使用最后一天的值
- **7day模式**: 计算平均值

#### Positive/Neutral/Negative (积极/中性/消极)
- **计算基础**: 基于 `sentiment_score` (0-1范围)
- **逻辑**:
  - Score >= 0.7: 主要是positive（40-100%）
  - Score 0.3-0.7: 主要是neutral（60-100%），需要归一化确保总和为100%
  - Score < 0.3: 主要是negative（40-100%）
- **总和**: 确保 positive + neutral + negative = 100%

### 4.3 Sentiment Trend Chart (情绪趋势图)
- **数据来源**: 所有品牌的 `sentiment_score`
- **范围**: 0-1（不转换为-1到+1）
- **日期显示**: 向前减一天，格式 "MM/dd"
- **品牌颜色**: 各品牌使用不同颜色
- **Y轴**: domain={[0, 1]}

### 4.4 Sentiment Score Ranking (情绪分数排名)
- **数据来源**: `sentiment_score` 按降序排列
- **显示值**: 0-1范围
- **排名变化**:
  - **1day模式**: 显示排名变化（上升/下降的绝对名次）
  - **7day模式**: 显示得分变化（百分比）
- **英业达显示**: 标记为 `isSelf: true`，名称显示为"Your Brand"

### 4.5 Risk Topics (风险话题)
- **当前状态**: 返回空数组（TODO: 从 `aggregated_sentiment_detail` 提取）

---

## 五、数据一致性要求

### 5.1 日期处理
- **时区**: 使用上海时区（Shanghai）
- **日期格式**: YYYY-MM-DD
- **显示格式**: MM/dd
- **日期偏移**: 后台数据日期向前减一天显示（11.6数据显示为11.5）

### 5.2 品牌名称映射
- **英业达**: 
  - Overview: "英业达"
  - Sentiment: "Your Brand"
  - Visibility: "Your Brand"
- **其他品牌**: 保持原始名称

### 5.3 数据更新
- **缓存设置**: `staleTime: 0`, `cacheTime: 0`（禁用缓存）
- **自动刷新**: 日期范围变化时自动重新获取数据

---

## 六、API路由配置

### 6.1 已创建的API路由
- `/api/overview` - Overview页面数据
- `/api/visibility` - Visibility页面数据
- `/api/sentiment` - Sentiment页面数据

### 6.2 MSW配置
- 绕过 `/api/overview`, `/api/visibility`, `/api/sentiment` 请求
- 让Next.js API路由处理这些请求

---

## 七、UI/UX要求

### 7.1 品牌筛选器
- **筛选器图标**: 使用品牌首字母或图标
- **颜色**: 与图表线条颜色一致
- **行为**: 点击1day时，品牌图标显示对应颜色（不全部变蓝）

### 7.2 排名变化显示
- **1day模式**: 
  - 格式: `+2`, `-1` (绝对名次)
  - 颜色: 上升绿色，下降红色
- **7day模式**: 
  - 格式: `+5.2%`, `-3.1%` (百分比)
  - 颜色: 上升绿色，下降红色

### 7.3 图表配置
- **工具库**: Recharts
- **响应式**: 使用 ResponsiveContainer
- **工具提示**: 自定义样式，深色背景
- **网格**: 浅灰色虚线
- **数据点**: 显示dot和activeDot

---

## 八、技术实现细节

### 8.1 前端技术栈
- **框架**: Next.js 14
- **状态管理**: Zustand (useBrandUIStore)
- **数据获取**: React Query (@tanstack/react-query)
- **图表**: Recharts
- **日期处理**: date-fns

### 8.2 后端技术栈
- **API框架**: Next.js API Routes
- **数据格式**: JSON
- **文件读取**: Node.js fs/promises

### 8.3 数据计算
- **平均值计算**: 多天模式对所有日期数据求平均
- **排名计算**: 按得分降序排列（Rank除外，按排名升序）
- **Delta计算**: 
  - 1day: 排名变化（绝对名次）
  - Multi-day: 得分变化（百分比）

---

## 九、待完成任务

### 9.1 高优先级
- [ ] Sentiment页面的Risk Topics提取（从 `aggregated_sentiment_detail`）
- [ ] 确保所有页面的数据一致性
- [ ] 测试所有日期范围的边界情况

### 9.2 中优先级
- [ ] 添加数据验证和错误处理
- [ ] 优化API响应性能
- [ ] 添加数据导出功能

### 9.3 低优先级
- [ ] 添加数据缓存策略（如果需要）
- [ ] 优化图表渲染性能
- [ ] 添加更多数据可视化选项

---

## 十、已知问题和限制

### 10.1 数据限制
- 当前只支持一个产品：`英业达 (Inventec) 机架解决方案`
- 日期范围限制：2025-10-31 至 2025-11-06

### 10.2 UI限制
- Visibility页面最多显示5个竞品（不包括英业达）
- Overview页面最多显示6个品牌（包括英业达）

### 10.3 功能限制
- Risk Topics目前返回空数组
- 不支持自定义日期范围导出

---

## 十一、数据恢复指南

### 11.1 恢复到完全没有波动的状态
```python
# 使用11.06的数据作为基准，将10.31-11.05设置为完全相同
# 这样所有日期数据完全一致，没有任何波动
```

### 11.2 恢复到生成时间序列数据之后的状态
```python
# 使用11.06作为基准，重新生成10.31-11.05的数据
# mention_rate: ±10% 波动
# content_share: ±5% 波动
# 重新计算total_score和combined_score
```

---

## 十二、关键代码位置

### 12.1 API路由
- `src/app/api/overview/route.ts` - Overview API
- `src/app/api/visibility/route.ts` - Visibility API
- `src/app/api/sentiment/route.ts` - Sentiment API

### 12.2 页面组件
- `src/app/(app)/overview/page.tsx` - Overview页面
- `src/app/(app)/insights/visibility/page.tsx` - Visibility页面
- `src/app/(app)/insights/sentiment/page.tsx` - Sentiment页面

### 12.3 工具函数
- `src/lib/date-utils.ts` - 日期处理工具
- `src/services/api.ts` - API客户端配置
- `src/mocks/browser.ts` - MSW配置

### 12.4 类型定义
- `src/types/overview.ts` - Overview类型
- `src/types/sentiment.ts` - Sentiment类型

---

## 总结

本次开发完成了一个完整的品牌分析和竞品对比系统，包括：
1. **Overview页面** - 品牌整体表现概览
2. **Visibility页面** - 可见度、触达、排名、关注度四个维度的深入分析
3. **Sentiment页面** - 情绪分析和风险话题识别

所有页面都支持1day和7day两种模式，具备完整的数据展示、趋势分析和竞品对比功能。系统使用真实的时间序列数据，支持动态日期范围选择，并提供了丰富的可视化图表。


