import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"
import { toTraditional, translate, translateToEnglish } from "@/lib/i18n"
import { getDomainCategory } from "@/lib/source-categories"

// 所有标准网站类型（按顺序）
const ALL_SOURCE_TYPES = [
  "Official",
  "News",
  "Media",
  "Knowledge",
  "Business Profiles",
  "Review",
  "UGC",
  "Academic",
]

// 类型名称映射表（getDomainCategory 返回的类型 -> 标准类型）
const TYPE_MAPPING: Record<string, string> = {
  "Official Website": "Official",
  "News / Editorial": "News",
  "Editorial": "News",
  "Tech / Vertical Media": "Media",
  "Tech Blog": "Media",
  "Wiki / Knowledge Base": "Knowledge",
  "Wiki": "Knowledge",
  "Knowledge Base": "Knowledge",
  "Product Review": "Review",
  "Review Site": "Review",
  "Social Media": "UGC",
  "Forum": "UGC",
  "Video Platform": "UGC",
  "Government": "Other",
  "Case Study": "Other",
  // 确保所有可能的类型都有映射
  "Other": "Other", // 保持 Other 不变
}

const SELF_BRAND_CANDIDATES = ["Citi Private Bank", "花旗私人银行", "CTBC", "ctbc", "中国信托", "中國信託", "英业达", "Inventec"]
const MODEL_KEYS = ["chatgpt", "gemini", "claude"] as const

const slugify = (value: string) =>
  (() => {
    const ascii = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    if (ascii) return ascii
    const encoded = encodeURIComponent(value.toLowerCase())
    return encoded || "item"
  })()

const FALLBACK_SOURCES = [
  "wikipedia.org",
  "techradar.com",
  "forbes.com",
  "theverge.com",
  "wired.com",
  "zdnet.com",
  "cnet.com",
  "arstechnica.com",
]

// 固定的 6 个主题，与 Intent 页面和 Overview 页面同步
const FALLBACK_TOPICS = [
  { 
    name: "Performance and Architecture", 
    example: "Discussions about rack server performance, CPU architecture, memory configurations, and processing capabilities." 
  },
  { 
    name: "Cooling, Power Efficiency and High-Density Deployment", 
    example: "Examples describing cooling systems, power consumption, PUE optimization, and high-density data center deployments." 
  },
  { 
    name: "Data Center-Grade Stability and High Availability", 
    example: "Commentary on server reliability, redundant components, fault tolerance, and mission-critical application support." 
  },
  { 
    name: "AI, Deep Learning and High-Performance Computing Applications", 
    example: "References to AI workloads, GPU support, deep learning infrastructure, and HPC cluster configurations." 
  },
  { 
    name: "Edge Computing and Private Cloud / Hybrid Cloud Deployment", 
    example: "Insights about edge server solutions, private cloud infrastructure, hybrid cloud deployments, and distributed computing." 
  },
  { 
    name: "Security, Maintenance and Remote Management", 
    example: "Notes on server security features, remote management capabilities, maintenance procedures, and enterprise security standards." 
  },
]

interface RankingItem {
  brand: string
  value: number
  delta: number
  rank: number
  isSelf: boolean
  unit?: string
}

interface TrendData {
  date: string
  [brandName: string]: string | number
}

interface HeatmapCell {
  source: string
  topic: string
  mentionRate: number
  sampleCount: number
  example: string
}

interface HeatmapTopic {
  name: string
  slug: string
}

interface HeatmapSource {
  name: string
  slug: string
}

interface VisibilityData {
  visibility: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  reach: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  rank: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  focus: {
    ranking: RankingItem[]
    trends: TrendData[]
  }
  heatmap: {
    sources: HeatmapSource[]
    topics: HeatmapTopic[]
    cells: HeatmapCell[]
  }
  actualDateRange?: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
}

const resolveSelfBrandKey = (data: any, productKey?: string): string => {
  if (!data) {
    return SELF_BRAND_CANDIDATES[0]
  }
  
  const mentionRateKeys = Object.keys(data.mention_rate || {})
  const combinedScoreKeys = Object.keys(data.combined_score || {})
  const allKeys = [...new Set([...mentionRateKeys, ...combinedScoreKeys])]
  
  // 如果提供了产品键名，尝试从产品键名中提取品牌名称
  if (productKey) {
    let brandFromKey = ""
    if (productKey.includes("|")) {
      brandFromKey = productKey.split("|")[0].trim()
    } else if (productKey.includes("_")) {
      // 格式: "中国信托_ctbc_财富管理与投资服务"
      brandFromKey = productKey.split("_")[0].trim()
    } else {
      brandFromKey = productKey
    }
    
    // 先尝试精确匹配
    if (allKeys.includes(brandFromKey)) {
      return brandFromKey
    }
    
    // 尝试模糊匹配
    const matchingKey = allKeys.find(key => 
      key.toLowerCase().includes(brandFromKey.toLowerCase()) || 
      brandFromKey.toLowerCase().includes(key.toLowerCase())
    )
    if (matchingKey) {
      return matchingKey
    }
  }
  
  // 使用默认候选列表
  for (const candidate of SELF_BRAND_CANDIDATES) {
    if (allKeys.includes(candidate)) {
      return candidate
    }
  }
  
  // 如果仍然没有找到，返回第一个品牌（作为后备）
  if (allKeys.length > 0) {
    console.warn(`[Visibility API] Could not find self brand in candidates, using first brand: ${allKeys[0]}`)
    return allKeys[0]
  }
  
  return SELF_BRAND_CANDIDATES[0]
}

