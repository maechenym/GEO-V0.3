/**
 * 将JSON文件中的简体中文翻译成繁体中文
 * 使用方法: node scripts/translate-json-to-traditional.js
 */

const fs = require('fs');
const path = require('path');

// 简体到繁体的映射（从i18n.ts中提取主要映射）
const simplifiedToTraditional = {
  "英业达": "英業達",
  "华为": "華為",
  "联想": "聯想",
  "戴尔": "戴爾",
  "华勤技术": "華勤技術",
  "闻泰科技": "聞泰科技",
  "歌尔股份": "歌爾股份",
  "广达电脑": "廣達電腦",
  "笔记本电脑代工": "筆記型電腦代工",
  "强大的": "強大的",
  "生产": "生產",
  "能力": "能力",
  "交付": "交付",
  "智能": "智能",
  "硬件": "硬件",
  "领域": "領域",
  "持续": "持續",
  "创新": "創新",
  "优化": "優化",
  "供应链": "供應鏈",
  "管理": "管理",
  "提升": "提升",
  "整体": "整體",
  "效率": "效率",
};

// 递归翻译对象
function translateToTraditional(obj) {
  if (typeof obj === 'string') {
    let result = obj;
    for (const [simplified, traditional] of Object.entries(simplifiedToTraditional)) {
      result = result.replace(new RegExp(simplified, 'g'), traditional);
    }
    return result;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => translateToTraditional(item));
  }
  
  if (obj && typeof obj === 'object') {
    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
      // 翻译键名
      let translatedKey = key;
      for (const [simplified, traditional] of Object.entries(simplifiedToTraditional)) {
        translatedKey = translatedKey.replace(new RegExp(simplified, 'g'), traditional);
      }
      // 翻译值
      translated[translatedKey] = translateToTraditional(value);
    }
    return translated;
  }
  
  return obj;
}

// 主函数
function main() {
  const inputPath = path.join(__dirname, '..', 'data', 'all_products_results_20251114_021851.json');
  const outputPath = path.join(__dirname, '..', 'data', 'all_products_results_20251114_021851_traditional.json');
  
  console.log('Reading JSON file...');
  const fileContent = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(fileContent);
  
  console.log('Translating to Traditional Chinese...');
  const translatedData = translateToTraditional(data);
  
  console.log('Writing translated JSON file...');
  fs.writeFileSync(outputPath, JSON.stringify(translatedData, null, 2), 'utf8');
  
  console.log(`✅ Translation complete! Output: ${outputPath}`);
}

main();

