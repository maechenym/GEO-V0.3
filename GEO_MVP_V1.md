# GEO MVP-V1

## 品牌名称：ximu
- 品牌色：HEX #0000D2
- logo：未提供

---

## Onboarding

### URL 路径
- **模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /公共展示页
- **模块名称**：公共展示页  
- 页面目的：介绍产品核心功能、案例，吸引用户点击 "Start free trial"  
- 输入或选择的数据：点击 "Start free trial" 按钮  
- 输出结果：跳转到注册登录页  

---

### /signup, /login
- **模块名称**：注册登录页  
- 页面目的：允许用户通过邮箱或 Google 账户注册/登录。  
- 输入或选择的数据：  
  - 邮箱注册：输入邮箱/设置密码/验证码  
  - Google 登录：点击 Google 谷歌登录按钮  
- 输出结果：登录成功后，跳转到新手引导 Step 1 (Brand) 页面  

---

### /onboarding/brand
- **模块名称**：新手引导 - Brand  
- 页面目的：用户只需填写品牌和产品名称，系统将自动生成一段品牌描述。  
- 输入或选择的数据：填写品牌名 (Brand)、产品名 (Product)  
- 输出结果：自动生成结果：显示模型生成的品牌描述  

---

### /onboarding/brand
- **模块名称**：Waiting List 等待页  
- 页面目的：确认用户已进入等待队列，告知用户数据正在收集，并说明后续联系时间  
- 输入或选择的数据：无  
- 输出结果：显示信息：您已进入 Waiting List，我们将在 7 天后联系您，届时可登录查看分析结果  

---

## Overview

### URL
- **模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /overview
- **模块名称**：KPI 指标卡片区  
- 页面目的：一眼概览核心指数，作为全局入口  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - 品牌ID（brand_id）  
  - 产品ID（product_id）  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：显示 3 张卡片：  
  1. Brand Influence（品牌影响力）  
  2. Visibility（可见度）  
  3. Sentiment（情绪）  
  每张卡片显示当前时间周期指数与变化趋势箭头/数值；  
  - 交互：点击 Visibility 卡片 → 跳转 Visibility 页面  
  - 点击 Sentiment 卡片 → 跳转 sentiment 页面  

---

### /overview
- **模块名称**：品牌影响力趋势（Brand Influence Trend）  
- 页面目的：观察 Brand Influence 随时间变化的走势  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - brand_id、product_id  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：折线图（加一点线下的阴影）呈现 Brand Influence 指数随时间的趋势  

---

### /overview
- **模块名称**：品牌影响力排名（Brand Influence Ranking）  
- 页面目的：查看本品牌在行业内相对位置与名次变化  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - brand_id、product_id  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：展示：当前名次、品牌、相对上一周期名次变化（↑/↓/—）、Influence 得分  
  - 本品牌有一栏固定在最上面一栏显示，不剔除排名中的品牌栏  

---

### /overview
- **模块名称**：Sources（引用来源）  
- 页面目的：了解 AI 回答中主要网站来源及该网站是否提到本品牌  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - brand_id、product_id  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：  
  - 分栏展示 Top 5 来源网站；左侧是网站域名，右侧显示该网站是否提到你的品牌  
  - 支持 hover 显示精确数值  
  - 交互：点击 sources 卡片右上角的查看更多跳转到 /Sources 界面  

---

### /overview
- **模块名称**：Topics（热门主题）  
- 页面目的：识别当前周期内的 Top 主题及该主题下你的品牌的提及率  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - brand_id、product_id  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：显示 Top 5 主题卡片/列表：主题名、该主题下你的品牌的提及率；  
  - 交互：点击 “topic 卡片右上角的查看更多” → 跳转 query 页面  

---

### 统一说明
- **页面路径**：/overview（单页 Dashboard，不切换页面）  
- **行业/品类**：由系统根据初始化的 brand_id / product_id 自动识别（用户无需选择）  
- **筛选统一**：顶部筛选栏提供时间周期（Last 1/7/14/30天、自定义）与 brand_id、product_id、模型平台筛选栏：ALL model、chatgpt、gemini、claude  
- **联动刷新**：筛选变化后，五个区块同步刷新数据和可视化结果  

---

## Visibility

