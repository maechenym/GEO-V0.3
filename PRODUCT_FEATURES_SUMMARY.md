# GEO 产品功能总结文档

## 版本信息
- **产品名称**: GEO (ximu)
- **当前版本**: V0.4
- **品牌色**: #0000D2
- **最后更新**: 2025年11月

---

## 一、核心功能模块

### 1.1 用户认证与注册
- ✅ **邮箱密码注册/登录**
- ✅ **Google OAuth 登录**
- ✅ **Magic Link 无密码登录**
- ✅ **用户会话管理**
- ✅ **基于 `hasBrand` 的智能路由跳转**

### 1.2 多语言支持
- ✅ **双语界面**: 英文 / 繁体中文
- ✅ **全面翻译**: 所有 UI 元素、Tooltip、提示信息
- ✅ **动态切换**: 实时切换语言，无需刷新页面
- ✅ **数据本地化**: 品牌名称自动转换为对应语言

---

## 二、Overview（概览）页面

### 2.1 KPI 指标卡片
显示 5 个核心指标，每个卡片包含：
- **Reach（触达率）**: 品牌在 AI 中被提到的频率（%）
- **Rank（排名）**: 品牌在回答中出现的平均顺序
- **Focus（关注度）**: 品牌内容所占整体篇幅比例（%）
- **Sentiment（情绪）**: AI 对品牌的情绪态度（0-1）
- **Visibility（可见度）**: 品牌在 AI 回答中的整体可见度（%）

**功能特性**:
- 显示当前值 + 环比变化（delta，当前设为 0）
- 支持 Tooltip 说明
- 点击卡片可跳转到对应详细页面

### 2.2 品牌影响力趋势图
- **数据来源**: `total_score`（品牌影响力得分）
- **显示内容**: 本品牌与竞品的趋势对比
- **交互功能**:
  - 支持多品牌对比（最多 6 个品牌）
  - 品牌筛选器（点击显示/隐藏）
  - 品牌颜色标识
- **日期处理**: 支持 1/7/14/30 天及自定义日期范围

### 2.3 品牌影响力排名表
- **排序依据**: 按 `total_score` 降序排列
- **显示内容**:
  - 排名（Rank）
  - 品牌名称（Brand）
  - 排名变化（Delta，当前设为 0）
  - 影响力得分（Score）
- **特殊标记**: 本品牌标记为 `isSelf: true`，显示在顶部或列表中

### 2.4 热门来源（Top Sources）
- **显示内容**: Top 5 来源网站
- **信息展示**:
  - 网站域名
  - 是否提及本品牌（Yes/No）
  - 引用率（Citation Rate）
- **交互**: 点击"查看更多"跳转到 Sources 页面

### 2.5 热门话题（Top Topics）
- **显示内容**: Top 5 热门话题
- **信息展示**:
  - 话题名称
  - 该话题下本品牌的提及率
  - 话题占比
- **交互**: 点击"查看更多"跳转到 Queries 页面

---

## 三、Visibility（可见度）页面

### 3.1 KPI 指标卡片
显示 3 个核心指标：
- **Reach（提及率）**: `mention_rate * 100`（%）
- **Rank（排名）**: `absolute_rank` 的分子值
- **Focus（内容占比）**: `content_share * 100`（%）

**功能特性**:
- 显示当前值 + 环比变化（delta，当前设为 0）
- 支持 Tooltip 说明

### 3.2 趋势图表 + 排名表
- **左侧趋势图**:
  - 支持切换显示指标（Visibility / Reach / Rank / Focus）
  - 下拉选择器切换指标
  - 时间序列折线图
  - 显示本品牌趋势
- **右侧排名表**:
  - 表格标题: "排名"（Ranking）
  - 支持切换排序指标（Visibility / Reach / Rank / Focus）
  - 显示所有竞品排名
  - 本品牌标记为 `isSelf: true`

### 3.3 可见度热力图（Visibility Heatmap）
- **显示内容**: 
  - 行：热门提问主题（Topics）
  - 列：网站来源类型（Source Category）
  - 单元格：品牌提及率（Mention Rate）
