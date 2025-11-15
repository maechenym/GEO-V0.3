/**
 * Internationalization utilities
 * 國際化工具
 */

import type { Language } from "@/store/language.store"

// 簡體中文到繁體中文的轉換映射
const simplifiedToTraditional: Record<string, string> = {
  // 常見品牌和競品名稱
  "英业达": "英業達",
  "惠普": "惠普",
  "华为": "華為",
  "戴尔": "戴爾",
  "联想": "聯想",
  "联想（Lenovo）": "聯想（Lenovo）",
  "戴尔（Dell）": "戴爾（Dell）",
  "超微": "超微",
  "超微（Supermicro）": "超微（Supermicro）",
  "威盛電子（VIA Technologies）": "威盛電子（VIA Technologies）",
  "合勤科技": "合勤科技",
  "技嘉科技": "技嘉科技",
  "新华三": "新華三",
  "浪潮": "浪潮",
  "研华": "研華",
  "华擎": "華擎",
  "华硕": "華碩",
  "广达电脑": "廣達電腦",
  "广达": "廣達",
  "仁宝电脑": "仁寶電腦",
  "仁宝": "仁寶",
  "华勤技术": "華勤技術",
  "华勤": "華勤",
  "华一精品科技": "華一精品科技",
  "和硕联合": "和碩聯合",
  "和硕": "和碩",
  "歌尔股份": "歌爾股份",
  "歌尔": "歌爾",
  "纬创资通": "緯創資通",
  "纬创": "緯創",
  "闻泰科技": "聞泰科技",
  "闻泰": "聞泰",
  "存储区域网络服务器": "儲存區域網路伺服器",
  "超融合IT基础架构": "超融合IT基礎架構",
  "超融合云平台服务器": "超融合雲平台伺服器",
  "高性能计算集群服务器": "高效能計算叢集伺服器",
  "亚马逊Web服务": "亞馬遜Web服務",
  "微软Azure": "微軟Azure",
  "神基科技": "神基科技",
  "机架解决方案": "機架解決方案",
  "AI服务器": "AI伺服器",
  "通用服务器": "通用伺服器",
  "存储服务器": "儲存伺服器",
  "网络交换机": "網路交換機",
  "笔记本电脑": "筆記型電腦",
  "台式机": "桌上型電腦",
  "精简型电脑": "精簡型電腦",
  "服务器": "伺服器",
  "网络设备": "網路設備",
  "计算机": "電腦",
  "强固型工业电脑": "強固型工業電腦",
  "机械解决方案": "機械解決方案",
  "汽车零部件": "汽車零部件",
  "航空紧固件": "航空緊固件",
  
  // 主題相關
  "技术创新": "技術創新",
  "产品质量": "產品質量",
  "供应链管理": "供應鏈管理",
  "成本控制": "成本控制",
  "全球最大的笔记本电脑ODM厂商": "全球最大的筆記型電腦ODM廠商",
  
  // 常見UI文字
  "产品": "產品",
  "竞品": "競品",
  "品牌": "品牌",
  "管理": "管理",
  "设置": "設置",
  "保存": "保存",
  "取消": "取消",
  "编辑": "編輯",
  "删除": "刪除",
  "添加": "添加",
  "更新": "更新",
  "名称": "名稱",
  "类别": "類別",
  "状态": "狀態",
  "活跃": "活躍",
  "非活跃": "非活躍",
  
  // 專有名詞
  "Inventec": "Inventec",
}

