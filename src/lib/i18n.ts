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
  
  // 金融品牌相關（確保所有品牌名稱都轉換為繁體）
  "中国": "中國",
  "银行": "銀行",
  "信托": "信託",
  "证券": "證券",
  "基金": "基金",
  "财富": "財富",
  "财富管理": "財富管理",
  "国际": "國際",
  "集团": "集團",
  "控股": "控股",
  "资本": "資本",
  "公司": "公司",
  "管理": "管理",
  "私人": "私人",
  "资产": "資產",
  "资产配置": "資產配置",
  "拥有": "擁有",
  "专业": "專業",
  "团队": "團隊",
  "为": "為",
  "客户": "客戶",
  "投资": "投資",
  "投资建议": "投資建議",
  "建议": "建議",
  "业内": "業內",
  "声誉": "聲譽",
  "信誉": "信譽",
  "服务": "服務",
  "金融服务": "金融服務",
  "涵盖": "涵蓋",
  "债券": "債券",
  "保险": "保險",
  "另类": "另類",
  "产品": "產品",
  "满足": "滿足",
  "高净值": "高淨值",
  "净值": "淨值",
  "专注": "專注",
  "定制化": "定制化",
  "多元化": "多元化",
  "华夏": "華夏",
  "工银": "工銀",
  "瑞信": "瑞信",
  "海通": "海通",
  "渣打": "渣打",
  "瑞讯": "瑞訊",
  "瑞银": "瑞銀",
  "花旗": "花旗",
  "辉立": "輝立",
  "野村": "野村",
  "高盛": "高盛",
  "中金": "中金",
  "中金公司": "中金公司",  // "公司"在繁体中也是"公司"，没有简繁区别，所以这个映射是正确的
  "中金財富證券": "中金財富證券",  // 确保繁体版本也能正确显示
  "中金财富证券": "中金財富證券",
  "中金財富管理": "中金財富管理",  // 确保繁体版本也能正确显示
  "中金财富管理": "中金財富管理",
  "交通": "交通",
  "光大": "光大",
  "平安": "平安",
  "建信": "建信",
  "招商": "招商",
  "摩根": "摩根",
  "大通": "大通",
  "伯恩斯坦": "伯恩斯坦",
  // 銀行品牌名稱（完整名稱映射）
  "国泰世华银行": "國泰世華銀行",
  "玉山银行": "玉山銀行",
  "台新银行": "台新銀行",
  "国泰证券": "國泰證券",
  "台新": "台新",
  "玉山": "玉山",
  "国泰世华": "國泰世華",
  
  // PortfolioPilot 相關
  "PortfolioPilot": "PortfolioPilot",
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
  "Unsaved Changes": "尚未保存更改",
  "You have unsaved changes. Do you want to save them before leaving?": "尚未保存更改的信息，确定要离开吗？",
  "Save Changes": "保存更改",
  "Discard Changes": "放棄更改",
  "Your changes have been saved successfully": "您的更改已成功保存",
  "Failed to save changes. Please try again.": "保存更改失敗。請重試。",
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
  "Showing": "顯示",
  "of": "共",
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
  "Mentions": "提及品牌",
  "Mentions_en": "Mentions",
  "Sources Distribution": "不同來源類別的佔比情況，協助識別主要引用來源",
  "Sources Distribution_en": "How each source category contributes to total mentions, highlighting dominant origins.",
  
  // Source Type 分類和用途說明
  "Official": "Official",
  "Official_zh": "官方",
  "Official_purpose": "產品信息最權威",
  "Official_purpose_en": "Most authoritative product information",
  "Official Website": "Official",
  "Official Website_zh": "官方",
  "News": "News",
  "News_zh": "新聞",
  "News_purpose": "事實數據最核心來源",
  "News_purpose_en": "Core source of factual data",
  "News / Editorial": "News",
  "News / Editorial_zh": "新聞",
  "Editorial": "News",
  "Editorial_zh": "新聞",
  "Media": "Media",
  "Media_zh": "媒體",
  "Media_purpose": "科技/產品分析",
  "Media_purpose_en": "Technology/product analysis",
  "Tech / Vertical Media": "Media",
  "Tech / Vertical Media_zh": "媒體",
  "Tech Blog": "Media",
  "Tech Blog_zh": "媒體",
  "Knowledge": "Knowledge",
  "Knowledge_zh": "知識",
  "Knowledge_purpose": "背景知識",
  "Knowledge_purpose_en": "Background knowledge",
  "Wiki / Knowledge Base": "Knowledge",
  "Wiki / Knowledge Base_zh": "知識",
  "Wiki": "Knowledge",
  "Wiki_zh": "知識",
  "Knowledge Base": "Knowledge",
  "Knowledge Base_zh": "知識",
  "Business Profiles": "Business Profiles",
  "Business Profiles_zh": "商業檔案",
  "Business Profiles_purpose": "公司信息",
  "Business Profiles_purpose_en": "Company information",
  "Review": "Review",
  "Review_zh": "評測",
  "Review_purpose": "評測/口碑",
  "Review_purpose_en": "Reviews/reputation",
  "Product Review": "Review",
  "Product Review_zh": "評測",
  "Review Site": "Review",
  "Review Site_zh": "評測",
  "UGC": "UGC",
  "UGC_zh": "用戶生成內容",
  "UGC_purpose": "用戶經驗",
  "UGC_purpose_en": "User experience",
  "Social Media": "UGC",
  "Social Media_zh": "用戶生成內容",
  "Academic": "Academic",
  "Academic_zh": "學術",
  "Academic_purpose": "專業知識",
  "Academic_purpose_en": "Professional knowledge",
  
  // Tooltips - Intent頁面
  "Core Queries": "核心查詢",
  "Core Queries_en": "Core Queries",
  "Core Query": "核心查詢",
  "Core Query_en": "Core Query",
  "Total Queries": "總查詢數",
  "Total Queries_en": "Total Queries",
  "Intent Distribution": "意圖分佈",
  "Intent Distribution_en": "Intent Distribution",
  "AI Response": "AI 回答",
  "AI Response_en": "AI Response",
  "Intent": "意圖",
  "Intent_en": "Intent",
  "Citation": "引用",
  "Citation_en": "Citation",
  "Query Distribution": "各類查詢問題在整體中的佔比",
  "Query Distribution_en": "Proportion of each query type across all questions",
  "Topics": "該品類下相關的主要話題",
  "Topics_en": "Main topics related to this category",
  "Query Topics": "查詢問題的主要主題分類",
  "Query Topics_en": "Main topic categories for query questions",
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
  "Mentioned（core query 表格）": "該查詢是否提到本品牌",
  "Mentioned（core query 表格）_en": "Whether this query mentions your brand",
  "Mentions（core query 表格）": "該問題下被提到的所有品牌數量",
  "Mentions（core query 表格）_en": "Number of brands mentioned in this question",
  "Position（core query 表格）": "你的品牌在此問題下的出現順序平均值",
  "Position（core query 表格）_en": "Average order your brand appears in this question",
  "Focus（core query 表格）": "你的品牌在此問題下的內容佔比平均值",
  "Focus（core query 表格）_en": "Average proportion of content focused on your brand in this question",
  "Citation（core query 表格）": "你的品牌在此問題下的引用來源數量",
  "Citation（core query 表格）_en": "Number of sources citing your brand in this question",
  
  // Tooltips - Overview頁面
  "Brand influence": "品牌影響力",
  "Brand influence_en": "Brand influence",
  "Brand influence_tooltip": "綜合可見度與情感，體現品牌在 AI 世界的整體影響力。",
  "Brand influence_tooltip_en": "Combines visibility and sentiment to reflect overall brand influence in AI.",
  "Brand Influence Trends_tooltip": "查看您和競品的品牌影響力變化趨勢",
  "Brand Influence Trends_tooltip_en": "View trends in your and your competitors' brand influence.",
  "Visibility": "可見度",
  "Visibility_en": "Visibility",
  "Visibility_tooltip": "反映品牌在 AI 回答中被看到的整體程度。",
  "Visibility_tooltip_en": "Shows how visible a brand is in AI-generated answers.",
  "Sentiment": "情緒",
  "Sentiment_en": "Sentiment",
  "Overview description": "根據品牌在 AI 檢索中的可見度與情緒傾向，綜合衡量其整體影響力",
  "Overview description_en": "Measure your brand's overall influence through its visibility and sentiment in AI search",
  "Reach": "表示品牌在 AI 回答中被提及的頻率 — 更高的觸及率意味著更大的曝光度",
  "Reach_en": "Indicates how often the brand is mentioned in AI responses — higher reach means greater exposure",
  "Reach_tooltip": "表示品牌在 AI 中被提到的頻率，越高說明曝光越多",
  "Reach_tooltip_en": "Indicates how often the brand is mentioned by AI — higher means more exposure.",
  "Rank": "顯示品牌在 AI 回答中出現的時間順序 — 更早的提及表明更高的相關性或優先級",
  "Rank_en": "Shows how early the brand appears in AI answers — earlier mentions suggest higher relevance or priority",
  "Position": "顯示品牌在 AI 回答中出現的時間順序 — 更早的提及表明更高的相關性或優先級",
  "Position_en": "Shows how early the brand appears in AI answers — earlier mentions suggest higher relevance or priority",
  "Position_tooltip": "在提到品牌的回答中，品牌出現的平均先後順序，越靠前代表越受關注",
  "Position_tooltip_en": "The average order in which a brand appears in responses, with earlier mentions indicating higher attention.",
  "Focus": "衡量 AI 內容中關注品牌的比重 — 代表其注意力份額",
  "Focus_en": "Measures how much of the AI's content focuses on the brand — representing its share of attention",
  "Focus_tooltip": "在提到品牌的回答中，品牌內容所佔整體篇幅比例，體現品牌存在感",
  "Focus_tooltip_en": "The proportion of content dedicated to the brand in responses, reflecting its presence.",
  "Sentiment_tooltip": "在提到品牌的回答中，反映 AI 對品牌的情緒態度，從負面到正面。",
  "Sentiment_tooltip_en": "Reflects AI's emotional tone towards the brand in responses, from negative to positive.",
  "Influence ranking": "影響力排名",
  "Influence ranking_en": "Influence ranking",
  "Influence ranking_tooltip": "根據品牌的影響力，顯示品牌在同類產品中的排名。",
  "Influence ranking_tooltip_en": "Shows how a brand ranks in AI influence compared to similar products.",
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
  "Mentioned": "提到您",
  "Mentioned_en": "Mentioned",
  "Not mentioned": "未提及",
  "Not mentioned_en": "Not mentioned",
  "Overview": "概覽",
  "Overview_en": "Overview",
  "Measure your brand's overall influence through its visibility and sentiment in AI search": "透過AI搜尋中的可見性和情感傾向來衡量您的品牌整體影響力",
  "Measure your brand's overall influence through its visibility and sentiment in AI search_en": "Measure your brand's overall influence through visibility and sentiment in AI search.",
  "有提及": "有提及",
  "有提及_en": "Mentioned",
  "未提及": "未提及",
  "未提及_en": "Not mentioned",
  "Sources overview": "顯示被模型引用的熱門網站，以及網站是否提及您的品牌",
  "Sources overview_en": "Displays popular websites referenced by the model, and whether those websites mention your brand.",
  "Top sources_tooltip": "顯示被模型引用的熱門網站，以及網站是否提及您的品牌",
  "Top sources_tooltip_en": "Displays popular websites referenced by the model, and whether those websites mention your brand.",
  "Topics overview": "顯示使用者提問中熱門的主題，並展示該主題所佔所有主題的比例",
  "Topics overview_en": "Display the most popular topics among user questions and show the percentage of each topic among all topics.",
  "Top topics_tooltip": "顯示使用者提問中最熱門的主題，並顯示每個主題在所有主題中所佔的百分比。",
  "Top topics_tooltip_en": "Displays the most popular topics in user questions and shows the percentage of each theme among all topics.",
  "Reach": "觸及率",
  "Reach_en": "Reach",
  "Rank": "提及順序",
  "Rank_en": "Position",
  "Position": "提及順序",
  "Position_en": "Position",
  "Focus": "內容佔比",
  "Focus_en": "Focus",
  "Ranking": "排名",
  "Ranking_en": "Ranking",
  
  // Tooltips - Visibility頁面
  "Trend": "顯示所選指標（可見度 / 觸及率 / 提及順序 / 內容佔比）隨時間的近期變化。使用下拉選單切換",
  "Trend_en": "Shows recent change over time for the selected metric (Visibility / Reach / Position / Focus). Use the dropdown to switch",
  "Visibility Heatmap": "可見度熱力圖",
  "Visibility Heatmap_en": "Visibility Heatmap",
  "Visibility Heatmap_tooltip": "展示熱門提问主題和AI回答中網站來源類型下您的品牌提及率",
  "Visibility Heatmap_tooltip_en": "Show your brand reach (mention rate) by website source type in popular question topics and AI answers.",
  "Visibility Trend": "可見度趨勢",
  "Visibility Trend_en": "Visibility Trend",
  "Visibility Trend_tooltip": "查看您的品牌可見度變化趨勢",
  "Visibility Trend_tooltip_en": "View trends in your brand visibility.",
  "No visibility trend data": "無可用的可見度趨勢資料",
  "No visibility trend data_en": "No visibility trend data",
  "Try adjusting your filters": "請調整篩選條件後再試",
  "Try adjusting your filters_en": "Try adjusting your filters",
  "Loading...": "載入中...",
  "Loading..._en": "Loading...",
  "Error loading data": "載入資料時發生錯誤",
  "Error loading data_en": "Error loading data",
  "No data available. Try adjusting filters.": "無可用資料。請調整篩選條件。",
  "No data available. Try adjusting filters._en": "No data available. Try adjusting filters.",
 
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
  "Top Positive Response Themes": "熱門正面回應主題",
  "Top Positive Response Themes_en": "Top Positive Response Themes",
  "Top Negative Response Themes": "熱門負面回應主題",
  "Top Negative Response Themes_en": "Top Negative Response Themes",
  "Response Themes": "回應主題",
  "Response Themes_en": "Response Themes",
  "Query Topics": "查詢主題",
  "Query Topics_en": "Query Topics",
  "Topics": "主題",
  "Topics_en": "Topics",
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
  "Avg Sentiment_tooltip": "展示 AI 回答中提及你品牌時的平均情緒傾向，反映整體正負面態度。",
  "Avg Sentiment_tooltip_en": "Shows the average emotional tone in AI responses mentioning your brand — overall positivity or negativity.",
  "Positive_tooltip": "表示 AI 對你品牌持積極態度的回答占比。",
  "Positive_tooltip_en": "Percentage of AI responses expressing positive sentiment toward your brand.",
  "Neutral_tooltip": "表示 AI 對你品牌保持客觀或中立態度的回答占比。",
  "Neutral_tooltip_en": "Percentage of AI responses that remain neutral or factual toward your brand.",
  "Negative_tooltip": "表示 AI 對你品牌持負面態度的回答占比。",
  "Negative_tooltip_en": "Percentage of AI responses expressing negative sentiment toward your brand.",
  "Sentiment trend_tooltip": "展示情緒得分隨時間變化的趨勢，用於觀察品牌口碑走向。",
  "Sentiment trend_tooltip_en": "Shows how your brand's sentiment score changes over time — tracking reputation trends.",
  "Top Positive Topics_tooltip": "展示 AI 回答中對你品牌評價最積極的主題。",
  "Top Positive Topics_tooltip_en": "Highlights the topics where AI shows the most positive sentiment toward your brand.",
  "Top Negative Topics_tooltip": "展示 AI 回答中對你品牌評價最消極的主題。",
  "Top Negative Topics_tooltip_en": "Highlights the topics where AI shows the most negative sentiment toward your brand.",
  "Sentiment Distribution_tooltip": "展示不同來源類別中的情緒表現，對比各渠道的正面與負面傾向。",
  "Sentiment Distribution_tooltip_en": "Shows how sentiment shifts across each source category, comparing positive vs. negative share.",
  
  // Sidebar導航
  "Queries": "查詢分析",
  "Queries_en": "Queries",
  "Analyze AI prompts and answers to understand query visibility and sentiment": "分析 AI 提示和回答以了解查詢可見度和情緒",
  "Analyze AI prompts and answers to understand query visibility and sentiment_en": "Analyze AI prompts and answers to understand query visibility and sentiment",
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
  "No permission": "無權限",
  "No permission_en": "No permission",
  "Only administrators can delete members.": "僅管理員可刪除成員。",
  "Only administrators can delete members._en": "Only administrators can delete members.",
  "I understand": "我知道了",
  "I understand_en": "I understand",
  "Cannot delete, current team has only one member": "無法刪除，當前team僅有一位成員無法刪除",
  "Cannot delete, current team has only one member_en": "Cannot delete, current team has only one member",
  "Please invite a new member before deleting the current member.": "請先邀請新成員後再刪除當前成員。",
  "Please invite a new member before deleting the current member._en": "Please invite a new member before deleting the current member.",
  "Confirm deletion?": "確定刪除嗎？",
  "Confirm deletion?_en": "Confirm deletion?",
  "This action will remove access for member": "此操作將移除成員",
  "This action will remove access for member_en": "This action will remove access for member",
  "'s access permissions.": "的訪問權限。",
  "'s access permissions._en": "'s access permissions.",
  "This action will remove access for this member.": "此操作將移除該成員的訪問權限。",
  "This action will remove access for this member._en": "This action will remove access for this member.",
  "Confirm": "確認",
  "Confirm_en": "Confirm",
  
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
  "Visibility Ranking_tooltip": "根據品牌的可見度，顯示品牌在同類產品中的排名",
  "Visibility Ranking_tooltip_en": "Shows how a brand ranks in AI visibility compared to similar products.",
  "Reach Ranking_tooltip": "根據品牌的提及率，顯示品牌在同類產品中的排名",
  "Reach Ranking_tooltip_en": "Shows how a brand ranks in reach compared to similar products.",
  "Position Ranking_tooltip": "根據品牌在回答中的提及順序，顯示品牌在同類產品中的排名",
  "Position Ranking_tooltip_en": "Shows how a brand ranks in the order of mentions in AI answers compared to similar products.",
  "Focus Ranking_tooltip": "根據品牌在回答中的內容佔比，顯示品牌在同類產品中的排名",
  "Focus Ranking_tooltip_en": "Shows how a brand ranks in the focus content percentage in AI answers compared to similar products.",
  "Source / Topic": "來源類別 / 主題",
  "Source / Topic_en": "Source Category / Topic",
  "Efficient supply chain management": "高效的供應鏈管理",
  "Efficient supply chain operations": "高效的供應鏈運營",
  "Analyze brand visibility metrics: Reach, Rank, and Focus": "分析品牌可見度指標：觸及率、提及順序和內容佔比",
  "Analyze brand visibility metrics: Reach, Rank, and Focus_en": "Analyze brand visibility metrics: Reach, Position, and Focus",
  "Visibility Insights": "可見度",
  "Visibility Insights_en": "Visibility",
  "Measure your brand visibility by analyzing brand mention rate, mention order, and content proportion in AI searches.": "透過分析AI搜尋中的品牌提及率、提及順序和內容佔比和來衡量您的品牌可見度",
  "Measure your brand visibility by analyzing brand mention rate, mention order, and content proportion in AI searches._en": "Measure your brand visibility by analyzing brand mention rate, mention order, and content proportion in AI searches.",
  "vs previous day": "與前一天相比",
  "vs previous day_en": "vs previous day",
  "vs previous": "與前",
  "vs previous_en": "vs previous",
  "days": "天相比",
  "days_en": "days",
  
  // Toast messages - Products
  "Brand Created": "品牌已創建",
  "Brand Created_en": "Brand Created",
  "has been created successfully": "已成功創建",
  "has been created successfully_en": "has been created successfully",
  "Failed to Create Brand": "創建品牌失敗",
  "Failed to Create Brand_en": "Failed to Create Brand",
  "Please try again": "請重試",
  "Please try again_en": "Please try again",
  "Brand information updated successfully": "品牌資訊已成功更新",
  "Brand information updated successfully_en": "Brand information updated successfully",
  "Failed to Save": "保存失敗",
  "Failed to Save_en": "Failed to Save",
  "Brand Deleted": "品牌已刪除",
  "Brand Deleted_en": "Brand Deleted",
  "has been deleted successfully": "已成功刪除",
  "has been deleted successfully_en": "has been deleted successfully",
  "Failed to Delete Brand": "刪除品牌失敗",
  "Failed to Delete Brand_en": "Failed to Delete Brand",
  "Product Created": "產品已創建",
  "Product Created_en": "Product Created",
  "Failed to Create Product": "創建產品失敗",
  "Failed to Create Product_en": "Failed to Create Product",
  "Product information updated successfully": "產品資訊已成功更新",
  "Product information updated successfully_en": "Product information updated successfully",
  "Product Deleted": "產品已刪除",
  "Product Deleted_en": "Product Deleted",
  "Failed to Delete Product": "刪除產品失敗",
  "Failed to Delete Product_en": "Failed to Delete Product",
  "Competitor Created": "競品已創建",
  "Competitor Created_en": "Competitor Created",
  "Failed to Create Competitor": "創建競品失敗",
  "Failed to Create Competitor_en": "Failed to Create Competitor",
  "Competitor information updated successfully": "競品資訊已成功更新",
  "Competitor information updated successfully_en": "Competitor information updated successfully",
  "Competitor Deleted": "競品已刪除",
  "Competitor Deleted_en": "Competitor Deleted",
  "Failed to Delete Competitor": "刪除競品失敗",
  "Failed to Delete Competitor_en": "Failed to Delete Competitor",
  "Persona Created": "人物角色已創建",
  "Persona Created_en": "Persona Created",
  "Failed to Create Persona": "創建人物角色失敗",
  "Failed to Create Persona_en": "Failed to Create Persona",
  "Persona information updated successfully": "人物角色資訊已成功更新",
  "Persona information updated successfully_en": "Persona information updated successfully",
  "Persona Deleted": "人物角色已刪除",
  "Persona Deleted_en": "Persona Deleted",
  "Failed to Delete Persona": "刪除人物角色失敗",
  "Failed to Delete Persona_en": "Failed to Delete Persona",
  
  // Toast messages - Auth
  "Are you sure you want to log out?": "您確定要登出嗎？",
  "Are you sure you want to log out?_en": "Are you sure you want to log out?",
  "You will need to sign in again to continue.": "您需要重新登入才能繼續。",
  "You will need to sign in again to continue._en": "You will need to sign in again to continue.",
  
  // Toast messages - General
  "Export": "導出",
  "Export_en": "Export",
  "Export is under development.": "導出功能開發中",
  "Export is under development._en": "Export is under development.",
  "Export feature": "導出功能",
  "Export feature_en": "Export feature",
  
  // Delete Product Dialog
  "Delete Product": "刪除產品",
  "Delete Product_en": "Delete Product",
  "Are you sure you want to delete this product? This action cannot be undone.": "您確定要刪除此產品嗎？此操作無法撤銷。",
  "Are you sure you want to delete this product? This action cannot be undone._en": "Are you sure you want to delete this product? This action cannot be undone.",
  
  // Delete Persona Dialog
  "Delete Persona": "刪除人物角色",
  "Delete Persona_en": "Delete Persona",
  "Are you sure you want to delete this persona? This action cannot be undone.": "您確定要刪除此人物角色嗎？此操作無法撤銷。",
  "Are you sure you want to delete this persona? This action cannot be undone._en": "Are you sure you want to delete this persona? This action cannot be undone.",
  
  // Sentiment page
  "No positive topics available": "暫無正面主題",
  "No positive topics available_en": "No positive topics available",
  "No negative topics available": "暫無負面主題",
  "No negative topics available_en": "No negative topics available",
  
  // Toast messages - Additional
  "Product Added": "產品已添加",
  "Product Added_en": "Product Added",
  "Product has been added successfully": "產品已成功添加",
  "Product has been added successfully_en": "Product has been added successfully",
  "Failed to Add Product": "添加產品失敗",
  "Failed to Add Product_en": "Failed to Add Product",
  "Product Updated": "產品已更新",
  "Product Updated_en": "Product Updated",
  "Product has been updated successfully": "產品已成功更新",
  "Product has been updated successfully_en": "Product has been updated successfully",
  "Failed to Update": "更新失敗",
  "Failed to Update_en": "Failed to Update",
  "Product has been removed successfully": "產品已成功移除",
  "Product has been removed successfully_en": "Product has been removed successfully",
  "Failed to Delete": "刪除失敗",
  "Failed to Delete_en": "Failed to Delete",
  "Persona Added": "人物角色已添加",
  "Persona Added_en": "Persona Added",
  "Persona has been added successfully": "人物角色已成功添加",
  "Persona has been added successfully_en": "Persona has been added successfully",
  "Failed to Add Persona": "添加人物角色失敗",
  "Failed to Add Persona_en": "Failed to Add Persona",
  "Persona Updated": "人物角色已更新",
  "Persona Updated_en": "Persona Updated",
  "Persona has been updated successfully": "人物角色已成功更新",
  "Persona has been updated successfully_en": "Persona has been updated successfully",
  "Persona has been removed successfully": "人物角色已成功移除",
  "Persona has been removed successfully_en": "Persona has been removed successfully",
  "Competitor Added": "競品已添加",
  "Competitor Added_en": "Competitor Added",
  "Competitor has been added successfully": "競品已成功添加",
  "Competitor has been added successfully_en": "Competitor has been added successfully",
  "Failed to Add Competitor": "添加競品失敗",
  "Failed to Add Competitor_en": "Failed to Add Competitor",
  "Competitor Updated": "競品已更新",
  "Competitor Updated_en": "Competitor Updated",
  "Competitor has been updated successfully": "競品已成功更新",
  "Competitor has been updated successfully_en": "Competitor has been updated successfully",
  "Competitor has been removed successfully": "競品已成功移除",
  "Competitor has been removed successfully_en": "Competitor has been removed successfully",
  "Brand has been removed successfully": "品牌已成功移除",
  "Brand has been removed successfully_en": "Brand has been removed successfully",
  "Deleting...": "刪除中...",
  "Deleting..._en": "Deleting...",
  "Upgrade to": "升級到",
  "Upgrade to_en": "Upgrade to",
  
  // Overview page - Bottom cards
  "Top sources": "熱門來源",
  "Top sources_en": "Top Sources",
  "Top topics": "熱門主題",
  "Top topics_en": "Top Topics",
  
  // Overview page - Brand Influence Trends Chart
  "Brand Influence Trends": "品牌影響力趨勢",
  "Brand Influence Trends_en": "Brand Influence Trends",
}

