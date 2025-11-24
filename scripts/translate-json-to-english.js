/**
 * 将JSON文件中的所有中文数据翻译成英文
 * 使用方法: node scripts/translate-json-to-english.js
 */

const fs = require('fs');
const path = require('path');

// 中文到英文的映射（从 i18n.ts 中提取）
const chineseToEnglish = {
  // 品牌名
  "中国信托": "CTBC",
  "中國信託": "CTBC",
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
  "工银瑞信基金管理": "ICBC Credit Suisse Asset Management",
  "华夏基金": "China Asset Management",
  "海通国际证券": "Haitong International Securities",
  "元大证券": "Yuanta Securities",
  "国泰证券": "Cathay Securities",
  "凯基证券": "KGI Securities",
  "昱成资产管理顾问": "Yucheng Asset Management Advisory",
  
  // 产品键名相关
  "中国信托_ctbc_财富管理与投资服务": "CTBC_ctbc_Wealth Management and Investment Services",
  
  // Topics 和常见短语
  "技术创新": "Technology Innovation",
  "技術創新": "Technology Innovation",
  "产品质量": "Product Quality",
  "產品質量": "Product Quality",
  "供应链管理": "Supply Chain Management",
  "供應鏈管理": "Supply Chain Management",
  "成本控制": "Cost Control",
  "财富管理": "Wealth Management",
  "財富管理": "Wealth Management",
  "投资服务": "Investment Services",
  "投資服務": "Investment Services",
  "全球领先的财富管理机构": "World's leading wealth management institution",
  "提供多元化的投资产品": "Offers diversified investment products",
  "专业的财富管理服务": "Professional wealth management services",
  "强大的亚太资产管理单位": "Strong Asia-Pacific asset management unit",
  "致力于扩展财富管理服务": "Committed to expanding wealth management services",
  "提供全面的财富管理服务": "Provides comprehensive wealth management services",
  "致力于为高净值客户提供定制化的投资方案": "Committed to providing customized investment solutions for high-net-worth clients",
  "涵盖投资咨询、资产配置和家族信托等服务": "Covers services such as investment consulting, asset allocation, and family trusts",
  "中国首家中外合资的投资银行": "China's first Sino-foreign joint venture investment bank",
  "在财富管理领域具有丰富经验": "Has rich experience in wealth management",
  "提供全面的金融服务": "Provides comprehensive financial services",
  "中金公司旗下的财富管理品牌": "Wealth management brand under CICC",
  "专注于为高净值客户提供定制化的财富管理服务": "Focuses on providing customized wealth management services for high-net-worth clients",
  "专注于高净值客户的需求": "Focuses on the needs of high-net-worth clients",
  "提供全面的财富管理服务，包括投资组合分析、风险管理和投资策略等。": "Provides comprehensive wealth management services, including portfolio analysis, risk management, and investment strategies.",
  "花旗财富投资实验室专注于为客户提供定制化的投资组合构建和风险管理服务。": "Citi Wealth Investment Lab focuses on providing customized portfolio construction and risk management services for clients.",
  "采用先进的建模技术，帮助客户识别风险敞口和潜在机遇。": "Uses advanced modeling techniques to help clients identify risk exposures and potential opportunities.",
  "提供多元化的投资服务，包括资产配置、投资组合构建和投资策略等。": "Provides diversified investment services, including asset allocation, portfolio construction, and investment strategies.",
  "投资理念强调通过多元化和严谨的资产配置来管理风险。": "Investment philosophy emphasizes risk management through diversification and rigorous asset allocation.",
  "提供定制化的投资组合分析，帮助客户识别风险和机遇。": "Provides customized portfolio analysis to help clients identify risks and opportunities.",
  "提供创新的投资产品和策略，专注于识别收益潜力。": "Provides innovative investment products and strategies, focusing on identifying return potential.",
  "投资展望报告强调积极、严谨的投资方针，关注市场催化因素。": "Investment outlook reports emphasize proactive and rigorous investment approaches, focusing on market catalysts.",
  "提供多元化的投资组合构建建议。": "Provides diversified portfolio construction recommendations.",
  "专注于提供交易、投资解决方案和银行服务等金融服务。": "Focuses on providing financial services such as trading, investment solutions, and banking services.",
  "品牌信譽度高": "High brand reputation",
  "打造出客戶最信賴的財富管理品牌": "Builds the most trusted wealth management brand for clients",
  
  // 更多常见中文短语
  "服务涵盖股票、交易型开放式指数基金（ETF）、外汇和加密货币等多种金融产品。": "Services cover various financial products including stocks, ETFs, foreign exchange, and cryptocurrencies.",
  "提供多资产在线交易服务。": "Provides multi-asset online trading services.",
  "提供多资产在线交易服务，包括股票、交易型开放式指数基金（ETF）、外汇和加密货币等金融产品。": "Provides multi-asset online trading services, including stocks, ETFs, foreign exchange, and cryptocurrencies.",
  "荣获中国最佳信托公司": "Awarded China's Best Trust Company",
  "荣获中国年度家族信托": "Awarded China's Annual Family Trust",
  "蝉联\"中国年度家族信托\"奖项，体现了其在家族信托服务的专业度和创新性": "Won the 'China's Annual Family Trust' award consecutively, demonstrating its professionalism and innovation in family trust services",
  "斩获\"中国最佳信托公司\"奖项": "Won the 'China's Best Trust Company' award",
  "家族财富管理服务信托客户数量增长61.92%": "Family wealth management service trust client count increased by 61.92%",
  "全面升级财富传承服务矩阵，创新推出非上市公司股权信托、不动产信托等产品": "Comprehensively upgraded wealth inheritance service matrix, innovatively launched products such as unlisted company equity trusts and real estate trusts",
  "财富管理服务信托客户数量比上年末增长61.92%": "Wealth management service trust client count increased by 61.92% compared to the end of last year",
  "在全球范围内设立了203家私人银行中心，提升了家族信托服务的专业度和创新性": "Established 203 private banking centers globally, enhancing the professionalism and innovation of family trust services",
  "特色服务体系日益完善": "Characteristic service system is increasingly improved",
  "家族财富业务规模增长43.56%": "Family wealth business scale increased by 43.56%",
  "家族财富业务规模在年内实现了43.56%的增长": "Family wealth business scale achieved a 43.56% growth within the year",
  "特色服务体系不断完善，有效满足了客户多样化的家族财富传承与规划需求": "Characteristic service system continues to improve, effectively meeting customers' diverse family wealth inheritance and planning needs",
  "家族信托规模增速显著": "Family trust scale growth rate is significant",
  "比上年末增长超256%": "Increased by over 256% compared to the end of last year",
  "家族信托规模比上年末增长超过256%": "Family trust scale increased by over 256% compared to the end of last year",
  "强化了数字化运营、活动运营、权益运营能力，推动客群经营单位从\"个人\"向\"家庭\"转型": "Strengthened digital operations, activity operations, and equity operations capabilities, promoting customer group management units to transform from 'individual' to 'family'",
  "家族信托管理规模突破千亿元": "Family trust management scale exceeded 100 billion yuan",
  "拥有专业的财富管理团队,为客户提供定制化的资产配置和投资建议。": "Has a professional wealth management team, providing customized asset allocation and investment advice for clients.",
  "在业内享有良好的声誉和信誉。": "Enjoys a good reputation and credibility in the industry.",
  "提供涵盖股票、债券、基金、保险、信托、另类投资等多种产品,满足高净值...": "Provides various products covering stocks, bonds, funds, insurance, trusts, alternative investments, etc., meeting high net worth...",
};