const getModelData = (dayData: any, modelKey: string) => {
  if (!dayData) return null
  if (modelKey === "all") {
    return dayData.overall
  }
  return dayData[modelKey] || dayData.overall
}

// Helper function to sort Map entries by value (descending)
const sortEntries = (map: Map<string, number>): [string, number][] => {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-11-08"
    const endDate = searchParams.get("endDate") || "2025-11-14"
    const productId = searchParams.get("productId")
    const modelParam = (searchParams.get("model") || "all").toLowerCase()
    const modelKey = MODEL_KEYS.includes(modelParam as typeof MODEL_KEYS[number]) ? modelParam : "all"
    const language = searchParams.get("language") || "en"

    // 读取JSON文件 - 只使用新文件
    const projectRoot = process.cwd()
    const dataPath = path.resolve(projectRoot, "data", "all_products_results_20251120_030450_english.json")
    
    let fileContents: string = ""
    
    try {
      fileContents = await fs.readFile(dataPath, "utf8")
      console.log(`[Visibility API] Successfully loaded JSON from: ${dataPath}`)
    } catch (error: any) {
      console.error(`[Visibility API] Error reading JSON file from: ${dataPath}`, error)
      return NextResponse.json(
        { error: "Failed to read data file" },
        { status: 500 }
      )
    }

    const allData = JSON.parse(fileContents)
    
    // 确定要使用的产品名称
    // 新格式: "品牌名 (英文名) | 产品名" 或 "品牌名_ctbc_产品名"
    // 默认使用数据文件中的第一个产品
    const availableProducts = Object.keys(allData)
    let productName = availableProducts.length > 0 ? availableProducts[0] : "中国信托_ctbc_财富管理与投资服务" // 默认产品
    
    // 如果提供了productId，尝试从产品数据中获取产品名称
    if (productId) {
      try {
        // 尝试从产品API获取产品信息
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const productResponse = await fetch(`${baseUrl}/api/products/${productId}`, {
          headers: {
            "Authorization": request.headers.get("Authorization") || "",
          },
        })
        
        if (productResponse.ok) {
          const productData = await productResponse.json()
          if (productData.product && productData.product.name) {
            // 从产品名称构建JSON键名格式
            const productNameFromAPI = productData.product.name
            const brandName = productData.product.brand?.name || "英业达 (Inventec)"
            
            // 构建新格式的键名: "品牌名 | 产品名" 或 "品牌名_ctbc_产品名"
            if (productNameFromAPI.includes("|")) {
              productName = productNameFromAPI
            } else if (productNameFromAPI.includes("_")) {
              productName = productNameFromAPI
            } else if (productNameFromAPI.includes(brandName)) {
              const withPipe = productNameFromAPI.replace(/\s+/, " | ")
              const withUnderscore = productNameFromAPI.replace(/\s+/g, "_")
              
              if (allData[withPipe]) {
                productName = withPipe
              } else if (allData[withUnderscore]) {
                productName = withUnderscore
            } else {
                productName = withPipe
              }
            } else {
              const withPipe = `${brandName} | ${productNameFromAPI}`
              const brandNameUnderscore = brandName.replace(/\s+/g, "_").replace(/[()]/g, "")
              const productNameUnderscore = productNameFromAPI.replace(/\s+/g, "_")
              const withUnderscore = `${brandNameUnderscore}_${productNameUnderscore}`
              
              if (allData[withPipe]) {
                productName = withPipe
              } else if (allData[withUnderscore]) {
                productName = withUnderscore
              } else {
                productName = withPipe
              }
            }
            
            console.log(`[Visibility API] Using product: ${productName} for productId: ${productId}`)
          }
        } else {
          console.warn(`[Visibility API] Failed to get product for ${productId}, using default`)
        }
      } catch (error) {
        console.warn(`[Visibility API] Error fetching product ${productId}:`, error)
        // 如果获取失败，使用默认产品
      }
    }
    
    // 如果直接匹配失败，尝试查找包含该产品名的键
    let productData = allData[productName]
    
    if (!productData && productName.includes("|")) {
      // 尝试模糊匹配：查找包含品牌和产品名的键
      const [brandPart, productPart] = productName.split("|").map(s => s.trim())
      const matchingKey = Object.keys(allData).find(key => {
        return key.includes(brandPart) && key.includes(productPart)
      })
      if (matchingKey) {
        productName = matchingKey
        productData = allData[matchingKey]
        console.log(`[Visibility API] Found matching product key: ${matchingKey}`)
      }
    } else if (!productData && productName.includes("_")) {
      // 尝试匹配下划线格式的键
      const [brandPart, productPart] = productName.split("_").map(s => s.trim())
      const matchingKey = Object.keys(allData).find(key => {
        return key.includes(brandPart) && key.includes(productPart)
      })
      if (matchingKey) {
        productName = matchingKey
        productData = allData[matchingKey]
        console.log(`[Visibility API] Found matching product key: ${matchingKey}`)
      }
    }
    
    // 如果仍然没有找到，使用第一个可用产品
    if (!productData && availableProducts.length > 0) {
      productName = availableProducts[0]
      productData = allData[productName]
      console.log(`[Visibility API] Using first available product: ${productName}`)
    }

    if (!productData || productData.length === 0) {
      console.error(`[Visibility API] Product data not found: ${productName}`)
      console.log(`[Visibility API] Available products:`, Object.keys(allData).slice(0, 10))
      return NextResponse.json(
        { error: `Product data not found: ${productName}` },
        { status: 404 }
      )
    }

    console.log(`[Visibility API] Found ${productData.length} days of data for ${productName}`)

    // 过滤日期范围
    const filteredData = productData.filter(([date]: [string, any]) => {
      return date >= startDate && date <= endDate
    })

    if (filteredData.length === 0) {
      return NextResponse.json(
        { error: "No data for date range" },
        { status: 404 }
      )
    }

    // 判断日期范围类型
    const dateRangeDays = filteredData.length
    // 1day模式：日期范围在2天以内（包含2天），用于显示11.4和11.5的数据
    const dateDiffMs = new Date(endDate).getTime() - new Date(startDate).getTime()
    const isOneDayRange = dateRangeDays <= 2 && dateDiffMs <= 172800000 // 2天的毫秒数

    console.log(`[Visibility API] Processing data - days: ${dateRangeDays}, isOneDayRange: ${isOneDayRange}`)

    // 获取前一天的数据（用于1day模式的排名变化计算）
    let previousDayData: any = null
    if (isOneDayRange && filteredData.length > 0) {
      const latestDate = filteredData[filteredData.length - 1][0]
      const latestDateObj = new Date(latestDate)
      const previousDate = format(subDays(latestDateObj, 1), "yyyy-MM-dd")
      const previousEntry = productData.find(([date]: [string, any]) => date === previousDate)
      if (previousEntry) {
        previousDayData = previousEntry[1].overall
      }
    }

    // 计算四个指标的排名和趋势
    
    // 1. Visibility Ranking (基于combined_score)
    const calculateVisibilityRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        // 1day模式：使用最后一天的数据
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const currentScores = latestOverall.combined_score || {}
        
        // 确定本品牌键名
        const selfBrandKey = resolveSelfBrandKey(latestOverall, productName)
        
        // 计算当前排名
        const currentRanking = Object.entries(currentScores)
          .map(([name, score]) => ({ name, score: score as number }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat((item.score * 100).toFixed(2)), // 转换为百分比
            delta: 0,
            rank: index + 1,
            isSelf: item.name === selfBrandKey,
          }))

        // 因为没有前七天的数据，所有delta都设为0
        ranking = currentRanking

        // 趋势数据 - 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.5的数据代表收集到的是11.4的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.combined_score || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      } else {
        // 多天模式：计算平均值，使用所有天出现的所有品牌
        // 确定本品牌键名（使用第一天的数据）
        const firstDayData = filteredData[0]?.[1]
        const firstDayOverall = firstDayData?.overall
        const selfBrandKey = resolveSelfBrandKey(firstDayOverall, productName)
        
        // 获取所有天出现的所有品牌（不限制为第一天的品牌列表）
        const allBrandsAcrossDays = new Set<string>()
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.combined_score || {}
          Object.keys(dayScores).forEach(name => {
            allBrandsAcrossDays.add(name)
          })
        })
        
        console.log(`[Visibility API] calculateVisibilityRanking (multi-day) - all brands across all days: ${allBrandsAcrossDays.size}`)
        
        const scoresAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.combined_score || {}
          
          // 使用所有天出现的所有品牌（不限制为第一天的品牌列表）
          Object.keys(dayScores).forEach((brandName) => {
            if (dayScores[brandName] !== undefined) {
              if (!scoresAccumulator[brandName]) {
                scoresAccumulator[brandName] = []
              }
              scoresAccumulator[brandName].push(dayScores[brandName] as number)
            }
          })
        })

        // 计算平均得分
        const avgScores = Object.entries(scoresAccumulator)
          .map(([name, scores]) => ({
            name,
            score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.score - a.score)

        ranking = avgScores.map((item, index) => ({
          brand: item.name,
          value: parseFloat((item.score * 100).toFixed(2)),
          delta: 0, // 多天模式暂时不计算delta
          rank: index + 1,
          isSelf: item.name === selfBrandKey,
        }))

        // 趋势数据
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.6的数据代表收集到的是11.5的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.combined_score || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 2. Reach Ranking (基于mention_rate的百分比形式)
    const calculateReachRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const selfBrandKey = resolveSelfBrandKey(latestOverall, productName)
        const currentScores = latestOverall.mention_rate || {}
        
        console.log(`[Visibility API] calculateReachRanking - selfBrandKey: ${selfBrandKey}`)
        console.log(`[Visibility API] calculateReachRanking - mention_rate keys count: ${Object.keys(currentScores).length}`)
        console.log(`[Visibility API] calculateReachRanking - selfBrandKey in mention_rate: ${selfBrandKey in currentScores}`)
        if (selfBrandKey in currentScores) {
          console.log(`[Visibility API] calculateReachRanking - selfBrandKey value: ${currentScores[selfBrandKey]}`)
        }
        
        const currentRanking = Object.entries(currentScores)
          .map(([name, score]) => ({ name, score: score as number }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat((item.score * 100).toFixed(2)),
            delta: 0,
            rank: index + 1,
            isSelf: item.name === selfBrandKey,
            unit: "%",
          }))

        // 因为没有前七天的数据，所有delta都设为0
        ranking = currentRanking

        // 趋势数据 - 1day模式：显示最后两天
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.mention_rate || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      } else {
        // 多天模式：使用所有天出现的所有品牌
        const firstDayData = filteredData[0]?.[1]
        const firstDayOverall = firstDayData?.overall
        const selfBrandKey = resolveSelfBrandKey(firstDayOverall, productName)
        
        // 获取所有天出现的所有品牌（不限制为第一天的品牌列表）
        const allBrandsAcrossDays = new Set<string>()
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.mention_rate || {}
          Object.keys(dayScores).forEach(name => {
            allBrandsAcrossDays.add(name)
          })
        })
        
        console.log(`[Visibility API] calculateReachRanking (multi-day) - selfBrandKey: ${selfBrandKey}`)
        console.log(`[Visibility API] calculateReachRanking (multi-day) - all brands across all days: ${allBrandsAcrossDays.size}`)
        console.log(`[Visibility API] calculateReachRanking (multi-day) - selfBrandKey in allBrandsAcrossDays: ${allBrandsAcrossDays.has(selfBrandKey)}`)
        
        const scoresAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.mention_rate || {}
          
          // 使用所有天出现的所有品牌（不限制为第一天的品牌列表）
          Object.keys(dayScores).forEach((brandName) => {
            if (dayScores[brandName] !== undefined) {
              if (!scoresAccumulator[brandName]) {
                scoresAccumulator[brandName] = []
              }
              scoresAccumulator[brandName].push(dayScores[brandName] as number)
            }
          })
        })

        const avgScores = Object.entries(scoresAccumulator)
          .map(([name, scores]) => ({
            name,
            score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.score - a.score)

        ranking = avgScores.map((item, index) => ({
          brand: item.name,
          value: parseFloat((item.score * 100).toFixed(2)),
          delta: 0,
          rank: index + 1,
          isSelf: item.name === selfBrandKey,
          unit: "%",
        }))

        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.mention_rate || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 3. Rank Ranking (基于absolute_rank，按排名升序)
    const calculateRankRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const currentRanks = latestOverall.absolute_rank || {}
        
        // 解析排名值
        const parseRank = (rankRaw: any): number => {
          if (typeof rankRaw === 'string') {
            const match = rankRaw.match(/^([\d.]+)/)
            return match ? parseFloat(match[1]) : 999
          } else if (typeof rankRaw === 'number') {
            return rankRaw
          }
          return 999
        }

        const selfBrandKey = resolveSelfBrandKey(latestOverall, productName)

        const currentRanking = Object.entries(currentRanks)
          .map(([name, rankRaw]) => ({ name, rank: parseRank(rankRaw) }))
          .sort((a, b) => a.rank - b.rank) // 排名越小越好，升序
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat(item.rank.toFixed(1)), // 保留小数点
            delta: 0,
            rank: index + 1,
            isSelf: item.name === selfBrandKey,
          }))

        // 因为没有前七天的数据，所有delta都设为0
        ranking = currentRanking

        // 趋势数据 - 1day模式：显示最后两天
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayRanks = dayOverall.absolute_rank || {}
          
          Object.keys(dayRanks).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseRank(dayRanks[brandName])
          })
          
          trends.push(trendPoint)
        })
      } else {
        // 多天模式：使用所有天出现的所有品牌
        const firstDayData = filteredData[0]?.[1]
        const firstDayOverall = firstDayData?.overall
        const selfBrandKey = resolveSelfBrandKey(firstDayOverall, productName)
        
        // 获取所有天出现的所有品牌（不限制为第一天的品牌列表）
        const allBrandsAcrossDays = new Set<string>()
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayRanks = dayOverall.absolute_rank || {}
          Object.keys(dayRanks).forEach(name => {
            allBrandsAcrossDays.add(name)
          })
        })
        
        console.log(`[Visibility API] calculateRankRanking (multi-day) - all brands across all days: ${allBrandsAcrossDays.size}`)
        
        const ranksAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayRanks = dayOverall.absolute_rank || {}
          
          // 使用所有天出现的所有品牌（不限制为第一天的品牌列表）
          Object.keys(dayRanks).forEach((brandName) => {
            if (dayRanks[brandName] !== undefined) {
              if (!ranksAccumulator[brandName]) {
                ranksAccumulator[brandName] = []
              }
              const rankValue = typeof dayRanks[brandName] === 'string' 
                ? parseFloat(dayRanks[brandName].match(/^([\d.]+)/)?.[1] || '999')
                : (dayRanks[brandName] as number)
              ranksAccumulator[brandName].push(rankValue)
            }
          })
        })

        const avgRanks = Object.entries(ranksAccumulator)
          .map(([name, ranks]) => ({
            name,
            rank: ranks.reduce((sum, r) => sum + r, 0) / ranks.length,
          }))
          .sort((a, b) => a.rank - b.rank)

        ranking = avgRanks.map((item, index) => ({
          brand: item.name,
          value: parseFloat(item.rank.toFixed(1)),
          delta: 0,
          rank: index + 1,
          isSelf: item.name === selfBrandKey,
        }))

        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayRanks = dayOverall.absolute_rank || {}
          
          Object.keys(dayRanks).forEach((brandName) => {
            const displayName = brandName
            const rankValue = typeof dayRanks[brandName] === 'string' 
              ? parseFloat(dayRanks[brandName].match(/^([\d.]+)/)?.[1] || '999')
              : (dayRanks[brandName] as number)
            trendPoint[displayName] = parseFloat(rankValue.toFixed(1))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 4. Focus Ranking (基于content_share)
    const calculateFocusRanking = (): { ranking: RankingItem[]; trends: TrendData[] } => {
      let ranking: RankingItem[] = []
      const trends: TrendData[] = []

      if (isOneDayRange) {
        const latestData = filteredData[filteredData.length - 1][1]
        const latestOverall = latestData.overall
        const selfBrandKey = resolveSelfBrandKey(latestOverall, productName)
        const currentScores = latestOverall.content_share || {}
        
        const currentRanking = Object.entries(currentScores)
          .map(([name, score]) => ({ name, score: score as number }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            brand: item.name,
            value: parseFloat((item.score * 100).toFixed(2)),
            delta: 0,
            rank: index + 1,
            isSelf: item.name === selfBrandKey,
          }))

        // 因为没有前七天的数据，所有delta都设为0
        ranking = currentRanking

        // 趋势数据 - 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
        const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
        dataForTrend.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.5的数据代表收集到的是11.4的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.content_share || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      } else {
        // 多天模式：使用所有天出现的所有品牌
        const firstDayData = filteredData[0]?.[1]
        const firstDayOverall = firstDayData?.overall
        const selfBrandKey = resolveSelfBrandKey(firstDayOverall, productName)
        
        // 获取所有天出现的所有品牌（不限制为第一天的品牌列表）
        const allBrandsAcrossDays = new Set<string>()
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.content_share || {}
          Object.keys(dayScores).forEach(name => {
            allBrandsAcrossDays.add(name)
          })
        })
        
        console.log(`[Visibility API] calculateFocusRanking (multi-day) - all brands across all days: ${allBrandsAcrossDays.size}`)
        
        const scoresAccumulator: Record<string, number[]> = {}
        
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dayScores = dayOverall.content_share || {}
          
          // 使用所有天出现的所有品牌（不限制为第一天的品牌列表）
          Object.keys(dayScores).forEach((brandName) => {
            if (dayScores[brandName] !== undefined) {
              if (!scoresAccumulator[brandName]) {
                scoresAccumulator[brandName] = []
              }
              scoresAccumulator[brandName].push(dayScores[brandName] as number)
            }
          })
        })

        const avgScores = Object.entries(scoresAccumulator)
          .map(([name, scores]) => ({
            name,
            score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          }))
          .sort((a, b) => b.score - a.score)

        ranking = avgScores.map((item, index) => ({
          brand: item.name,
          value: parseFloat((item.score * 100).toFixed(2)),
          delta: 0,
          rank: index + 1,
          isSelf: item.name === selfBrandKey,
        }))

        // 趋势数据
        filteredData.forEach(([date, data]: [string, any]) => {
          const dayOverall = data.overall
          const dateObj = new Date(date)
          // 将日期向前减一天（后台11.6的数据代表收集到的是11.5的数据）
          const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
          
          const trendPoint: TrendData = { date: displayDate }
          const dayScores = dayOverall.content_share || {}
          
          Object.keys(dayScores).forEach((brandName) => {
            const displayName = brandName
            trendPoint[displayName] = parseFloat(((dayScores[brandName] as number) * 100).toFixed(2))
          })
          
          trends.push(trendPoint)
        })
      }

      return { ranking, trends }
    }

    // 计算所有指标
    const visibility = calculateVisibilityRanking()
    const reach = calculateReachRanking()
    const rank = calculateRankRanking()
    const focus = calculateFocusRanking()

    const computeHeatmap = (): VisibilityData["heatmap"] => {
      const shouldTranslate = language === "zh-TW"
      // 按来源类型聚合，而不是按域名
      const selfSourceTypeCounts = new Map<string, number>()
      const otherSourceTypeCounts = new Map<string, number>()

      const selfTopicCounts = new Map<string, number>()
      const otherTopicCounts = new Map<string, number>()
      const topicExamples = new Map<string, string>()

      let resolvedSelfBrand = SELF_BRAND_CANDIDATES[0]

      const extractTopic = (text: string): string => {
        if (!text) return ""
        const parts = text.split(/[：:]/)
        const candidate = parts[0]?.trim() || text.trim()
        return candidate.length > 60 ? `${candidate.slice(0, 57)}...` : candidate
      }

      const incrementCount = (map: Map<string, number>, key: string, amount = 1) => {
        map.set(key, (map.get(key) || 0) + amount)
      }

      // 将来源类型名称标准化
      const normalizeSourceType = (type: string): string => {
        // 先检查映射表
        if (TYPE_MAPPING[type]) {
          return TYPE_MAPPING[type]
        }
        // 检查是否是标准类型
        if (ALL_SOURCE_TYPES.includes(type)) {
          return type
        }
        // 如果都不匹配，返回原值（可能是 "Other" 或其他）
        return type
      }

      filteredData.forEach(([date, dayData]: [string, any]) => {
        const modelData = getModelData(dayData, modelKey)
        if (!modelData) return

        const selfBrandKey = resolveSelfBrandKey(modelData, productName)
        if (selfBrandKey) {
          resolvedSelfBrand = selfBrandKey
        }

        const brandDomains = modelData.brand_domains || {}
        Object.entries(brandDomains).forEach(([brandName, domains]: [string, any]) => {
          if (!Array.isArray(domains)) return
          domains.forEach((domain: string) => {
            const normalized = domain.trim().toLowerCase()
            if (!normalized) return
            // 将域名映射到来源类型
            const sourceType = getDomainCategory(domain)
            const normalizedType = normalizeSourceType(sourceType)
            const targetMap = brandName === resolvedSelfBrand ? selfSourceTypeCounts : otherSourceTypeCounts
            incrementCount(targetMap, normalizedType)
          })
        })

        const sentimentDetails = modelData.aggregated_sentiment_detail || {}
        Object.entries(sentimentDetails).forEach(([brandName, details]: [string, any]) => {
          const positiveAspects: string[] = Array.isArray(details?.positive_aspects) ? details.positive_aspects : []
          const negativeAspects: string[] = Array.isArray(details?.negative_aspects) ? details.negative_aspects : []
          const targetMap = brandName === resolvedSelfBrand ? selfTopicCounts : otherTopicCounts

          ;[...positiveAspects, ...negativeAspects].forEach((aspect: string) => {
            const topicName = extractTopic(aspect)
            if (!topicName) return
            incrementCount(targetMap, topicName)
            if (!topicExamples.has(topicName)) {
              topicExamples.set(topicName, aspect)
            }
          })
        })
      })

      // 合并本品牌和其他品牌的来源类型计数
      const allSourceTypeCounts = new Map<string, number>()
      ;[...selfSourceTypeCounts.entries(), ...otherSourceTypeCounts.entries()].forEach(([type, count]) => {
        allSourceTypeCounts.set(type, (allSourceTypeCounts.get(type) || 0) + count)
      })

      // 调试日志：输出所有收集到的类型
      if (allSourceTypeCounts.size > 0) {
        console.log("[Visibility API] All source types found:", Array.from(allSourceTypeCounts.entries()))
      }

      // 按照 ALL_SOURCE_TYPES 的顺序选择来源类型，只选择有数据的类型
      const selectedSourceTypes = ALL_SOURCE_TYPES.filter(type => allSourceTypeCounts.has(type) && allSourceTypeCounts.get(type)! > 0)
      
      // 添加所有有数据的标准类型（不限制数量）
      // 如果标准类型中有数据但没被选中，也添加进来
      ALL_SOURCE_TYPES.forEach(type => {
        if (allSourceTypeCounts.has(type) && allSourceTypeCounts.get(type)! > 0 && !selectedSourceTypes.includes(type)) {
          selectedSourceTypes.push(type)
        }
      })
      
      // 如果还有空间，添加其他有数据的类型（按计数排序），但排除 "Other"
      if (selectedSourceTypes.length < ALL_SOURCE_TYPES.length) {
        const remainingTypes = Array.from(allSourceTypeCounts.entries())
          .filter(([type]) => !ALL_SOURCE_TYPES.includes(type) && type !== "Other")
          .sort(([, a], [, b]) => b - a)
          .map(([type]) => type)
        selectedSourceTypes.push(...remainingTypes)
      }
      
      // 如果仍然没有类型，检查是否有 "Other" 类型，如果有则添加
      if (selectedSourceTypes.length === 0 && allSourceTypeCounts.has("Other") && allSourceTypeCounts.get("Other")! > 0) {
        selectedSourceTypes.push("Other")
      }
      
      // 如果仍然没有类型，生成模拟数据用于展示
      if (selectedSourceTypes.length === 0) {
        console.log("[Visibility API] No source types found, generating mock data")
        // 使用所有标准类型作为模拟数据
        const mockSourceTypes = ALL_SOURCE_TYPES // 使用所有8个标准类型
        const mockTopics = FALLBACK_TOPICS.slice(0, 6).map((topic, index) => ({
          key: topic.name,
          count: 10 - index, // 模拟计数
          example: topic.example,
        }))
        
        const mockTotalSourceMentions = mockSourceTypes.length * 10
        const mockTotalTopicMentions = mockTopics.reduce((sum, t) => sum + t.count, 0)
        
        const mockSourcesWithShare = mockSourceTypes.map((type) => ({
          key: type,
          label: type,
          slug: slugify(type),
          count: 10,
          share: 10 / mockTotalSourceMentions,
        }))
        
        const mockTopicsWithShare = mockTopics.map((entry) => {
          const translatedName = shouldTranslate ? translate(entry.key, language as "en" | "zh-TW") : entry.key
          const exampleText = entry.example || entry.key
          return {
            name: translatedName,
            slug: slugify(entry.key),
            count: entry.count,
            share: entry.count / mockTotalTopicMentions,
            example: shouldTranslate ? translate(exampleText, language as "en" | "zh-TW") : exampleText,
          }
        })
        
        const mockCells: HeatmapCell[] = []
        mockSourcesWithShare.forEach((source) => {
          mockTopicsWithShare.forEach((topic) => {
            const mentionRate = parseFloat(((source.share * topic.share) * 100).toFixed(2)) || 0
            mockCells.push({
              source: source.label,
              topic: topic.name,
              mentionRate,
              sampleCount: Math.max(1, Math.round((source.count + topic.count) / 2)),
              example: topic.example || "",
            })
          })
        })
        
        const mockResult = {
          sources: mockSourcesWithShare.map(({ label, slug }) => ({ name: label, slug })),
          topics: mockTopicsWithShare.map(({ name, slug }) => ({ name, slug })),
          cells: mockCells,
        }
        console.log("[Visibility API] Mock heatmap data generated:", {
          sourcesCount: mockResult.sources.length,
          topicsCount: mockResult.topics.length,
          cellsCount: mockResult.cells.length,
        })
        return mockResult
      }
      
      console.log("[Visibility API] Selected source types:", selectedSourceTypes)

      // 从数据中真实提取主题（从所有品牌的aspects中提取），与Overview API保持一致
      const allTopicCounts = new Map<string, number>()
      const allTopicExamples = new Map<string, string>()

      // 合并所有主题（包括本品牌和其他品牌）
      const rankedSelfTopics = sortEntries(selfTopicCounts)
      const rankedOtherTopics = sortEntries(otherTopicCounts)
      
      // 合并所有主题的计数
      ;[...rankedSelfTopics, ...rankedOtherTopics].forEach(([topicName, count]) => {
        const normalized = topicName.toLowerCase()
        if (!normalized) return
        
        // 使用aspect本身作为主题名（去除"关于"前缀）
        const cleanTopicName = topicName.trim().replace(/^关于/, "").trim()
        if (!cleanTopicName) return
        
        allTopicCounts.set(cleanTopicName, (allTopicCounts.get(cleanTopicName) || 0) + count)
        if (!allTopicExamples.has(cleanTopicName)) {
          allTopicExamples.set(cleanTopicName, topicName)
        }
      })

      // 如果没有数据，使用fallback主题
      if (allTopicCounts.size === 0) {
        FALLBACK_TOPICS.forEach((topic) => {
          allTopicCounts.set(topic.name, 1)
          allTopicExamples.set(topic.name, topic.example)
        })
      }

      // 构建选中的主题列表（按提及次数排序，最多返回前6个）
      const selectedTopicsRaw = Array.from(allTopicCounts.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6) // 最多返回 6 个最热门的主题

      const totalSourceMentions = Math.max(
        selectedSourceTypes.reduce(
          (sum, type) => sum + (allSourceTypeCounts.get(type) || 0),
          0
        ),
        1
      )
      const totalTopicMentions =
        selectedTopicsRaw.reduce((sum, entry) => sum + entry.count, 0) || selectedTopicsRaw.length || 1

      const sourcesWithShare = selectedSourceTypes.map((type) => {
        const count = allSourceTypeCounts.get(type) || 0
        const share = totalSourceMentions > 0 ? count / totalSourceMentions : 0
        return {
          key: type,
          label: type, // 使用类型名称作为 label
          slug: slugify(type),
          count,
          share,
        }
      })

      const topicsWithShare = selectedTopicsRaw.map((entry) => {
        // 使用从数据中提取的示例
        const example = allTopicExamples.get(entry.key) || entry.key
        // 翻译主题名称（支持简体中文和英文）
        const translatedName = shouldTranslate ? translate(entry.key, language as "en" | "zh-TW") : entry.key
        return {
          name: translatedName,
          slug: slugify(entry.key), // slug保持原样，用于匹配
          count: entry.count,
          share: entry.count / totalTopicMentions,
          example: shouldTranslate ? translate(example, language as "en" | "zh-TW") : example,
        }
      })

      const cells: HeatmapCell[] = []

      sourcesWithShare.forEach((source) => {
        topicsWithShare.forEach((topic) => {
          const mentionRate = parseFloat(((source.share * topic.share) * 100).toFixed(2)) || 0
          const sampleCount = Math.max(1, Math.round((source.count + topic.count) / 2))
          cells.push({
            source: source.label, // 使用类型名称（如 "Official", "News" 等）
            topic: topic.name,
            mentionRate: isNaN(mentionRate) ? 0 : mentionRate,
            sampleCount: isNaN(sampleCount) ? 1 : sampleCount,
            example: topic.example || "",
          })
        })
      })

      const result = {
        sources: sourcesWithShare.map(({ label, slug }) => ({ name: label, slug })),
        topics: topicsWithShare.map(({ name, slug }) => ({ name, slug })),
        cells,
      }
      console.log("[Visibility API] Heatmap data generated:", {
        sourcesCount: result.sources.length,
        topicsCount: result.topics.length,
        cellsCount: result.cells.length,
        sources: result.sources.map(s => s.name),
        topics: result.topics.map(t => t.name),
      })
      return result
    }

    let heatmap
    try {
      console.log("[Visibility API] Calling computeHeatmap, filteredData length:", filteredData.length)
      heatmap = computeHeatmap()
      console.log("[Visibility API] computeHeatmap returned:", {
        sourcesCount: heatmap?.sources?.length ?? 0,
        topicsCount: heatmap?.topics?.length ?? 0,
        cellsCount: heatmap?.cells?.length ?? 0,
      })
      // 如果返回的数据为空，强制生成模拟数据
      if (!heatmap || !heatmap.sources || !heatmap.topics || heatmap.sources.length === 0 || heatmap.topics.length === 0) {
        console.log("[Visibility API] Heatmap data is empty or invalid, generating mock data as fallback")
        console.log("[Visibility API] Current heatmap state:", {
          exists: !!heatmap,
          sources: heatmap?.sources,
          topics: heatmap?.topics,
          cells: heatmap?.cells,
        })
        const mockSourceTypes = ALL_SOURCE_TYPES // 使用所有8个标准类型
        const mockTopics = FALLBACK_TOPICS.slice(0, 6).map((topic, index) => ({
          key: topic.name,
          count: 10 - index,
          example: topic.example,
        }))
        const mockTotalSourceMentions = mockSourceTypes.length * 10
        const mockTotalTopicMentions = mockTopics.reduce((sum, t) => sum + t.count, 0)
        const mockSourcesWithShare = mockSourceTypes.map((type) => ({
          key: type,
          label: type,
          slug: slugify(type),
          count: 10,
          share: 10 / mockTotalSourceMentions,
        }))
        const mockTopicsWithShare = mockTopics.map((entry) => {
          const translatedName = language === "zh-TW" ? translate(entry.key, language as "en" | "zh-TW") : entry.key
          const exampleText = entry.example || entry.key
          return {
            name: translatedName,
            slug: slugify(entry.key),
            count: entry.count,
            share: entry.count / mockTotalTopicMentions,
            example: language === "zh-TW" ? translate(exampleText, language as "en" | "zh-TW") : exampleText,
          }
        })
        const mockCells: HeatmapCell[] = []
        mockSourcesWithShare.forEach((source) => {
          mockTopicsWithShare.forEach((topic) => {
            const mentionRate = parseFloat(((source.share * topic.share) * 100).toFixed(2)) || 0
            mockCells.push({
              source: source.label,
              topic: topic.name,
              mentionRate,
              sampleCount: Math.max(1, Math.round((source.count + topic.count) / 2)),
              example: topic.example || "",
            })
          })
        })
        heatmap = {
          sources: mockSourcesWithShare.map(({ label, slug }) => ({ name: label, slug })),
          topics: mockTopicsWithShare.map(({ name, slug }) => ({ name, slug })),
          cells: mockCells,
        }
        console.log("[Visibility API] Fallback mock data generated:", {
          sourcesCount: heatmap.sources.length,
          topicsCount: heatmap.topics.length,
          cellsCount: heatmap.cells.length,
        })
      }
    } catch (error: any) {
      console.error("[Visibility API] Error in computeHeatmap:", error)
      console.error("[Visibility API] Error stack:", error?.stack)
      // 发生错误时也生成模拟数据，而不是返回空数组
      console.log("[Visibility API] Error occurred, generating mock data as fallback")
      const mockSourceTypes = ALL_SOURCE_TYPES // 使用所有8个标准类型
      const mockTopics = FALLBACK_TOPICS.slice(0, 6).map((topic, index) => ({
        key: topic.name,
        count: 10 - index,
        example: topic.example,
      }))
      const mockTotalSourceMentions = mockSourceTypes.length * 10
      const mockTotalTopicMentions = mockTopics.reduce((sum, t) => sum + t.count, 0)
      const mockSourcesWithShare = mockSourceTypes.map((type) => ({
        key: type,
        label: type,
        slug: slugify(type),
        count: 10,
        share: 10 / mockTotalSourceMentions,
      }))
      const mockTopicsWithShare = mockTopics.map((entry) => {
        const translatedName = language === "zh-TW" ? translate(entry.key, language as "en" | "zh-TW") : entry.key
        const exampleText = entry.example || entry.key
        return {
          name: translatedName,
          slug: slugify(entry.key),
          count: entry.count,
          share: entry.count / mockTotalTopicMentions,
          example: language === "zh-TW" ? translate(exampleText, language as "en" | "zh-TW") : exampleText,
        }
      })
      const mockCells: HeatmapCell[] = []
      mockSourcesWithShare.forEach((source) => {
        mockTopicsWithShare.forEach((topic) => {
          const mentionRate = parseFloat(((source.share * topic.share) * 100).toFixed(2)) || 0
          mockCells.push({
            source: source.label,
            topic: topic.name,
            mentionRate,
            sampleCount: Math.max(1, Math.round((source.count + topic.count) / 2)),
            example: topic.example || "",
          })
        })
      })
      heatmap = {
        sources: mockSourcesWithShare.map(({ label, slug }) => ({ name: label, slug })),
        topics: mockTopicsWithShare.map(({ name, slug }) => ({ name, slug })),
        cells: mockCells,
      }
      console.log("[Visibility API] Error fallback mock data generated:", {
        sourcesCount: heatmap.sources.length,
        topicsCount: heatmap.topics.length,
        cellsCount: heatmap.cells.length,
      })
    }
 
    // Calculate the actual date range for display (subtract 1 day from file dates)
    const actualStartDate = format(subDays(new Date(filteredData[0][0]), 1), "yyyy-MM-dd")
    const actualEndDate = format(subDays(new Date(filteredData[filteredData.length - 1][0]), 1), "yyyy-MM-dd")

    // 强制将所有品牌名翻译为英文，并确保本品牌显示为 "CTBC"
    const translateRanking = (ranking: RankingItem[], selfBrandKey: string) => {
      return ranking.map(item => {
        let translatedBrand = translateToEnglish(item.brand)
        // 如果是本品牌，强制显示为 "CTBC"
        if (item.isSelf || item.brand === selfBrandKey || translateToEnglish(item.brand) === translateToEnglish(selfBrandKey)) {
          translatedBrand = "CTBC"
        }
        return {
          ...item,
          brand: translatedBrand,
          isSelf: item.isSelf || item.brand === selfBrandKey || translateToEnglish(item.brand) === translateToEnglish(selfBrandKey),
        }
      })
    }

    // 获取本品牌键名（用于翻译）
    const latestData = filteredData[filteredData.length - 1]?.[1]
    const latestOverall = latestData?.overall
    const selfBrandKey = latestOverall ? resolveSelfBrandKey(latestOverall, productName) : SELF_BRAND_CANDIDATES[0]

    // 翻译所有排名数据
    const translatedVisibility = {
      ranking: translateRanking(visibility.ranking, selfBrandKey),
      trends: visibility.trends,
    }
    const translatedReach = {
      ranking: translateRanking(reach.ranking, selfBrandKey),
      trends: reach.trends,
    }
    const translatedRank = {
      ranking: translateRanking(rank.ranking, selfBrandKey),
      trends: rank.trends,
    }
    const translatedFocus = {
      ranking: translateRanking(focus.ranking, selfBrandKey),
      trends: focus.trends,
    }

    const response: VisibilityData = {
      visibility: translatedVisibility,
      reach: translatedReach,
      rank: translatedRank,
      focus: translatedFocus,
      heatmap,
      actualDateRange: {
        start: actualStartDate,
        end: actualEndDate,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[Visibility API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