// 中文到英文的映射（用于品牌名和 topics）
const chineseToEnglish: Record<string, string> = {
  // 品牌名
  "中国信托": "CTBC",
  "中國信託": "CTBC",
  "花旗私人银行": "CTBC", // 数据文件中的本品牌，映射为 CTBC
  "Citi Private Bank": "CTBC", // 英文版本也映射为 CTBC
  "英业达": "Inventec",
  "英業達": "Inventec",
  "惠普": "HP",
  "华为": "Huawei",
  "華為": "Huawei",
  "戴尔": "Dell",
  "戴爾": "Dell",
  "联想": "Lenovo",
  "聯想": "Lenovo",
  "超微": "Supermicro",
  "威盛電子": "VIA Technologies",
  "合勤科技": "Zyxel",
  "技嘉科技": "Gigabyte",
  "新华三": "H3C",
  "新華三": "H3C",
  "浪潮": "Inspur",
  "研华": "Advantech",
  "研華": "Advantech",
  "华擎": "ASRock",
  "華擎": "ASRock",
  "华硕": "ASUS",
  "華碩": "ASUS",
  "广达电脑": "Quanta Computer",
  "廣達電腦": "Quanta Computer",
  "广达": "Quanta",
  "廣達": "Quanta",
  "仁宝电脑": "Compal Electronics",
  "仁寶電腦": "Compal Electronics",
  "仁宝": "Compal",
  "仁寶": "Compal",
  "华勤技术": "Huaqin Technology",
  "華勤技術": "Huaqin Technology",
  "华勤": "Huaqin",
  "華勤": "Huaqin",
  "和硕联合": "Pegatron",
  "和碩聯合": "Pegatron",
  "和硕": "Pegatron",
  "和碩": "Pegatron",
  "纬创资通": "Wistron",
  "緯創資通": "Wistron",
  "纬创": "Wistron",
  "緯創": "Wistron",
  "闻泰科技": "Wingtech",
  "聞泰科技": "Wingtech",
  "闻泰": "Wingtech",
  "聞泰": "Wingtech",
  
  // 金融相关品牌
  "瑞银集团": "UBS Group",
  "中金公司": "CICC",
  "中金财富证券": "CICC Wealth Securities",
  "花旗私人银行": "Citi Private Bank",
  "摩根大通私人银行": "JPMorgan Private Bank",
  "高盛资产管理": "Goldman Sachs Asset Management",
  "瑞讯集团": "Swissquote Group",
  "建信信托": "CCB Trust",
  "中国银行": "Bank of China",
  "交通银行": "Bank of Communications",
  "光大银行": "China Everbright Bank",
  "招商银行": "China Merchants Bank",
  "伯恩斯坦私人财富管理": "Bernstein Private Wealth Management",
  "野村控股": "Nomura Holdings",
  "中金财富管理": "CICC Wealth Management",
  "辉立资本": "Phillip Capital",
  "平安银行": "Ping An Bank",
  "渣打银行": "Standard Chartered Bank",
  "中国工商银行": "ICBC",
  "中國工商銀行": "ICBC",
  "工银瑞信基金管理": "ICBC Credit Suisse Asset Management",
  "华夏基金": "China Asset Management",
  "海通国际证券": "Haitong International Securities",
  "元大证券": "Yuanta Securities",
  "国泰证券": "Cathay Securities",
  "凯基证券": "KGI Securities",
  "昱成资产管理顾问": "Yucheng Asset Management Advisory",
  
  // Topics 相关短语
  "拥有专业的财富管理团队，为客户提供定制化的资产配置和投资建议。": "Has a professional wealth management team, providing customized asset allocation and investment advice for clients.",
  "提供涵盖股票、债券、基金、保险、信托、另类投资等多种产品，满足高净值客户": "Provides various products covering stocks, bonds, funds, insurance, trusts, alternative investments, etc., meeting high net worth clients",
  "提供涵盖股票、债券、基金、保险、信托、另类投资等多种产品，满足高净值客户需求": "Provides various products covering stocks, bonds, funds, insurance, trusts, alternative investments, etc., meeting high net worth clients' needs",
  
  // 确保所有可能的品牌名变体都被映射
  "元大": "Yuanta",
  "国泰": "Cathay",
  "凯基": "KGI",
  "昱成": "Yucheng",
  "辉立": "Phillip",
  "华夏": "China Asset Management",
  "海通": "Haitong",
  "工银": "ICBC",
  "渣打": "Standard Chartered",
  "平安": "Ping An",
  "招商": "China Merchants",
  "光大": "China Everbright",
  "交通": "Bank of Communications",
  "中国银行": "Bank of China",
  "建信": "CCB Trust",
  "野村": "Nomura",
  "伯恩斯坦": "Bernstein",
  "星展银行": "DBS Bank",
  "星展": "DBS",
  "中国Ping An保险": "Ping An Insurance",
  "Ping An保险": "Ping An Insurance",
  "星展私人银行": "DBS Private Bank",
  "汇丰银行": "HSBC Bank",
  "汇丰": "HSBC",
  "妙盈科技": "Mioying Technology",
  "中信银行": "China CITIC Bank",
  "中信": "CITIC",
  "中信建投证券": "CITIC Securities",
  "凯雷集团": "Carlyle Group",
  "台中银行PNC金融服务集团": "PNC Financial Services Group",
  "PNC金融服务集团": "PNC Financial Services Group",
  "PNC金融": "PNC Financial",
  "中信信托": "CITIC Trust",
  "高盛": "Goldman Sachs",
  "先锋": "Vanguard",
  "富达投资": "Fidelity Investments",
  "富达": "Fidelity",
  "贝莱德": "BlackRock",
  "Endowus智安投财富管理平台": "Endowus Wealth Management Platform",
  "智安投": "Endowus",
  "摩根士丹利": "Morgan Stanley",
  "台中银行": "Taichung Bank",
  "台中": "Taichung",
  
  // Topics
  "技术创新": "Technology Innovation",
  "技術創新": "Technology Innovation",
  "产品质量": "Product Quality",
  "產品質量": "Product Quality",
  "供应链管理": "Supply Chain Management",
  "供應鏈管理": "Supply Chain Management",
  "成本控制": "Cost Control",
  "全球最大的笔记本电脑ODM厂商": "World's Largest Laptop ODM Manufacturer",
  "全球最大的筆記型電腦ODM廠商": "World's Largest Laptop ODM Manufacturer",
  "高效的供應鏈管理": "Efficient Supply Chain Management",
  "高效的供應鏈運營": "Efficient Supply Chain Operations",
  "性能与架构": "Performance and Architecture",
  "性能與架構": "Performance and Architecture",
  "冷却、能效和高密度部署": "Cooling, Power Efficiency and High-Density Deployment",
  "冷卻、能效和高密度部署": "Cooling, Power Efficiency and High-Density Deployment",
  "数据中心级稳定性和高可用性": "Data Center-Grade Stability and High Availability",
  "數據中心級穩定性和高可用性": "Data Center-Grade Stability and High Availability",
  "AI、深度学习和高性能计算应用": "AI, Deep Learning and High-Performance Computing Applications",
  "AI、深度學習和高性能計算應用": "AI, Deep Learning and High-Performance Computing Applications",
  "边缘计算和私有云/混合云部署": "Edge Computing and Private Cloud / Hybrid Cloud Deployment",
  "邊緣計算和私有雲/混合雲部署": "Edge Computing and Private Cloud / Hybrid Cloud Deployment",
  "2024年出货量同比减少5%": "5% year-over-year decrease in shipments in 2024",
  "2024年出貨量同比減少5%": "5% year-over-year decrease in shipments in 2024",
  "2024年，出货量为3230万台，同比减少5%": "In 2024, shipments were 32.3 million units, a 5% year-over-year decrease",
  "2024年，出貨量為3230萬台，同比減少5%": "In 2024, shipments were 32.3 million units, a 5% year-over-year decrease",
  "2024年出货量为3230万台，同比减少5%": "In 2024, shipments were 32.3 million units, a 5% year-over-year decrease",
  "2024年出貨量為3230萬台，同比減少5%": "In 2024, shipments were 32.3 million units, a 5% year-over-year decrease",
  "劳工条件和成本控制的争议": "Controversies over labor conditions and cost control",
  "勞工條件和成本控制的爭議": "Controversies over labor conditions and cost control",
  "劳工条件": "Labor Conditions",
  "勞工條件": "Labor Conditions",
  "出货量": "Shipments",
  "出貨量": "Shipments",
  "同比减少": "Year-over-year decrease",
  "同比減少": "Year-over-year decrease",
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
    // 檢查是否有 _zh 後綴的鍵（用於 source type 等）
    const zhKey = `${text}_zh`
    if (englishToTraditional[zhKey]) {
      return englishToTraditional[zhKey]
    }
    // 再檢查簡體中文到繁體中文的映射
    return toTraditional(text)
  } else {
    // 英文模式：先檢查是否有 _en 後綴的鍵
    const enKey = `${text}_en`
    if (englishToTraditional[enKey]) {
      return englishToTraditional[enKey]
    }
    // 檢查中文到英文的映射（品牌名、topics等）
    if (chineseToEnglish[text]) {
      return chineseToEnglish[text]
    }
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
 * 獲取 Source Type 的用途說明
 */
export function getSourceTypePurpose(sourceType: string, language: Language): string {
  // 先將舊的 source type 名稱映射到新的標準名稱
  const normalizedType = englishToTraditional[sourceType] || sourceType
  
  const purposeKey = `${normalizedType}_purpose`
  const purposeEnKey = `${normalizedType}_purpose_en`
  
  if (language === "zh-TW") {
    return englishToTraditional[purposeKey] || normalizedType
  } else {
    return englishToTraditional[purposeEnKey] || englishToTraditional[purposeKey] || normalizedType
  }
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

/**
 * 强制将所有中文数据翻译为英文
 * 用于前端显示，确保所有数据都是英文
 */
export function translateToEnglish(text: string): string {
  if (!text || typeof text !== "string") {
    return text
  }

  // 先检查 chineseToEnglish 映射（精确匹配）
  if (chineseToEnglish[text]) {
    return chineseToEnglish[text]
  }

  // 如果文本已经是英文（不包含中文字符），直接返回
  if (!/[\u4e00-\u9fa5]/.test(text)) {
    return text
  }

  // 对于包含中文的文本，尝试部分匹配和替换
  // 按长度从长到短排序，优先匹配更长的短语
  const sortedEntries = Object.entries(chineseToEnglish).sort((a, b) => b[0].length - a[0].length)
  let result = text
  for (const [chinese, english] of sortedEntries) {
    // 转义特殊字符，避免正则表达式错误
    const escapedChinese = chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(escapedChinese, 'g'), english)
  }

  // 如果还有中文字符，尝试从 englishToTraditional 映射中查找英文版本
  if (/[\u4e00-\u9fa5]/.test(result)) {
    for (const [key, value] of Object.entries(englishToTraditional)) {
      if (value === text && key.endsWith("_en")) {
        return key.replace("_en", "")
      }
    }
  }

  // 如果找不到映射，返回处理后的结果（可能还有中文）
  return result
}