### 区块
- **模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /insights/visibility
- **模块名称**：KPI 指标卡片（Reach / Rank / Focus）  
- 页面目的：一眼看懂可见度的三项核心构成与环比变化，作为诊断入口  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - brand_id、product_id  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：三张卡片：  
  - Reach（提及率）：当前值 + 相对上一周期 Δ（↑/↓/—）百分比  
  - Rank（位次）：当前名次 + 名次变化 Δ 位（↑/↓/—）  
  - Focus（内容占比）：当前占比% + Δ%（↑/↓/—）  
  （可含微趋势火花线与 Tooltip 口径说明）  

---

### /insights/visibility
- **模块名称**：Visibility 趋势图（折线/面积） + 右侧 Ranking 表格  
- 页面目的：观察 Visibility 指数随时间的变化趋势，并同步查看同周期行业排名  
- 输入或选择的数据：  
  - 时间周期：Last 1/7/14/30 天、自定义  
  - brand_id、product_id  
  - 模型平台：ALL model、chatgpt、gemini、claude  
- 输出结果：  
  - 左侧：趋势图 显示 Visibility（combined_score%）的时间序列，展示指数与趋势  
  - 右侧：Visibility Ranking 表格名字改为 Ranking，格式和现在保持不变，大小参考 overview 界面的 ranking 表格的位置和高度，（名次、品牌、名次变化、Visibility）  
  - 表格中 visibility 指数作为主表，上面有 4 个可以显示排序的按钮，分别是 visibility、reach、rank、focus，其中 visibility 是主要的指数、选中为本品牌蓝色、其他指数为白色，放在 ranking 卡片的右上角，显示下拉按钮，默认显示 visibility，下拉可选择其他的。  

---

## Sentiment

### 区块
- **模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /insights/sentiment
- **模块名称**：KPI 卡片（情绪评分）  
- 页面目的：展示品牌的总体情绪，帮助用户理解品牌的整体情感态度  
- 输入或选择的数据：  
  - 时间范围：Last 7/14/30天、自定义  
  - 品牌选择（brand_id）  
- 输出结果：四张 KPI 卡片：  
  - Avg Sentiment：品牌的平均情绪评分（-1~+1）  
  - Positive%：正向情绪的百分比（0~100%）  
  - Neutral%：中立情绪的百分比（0~100%）  
  - Negative%：负向情绪的百分比（0~100%）  
  每个卡片都带有小箭头，显示与上一周期的变化（↑/↓）  

---

### /insights/sentiment
- **模块名称**：情绪话题分析（Positive/Negative Topics）  
- 页面目的：显示正向和负向情绪的关键词话题，帮助用户了解品牌在不同话题下的情感分布  
- 输入或选择的数据：  
  - 时间范围（Last 7/14/30天、自定义）  
  - 品牌选择（brand_id）  
- 输出结果：  
  - 两个卡片：Top Positive Topics（显示 3~5 个正向话题及其情绪得分）  
  - Top Negative Topics（显示 3~5 个负向话题及其情绪得分）  

---

### /insights/sentiment
- **模块名称**：情绪来源分析（Sentiment by Source）  
- 页面目的：展示品牌在不同来源下的情绪分布，帮助用户理解不同来源对品牌的情感偏好  
- 输入或选择的数据：  
  - 时间范围（Last 7/14/30天、自定义）  
  - 品牌选择（brand_id）  
- 输出结果：堆叠条形图：每个来源（如 Wikipedia、TechRadar）对应的正向、负向和中立情绪。每个来源的条形图会用不同颜色区分  

---

## Sources

### 区块
- **模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /insights/sources
- **模块名称**：Sources (页面整体)  
- 页面目的：引用来源分析：用户了解 AI 回复引用的不同来源网站的情况、引用率、及这些来源提及本品牌的情况  
- 输入或选择的数据：  
  - 时间周期 (通过 Header 输入，默认为 Last 7 Days，可选择 1/7/14/30 Days 或自定义日历)  
- 输出结果：Sources 表格：显示满足筛选和排序条件的数据列表  

---

### /insights/sources
- **模块名称**：Sources 表格  
- 页面目的：查看和筛选来源数据：用户查看每个来源的详情、按提及率排序，并按类型或是否提及本品牌进行筛选  
- 输入或选择的数据：  
  - Type 筛选 (选择来源分类，默认显示 ALL)  
  - Mentioned 筛选 (选择 Yes 或 No)  
  - Citation Rate 排序 (点击上下箭头进行升序或降序排列)  
