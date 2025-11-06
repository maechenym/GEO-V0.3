import { readFileSync } from "fs"
import { join } from "path"

/**
 * 读取产品分析数据
 * 从JSON文件中读取指定产品的时间序列数据
 */
export function getProductAnalyticsData(productName: string) {
  try {
    const jsonPath = join(process.cwd(), "..", "all_brands_results_20251106_075334.json")
    const fileContent = readFileSync(jsonPath, "utf-8")
    const data = JSON.parse(fileContent)
    
    if (!data[productName]) {
      return null
    }
    
    return data[productName]
  } catch (error) {
    console.error(`Error reading product analytics data for ${productName}:`, error)
    return null
  }
}

/**
 * 获取所有可用的产品名称列表
 */
export function getAllProductNames(): string[] {
  try {
    const jsonPath = join(process.cwd(), "..", "all_brands_results_20251106_075334.json")
    const fileContent = readFileSync(jsonPath, "utf-8")
    const data = JSON.parse(fileContent)
    
    return Object.keys(data)
  } catch (error) {
    console.error("Error reading product names:", error)
    return []
  }
}

/**
 * 根据产品名称获取指定日期的数据
 */
export function getProductDataByDate(productName: string, date: string) {
  const productData = getProductAnalyticsData(productName)
  if (!productData) {
    return null
  }
  
  const entry = productData.find(([entryDate]: [string, any]) => entryDate === date)
  return entry ? entry[1] : null
}

/**
 * 获取指定日期范围内的数据
 */
export function getProductDataByDateRange(productName: string, startDate: string, endDate: string) {
  const productData = getProductAnalyticsData(productName)
  if (!productData) {
    return []
  }
  
  return productData.filter(([entryDate]: [string, any]) => {
    return entryDate >= startDate && entryDate <= endDate
  })
}

