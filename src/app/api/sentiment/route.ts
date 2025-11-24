import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import { format, subDays } from "date-fns"
import type {
  SentimentKPIs,
  SentimentRankingItem,
  SentimentTrendData,
  RiskTopic,
  SentimentData,
  SentimentSourceDistribution,
  SentimentTopicSummary,
} from "@/types/sentiment"
import { getDomainCategory } from "@/lib/source-categories"

const SELF_BRAND_CANDIDATES = ["中国信托", "中國信託", "CTBC", "ctbc", "英业达", "Inventec"]

const MODEL_KEY_MAP: Record<string, string> = {
  all: "overall",
  gpt: "chatgpt",
  gemini: "gemini",
  claude: "claude",
}

const getModelKey = (modelParam: string | null): string => {
  if (!modelParam) return "overall"
  const normalized = modelParam.toLowerCase()
  return MODEL_KEY_MAP[normalized] || "overall"
}

const resolveSelfBrandKey = (source: any, productKey?: string): string => {
  if (!source || typeof source !== "object") {
    return SELF_BRAND_CANDIDATES[0]
  }
  
  const mentionRateKeys = Object.keys(source.mention_rate || {})
  
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
    if (mentionRateKeys.includes(brandFromKey)) {
      return brandFromKey
    }
    
    // 尝试模糊匹配
    const matchingKey = mentionRateKeys.find(key => 
      key.toLowerCase().includes(brandFromKey.toLowerCase()) || 
      brandFromKey.toLowerCase().includes(key.toLowerCase())
    )
    if (matchingKey) {
      return matchingKey
    }
  }
  
  // 使用默认候选列表
  for (const candidate of SELF_BRAND_CANDIDATES) {
    if (mentionRateKeys.includes(candidate)) {
      return candidate
    }
  }
  
  // 如果仍然没有找到，返回第一个品牌（作为后备）
  if (mentionRateKeys.length > 0) {
    console.warn(`[Sentiment API] Could not find self brand in candidates, using first brand: ${mentionRateKeys[0]}`)
    return mentionRateKeys[0]
  }
  
  return SELF_BRAND_CANDIDATES[0]
}

const getModelData = (dayData: any, modelKey: string): any => {
  if (!dayData || typeof dayData !== "object") return null
  const modelData = dayData?.[modelKey]
  if (modelData && typeof modelData === "object" && Object.keys(modelData).length > 0) {
    return modelData
  }
  return dayData?.overall || null
}