- 输出结果：表格标题：Sources (大写)  

---
### /insights/sources
- **模块名称**：Sources 分页  
- 页面目的：浏览全部来源：用户翻页查看所有 20 个来源网站。  
- 输入或选择的数据：无  
- 输出结果：  
  - 翻页按钮 (上一页/下一页)  
  - 每页显示 7 个左右 来源网站记录  

---

### /insights/Sources
- **模块名称**：可视化卡片  
- 页面目的：展示查询网站来源分类和对应分类的品牌提及率可视化  
- 输入或选择的数据：无  
- 输出结果：  
  - Sources Distribution ：横向柱形比例图，反映不同网站来源类别，不同颜色代表不同分类。  
  - Sources Distribution的柱形右侧再做一个对应的柱形，用灰色底色，显示该分类中提及到品牌的网站在该分类的占比，比如 offic 有 100 个，其中提到本品牌的有 10 个，就显示 10%

---

### /insights/sources
- **模块名称**：Sources Tooltip  
- 页面目的：获取字段解释：鼠标悬停在表头名词后面的 ? 上。  
- 输入或选择的数据：无  
- 输出结果：Tooltip 解释（内容随语言选择切换为繁体中文或英文）：  
  - **Source**: 来源网站的域名或名称。  
  - **Type**: 来源的分类 (如 News, Blog, Forum 等)。  
  - **Citation Rate**: 该来源在回答中被引用的频率。  
  - **Mentioned**: 该来源是否提及了本品牌。  
  - **Mentions**: 该来源一共提及了哪些品牌。  

---

## Queries

### 区块
- **模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /insights/Queries
- **模块名称**：Queries (页面整体)  
- 页面目的：提问意图和核心查询洞察：用户了解关于品牌的核心查询主题、用户提问意图分布和各主题下的品牌表现  
- 输入或选择的数据：  
  - 时间周期 (通过 Header 输入，默认为 Last 7 Days，可选择 1/7/14/30 Days 或自定义日历)  
- 输出结果：页面所有数据和图表随时间周期更新。  

---

### /insights/Queries
- **模块名称**：顶部卡片  
- 页面目的：展示查询总量与意图分布：用户查看核心查询数量、总查询数量以及用户提问意图的比例  
- 输入或选择的数据：无  
- 输出结果：  
  - **Core Queries**：显示总结后的核心查询数量。  
  - **Total Queries**：显示总查询数量（比核心查询多 15 倍以上）。  
  - **Intent Distribution**（标题，宽度 70%）：环形比例图，反映提问意图的比例（检索/建议/评估/比较/其他），不同颜色代表不同意图。  

---

### /insights/Queries
- **模块名称**：Core Queries 表格 (主)  
- 页面目的：查看核心主题下的品牌表现：用户按主题（Topics）查看本品牌的 Reach、Rank、Focus 和 Sentiment 表现，并可展开查看具体查询  
- 输入或选择的数据：无  
- 输出结果：表格标题：Core Queries（黑色，字体加大）。  
  - 表格表头：Topics、Total Queries、Reach、Rank、Focus、Sentiment  
  - 其中 Reach、Rank、Focus、Sentiment 表头具备上下箭头，可按照该列排序  

---

### /insights/Queries
- **模块名称**：Core Query 表格 (展开)  
- 页面目的：查看主题下的具体查询详情：用户查看构成该主题的核心查询、AI 回复、意图、以及本品牌的具体排名和内容占比  
- 输入或选择的数据：无  
- 输出结果：  
  - 表格表头：Core Query（20%）、AI Response（25%）、Intent（15%）、Mentions（10%）、Rank（10%）、Focus（10%）、Citation（10%）。  
  - 其中 Reach、Rank、Focus、Sentiment 表头具备上下箭头，可按照该列排序  

---

### /insights/Queries
- **模块名称**：Queries Tooltip  
- 页面目的：获取字段解释：鼠标悬停在表头名词后面的 ? 上。  
- 输入或选择的数据：无  
- 输出结果：Tooltip 解释（内容随语言选择切换为繁体中文或英文）：  
  - **Topics**：展示总结查询的关键词，主题是什么。  
  - **Total Queries**：查询的总数。  
  - **Reach**：提及本品牌的提及率。  
  - **Rank**：提及本品牌时的排名。  
  - **Focus**：提及本品牌时的内容占比。  
  - **Sentiment**：本品牌在这个主题下的平均情绪。  