// 英文到繁體中文的翻譯映射
const englishToTraditional: Record<string, string> = {
  // Profile頁面
  "Profile": "個人資料",
  "Profile_en": "Profile",
  "Manage your account settings": "管理您的帳戶設置",
  "Language Settings": "語言設置",
  "Choose your preferred language": "選擇您的首選語言",
  "Language": "語言",
  "Account Information": "帳戶資訊",
  "Your account details": "您的帳戶詳細資訊",
  "User ID": "用戶ID",
  "Email": "電子郵件",
  "Brand Status": "品牌狀態",
  "Brand configured": "已配置品牌",
  "No brand configured": "尚未配置品牌",
  "Actions": "操作",
  "Account actions": "帳戶操作",
  "Logout": "登出",
  "Not available": "不可用",
  "Change Password": "修改密碼",
  "Update your password to keep your account secure": "更新密碼以保障帳戶安全",
  "Current Password": "當前密碼",
  "New Password": "新密碼",
  "Confirm Password": "確認密碼",
  "Enter your current password": "輸入當前密碼",
  "Enter a new password": "輸入新密碼",
  "Confirm your new password": "確認新密碼",
  "Please fill in all fields": "請填寫所有欄位",
  "Password must be at least 8 characters": "密碼至少需 8 個字元",
  "Passwords do not match": "兩次輸入的密碼不一致",
  "Password updated successfully": "密碼已成功更新",
  "Failed to change password": "修改密碼失敗",
  "Save": "保存",
  "Saving...": "保存中...",
  "Subscription Plan": "訂閱方案",
  "Your current subscription details": "您當前的訂閱詳細資訊",
  "Plan": "方案",
  "Subscription Start Date": "訂閱開始日期",
  "Subscription End Date": "訂閱結束日期",
  "Remaining Days": "剩餘天數",
  "Expired": "已過期",
  
  // Products頁面
  "Products": "產品",
  "Manage your products, target personas and competitors.": "管理您的產品、目標人物角色和競品。",
  "Save changes": "保存更改",
  "Changes Saved": "更改已保存",
  "All changes have been saved successfully": "所有更改已成功保存",
  "Save Failed": "保存失敗",
  "Failed to save changes": "保存更改失敗",
  "Failed to load brand information. Please try again.": "載入品牌資訊失敗。請重試。",
  "Loading products...": "載入產品中...",
  "Brand": "品牌",
  
  // ProductListCard
  "products": "產品",
  "Add Product": "添加產品",
  "Product": "產品",
  "Category": "類別",
  "Status": "狀態",
  "Active": "活躍",
  "Inactive": "非活躍",
  "Product Name": "產品名稱",
  "Optional": "可選",
  "No products yet. Click \"Add Product\" to get started.": "尚無產品。點擊「添加產品」開始。",
  "Add a new product to track": "添加要追蹤的新產品",
  "Delete Product": "刪除產品",
  "Are you sure you want to delete this product? This action cannot be undone.": "您確定要刪除此產品嗎？此操作無法撤銷。",
  "Adding...": "添加中...",
  "Deleting...": "刪除中...",
  "Delete": "刪除",
  "Cancel": "取消",
  
  // CompetitorsCard
  "Competitors": "競品",
  "Track your competitors": "追蹤您的競品",
  "competitors": "競品",
  "Add Competitor": "添加競品",
  "Region": "地區",
  "Competitor Name": "競品名稱",
  "No competitors yet. Click \"Add Competitor\" to get started.": "尚無競品。點擊「添加競品」開始。",
  "Add a competitor to track": "添加要追蹤的競品",
  "Delete Competitor": "刪除競品",
  "Are you sure you want to delete this competitor? This action cannot be undone.": "您確定要刪除此競品嗎？此操作無法撤銷。",
  
  // Plan頁面
  "Plan": "方案",
  "Choose the subscription that fits your team.": "選擇適合您團隊的訂閱方案。",
  "Free Trial": "免費試用",
  "Basic": "基礎",
  "Advanced": "進階",
  "Enterprise": "企業",
  "Most Popular": "最受歡迎",
  "Current Plan": "當前方案",
  "Start for $0": "免費開始",
  "Choose Basic": "選擇基礎方案",
  "Choose Advanced": "選擇進階方案",
  "Contact Sales": "聯繫銷售",
  "Select Plan": "選擇方案",
  "Redirecting...": "重定向中...",
  "1 product monitoring": "1 個產品監測",
  "5 competitor tracking": "5 個競品追蹤",
  "50 AI queries per month": "每月 50 個 AI 查詢",
  "Get 7 days of full access, and earn an extra 7-day free trial by inviting one business user": "獲得 7 天完整訪問權限，邀請一位企業用戶即可額外獲得 7 天免費試用",
  "3 products monitoring": "3 個產品監測",
  "15 competitor tracking": "15 個競品追蹤",
  "150 AI queries per month": "每月 150 個 AI 查詢",
  "Email support": "電子郵件支援",
  "10 products monitoring": "10 個產品監測",
  "50 competitor tracking": "50 個競品追蹤",
  "500 AI queries per month": "每月 500 個 AI 查詢",
  "Priority support": "優先支援",
  "Advanced analytics": "進階分析",
  "20+ products monitoring": "20+ 個產品監測",
  "100+ competitor tracking": "100+ 個競品追蹤",
  "Unlimited AI queries": "無限 AI 查詢",
  "Dedicated support": "專屬支援",
  "Custom integrations": "自訂整合",
  "Security & compliance": "安全性與合規性",
  "We'll tailor a plan for your organization.": "我們將為您的組織量身定制方案。",
  "Email us": "發送郵件",
  
  // Intent頁面
  "Information": "檢索",
  "Advice": "建議",
  "Evaluation": "評估",
  "Comparison": "比較",
  "Other": "其他",
  
  // Tooltips - Sources頁面
  "Sources": "顯示你的品牌被提及的來源網站",
  "Sources_en": "Shows the websites where your brand is mentioned",
  "Type": "該來源的類別，如新聞、博客、技術文檔等",
  "Type_en": "Type of source, such as news, blogs, or technical documents",
  "Citation rate": "該來源在回答中被引用的頻率",
  "Citation rate_en": "How often this source is cited in AI responses",
  "Mentioned": "是否在該來源中提到你的品牌（是/否）",
  "Mentioned_en": "Whether your brand is mentioned in this source (Yes/No)",
  "Mentions": "該來源中提到的所有品牌數量",
  "Mentions_en": "Number of brands mentioned in this source",
  "Sources Distribution": "不同來源類別的佔比情況，協助識別主要引用來源",
  "Sources Distribution_en": "How each source category contributes to total mentions, highlighting dominant origins.",
  
  // Tooltips - Intent頁面
  "Core Queries": "代表該品類的核心問題",
  "Core Queries_en": "Representative key questions for this category",
  "Total Queries": "該品類下的總問題數量",
  "Total Queries_en": "Total number of questions under this category",
  "Intent Distribution": "各類意圖問題在整體中的佔比",
  "Intent Distribution_en": "Proportion of each intent type across all questions",
  "Query Distribution": "各類查詢問題在整體中的佔比",
  "Query Distribution_en": "Proportion of each query type across all questions",
  "Topics": "該品類下相關的主要話題",
  "Topics_en": "Main topics related to this category",
  "Total Queries（Topic）": "該主題下的問題總數",
  "Total Queries（Topic）_en": "Total number of questions under this topic",
  "Reach": "該主題下你的品牌被提到的頻率平均值",
  "Reach_en": "Average frequency your brand is mentioned under this topic",
  "Rank": "該主題下你的品牌在回答中出現的順序平均值",
  "Rank_en": "Average order your brand appears in responses under this topic",
  "Focus": "該主題內容中你的品牌所佔篇幅的平均比例",
  "Focus_en": "Average proportion of content focused on your brand under this topic",
  "Sentiment（Intent頁面）": "該主題下 AI 對你的品牌的情緒傾向平均值",
  "Sentiment（Intent頁面）_en": "Average sentiment of AI toward your brand under this topic",
  "Intent（core query 表格）": "當前問題的意圖類型",
  "Intent（core query 表格）_en": "The intent type of the current question",
  "Mentions（core query 表格）": "該問題下被提到的所有品牌數量",
  "Mentions（core query 表格）_en": "Number of brands mentioned in this question",
  "Rank（core query 表格）": "你的品牌在此問題下的出現順序平均值",
  "Rank（core query 表格）_en": "Average order your brand appears in this question",
  "Focus（core query 表格）": "你的品牌在此問題下的內容佔比平均值",
  "Focus（core query 表格）_en": "Average proportion of content focused on your brand in this question",
  "Citation（core query 表格）": "你的品牌在此問題下的引用來源數量",
  "Citation（core query 表格）_en": "Number of sources citing your brand in this question",
  
  // Tooltips - Overview頁面
  "Brand influence": "品牌影響力",
  "Brand influence_en": "Brand influence",
  "Brand influence_tooltip": "結合可見度和情緒，反映品牌在 AI 生態系統中的整體影響力",
  "Brand influence_tooltip_en": "Combines visibility and sentiment to reflect the brand's overall influence in the AI ecosystem",
  "Visibility": "可見度",
  "Visibility_en": "Visibility",
  "Sentiment": "情緒",
  "Sentiment_en": "Sentiment",
  "Overview description": "根據品牌在 AI 檢索中的可見度與情緒傾向，綜合衡量其整體影響力",
  "Overview description_en": "Measure your brand's overall influence through its visibility and sentiment in AI search",
  "Reach": "表示品牌在 AI 回答中被提及的頻率 — 更高的觸及率意味著更大的曝光度",
  "Reach_en": "Indicates how often the brand is mentioned in AI responses — higher reach means greater exposure",
  "Rank": "顯示品牌在 AI 回答中出現的時間順序 — 更早的提及表明更高的相關性或優先級",
  "Rank_en": "Shows how early the brand appears in AI answers — earlier mentions suggest higher relevance or priority",
  "Focus": "衡量 AI 內容中關注品牌的比重 — 代表其注意力份額",
  "Focus_en": "Measures how much of the AI's content focuses on the brand — representing its share of attention",
  "Sentiment": "情緒",
  "Sentiment_en": "Sentiment",
  "Sentiment_tooltip": "顯示 AI 對品牌的情緒傾向，範圍從負面到正面",
  "Sentiment_tooltip_en": "Shows AI's emotional tone toward the brand, ranging from negative to positive",
  "Influence ranking": "影響力排名",
  "Influence ranking_en": "Influence ranking",
  "Influence ranking_tooltip": "顯示品牌在 AI 影響力方面與類似產品相比的排名",
  "Influence ranking_tooltip_en": "Shows how a brand ranks in AI influence compared to similar products",
  "Sources": "引用來源",
  "Sources_en": "Sources",
  "Topics": "熱門主題",
  "Topics_en": "Topics",
  "View detail": "查看詳情",
  "View detail_en": "View detail",
  "mentions": "次提及",
  "mentions_en": "mentions",
  "occurrences": "次出現",
  "occurrences_en": "occurrences",
  "Add Competitor": "添加競品",
  "Add Competitor_en": "Add Competitor",
  "Add Competitor Brand": "添加競品品牌",
  "Add Competitor Brand_en": "Add Competitor Brand",
  "Select competitor brands to add to the trend chart": "選擇要添加到趨勢圖中的競品品牌",
  "Select competitor brands to add to the trend chart_en": "Select competitor brands to add to the trend chart",
  "No available competitor brands": "沒有可用的競品品牌",
  "No available competitor brands_en": "No available competitor brands",
  "Cancel": "取消",
  "Cancel_en": "Cancel",
  "Mentioned": "已提及",
  "Mentioned_en": "Mentioned",
  "Not mentioned": "未提及",
  "Not mentioned_en": "Not mentioned",
  "Overview": "概覽",
  "Overview_en": "Overview",
  "Measure your brand's overall influence through its visibility and sentiment in AI search": "根據品牌在 AI 檢索中的可見度與情緒傾向，綜合衡量其整體影響力",
  "Measure your brand's overall influence through its visibility and sentiment in AI search_en": "Measure your brand's overall influence through its visibility and sentiment in AI search",
  "有提及": "有提及",
  "有提及_en": "Mentioned",
  "未提及": "未提及",
  "未提及_en": "Not mentioned",
  "Sources overview": "瞭解 AI 回答中最常引用的來源網站，以及是否提到你的品牌",
  "Sources overview_en": "See which sources AI responses cite most often and whether your brand is mentioned.",
  "Topics overview": "快速掌握本期間最受關注的主題與品牌提及率",
  "Topics overview_en": "Review the top themes this period and how often your brand appears within them.",
  "Reach": "觸及率",
  "Reach_en": "Reach",
  "Rank": "提及順序",
  "Rank_en": "Rank",
  "Focus": "內容佔比",
  "Focus_en": "Focus",
  
  // Tooltips - Visibility頁面
  "Trend": "顯示所選指標（可見度 / 觸及率 / 提及順序 / 內容佔比）隨時間的近期變化。使用下拉選單切換",
  "Trend_en": "Shows recent change over time for the selected metric (Visibility / Reach / Rank / Focus). Use the dropdown to switch",
  "Visibility Heatmap": "可見度熱力圖",
  "Visibility Heatmap_en": "Visibility Heatmap",
  "Visibility Heatmap_tooltip": "來源與主題的交叉熱力圖，用於快速識別模型在何處最常提到你的品牌",
  "Visibility Heatmap_tooltip_en": "Source × Topic heatmap that highlights where models most frequently mention your brand.",
  "Visibility Trend": "可見度趨勢",
  "Visibility Trend_en": "Visibility Trend",
  "No visibility trend data": "無可用的可見度趨勢資料",
  "No visibility trend data_en": "No visibility trend data",
  "Try adjusting your filters": "請調整篩選條件後再試",
  "Try adjusting your filters_en": "Try adjusting your filters",
 
  // Tooltips - Sentiment頁面
  "Avg Sentiment": "平均情緒",
  "Avg Sentiment_en": "Avg Sentiment",
  "Positive": "正面",
  "Positive_en": "Positive",
  "Neutral": "中性",
  "Neutral_en": "Neutral",
  "Negative": "負面",
  "Negative_en": "Negative",
  "Top Positive Topics": "熱門正面主題",
  "Top Positive Topics_en": "Top Positive Topics",
  "Top Negative Topics": "熱門負面主題",
  "Top Negative Topics_en": "Top Negative Topics",
  "Sentiment Distribution": "情緒分佈",
  "Sentiment Distribution_en": "Sentiment Distribution",
  "Innovation leadership": "創新領導力",
  "Innovation leadership_en": "Innovation leadership",
  "Product quality": "產品品質",
  "Product quality_en": "Product quality",
  "Customer satisfaction": "客戶滿意度",
  "Customer satisfaction_en": "Customer satisfaction",
  "Market position": "市場地位",
  "Market position_en": "Market position",
  "Technology advancement": "技術進步",
  "Technology advancement_en": "Technology advancement",
  "Sentiment trend": "顯示所選品牌隨時間的情緒趨勢",
  "Sentiment trend_en": "Shows sentiment trend over time for selected brands",
  "Sentiment Score Rank": "顯示品牌按情緒分數與競爭對手相比的排名",
  "Sentiment Score Rank_en": "Shows how brands rank by sentiment score compared to competitors",
  
  // Sidebar導航
  "Queries": "查詢分析",
  "Queries_en": "Queries",
  "Team": "團隊",
  "Team_en": "Team",
  "Plan": "方案",
  "Plan_en": "Plan",
  "Tracking": "追蹤",
  "Tracking_en": "Tracking",
  "Insights": "洞察",
  "Insights_en": "Insights",
  
  // Team頁面
  "Invite Member": "邀請成員",
  "Invite Member_en": "Invite Member",
  "Inviting...": "邀請中...",
  "Inviting..._en": "Inviting...",
  "Admin": "管理員",
  "Admin_en": "Admin",
  "Viewer": "檢視者",
  "Viewer_en": "Viewer",
  
  // Time range selector
  "Last 1Day": "Last 1Day",
  "Last 1Day_en": "Last 1Day",
  "Last 7Days": "Last 7Days",
  "Last 7Days_en": "Last 7Days",
  "14 days": "14 days",
  "14 days_en": "14 days",
  "30 days": "30 days",
  "30 days_en": "30 days",
  "Calendar": "日曆",
  "Calendar_en": "Calendar",
  "Visibility Ranking": "可見度排名",
  "Visibility Ranking_en": "Visibility Ranking",
  "Source / Topic": "來源 / 主題",
  "Source / Topic_en": "Source / Topic",
  "Efficient supply chain management": "高效的供應鏈管理",
  "Efficient supply chain operations": "高效的供應鏈運營",
  "Analyze brand visibility metrics: Reach, Rank, and Focus": "分析品牌可見度指標：觸及率、提及順序和內容佔比",
  "Analyze brand visibility metrics: Reach, Rank, and Focus_en": "Analyze brand visibility metrics: Reach, Rank, and Focus",
  "vs previous day": "與前一天相比",
  "vs previous day_en": "vs previous day",
  "vs previous": "與前",
  "vs previous_en": "vs previous",
  "days": "天相比",
  "days_en": "days",
}