/**
 * 翻译函数
 */
function translateToEnglish(text) {
  if (!text || typeof text !== "string") {
    return text;
  }

  // 先检查直接映射
  if (chineseToEnglish[text]) {
    return chineseToEnglish[text];
  }

  // 如果文本已经是英文（不包含中文字符），直接返回
  if (!/[\u4e00-\u9fa5]/.test(text)) {
    return text;
  }

  // 尝试部分匹配和替换（使用转义后的正则表达式）
  let result = text;
  for (const [chinese, english] of Object.entries(chineseToEnglish)) {
    // 转义特殊字符，避免正则表达式错误
    const escapedChinese = chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedChinese, 'g'), english);
  }

  // 如果还有中文字符，返回原文本（在实际使用中可能需要更智能的翻译）
  return /[\u4e00-\u9fa5]/.test(result) ? text : result;
}

/**
 * 递归翻译对象
 */
function translateObject(obj) {
  if (typeof obj === 'string') {
    return translateToEnglish(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => translateObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
      // 翻译键名
      const translatedKey = translateToEnglish(key);
      // 翻译值
      translated[translatedKey] = translateObject(value);
    }
    return translated;
  }
  
  return obj;
}

// 主函数
function main() {
  const inputPath = path.join(__dirname, '..', 'data', 'all_products_results_20251120_030450.json');
  const outputPath = path.join(__dirname, '..', 'data', 'all_products_results_20251120_030450_english.json');
  
  console.log('Reading JSON file...');
  const fileContent = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(fileContent);
  
  console.log('Translating to English...');
  const translatedData = translateObject(data);
  
  console.log('Writing translated JSON file...');
  fs.writeFileSync(outputPath, JSON.stringify(translatedData, null, 2), 'utf8');
  
  console.log(`✅ Translation complete! Output: ${outputPath}`);
  console.log(`Original file: ${inputPath}`);
  console.log(`Translated file: ${outputPath}`);
}

main();