- **交互功能**:
  - 点击单元格显示详情（主题、来源、提及率、示例）
  - 动态行数（根据主题数量）
  - 动态列数（根据来源类型数量）
- **Tooltip**: "展示熱門提问主題和AI回答中網站來源類型下您的品牌提及率"

---

## 四、Sentiment（情绪分析）页面

### 4.1 KPI 指标卡片
显示 4 个核心指标：
- **Avg Sentiment（平均情绪）**: 品牌平均情绪评分（0-1）
- **Positive%（积极）**: 正向情绪百分比（0-100%）
- **Neutral%（中性）**: 中立情绪百分比（0-100%）
- **Negative%（消极）**: 负向情绪百分比（0-100%）

**功能特性**:
- 显示当前值 + 环比变化（delta，当前设为 0）
- 总和确保为 100%

### 4.2 情绪趋势图
- **数据来源**: 所有品牌的 `sentiment_score`
- **显示范围**: 0-1（不转换为 -1 到 +1）
- **交互功能**: 多品牌对比，不同颜色标识

### 4.3 情绪分数排名表
- **排序依据**: 按 `sentiment_score` 降序排列
- **显示内容**: 排名、品牌、得分、排名变化
- **特殊标记**: 本品牌标记为 `isSelf: true`

### 4.4 热门情绪话题
- **Top Positive Topics**: 显示 3-5 个正向话题及其情绪得分
- **Top Negative Topics**: 显示 3-5 个负向话题及其情绪得分
- **话题翻译**: 支持中英文切换

---

## 五、Sources（来源分析）页面

### 5.1 Sources 表格
- **表格列**:
  - Source（来源网站域名）
  - Type（来源分类：News, Blog, Forum 等）
  - Citation Rate（引用率）
  - Mentioned（是否提及本品牌：Yes/No）
  - Mentions（提及的品牌数量）
- **筛选功能**:
  - Type 筛选（选择来源分类，默认 ALL）
  - Mentioned 筛选（Yes/No）
  - Citation Rate 排序（升序/降序）
- **分页**: 每页显示约 7 条记录

### 5.2 可视化卡片
- **Sources Distribution**: 
  - 横向柱形比例图
  - 不同颜色代表不同分类
  - 右侧灰色柱形显示该分类中提及品牌的网站占比

### 5.3 Tooltip 说明
所有表头字段都有 Tooltip 说明，支持中英文切换

---

## 六、Intent（意图分析/Queries）页面

### 6.1 顶部统计卡片
- **Core Queries**: 核心查询数量
- **Total Queries**: 总查询数量（比核心查询多 15 倍以上）
- **Intent Distribution**: 
  - 环形比例图
  - 显示意图分布（检索/建议/评估/比较/其他）
  - 不同颜色代表不同意图

### 6.2 Core Queries 表格
- **表格列**:
  - Topics（主题）
  - Total Queries（总查询数）
  - Reach（提及率）
  - Rank（排名）
  - Focus（内容占比）
  - Sentiment（情绪）
- **排序功能**: Reach、Rank、Focus、Sentiment 列支持排序
- **展开功能**: 点击行展开查看具体查询详情

### 6.3 展开表格（Core Query 详情）
- **表格列**:
  - Core Query（20%）：具体查询问题
  - AI Response（25%）：AI 回复
  - Intent（15%）：意图类型（每个查询独立显示）
  - Mentions（10%）：提及的品牌数量
  - Rank（10%）：本品牌排名
  - Focus（10%）：本品牌内容占比
  - Citation（10%）：引用来源数量
- **排序功能**: Reach、Rank、Focus、Sentiment 列支持排序

### 6.4 Tooltip 说明
所有表头字段都有 Tooltip 说明，支持中英文切换

---

## 七、Settings（设置）页面

### 7.1 Products（产品管理）
- **品牌/产品选择**: 下拉选择当前品牌和产品
- **产品列表**: 
  - 显示产品名称、类别、状态
  - 支持编辑、删除操作
