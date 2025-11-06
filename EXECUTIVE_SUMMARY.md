# GEO V0.2 产品功能执行摘要

## 项目概述

GEO V0.2 是一个品牌分析和竞品对比系统，主要用于分析英业达（Inventec）品牌在AI生态系统中的表现，包括可见度、触达、排名、关注度和情绪等多个维度。

---

## 核心功能模块

### 1. Overview（概览页面）
**功能**: 品牌整体表现概览
- **KPI指标**: Reach, Rank, Focus, Sentiment, Visibility
- **品牌影响力趋势**: 多品牌对比图表
- **竞品排名**: 按total_score排序，显示所有竞品
- **日期模式**: 1day（昨天+今天）, 7day（7天平均值）

### 2. Visibility（可见度页面）
**功能**: 四个维度的深入分析
- **Visibility Ranking**: 基于total_score
- **Reach Ranking**: 基于mention_rate
- **Rank Ranking**: 基于absolute_rank（排名越小越好）
- **Focus Ranking**: 基于content_share
- **趋势图表**: 每个指标的时间序列趋势

### 3. Sentiment（情绪页面）
**功能**: 品牌情绪分析和风险识别
- **SOV**: 市场声量份额
- **Sentiment Index**: 情绪指数（0-1范围）
- **Positive/Neutral/Negative**: 情绪分布
- **Sentiment Trend**: 多品牌情绪趋势对比
- **Sentiment Ranking**: 情绪分数排名

---

## 关键技术实现

### 数据源
- **位置**: `/Users/yimingchen/Documents/all_brands_results_20251106_075334.json`
- **产品**: `英业达 (Inventec) 机架解决方案`
- **日期范围**: 2025-10-31 至 2025-11-06

### 计算公式
```
total_score = mention_rate * content_share * sentiment_score
combined_score = mention_rate * content_share
```

### 日期处理
- **时区**: 上海时区
- **显示偏移**: 后台11.6数据代表11.5的数据，显示时向前减一天

### 排名变化显示
- **1day模式**: 显示排名变化（绝对名次，如 +2, -1）
- **7day模式**: 显示得分变化（百分比，如 +5.2%）

---

## 重要配置

### API路由
- `/api/overview` - Overview数据
- `/api/visibility` - Visibility数据  
- `/api/sentiment` - Sentiment数据

### 品牌显示
- **英业达**: Overview显示为"英业达"，其他页面显示为"Your Brand"
- **竞品**: 显示所有竞品，不限制Top 20

### 配色方案
- 各品牌使用不同颜色（CHART_COLORS）
- 品牌筛选器图标颜色与图表线条颜色一致

---

## 数据状态管理

### 基准数据
- 使用2025-11-06作为基准日期
- 其他日期基于基准生成（±10% mention_rate, ±5% content_share）

### 数据恢复
- 可恢复到完全没有波动的状态（所有日期数据完全相同）
- 可恢复到生成时间序列数据之后的状态（标准波动）

---

## 待完成功能

1. **Risk Topics**: Sentiment页面的风险话题提取（从aggregated_sentiment_detail）
2. **数据导出**: 添加数据导出功能
3. **错误处理**: 完善错误处理和边界情况

---

## 文件结构

```
GEO V0.2/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── overview/
│   │   │   │   └── page.tsx          # Overview页面
│   │   │   └── insights/
│   │   │       ├── visibility/
│   │   │       │   └── page.tsx      # Visibility页面
│   │   │       └── sentiment/
│   │   │           └── page.tsx      # Sentiment页面
│   │   └── api/
│   │       ├── overview/
│   │       │   └── route.ts          # Overview API
│   │       ├── visibility/
│   │       │   └── route.ts          # Visibility API
│   │       └── sentiment/
│   │           └── route.ts          # Sentiment API
│   ├── types/
│   │   ├── overview.ts               # Overview类型定义
│   │   └── sentiment.ts              # Sentiment类型定义
│   ├── lib/
│   │   └── date-utils.ts             # 日期工具函数
│   └── services/
│       └── api.ts                    # API客户端
└── PRODUCT_SUMMARY.md                 # 详细产品文档
```

---

## 快速开始

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问页面**
   - Overview: `http://localhost:3000/overview`
   - Visibility: `http://localhost:3000/insights/visibility`
   - Sentiment: `http://localhost:3000/insights/sentiment`

3. **测试账号**
   - Email: `test@example.com`
   - 数据已自动预加载

---

## 注意事项

1. **数据缓存**: 开发环境已禁用缓存（staleTime: 0），确保获取最新数据
2. **日期选择**: 所有页面支持1day和7day快速选择，也支持自定义日期范围
3. **品牌筛选**: Overview最多6个品牌，Visibility最多5个竞品
4. **数据一致性**: 确保所有页面使用相同的数据源和计算逻辑

---

**版本**: V0.2  
**最后更新**: 2025-11-06  
**状态**: 开发中