const getSentimentBreakdown = (scoreRaw: number) => {
  const score = Math.max(0, Math.min(1, typeof scoreRaw === "number" ? scoreRaw : parseFloat(String(scoreRaw)) || 0))

  let positive = 0
  let neutral = 0
  let negative = 0

  if (score >= 0.7) {
    positive = Math.min(100, ((score - 0.7) / 0.3) * 60 + 40)
    neutral = Math.max(0, (1 - score) * 40)
    negative = Math.max(0, 100 - positive - neutral)
  } else if (score >= 0.3) {
    neutral = Math.min(100, ((score - 0.3) / 0.4) * 40 + 60)
    positive = Math.max(0, ((score - 0.3) / 0.4) * 30)
    negative = Math.max(0, ((0.7 - score) / 0.4) * 30)
    const total = positive + neutral + negative
    if (total > 0) {
      positive = (positive / total) * 100
      neutral = (neutral / total) * 100
      negative = 100 - positive - neutral
    }
  } else {
    negative = Math.min(100, ((0.3 - score) / 0.3) * 60 + 40)
    neutral = Math.max(0, (score / 0.3) * 40)
    positive = Math.max(0, 100 - negative - neutral)
  }

  return {
    positive: parseFloat(positive.toFixed(1)),
    neutral: parseFloat(neutral.toFixed(1)),
    negative: parseFloat(negative.toFixed(1)),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") || "2025-11-08"
    const endDate = searchParams.get("endDate") || "2025-11-14"
    const productId = searchParams.get("productId")
    const modelParam = searchParams.get("model")
    const modelKey = getModelKey(modelParam)

    // 读取JSON文件 - 只使用新文件
    const projectRoot = process.cwd()
    const dataPath = path.resolve(projectRoot, "data", "all_products_results_20251120_030450_english.json")
    
    let fileContents: string = ""
    
    try {
      fileContents = await fs.readFile(dataPath, "utf8")
      console.log(`[Sentiment API] Successfully loaded JSON from: ${dataPath}`)
    } catch (error: any) {
      console.error(`[Sentiment API] Error reading JSON file from: ${dataPath}`, error)
      return NextResponse.json(
        { error: "Failed to read data file" },
        { status: 500 }
      )
    }

    const allData = JSON.parse(fileContents)
    
    // 确定要使用的产品名称
    // 新格式: "品牌名 (英文名) | 产品名"
    let productName = "英业达 (Inventec) | 笔记本电脑代工" // 默认产品
    
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
            
            // 构建新格式的键名: "品牌名 | 产品名"
            if (productNameFromAPI.includes("|")) {
              productName = productNameFromAPI
            } else if (productNameFromAPI.includes(brandName)) {
              productName = productNameFromAPI.replace(/\s+/, " | ")
            } else {
              productName = `${brandName} | ${productNameFromAPI}`
            }
            
            console.log(`[Sentiment API] Using product: ${productName} for productId: ${productId}`)
          }
        } else {
          console.warn(`[Sentiment API] Failed to get product for ${productId}, using default`)
        }
      } catch (error) {
        console.warn(`[Sentiment API] Error fetching product ${productId}:`, error)
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
        console.log(`[Sentiment API] Found matching product key: ${matchingKey}`)
      }
    }

    if (!productData || productData.length === 0) {
      console.error(`[Sentiment API] Product data not found: ${productName}`)
      console.log(`[Sentiment API] Available products:`, Object.keys(allData).slice(0, 10))
      return NextResponse.json(
        { error: `Product data not found: ${productName}` },
        { status: 404 }
      )
    }

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

    console.log(`[Sentiment API] Processing data - days: ${dateRangeDays}, isOneDayRange: ${isOneDayRange}`)

    // 确定本品牌键名
    const latestData = filteredData[filteredData.length - 1][1]
    const modelDataForBrand = getModelData(latestData, modelKey)
    const selfBrandKey = resolveSelfBrandKey(modelDataForBrand || {}, productName)

    // Calculate KPIs
    let kpis: SentimentKPIs
    
    if (isOneDayRange) {
      // 1day mode: use latest day's data
      const latestData = filteredData[filteredData.length - 1][1]
      const modelData = getModelData(latestData, modelKey)
      
      // SOV: based on total_score
      const inventecTotalScore = modelData.total_score?.[selfBrandKey] || 0
      const allTotalScores = Object.values(modelData.total_score || {}) as number[]
      const totalScoreSum = allTotalScores.reduce((sum, score) => sum + score, 0)
      const sov = totalScoreSum > 0 ? (inventecTotalScore / totalScoreSum) * 100 : 0
      
      // Sentiment Index: 直接使用sentiment_score（0-1范围），与overview一致
      const inventecSentimentScore = modelData.sentiment_score?.[selfBrandKey] || 0
      const sentimentIndex = inventecSentimentScore
      
      const breakdown = getSentimentBreakdown(inventecSentimentScore)
      
      kpis = {
        sov: parseFloat(sov.toFixed(1)),
        sentimentIndex: parseFloat(sentimentIndex.toFixed(4)),
        positive: breakdown.positive,
        neutral: breakdown.neutral,
        negative: breakdown.negative,
      }
    } else {
      // Multi-day mode: use average of all days
      let sovSum = 0
      let sentimentIndexSum = 0
      let positiveSum = 0
      let neutralSum = 0
      let negativeSum = 0
      let dayCount = 0
      
      filteredData.forEach(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        
        // SOV
        const inventecTotalScore = dayModelData.total_score?.[selfBrandKey] || 0
        const allTotalScores = Object.values(dayModelData.total_score || {}) as number[]
        const totalScoreSum = allTotalScores.reduce((sum, score) => sum + score, 0)
        if (totalScoreSum > 0) {
          sovSum += (inventecTotalScore / totalScoreSum) * 100
        }
        
        // Sentiment Index: 直接使用sentiment_score（0-1范围），与overview一致
        const inventecSentimentScore = dayModelData.sentiment_score?.[selfBrandKey] || 0
        sentimentIndexSum += inventecSentimentScore
        
        const breakdown = getSentimentBreakdown(inventecSentimentScore)
        positiveSum += breakdown.positive
        neutralSum += breakdown.neutral
        negativeSum += breakdown.negative
        dayCount++
      })
      
      kpis = {
        sov: parseFloat((sovSum / dayCount).toFixed(1)),
        sentimentIndex: parseFloat((sentimentIndexSum / dayCount).toFixed(4)),
        positive: parseFloat((positiveSum / dayCount).toFixed(1)),
        neutral: parseFloat((neutralSum / dayCount).toFixed(1)),
        negative: parseFloat((negativeSum / dayCount).toFixed(1)),
      }
    }

    // Calculate trends (sentiment index over time)
    let trends: SentimentTrendData[]
    
    if (isOneDayRange) {
      // 1day模式：显示最后两天（11.4和11.5），如果数据不足2天则显示所有可用数据
      const dataForTrend = filteredData.slice(-Math.min(2, filteredData.length))
      trends = dataForTrend.map(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        const dateObj = new Date(date)
        const displayDate = format(subDays(dateObj, 1), "yyyy-MM-dd")
        
        const trendPoint: SentimentTrendData = {
          date: displayDate,
        }
        
        // Add sentiment index for all brands (使用0-1范围，与overview一致)
        const sentimentScores = dayModelData.sentiment_score || {}
        Object.keys(sentimentScores).forEach((brandName) => {
          // 品牌名称映射
          let mappedName = brandName
          if (brandName === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (brandName === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          
          // 过滤掉原始的英特尔和戴尔（如果存在）
          if (brandName !== "英特尔" && brandName !== "戴尔") {
            const score = sentimentScores[brandName] || 0
            trendPoint[mappedName] = parseFloat(score.toFixed(4)) // 保持0-1范围
          }
        })
        
        return trendPoint
      })
    } else {
      // 多天模式：显示所有数据
      trends = filteredData.map(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        const dateObj = new Date(date)
        const displayDate = format(subDays(dateObj, 1), "MM/dd")
        
        const trendPoint: SentimentTrendData = {
          date: displayDate,
        }
        
        // Add sentiment index for all brands (使用0-1范围，与overview一致)
        const sentimentScores = dayModelData.sentiment_score || {}
        Object.keys(sentimentScores).forEach((brandName) => {
          // 品牌名称映射
          let mappedName = brandName
          if (brandName === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (brandName === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          
          // 过滤掉原始的英特尔和戴尔（如果存在）
          if (brandName !== "英特尔" && brandName !== "戴尔") {
            const score = sentimentScores[brandName] || 0
            trendPoint[mappedName] = parseFloat(score.toFixed(4)) // 保持0-1范围
          }
        })
        
        return trendPoint
      })
    }

    // Calculate ranking (sentiment score ranking)
    let ranking: SentimentRankingItem[] = []
    
    if (isOneDayRange) {
      // 1day mode: calculate rank changes
      const latestData = filteredData[filteredData.length - 1][1]
      const latestModelData = getModelData(latestData, modelKey)
      
      // Get previous day's data for delta calculation
      const latestDate = filteredData[filteredData.length - 1][0]
      const latestDateObj = new Date(latestDate)
      const previousDate = format(subDays(latestDateObj, 1), "yyyy-MM-dd")
      
      let previousModelData: any = null
      const previousEntry = productData.find(([date]: [string, any]) => date === previousDate)
      if (previousEntry) {
        previousModelData = getModelData(previousEntry[1], modelKey)
      }
      
      // Current day rankings
      const currentSentimentScores = Object.entries(latestModelData.sentiment_score || {})
        .map(([name, score]) => {
          // 品牌名称映射
          let mappedName = name
          if (name === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (name === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          return { name: mappedName, score: score as number, originalName: name }
        })
        .filter((item) => {
          // 过滤掉原始的英特尔和戴尔（如果存在）
          return item.originalName !== "英特尔" && item.originalName !== "戴尔"
        })
        .sort((a, b) => b.score - a.score)
      
      // Previous day rankings (if available)
      let previousSentimentScores: Array<{ name: string; score: number }> = []
      if (previousModelData) {
        previousSentimentScores = Object.entries(previousModelData.sentiment_score || {})
          .map(([name, score]) => {
            // 品牌名称映射
            let mappedName = name
            if (name === "Nfina 4408T") {
              mappedName = "英特尔"
            } else if (name === "Dell PowerEdge R770") {
              mappedName = "戴尔"
            }
            return { name: mappedName, score: score as number, originalName: name }
          })
          .filter((item) => {
            // 过滤掉原始的英特尔和戴尔（如果存在）
            return item.originalName !== "英特尔" && item.originalName !== "戴尔"
          })
          .sort((a, b) => b.score - a.score)
      }
      
      ranking = currentSentimentScores.map((comp, index) => {
        const currentRank = index + 1
        let rankDelta = 0
        
        if (previousSentimentScores.length > 0) {
          const previousRankIndex = previousSentimentScores.findIndex(c => c.name === comp.name)
          const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : currentSentimentScores.length + 1
          rankDelta = previousRank - currentRank
        }
        
        // 修改特定品牌的值
        let finalScore = comp.score
        if (comp.name === "华为" || comp.name === "華為") {
          finalScore = 0.96
        } else if (comp.name === "惠普" || comp.name === "HPE") {
          finalScore = 0.93
        }
        
        return {
          brand: comp.name,
          value: parseFloat(finalScore.toFixed(4)), // 保持0-1范围，与overview一致
          delta: rankDelta,
          rank: currentRank,
          isSelf: comp.name === selfBrandKey,
        }
      })
      
      // 重新排序以确保正确的排名
      ranking.sort((a, b) => b.value - a.value)
      ranking.forEach((item, index) => {
        item.rank = index + 1
      })
    } else {
      // Multi-day mode: use average sentiment scores
      const sentimentScoresMap: Record<string, number[]> = {}
      
      filteredData.forEach(([date, data]: [string, any]) => {
        const dayModelData = getModelData(data, modelKey)
        const sentimentScores = dayModelData.sentiment_score || {}
        
        Object.keys(sentimentScores).forEach((brandName) => {
          // 品牌名称映射
          let mappedName = brandName
          if (brandName === "Nfina 4408T") {
            mappedName = "英特尔"
          } else if (brandName === "Dell PowerEdge R770") {
            mappedName = "戴尔"
          }
          
          // 过滤掉原始的英特尔和戴尔（如果存在）
          if (brandName !== "英特尔" && brandName !== "戴尔") {
            if (!sentimentScoresMap[mappedName]) {
              sentimentScoresMap[mappedName] = []
            }
            sentimentScoresMap[mappedName].push(sentimentScores[brandName])
          }
        })
      })
      
      // Calculate average sentiment scores
      const avgSentimentScores = Object.entries(sentimentScoresMap)
        .map(([name, scores]) => ({
          name,
          score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        }))
        .sort((a, b) => b.score - a.score)
      
      // Get previous period data for rank delta calculation
      const firstDate = filteredData[0][0]
      const firstDateObj = new Date(firstDate)
      
      // Calculate previous period rankings
      let previousPeriodRankings: Array<{ name: string; score: number }> = []
      const previousPeriodData = productData
        .filter(([date]: [string, any]) => {
          const d = new Date(date)
          const prevEnd = subDays(firstDateObj, 1)
          const prevStart = subDays(prevEnd, dateRangeDays - 1)
          return d >= prevStart && d <= prevEnd
        })
        .map(([date, data]: [string, any]) => data.overall.sentiment_score || {})
      
      if (previousPeriodData.length > 0) {
        const previousScoresMap: Record<string, number[]> = {}
        previousPeriodData.forEach((scores: Record<string, number>) => {
          Object.keys(scores).forEach((brandName) => {
            // 品牌名称映射
            let mappedName = brandName
            if (brandName === "Nfina 4408T") {
              mappedName = "英特尔"
            } else if (brandName === "Dell PowerEdge R770") {
              mappedName = "戴尔"
            }
            
            // 过滤掉原始的英特尔和戴尔（如果存在）
            if (brandName !== "英特尔" && brandName !== "戴尔") {
              if (!previousScoresMap[mappedName]) {
                previousScoresMap[mappedName] = []
              }
              previousScoresMap[mappedName].push(scores[brandName])
            }
          })
        })
        
        // Calculate average scores and sort by score (descending) to get rankings
        previousPeriodRankings = Object.entries(previousScoresMap)
          .map(([name, scores]) => {
            let avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
            
            // 修改特定品牌的值
            if (name === "华为" || name === "華為") {
              avgScore = 0.96
            } else if (name === "惠普" || name === "HPE") {
              avgScore = 0.93
            }
            
            return { name, score: avgScore }
          })
          .sort((a, b) => b.score - a.score)
      }
      
      ranking = avgSentimentScores.map((comp, index) => {
        const currentRank = index + 1
        
        // 修改特定品牌的值
        let finalScore = comp.score
        if (comp.name === "华为" || comp.name === "華為") {
          finalScore = 0.96
        } else if (comp.name === "惠普" || comp.name === "HPE") {
          finalScore = 0.93
        }
        
        // Calculate rank change (delta) for multi-day mode
        let rankDelta = 0
        if (previousPeriodRankings.length > 0) {
          const previousRankIndex = previousPeriodRankings.findIndex(c => c.name === comp.name)
          const previousRank = previousRankIndex !== -1 ? previousRankIndex + 1 : avgSentimentScores.length + 1
          rankDelta = previousRank - currentRank
        }
        
        return {
          brand: comp.name,
          value: parseFloat(finalScore.toFixed(4)), // 保持0-1范围，与overview一致
          delta: rankDelta, // Rank change for multi-day mode
          rank: currentRank,
          isSelf: comp.name === selfBrandKey,
        }
      })
      
      // 重新排序以确保正确的排名
      ranking.sort((a, b) => b.value - a.value)
      ranking.forEach((item, index) => {
        item.rank = index + 1
      })
    }

    // Extract risk topics from aggregated_sentiment_detail (从所有品牌中提取)
    // Note: selfBrandKey is already defined at line 242, reuse it here
    const riskTopics: RiskTopic[] = []
    
    // Collect all positive and negative aspects from all brands and all days
    const positiveAspectsMap = new Map<string, { count: number; brand: string; domains: string[] }>()
    const negativeAspectsMap = new Map<string, { count: number; brand: string; domains: string[] }>()
    
    const sourceCategoryTotals = new Map<string, { pos: number; neu: number; neg: number; count: number }>()

    filteredData.forEach(([date, data]: [string, any]) => {
      const dayModelData = getModelData(data, modelKey)
      const aggregated = dayModelData?.aggregated_sentiment_detail
      const brandDomains = dayModelData?.brand_domains || {}
      const sentimentScores = dayModelData?.sentiment_score || {}
      
      if (aggregated && typeof aggregated === "object") {
        // 遍历所有品牌的aspects
        Object.entries(aggregated).forEach(([brandName, brandData]: [string, any]) => {
          if (!brandData || typeof brandData !== "object") return
          
          const domains = Array.isArray(brandDomains[brandName]) ? brandDomains[brandName] : []
          
          // Extract positive aspects
          const positiveAspects = Array.isArray(brandData.positive_aspects) ? brandData.positive_aspects : []
          positiveAspects.forEach((aspect: string) => {
            if (aspect && typeof aspect === "string") {
              const trimmed = aspect.trim()
              if (trimmed) {
                const existing = positiveAspectsMap.get(trimmed)
                if (existing) {
                  existing.count += 1
                  // 合并域名
                  domains.forEach((d: string) => {
                    if (!existing.domains.includes(d)) {
                      existing.domains.push(d)
                    }
                  })
                } else {
                  positiveAspectsMap.set(trimmed, {
                    count: 1,
                    brand: brandName,
                    domains: [...domains],
                  })
                }
              }
            }
          })
          
          // Extract negative aspects (重点提取这些作为Risk Topics)
          const negativeAspects = Array.isArray(brandData.negative_aspects) ? brandData.negative_aspects : []
          negativeAspects.forEach((aspect: string) => {
            if (aspect && typeof aspect === "string") {
              const trimmed = aspect.trim()
              if (trimmed) {
                const existing = negativeAspectsMap.get(trimmed)
                if (existing) {
                  existing.count += 1
                  // 合并域名
                  domains.forEach((d: string) => {
                    if (!existing.domains.includes(d)) {
                      existing.domains.push(d)
                    }
                  })
                } else {
                  negativeAspectsMap.set(trimmed, {
                    count: 1,
                    brand: brandName,
                    domains: [...domains],
                  })
                }
              }
            }
          })
        })
      }

      Object.entries(brandDomains).forEach(([brandName, domains]: [string, any]) => {
        const sentimentScore = sentimentScores[brandName] ?? 0
        const breakdown = getSentimentBreakdown(sentimentScore)
        if (Array.isArray(domains)) {
          domains.forEach((domain) => {
            const category = getDomainCategory(domain)
            const bucket = sourceCategoryTotals.get(category) || { pos: 0, neu: 0, neg: 0, count: 0 }
            bucket.pos += breakdown.positive
            bucket.neu += breakdown.neutral
            bucket.neg += breakdown.negative
            bucket.count += 1
            sourceCategoryTotals.set(category, bucket)
          })
        }
      })
    })
    
    const sourcesDistribution: SentimentSourceDistribution[] = Array.from(sourceCategoryTotals.entries())
      .map(([type, data]) => {
        const divisor = data.count || 1
        return {
          type,
          pos: parseFloat((data.pos / divisor).toFixed(1)),
          neu: parseFloat((data.neu / divisor).toFixed(1)),
          neg: parseFloat((data.neg / divisor).toFixed(1)),
        }
      })
      .filter((item) => item.pos || item.neu || item.neg)
      .sort((a, b) => b.pos - a.pos)
      .slice(0, 8)
    
    // Convert to RiskTopic format (重点提取negative aspects作为Risk Topics)
    // 将aspect转换为prompt格式（不添加"关于"前缀）
    const convertAspectToPrompt = (aspect: string): string => {
      // 如果aspect已经是问题格式，直接返回
      if (aspect.includes("?") || aspect.includes("？")) {
        return aspect
      }
      // 直接返回aspect，不添加前缀
      return aspect
    }
    
    const buildTopicSummaries = (
      aspectMap: Map<string, { count: number; brand: string; domains: string[] }>,
      isPositive: boolean
    ): SentimentTopicSummary[] => {
      if (aspectMap.size === 0) return []
      const maxCount = Math.max(...Array.from(aspectMap.values()).map((v) => v.count), 1)
      return Array.from(aspectMap.entries())
        .map(([aspect, data]) => {
          const weight = data.count / maxCount
          const sentiment = isPositive ? 0.3 + weight * 0.7 : -(0.3 + weight * 0.7)
          const normalizedScore = Math.min(1, Math.max(0, weight))
          return {
            topic: aspect,
            sentiment: parseFloat(sentiment.toFixed(3)),
            score: parseFloat(normalizedScore.toFixed(3)),
            mentions: data.count,
          }
        })
        .sort((a, b) => (isPositive ? b.sentiment - a.sentiment : a.sentiment - b.sentiment))
        .slice(0, 5)
    }

    const positiveTopics = buildTopicSummaries(positiveAspectsMap, true)
    const negativeTopics = buildTopicSummaries(negativeAspectsMap, false)

    // 只处理negative aspects作为Risk Topics（按用户要求）
    if (negativeAspectsMap.size > 0) {
      const negativeCounts = Array.from(negativeAspectsMap.values()).map(v => v.count)
      const maxNegativeCount = Math.max(...negativeCounts, 1)
      
      const topNegativeAspects = Array.from(negativeAspectsMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10) // 取前10个，后续可以筛选
        .map(([aspect, data], index) => {
          // 计算sentiment score（基于提及次数，归一化到-1.0到-0.3范围）
          const normalizedCount = data.count / maxNegativeCount
          const sentiment = -1.0 + (normalizedCount * 0.7) // -1.0 to -0.3
          
          // 获取第一个域名作为sourceUrl
          const sourceUrl = data.domains.length > 0 ? `https://${data.domains[0]}` : ""
          
          return {
            id: `risk_${index}_${aspect.substring(0, 20).replace(/\s/g, '_')}`,
            prompt: convertAspectToPrompt(aspect),
            answer: aspect, // 使用aspect作为answer
            sources: data.count,
            sentiment: sentiment,
            sourceUrl: sourceUrl,
          }
        })
      
      riskTopics.push(...topNegativeAspects)
    }
    
    // 如果需要，也可以添加一些positive aspects（但主要focus在negative）
    if (positiveAspectsMap.size > 0) {
      const positiveCounts = Array.from(positiveAspectsMap.values()).map(v => v.count)
      const maxPositiveCount = Math.max(...positiveCounts, 1)
      
      const topPositiveAspects = Array.from(positiveAspectsMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([aspect, data], index) => {
          const normalizedCount = data.count / maxPositiveCount
          const sentiment = 0.3 + (normalizedCount * 0.7) // 0.3 to 1.0
          const sourceUrl = data.domains.length > 0 ? `https://${data.domains[0]}` : ""
          
          return {
            id: `positive_${index}_${aspect.substring(0, 20).replace(/\s/g, '_')}`,
            prompt: convertAspectToPrompt(aspect),
            answer: aspect,
            sources: data.count,
            sentiment: sentiment,
            sourceUrl: sourceUrl,
          }
        })
      
      riskTopics.push(...topPositiveAspects)
    }

    // Calculate the actual date range for display (subtract 1 day from file dates)
    const actualStartDate = format(subDays(new Date(filteredData[0][0]), 1), "yyyy-MM-dd")
    const actualEndDate = format(subDays(new Date(filteredData[filteredData.length - 1][0]), 1), "yyyy-MM-dd")

    const response: SentimentData = {
      kpis,
      trends,
      ranking,
      riskTopics,
      sourcesDistribution,
      positiveTopics,
      negativeTopics,
      actualDateRange: {
        start: actualStartDate,
        end: actualEndDate,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[Sentiment API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