/**
 * 將簡體中文轉換為繁體中文
 */
export function toTraditional(text: string): string {
  if (!text) return text
  
  let result = text
  // 逐字檢查並轉換
  for (const [simplified, traditional] of Object.entries(simplifiedToTraditional)) {
    result = result.replace(new RegExp(simplified, "g"), traditional)
  }
  
  return result
}

/**
 * 根據語言返回翻譯後的文字
 */
export function translate(text: string, language: Language): string {
  if (language === "zh-TW") {
    // 先檢查英文到繁體中文的映射
    if (englishToTraditional[text]) {
      return englishToTraditional[text]
    }
    // 再檢查簡體中文到繁體中文的映射
    return toTraditional(text)
  }
  return text
}

/**
 * 獲取 tooltip 內容（根據語言返回對應的說明）
 */
export function getTooltipContent(key: string, language: Language): string {
  if (language === "zh-TW") {
    // 繁體中文：直接返回中文說明
    return englishToTraditional[key] || key
  } else {
    // 英文：返回英文說明（使用 _en 後綴的 key）
    const enKey = `${key}_en`
    return englishToTraditional[enKey] || key
  }
}

/**
 * 批量翻譯文字陣列
 */
export function translateArray(texts: string[], language: Language): string[] {
  return texts.map(text => translate(text, language))
}

/**
 * 翻譯物件中的文字屬性
 */
export function translateObject<T extends Record<string, any>>(
  obj: T,
  language: Language,
  keys: (keyof T)[]
): T {
  if (language === "en") {
    return obj
  }
  
  const result = { ...obj }
  for (const key of keys) {
    if (typeof result[key] === "string") {
      result[key] = translate(result[key] as string, language) as T[keyof T]
    }
  }
  
  return result
}