- **添加产品**: 点击"Add Product"按钮
- **套餐限制**: 超过订阅限制时显示红色提示
- **竞品管理**: 添加/删除竞品
- **Personas 管理**: 管理目标用户画像

### 7.2 Plan（订阅计划）
- **套餐卡片**: 
  - Free Trial（免费试用）
  - Basic（基础版）
  - Advanced（高级版）
  - Enterprise（企业版）
- **显示内容**:
  - 定价（$xxx USD/month）
  - 核心权益
  - 限制说明
  - CURRENT PLAN / MOST POPULAR / CUSTOM 标签
- **交互**: 点击按钮选择套餐

### 7.3 Team（团队管理）
- **成员列表**: 
  - Members（邮箱）
  - Role（Admin/Viewer）
  - Updated At（更新时间）
  - Actions（删除图标）
- **邀请成员**: 点击"Invite Member"按钮
  - 输入邮箱
  - 选择角色（Admin/Viewer）
- **权限显示**: 显示成员总数/当前添加成员数

---

## 八、Profile（个人资料）页面

### 8.1 账户信息
- **Email**: 显示用户登录邮箱
- **Brand Status**: 显示品牌配置状态（Brand configured）

### 8.2 语言设置
- **语言选择**: 下拉筛选列表
- **支持语言**: 英文、繁体中文
- **实时切换**: 所有界面元素随之切换

### 8.3 账户操作
- **Logout**: 安全登出当前账户

---

## 九、Onboarding（新手引导）流程

### 9.1 品牌信息录入
- **输入内容**: 
  - Brand（品牌名）
  - Product（产品名）
- **自动生成**: 系统自动生成品牌描述

### 9.2 等待列表（Waitlist）
- **显示信息**: 
  - 您已进入 Waiting List
  - 我们将在 7 天后联系您
  - 届时可登录查看分析结果

---

## 十、数据与 API

### 10.1 数据文件
- **主数据文件**: `data/all_products_results_20251114_021851.json`
- **数据范围**: 2025-11-13 至 2025-11-20（8 天）
- **数据模型**: overall, chatgpt, gemini, claude

### 10.2 核心指标
- **mention_rate**: 提及率（Reach）
- **absolute_rank**: 绝对排名（Rank）
- **content_share**: 内容占比（Focus）
- **sentiment_score**: 情绪得分（Sentiment）
- **combined_score**: 综合得分（Visibility）
- **total_score**: 总得分（Brand Influence）

### 10.3 API 端点
- `/api/overview` - Overview 页面数据
- `/api/visibility` - Visibility 页面数据
- `/api/sentiment` - Sentiment 页面数据
- `/api/intent` - Intent/Queries 页面数据
- `/api/sources` - Sources 页面数据
- `/api/products` - 产品管理数据
- `/api/plan` - 订阅计划数据
- `/api/team` - 团队管理数据
- `/api/profile` - 用户资料数据

### 10.4 日期处理
- **时区**: 上海时区（Shanghai）
- **日期格式**: YYYY-MM-DD
- **显示格式**: MM/dd
- **日期偏移**: 后台数据日期向前减一天显示（11.6 数据显示为 11.5）

---

## 十一、UI/UX 特性

### 11.1 响应式设计
- ✅ 移动端适配
- ✅ 桌面端优化
- ✅ 平板端支持

### 11.2 主题支持
- ✅ 浅色主题
- ✅ 深色主题（如配置）

### 11.3 动画效果
- ✅ Framer Motion 页面过渡
- ✅ 图表动画
- ✅ 加载状态动画

### 11.4 交互反馈
- ✅ Toast 通知系统
- ✅ 加载状态显示
- ✅ 错误处理提示
- ✅ 表单验证反馈

---

## 十二、技术栈

### 12.1 前端框架
- **Next.js 14.2** - React 框架（App Router）
- **TypeScript 5.4** - 类型安全
- **React 18.2** - UI 库