---

## Team

### URL
- **区块模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /Setting/Team
- **模块名称**：Team (成员管理)  
- 页面目的：管理团队成员：管理成员角色和权限，支持邀请新成员和移除现有成员  
- 输入或选择的数据：点击 Invite Member 按钮，并在弹窗中输入邮箱和选择身份角色 (Admin/Viewer)  
- 输出结果：成员列表：显示 Members (邮箱)、Role (Admin/Viewer)、Updated At 和 Actions (删除图标)  
  - 权限显示：显示成员总数/当前添加成员数  
  - 角色显示：角色的 Badge  
  - 操作：每行末尾有垃圾桶图标用于删除成员  

---

## Plan

### URL
- **区块模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /Setting/Plan
- **模块名称**：Plan (订阅计划)  
- 页面目的：查看/选择/管理套餐：用户查看不同套餐的定价、核心权益和限制，并选择订阅  
- 输入或选择的数据：点击按钮 (Start for $0 / Choose Basic / Contact Sales)  
- 输出结果：卡片式展示：4 个卡片（Free Trial, Basic, Advanced, Enterprise）  
  - 定价格式：$xxx USD/month（符合要求：$和 USD/month 字体适当减小）。  
  - 卡片装饰：CURRENT PLAN（和 MOST POPULAR/CUSTOM 格式一致）放在卡片右上角。  
  - Free Trial 特殊文案：Get 7 days of full access, and earn an extra 7-day free trial by inviting one business user。  

---

## Products

### URL
- **区块模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /Setting/Products
- **模块名称**：Products (品牌与产品管理)  
- 页面目的：配置核心分析对象：用户配置和管理品牌、产品，为 AI 可见度分析奠定数据基础  
- 输入或选择的数据：下拉选择 Brand / Product 名称。点击 Add Product。点击编辑/删除图标。  
- 输出结果：  
  - 品牌/产品选择框：显示当前选中的品牌（英业达 (Inventec)）和产品（机架解决方案）。  
  - 产品列表：显示已添加的产品名称、类别、状态和操作（编辑、删除）。  
  - 套餐限制提示：当产品数量超过订阅限制时，显示醒目的红色提示（图示 Upgrade plan to add more products (current limit: 3)）。  

---

## Profile

### URL
- **区块模块名称**  
- 页面目的 / 用户要做什么  
- 输入或选择的数据  
- 输出结果 / 显示内容

---

### /Profile
- **模块名称**：Profile (页面整体)  
- 页面目的：个人账户信息与设置管理：用户管理个人账户详情、执行账户操作（如登出），并进行语言设置  
- 输入或选择的数据：语言选择 (下拉筛选列表)  
- 输出结果：  
  - 语言切换：页面顶部的语言设置，包括繁体中文和英文、应改为下拉筛选列表，包含英文和中文繁体，所有界面元素随之切换  

---

### /Profile
- **模块名称**：Account Information  
- 页面目的：查看账户详情：查看与登录账户关联的基本信息  
- 输入或选择的数据：无  
- 输出结果：  
  - Email：显示用户的真实登录邮箱（图示 test@example.com）。  
  - 用户 ID：不显示用户 ID  
  - Brand Status：显示品牌配置状态（图示 Brand configured）。  

---

### /Profile
- **模块名称**：Actions  
- 页面目的：执行账户操作：用户进行登出操作  
- 输入或选择的数据：点击 Logout 按钮  
- 输出结果：Logout 按钮：用于安全登出当前账户  

---

## Tooltip