### 12.2 样式与 UI
- **Tailwind CSS 3.4** - CSS 框架
- **shadcn/ui** - React 组件库
- **Radix UI** - 可访问组件原语
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 12.3 状态管理
- **Zustand 4.5** - 状态管理（持久化）
- **React Query 5.28** - 服务端状态管理
- **React Hook Form 7.51** - 表单管理
- **Zod 3.23** - 模式验证

### 12.4 数据可视化
- **Recharts 3.3** - 图表库

### 12.5 开发工具
- **MSW 2.0** - API Mock
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Husky** - Git Hooks
- **Commitlint** - 提交信息规范

---

## 十三、数据特性

### 13.1 日期范围支持
- ✅ 1 天
- ✅ 7 天
- ✅ 14 天
- ✅ 30 天
- ✅ 自定义日期范围

### 13.2 模型筛选
- ✅ ALL model（所有模型）
- ✅ chatgpt
- ✅ gemini
- ✅ claude

### 13.3 数据计算
- **1 天模式**: 使用最后一天的数据
- **多天模式**: 计算平均值
- **Delta 计算**: 当前所有 delta 值设为 0（无环比数据）

### 13.4 品牌识别
- **自品牌识别**: 支持多种格式
  - "中国信托" / "中國信托" / "CTBC" / "ctbc"
  - "英业达" / "Inventec"
- **自动转换**: 根据语言设置自动转换品牌名称

---

## 十四、特殊功能

### 14.1 数据导出
- ✅ 支持导出功能（如配置）

### 14.2 数据验证
- ✅ 数据格式验证
- ✅ 错误处理
- ✅ 异常情况提示

### 14.3 性能优化
- ✅ 数据缓存策略
- ✅ 懒加载
- ✅ 代码分割

---

## 十五、已知限制

### 15.1 数据限制
- 当前数据范围：2025-11-13 至 2025-11-20
- Delta 值当前全部设为 0（无历史对比数据）

### 15.2 功能限制
- 部分功能可能处于开发中状态

---

## 十六、关键文件位置

### 16.1 页面组件
- `src/app/(app)/overview/page.tsx` - Overview 页面
- `src/app/(app)/insights/visibility/page.tsx` - Visibility 页面
- `src/app/(app)/insights/sentiment/page.tsx` - Sentiment 页面
- `src/app/(app)/insights/sources/page.tsx` - Sources 页面
- `src/app/(app)/insights/intent/page.tsx` - Intent/Queries 页面
- `src/app/(app)/settings/products/page.tsx` - Products 设置
- `src/app/(app)/settings/plan/page.tsx` - Plan 设置
- `src/app/(app)/settings/team/page.tsx` - Team 设置
- `src/app/(app)/profile/page.tsx` - Profile 页面

### 16.2 API 路由
- `src/app/api/overview/route.ts` - Overview API
- `src/app/api/visibility/route.ts` - Visibility API
- `src/app/api/sentiment/route.ts` - Sentiment API
- `src/app/api/intent/route.ts` - Intent API
- `src/app/api/sources/route.ts` - Sources API

### 16.3 工具函数
- `src/lib/i18n.ts` - 国际化翻译
- `src/lib/date-utils.ts` - 日期处理工具
- `src/lib/source-categories.ts` - 来源分类映射

### 16.4 类型定义
- `src/types/overview.ts` - Overview 类型
- `src/types/visibility.ts` - Visibility 类型
- `src/types/sentiment.ts` - Sentiment 类型
- `src/types/intent.ts` - Intent 类型

---

## 总结

GEO 是一个功能完整的 AI 驱动品牌影响力分析平台，提供：

1. **全面的数据分析**: Overview、Visibility、Sentiment、Sources、Intent 五大分析模块
2. **灵活的数据筛选**: 支持多日期范围、多模型筛选
3. **丰富的可视化**: 趋势图、排名表、热力图、分布图等
4. **完善的用户管理**: 产品管理、团队协作、订阅计划
5. **优秀的用户体验**: 双语支持、响应式设计、流畅动画

所有功能都经过精心设计和实现，确保数据准确性和用户体验的流畅性。