| 名稱               | 繁體中文說明                                             | 英文說明                                             |
|--------------------|------------------------------------------------------|----------------------------------------------------|
| 品牌影響力 (Brand Influence) | 綜合可見度與情感，體現品牌在 AI 世界的整體影響力。       | Combines visibility and sentiment to reflect overall brand influence in AI. |
| 提及率 (Reach)     | 表示品牌在 AI 中被提到的頻率，越高說明曝光越多。        | Indicates how often the brand is mentioned by AI — higher means more exposure. |
| 提及順序 (Rank)    | 在提到品牌的回答中，品牌出現的平均先後順序，越靠前代表越受關注。 | The average order in which a brand appears in responses, with earlier mentions indicating higher attention. |
| 內容聲量佔比 (Focus) | 在提到品牌的回答中，品牌內容所佔整體篇幅比例，體現品牌存在感。  | The proportion of content dedicated to the brand in responses, reflecting its presence. |
| 情感傾向 (Sentiment) | 在提到品牌的回答中，反映 AI 對品牌的情緒態度，從負面到正面。 | Reflects AI’s emotional tone towards the brand in responses, from negative to positive. |
| AI可見度 (Visibility) | 反映品牌在 AI 回答中被看到的整體程度。                  | Shows how visible a brand is in AI-generated answers. |
| 品牌影響力排名 (Influence Ranking) | 根據品牌的影響力，顯示品牌在同類產品中的排名。        | Shows how a brand ranks in AI influence compared to similar products. |
| AI可見度排名 (Visibility Ranking) | 根據品牌的可見度，顯示品牌在同類產品中的排名。       | Shows how a brand ranks in AI visibility compared to similar products. |
| 提及率排名 (Reach Ranking) | 根據品牌的提及率，顯示品牌在同類產品中的排名。        | Shows how a brand ranks in reach compared to similar products. |
| 提及順序排名 (Rank Ranking) | 根據品牌在回答中的提及順序，顯示品牌在同類產品中的排名。 | Shows how a brand ranks in the order of mentions in AI answers compared to similar products. |
| 內容聲量佔比排名 (Focus Ranking) | 根據品牌在回答中的內容佔比，顯示品牌在同類產品中的排名。 | Shows how a brand ranks in the focus content percentage in AI answers compared to similar products. |
| Visibility-Trend | 顯示所選指標（可見度 / 提及率 / 排名 / 內容聲量佔比）隨時間的變化趨勢。 | Shows recent change over time for the selected metric (Visibility / Reach / Rank / Focus). Use the dropdown to switch. |
| Sources            | 顯示你的品牌被提及的來源網站。                           | Shows the websites where your brand is mentioned. |
| Type               | 該來源的類別，如新聞、博客、技術文檔等。                   | Type of source, such as news, blogs, or technical documents. |
| Citation rate      | 該來源在回答中被引用的頻率。                             | How often this source is cited in AI responses. |
| Mentioned          | 是否在該來源中提到你的品牌（是/否）。                     | Whether your brand is mentioned in this source (Yes/No). |
| Mentions           | 該來源中提到的所有品牌數量。                             | Number of brands mentioned in this source. |
| Core Queries       | 代表該品類的核心問題。                                   | Representative key questions for this category. |
| Total Queries      | 該品類下的總問題數量。                                   | Total number of questions under this category. |
| Intent Distribution| 各類意圖問題在整體中的佔比。                             | Proportion of each intent type across all questions. |
| Topics             | 該品類下相關的主要話題。                                  | Main topics related to this category. |
| Total Queries（Topic）| 該主題下的問題總數。                                  | Total number of questions under this topic. |
| Reach（Topic）     | 該主題下你的品牌被提到的頻率平均值。                     | Average frequency your brand is mentioned under this topic. |
| Rank（Topic）      | 該主題下你的品牌在回答中出現的順序平均值。              | Average order your brand appears in responses under this topic. |
| Focus（Topic）     | 該主題內容中你的品牌所佔篇幅的平均比例。                  | Average proportion of content focused on your brand under this topic. |
| Sentiment（Topic） | 該主題下 AI 對你的品牌的情緒傾向平均值。                 | Average sentiment of AI toward your brand under this topic. |
| Intent（core query 表格） | 當前問題的意圖類型。                                 | The intent type of the current question. |
| Mentions（core query 表格） | 該問題下被提到的所有品牌數量。                       | Number of brands mentioned in this question. |
| Rank（core query 表格） | 你的品牌在此問題下的出現順序平均值。                  | Average order your brand appears in this question. |
| Focus（core query 表格） | 你的品牌在此問題下的內容佔比平均值。                  | Average proportion of content focused on your brand in this question. |
| Citation（core query 表格） | 你的品牌在此問題下的引用來源數量。                    | Number of sources citing your brand in this question. |

